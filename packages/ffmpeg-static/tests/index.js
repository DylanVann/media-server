const test = require('tape')
const { ok, strictEqual } = require('assert')
const { isAbsolute } = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')
const shell = require('any-shell-escape')
const { path: ffmpegPath } = require('..')

test('ffmpeg path is absolute', (t) => {
  ok(isAbsolute(ffmpegPath))
  t.end()
})

test(`${ffmpegPath} is a file`, (t) => {
  ok(fs.statSync(ffmpegPath).isFile(ffmpegPath))
  t.end()
})

test(`${ffmpegPath} is executable`, (t) => {
  fs.accessSync(ffmpegPath, fs.constants.X_OK)
  t.end()
})

test(`\`${ffmpegPath} --help\` works`, (t) => {
  const { status } = spawnSync(ffmpegPath, ['--help'], {
    stdio: ['ignore', 'ignore', 'pipe'], // stdin, stdout, stderr
  })
  strictEqual(status, 0)
  t.end()
})
