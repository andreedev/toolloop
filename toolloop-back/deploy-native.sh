#!/bin/bash

set -e  # Stop on errors

echo "Building native image..."
mvn clean package -Pnative -DskipTests

ZIP_PATH="target/function.zip"

# Check if ZIP exists and is not empty
if [[ -f "$ZIP_PATH" && -s "$ZIP_PATH" ]]; then
    echo "ZIP generated successfully: $ZIP_PATH"

    echo "Uploading to EC2 instance..."
    scp "$ZIP_PATH" ec2-user@your-ec2-instance:/home/ec2-user/

    echo "Deployment complete."

else
    echo "Error: ZIP file not found or is empty. Aborting upload."
    exit 1
fi