#!/bin/bash

aws lambda publish-layer-version \
--layer-name fluent-ffmpeg \
--description 'fluent-ffmpeg' \
--zip-file fileb://index.zip \
--compatible-runtimes nodejs12.x