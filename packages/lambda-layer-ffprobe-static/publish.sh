#!/bin/bash

aws lambda publish-layer-version \
--layer-name ffprobe-static \
--description '@dylanvann/ffprobe-static' \
--zip-file fileb://index.zip \
--compatible-runtimes nodejs12.x