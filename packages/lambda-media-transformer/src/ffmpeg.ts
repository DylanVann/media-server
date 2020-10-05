import createFFMPEG from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@dylanvann/ffmpeg-static'
import { path as ffprobePath } from '@dylanvann/ffprobe-static'

export const ffmpeg = createFFMPEG()
  .setFfmpegPath(ffmpegPath)
  .setFfprobePath(ffprobePath)
