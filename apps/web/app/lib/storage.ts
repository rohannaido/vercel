import { readFile } from "node:fs/promises";

import {
    PutObjectCommand,
    S3Client,
    S3ServiceException,
} from "@aws-sdk/client-s3";

const BUCKET_NAME = "my-vercel-project";
const REGION = "ap-southeast-2";
const key = "test";

/**
 * Upload a file to an S3 bucket.
 * @param {{ bucketName: string, key: string, filePath: string }}
 */
export const uploadFile = async ({ key, filePath }: { key: string, filePath: string }) => {
    const client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: await readFile(filePath),
    });

    try {
        const response = await client.send(command);
        console.log(response);
    } catch (caught) {
        if (
            caught instanceof S3ServiceException &&
            caught.name === "EntityTooLarge"
        ) {
            console.error(
                `Error from S3 while uploading object to ${BUCKET_NAME}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`,
            );
        } else if (caught instanceof S3ServiceException) {
            console.error(
                `Error from S3 while uploading object to ${BUCKET_NAME}.  ${caught.name}: ${caught.message}`,
            );
        } else {
            throw caught;
        }
    }
};
