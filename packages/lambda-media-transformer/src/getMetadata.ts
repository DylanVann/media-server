import { sharp } from './sharp'
import { ffmpeg } from './ffmpeg'
import type { Readable } from 'stream'
import type { Metadata } from 'sharp'

export const checkAndReturn = ({
  width,
  height,
}: {
  width?: unknown
  height?: unknown
}) => {
  if (typeof width !== 'number') {
    throw new Error(`Could not get the width.`)
  }
  if (typeof height !== 'number') {
    throw new Error(`Could not get the height.`)
  }
  return {
    width,
    height,
  }
}

export const getMetadata = async (
  type: 'image' | 'video',
  input: Readable,
): Promise<{ width: number; height: number }> => {
  if (type === 'image') {
    const metadata: Metadata = await new Promise((resolve, reject) => {
      const metadataTransformer = sharp().metadata((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
      input.pipe(metadataTransformer)
    })
    return checkAndReturn(metadata)
  } else {
    return new Promise((resolve, reject) => {
      ffmpeg
        .clone()
        .input(input)
        .ffprobe((err, data) => {
          if (err) {
            return reject(err)
          }
          return checkAndReturn(data.streams[0])
        })
    })
  }
}
