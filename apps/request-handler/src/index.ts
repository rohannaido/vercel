import express, { Request, Response } from "express";
import { S3Client, GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const app = express();


const client = new S3Client({
    region: "ap-southeast-2",
});

app.get("/*", async (req: Request, res: Response) => {
    try {

        const hostname = req.hostname;
        const projectId = hostname.split(".")[0];
        const requestPath = req.path == "/" ? "/index.html" : req.path;
        const filePath = `builds/${projectId}${requestPath}`;

        const command = new GetObjectCommand({
            Bucket: "my-vercel-project",
            Key: filePath,
        });

        const response = await client.send(command);

        const data = await response.Body?.transformToString();

        let contentType;

        switch (true) {
            case filePath.endsWith(".css"):
                contentType = "text/css";
                break;
            case filePath.endsWith(".js"):
                contentType = "application/javascript";
                break;
            case filePath.endsWith(".png"):
                contentType = "image/png";
                break;
            case filePath.endsWith(".svg"):
                contentType = "image/svg+xml";
                break;
            default:
                contentType = "text/html";
        }

        res.setHeader("Content-Type", contentType);

        // Handle binary data properly for images
        if (contentType.startsWith("image/")) {
            const buffer = Buffer.from(data || '', "binary");
            res.send(buffer);
        } else {
            res.send(data);
        }
    } catch (error) {
        res.status(404).send("Not found");
    }
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});