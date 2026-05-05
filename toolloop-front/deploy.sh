#!/bin/bash

export AWS_PAGER=""
S3_BUCKET="toolloop-angular-app"
BUILD_PATH="dist/toolloop-front/browser/"

AWS_PROFILE="mari"
export AWS_PROFILE

echo "Building Angular app for production..."
npm run build

echo "Uploading to S3"
aws s3 sync "$BUILD_PATH" s3://$S3_BUCKET/ \
    --delete \
    --region us-east-1 \
    --cache-control "no-cache,no-store,must-revalidate" \
    --acl public-read \
    --exclude ".git*"