const path = require('path')
const archiver = require('archiver')
const fs = require('fs')
const execa = require('execa')
const pkg = require('./package.json')

function zipDirectory(source, out) {
  return new Promise((resolve, reject) => {
    var output = fs.createWriteStream(out)
    var archive = archiver('zip')
    output.on('close', function () {
      resolve()
    })
    archive.on('error', function (err) {
      reject(err)
    })
    archive.pipe(output)
    archive.directory(source, false)
    archive.finalize()
  })
}

const external = [
  'sharp',
  'fluent-ffmpeg',
  '@dylanvann/ffmpeg-static',
  '@dylanvann/ffprobe-static',
]

const run = async () => {
  const options = { stdio: 'inherit' }
  await execa('tsc', ['--build'], options)
  await execa(
    'esbuild',
    [
      '--bundle',
      `--format=cjs`,
      '--platform=node',
      ...external.map((v) => `--external:${v}`),
      'src/index.ts',
      `--outfile=dist/index.js`,
    ],
    options,
  )
  await zipDirectory(path.join(__dirname, 'dist'), 'index.zip')
}

run()
