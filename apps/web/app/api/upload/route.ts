import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import { z } from "zod";
import { join } from "path";
import { cwd } from "process";
import { getAllFiles } from "../../lib/file";
import { uploadFile } from "../../lib/storage";
import { createClient } from "redis";
const publisher = createClient();

const requestSchema = z.object({
    repositoryUrl: z.string(),
});

export async function POST(request: Request) {
    const body = await request.json();
    const parsedBody = requestSchema.parse(body);

    if (!parsedBody.repositoryUrl) {
        return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // const id = crypto.randomUUID();

    // await simpleGit().clone(parsedBody.repositoryUrl, join(cwd(), "outputs", id));

    // const files = await getAllFiles(join(cwd(), "outputs", id));

    // for (const file of files) {
    //     const key = file.slice(cwd().length + 1);
    //     console.log("key");
    //     console.log(key);
    //     await uploadFile({ key, filePath: file });
    // }

    // Connect to Redis if not already connected
    if (!publisher.isOpen) {
        await publisher.connect();
    }

    await publisher.hSet("status", "123", "uploading");

    await publisher.lPush("build-queue", "123");

    // Optionally disconnect after use
    await publisher.disconnect();

    return NextResponse.json({ message: "Repository URL received" }, { status: 200 });
}
