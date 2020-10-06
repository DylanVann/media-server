# media-server

Supports resizing media on the fly using Lambda.

**Optimize and resize image:**

https://dgf765uuww7bi.cloudfront.net/ri-yoi-sun-bfab85d2de0c5f67c52d3df68a8c5c91.jpg?w=1194

**Optimize and resize video:**

https://dgf765uuww7bi.cloudfront.net/378f729d3cdd3f97bf01c67b3dafd5e5-prsm-trimmed.mp4

**Supported parameters:**

Functionality is relatively limited at the moment, only supporting two parameters.

If the need arises support for specifying height (`h`) or cropping logic could be added.

- `w` - Change width while preserving aspect ratio.
- `fm` - Set the desired format.
  - Formats:
    - `webp`
    - `mp4` - Not sure what this will do if you try it on an image.
    - `json` - Returns original `width` and `height` of the media in JSON.
      - e.g. `{ width: 1920, height: 1080 }`
      - This can be used to avoid layout shifting while preserving image aspect ratio.
    - `jpeg`
    - `png`
  - Setting an image format when the original is an `mp4` will get a thumbnail from the video.

## AWS Components

- Source S3 bucket.
  - This is where you store original images.
- Source S3 bucket CloudFront distribution.
  - This is in front of your source S3 bucket to improve the speed that the lambda can download source images.
- Lambda transform function.
  - This is the function for transforming images and videos.
- Lambda API Gateway.
  - This allows the lambda to function as a REST API.
  - Should be "REST" protocol.
  - Should enable `*/*` in "Binary Media Types".
- API CloudFront distribution.
  - This is in front of your api. It caches responses to improve performance.
  - This should pass through the `w` and `fm` query parameters.

## Packages

- `ffmpeg-static` - Static binaries for FFmpeg.
- `ffprobe-static` - Static binaries for FFprobe.
- `lambda-layer-ffmpeg-static` - Provides `@dylanvann/ffmpeg-static` as a lambda layer.
- `lambda-layer-ffprobe-static` - Provides `@dylanvann/ffprobe-static` as a lambda layer.
- `lambda-layer-fluent-ffmpeg` - Provides `fluent-ffmpeg` as a lambda layer.
- `lambda-layer-sharp` - Provides `sharp` as a lambda layer.
- `lambda-media-transformer` - The lambda for transforming media.

## Building

These packages use native libraries.
To build these packages correctly you should use an environment similar to AWS Lambda.
This can be accomplished using Docker.

Maybe in the future all dependencies could be WebAssembly, given that this is performance sensitive though it may be a while before that's feasible.

```bash
# Install dependencies.
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x .yarn/releases/yarn-1.22.10.js install
# Build packages.
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x .yarn/releases/yarn-1.22.10.js run build
```

## Publishing / Deploying

Some of these packages have `publish.sh` files for updating things on AWS.

For the most part though you will have to create and configure the components listed above in
[AWS Components](#aws-components) yourself.
Obviously there's room for improvement here maybe using AWS CDK.

There is one hardcoded variable that should probably be an environment variable, `sourceCloudFrontUrl` in [./packages/lambda-media-transformer/src/index.ts](./packages/lambda-media-transformer/src/index.ts).
