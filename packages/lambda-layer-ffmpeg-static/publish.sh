#!/bin/bash

aws lambda publish-layer-version \
--layer-name ffmpeg-static \
--description '@dylanvann/ffmpeg-static' \
--zip-file fileb://index.zip \
--compatible-runtimes nodejs12.x