'use strict'

var os = require('os')
var path = require('path')

var platform = os.platform()
var arch = os.arch()

var binaries = {
  darwin: ['x64'],
  linux: ['x64', 'ia32'],
  win32: ['x64', 'ia32'],
}

if (!binaries[platform] || binaries[platform].indexOf(arch) === -1) {
  console.error('Unsupported architecture.')
  process.exit(1)
}

var binPath = path.join(
  __dirname,
  'bin',
  platform,
  arch,
  platform === 'win32' ? 'ffprobe.exe' : 'ffprobe',
)

exports.path = binPath
