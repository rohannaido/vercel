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

        const contentType = filePath.endsWith(".css")
            ? "text/css"
            : filePath.endsWith(".js")
                ? "application/javascript"
                : "text/html";

        res.setHeader("Content-Type", contentType);
        res.send(data);
    } catch (error) {
        res.status(404).send("Not found");
    }
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});