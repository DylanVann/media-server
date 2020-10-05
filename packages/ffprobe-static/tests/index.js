const test = require('tape')
const fs = require('fs')
const ffprobe = require('..')

test('ffprobe path should exist on fs', (t) => {
  var stats = fs.statSync(ffprobe.path)
  t.ok(stats.isFile(ffprobe.path))
  t.end()
})
