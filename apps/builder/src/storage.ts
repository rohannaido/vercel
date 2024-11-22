import { S3Client, GetObjectCommand, GetObjectCommandOutput, ListObjectsCommand } from "@aws-sdk/client-s3";
import { join } from "path";
import { cwd } from "process";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";

const BUCKET_NAME = "my-vercel-project";
const REGION = "ap-southeast-2";

export const downloadProject = async (projectId: string) => {
    const client = new S3Client({
        region: REGION,
    });

    const listObjectsCommand = new ListObjectsCommand({
        Bucket: BUCKET_NAME,
        Prefix: `outputs/${projectId}`,
    });

    const { Contents } = await client.send(listObjectsCommand);

    if (!Contents) {
        throw new Error("No contents found");
    }

    for (const content of Contents) {
        console.log(content.Key);
        if (!content.Key) {
            continue;
        }

        const getObjectCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: content.Key,
        });

        const objectData = await client.send(getObjectCommand);

        let localPathArray = content.Key.split("/");
        localPathArray.shift();
        localPathArray.unshift("downloads");
        const localPath = localPathArray.join("/");

        const localFilePath = join(cwd(), localPath);

        await mkdir(dirname(localFilePath), { recursive: true });

        console.log(localFilePath);

        if (!objectData.Body) {
            continue;
        }

        const writeStream = createWriteStream(localFilePath);

        const data = await objectData.Body.transformToByteArray();

        writeStream.write(data);

        console.log(`Downloaded ${localFilePath}`);
    }
};

export const uploadProjectBuild = async (projectId: string) => {
    console.log(`Uploading project ${projectId}`);
};
