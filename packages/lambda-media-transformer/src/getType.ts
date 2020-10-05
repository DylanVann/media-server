import path from 'path'

const imageExtensions = { png: 'png', jpg: 'jpg', jpeg: 'jpeg' }
const videoExtensions = { mp4: 'mp4' }

export const getType = (inputPath: string): 'image' | 'video' => {
  const extension = path.extname(inputPath).slice(1)
  const isImage = extension in imageExtensions
  if (isImage) return 'image'
  const isVideo = extension in videoExtensions
  if (isVideo) return 'video'
  throw new Error(`Does not currently support converting .${extension}.`)
}
