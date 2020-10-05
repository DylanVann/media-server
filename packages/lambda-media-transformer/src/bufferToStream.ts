import { Readable } from 'stream'

export const bufferToStream = (binary: Buffer) =>
  new Readable({
    read() {
      this.push(binary)
      this.push(null)
    },
  })
