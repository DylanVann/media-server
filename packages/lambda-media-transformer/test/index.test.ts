import * as path from 'path'
import * as fs from 'fs-extra'
import { test, jest, expect } from '@jest/globals'
import { bufferToStream } from '../src/bufferToStream'

const assetsPath = path.join(__dirname, 'assets')
const outputPath = path.join(__dirname, 'output')

const mockResponse = (buffer: Buffer) =>
  Promise.resolve({
    ok: true,
    status: 200,
    buffer: () => Promise.resolve(buffer),
    body: bufferToStream(buffer),
  })

test('gets image metadata', async () => {
  const inputBuffer = await fs.readFile(
    path.join(assetsPath, 'sample-image.jpeg'),
  )
  const response = mockResponse(inputBuffer)
  jest.mock('node-fetch', () => jest.fn())
  const fetch = require('node-fetch')
  fetch.mockImplementation(() => response)
  const { handler } = require('../src')
  const result = await handler({
    path: 'example/image.jpeg',
    queryStringParameters: { w: 50, fm: 'json' },
  })
  expect(result.body).toMatchInlineSnapshot(
    `"{\\"width\\":150,\\"height\\":150}"`,
  )
})

test('resizes images', async () => {
  const inputBuffer = await fs.readFile(
    path.join(assetsPath, 'sample-image.jpeg'),
  )
  const response = mockResponse(inputBuffer)
  jest.mock('node-fetch', () => jest.fn())
  const fetch = require('node-fetch')
  fetch.mockImplementation(() => response)
  const { handler } = require('../src')
  const result = await handler({
    path: 'example/image.jpeg',
    queryStringParameters: { w: 50 },
  })
  const buffer = Buffer.from(result.body, 'base64')
  await fs.outputFile(path.join(outputPath, 'sample-image-50px.png'), buffer)
})

test('gets video metadata', async () => {
  const inputBuffer = await fs.readFile(
    path.join(assetsPath, 'sample-video.mp4'),
  )
  const response = mockResponse(inputBuffer)
  jest.mock('node-fetch', () => jest.fn())
  const fetch = require('node-fetch')
  fetch.mockImplementation(() => response)
  const { handler } = require('../src')
  const result = await handler({
    path: 'example/sample.mp4',
    queryStringParameters: { w: 50, fm: 'json' },
  })
  expect(result.body).toMatchInlineSnapshot(
    `"{\\"width\\":300,\\"height\\":648}"`,
  )
})

test('gets video thumbnail', async () => {
  const inputBuffer = await fs.readFile(
    path.join(assetsPath, 'sample-video.mp4'),
  )
  const response = mockResponse(inputBuffer)
  jest.mock('node-fetch', () => jest.fn())
  const fetch = require('node-fetch')
  fetch.mockImplementation(() => response)
  const { handler } = require('../src')
  const result = await handler({
    path: 'example/sample.mp4',
    queryStringParameters: { w: 50, fm: 'png' },
  })
  const buffer = Buffer.from(result.body, 'base64')
  await fs.outputFile(path.join(outputPath, 'sample-video-50px.png'), buffer)
})

test('resizes videos', async () => {
  const inputBuffer = await fs.readFile(
    path.join(assetsPath, 'sample-video.mp4'),
  )
  const response = mockResponse(inputBuffer)
  jest.mock('node-fetch', () => jest.fn())
  const fetch = require('node-fetch')
  fetch.mockImplementation(() => response)
  const { handler } = require('../src')
  const result = await handler({
    path: 'example/sample.mp4',
    queryStringParameters: { w: 50 },
  })
  const buffer = Buffer.from(result.body, 'base64')
  await fs.outputFile(path.join(outputPath, 'sample-video-50px.mp4'), buffer)
})
