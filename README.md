# media-server

- Source S3 bucket.
  - This is where you store original images.
- Source S3 bucket CloudFront distribution.
  - This is in front of your source S3 bucket to improve the speed that the lambda can download source images.
- Lambda transform function.
  - This is the function for transforming images and videos.
- Lambda API Gateway.
  - This allows the lambda to function as a REST API.
- API CloudFront distribution.
  - This is in front of your api. It caches responses to improve performance.
