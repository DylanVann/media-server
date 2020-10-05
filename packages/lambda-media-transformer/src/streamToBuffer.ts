import { Readable } from 'stream'

export const streamToBuffer = (stream: Readable) =>
  new Promise((resolve, reject) => {
    const data: any[] = []
    stream.on('data', (b) => data.push(b))
    stream.on('error', (e) => reject(e))
    stream.on('end', () => resolve(Buffer.concat(data)))
  })
