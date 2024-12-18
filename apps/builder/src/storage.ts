import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { join } from "path";
import { cwd } from "process";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { readdir, stat, readFile } from "fs/promises";
const BUCKET_NAME = "my-vercel-project";
const REGION = "ap-southeast-2";
import { createClient } from "redis";
const publisher = createClient();

export const downloadProject = async (projectId: string) => {
    if (!publisher.isOpen) {
        await publisher.connect();
    }

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

    let uploadedFiles = 0;
    const totalFiles = Contents.length;

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
        await publisher.publish(`deployment:${projectId}:builder:download`, JSON.stringify({
            file: localFilePath,
            current: ++uploadedFiles,
            total: totalFiles,
            percentage: Math.round((uploadedFiles / totalFiles) * 100)
        }));
    }
};

export const uploadProjectBuild = async (projectId: string) => {
    if (!publisher.isOpen) {
        publisher.connect();
    }

    const client = new S3Client({
        region: REGION,
    });

    const files = await getAllFiles(join(cwd(), `builds/${projectId}`));

    const totalFiles = files.length;
    let uploadedFiles = 0;

    for (const file of files) {
        const uploadObjectCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.slice(cwd().length + 1),
            Body: await readFile(file),
        });

        await client.send(uploadObjectCommand);

        publisher.publish(`deployment:${projectId}:builder:upload-output`, JSON.stringify({
            file: file,
            current: ++uploadedFiles,
            total: totalFiles,
            percentage: Math.round((uploadedFiles / totalFiles) * 100)
        }))
        console.log(`Uploaded ${file}`);
    }
};

const getAllFiles = async (path: string) => {
    const files = await readdir(path);
    const result: string[] = [];
    for (const file of files) {
        const filePath = join(path, file);
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            result.push(...(await getAllFiles(filePath)));
        } else {
            result.push(filePath);
        }
    }
    return result;
};
