import * as fs from 'fs'
import * as path from 'path'
import type { Metadata } from 'sharp'
import fetch from 'node-fetch'
import tempy from 'tempy'
import { getType } from './getType'
import { sharp } from './sharp'
import { checkAndReturn } from './getMetadata'
import { ffmpeg } from './ffmpeg'

const imageFormats = ['jpeg', 'png', 'webp']
const videoFormats = ['mp4']
const formats = [...imageFormats, ...videoFormats, 'json']
type Format = 'jpeg' | 'png' | 'json' | 'mp4' | 'webp'

interface Event {
  path: string
  queryStringParameters?: {
    w?: string
    fm?: Format
  }
}

/**
 * This will be a CloudFront distribution in front of your source S3 bucket.
 */
const sourceCloudFrontUrl = 'http://dg5t66o3lxva1.cloudfront.net'

const parseOptions = (
  event: Event,
): {
  id: string
  width: number | undefined
  format: Format | undefined
} => {
  let { path, queryStringParameters } = event || {}
  path = path.startsWith('/') ? path.replace('/', '') : path
  const { fm, w } = queryStringParameters || {}

  let format: undefined | Format
  if (fm) {
    if (!formats.includes(fm as string)) {
      throw new Error(`Format "${fm}" not supported`)
    }
    format = fm
  }
  // Version is just used for cache busting.
  // @ts-ignore
  const [_version, id] = path.split('/')
  return {
    id,
    width: w ? parseInt(w) : undefined,
    format,
  }
}

const getImageMetadata = async (
  input: Buffer,
): Promise<{ width: number; height: number }> => {
  const metadata: Metadata = await sharp(input).metadata()
  return checkAndReturn(metadata)
}

const getVideoMetadata = async (
  inputPath: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) =>
    ffmpeg
      .clone()
      .input(inputPath)
      .ffprobe((error, data) => {
        if (error) {
          return reject(error)
        }
        return resolve(checkAndReturn(data.streams[0]))
      }),
  )
}

const getOutputWidth = (
  originalWidth: number,
  width: number | undefined,
): number | undefined => {
  if (width === undefined) {
    return undefined
  }
  return width > originalWidth ? originalWidth : width
}

export const handler = async (event: Event) => {
  const { width, id, format } = parseOptions(event)
  const type = getType(id)

  const response = await fetch(`${sourceCloudFrontUrl}/${id}`)

  if (type === 'image') {
    const input = await response.buffer()
    const metadata = await getImageMetadata(input)

    if (format === 'json') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=31536000',
        },
        body: JSON.stringify(metadata),
      }
    }

    const outputWidth = getOutputWidth(metadata.width, width)
    let transform = sharp(input).toFormat(format || 'jpeg')
    if (outputWidth) {
      transform = transform.resize(outputWidth)
    }
    const outputBuffer = await transform.toBuffer()
    const base64 = outputBuffer.toString('base64')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=31536000',
      },
      isBase64Encoded: true,
      body: base64,
    }
  }

  if (type === 'video') {
    const input = await response.buffer()
    const inputPath = tempy.file({ extension: 'mp4' })
    const outputPath = tempy.file({ extension: 'mp4' })
    await fs.promises.writeFile(inputPath, input)
    const metadata = await getVideoMetadata(inputPath)
    const outputWidth = getOutputWidth(metadata.width, width)

    if (format === 'json') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=31536000',
        },
        body: JSON.stringify(metadata),
      }
    }

    // If we want a thumbnail for this video.
    if (imageFormats.includes(format as Format)) {
      const screenshotPath = tempy.file({ extension: 'png' })
      const { dir, base } = path.parse(screenshotPath)
      await new Promise<void>((resolve, reject) =>
        ffmpeg
          .clone()
          .input(inputPath)
          .screenshot({
            folder: dir,
            filename: base,
            count: 1,
          })
          .on('end', (error) => (error ? reject(error) : resolve())),
      )
      const thumbnailBuffer = await fs.promises.readFile(screenshotPath)

      let transform = sharp(thumbnailBuffer).toFormat(format || 'jpeg')
      if (outputWidth) {
        transform = transform.resize(outputWidth)
      }
      const outputBuffer = await transform.toBuffer()
      const base64 = outputBuffer.toString('base64')

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'max-age=31536000',
        },
        isBase64Encoded: true,
        body: base64,
      }
    }

    const outputBuffer: Buffer = await new Promise((resolve, reject) => {
      let transform = ffmpeg
        .clone()
        .input(inputPath)
        .noAudio()
        .format('mp4')
        .videoCodec('libx264')

      if (outputWidth) {
        transform = transform.size(`${outputWidth}x?`)
      }

      transform
        .output(outputPath)
        .on('end', (error) => {
          if (error) {
            reject(error)
          }
          fs.promises.readFile(outputPath).then(resolve).catch(reject)
        })
        .run()
    })

    const base64 = outputBuffer.toString('base64')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'max-age=31536000',
      },
      isBase64Encoded: true,
      body: base64,
    }
  }

  return {
    statusCode: 404,
  }
}

exports.handler = handler
