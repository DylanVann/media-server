#!/bin/bash

aws lambda publish-layer-version \
--layer-name sharp \
--description 'sharp' \
--zip-file fileb://index.zip \
--compatible-runtimes nodejs12.x
