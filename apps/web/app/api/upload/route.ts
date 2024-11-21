import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import { z } from "zod";
import { join } from "path";
import { cwd } from "process";
import { getAllFiles } from "../../lib/file";

const requestSchema = z.object({
    repositoryUrl: z.string(),
});

export async function POST(request: Request) {
    const body = await request.json();
    const parsedBody = requestSchema.parse(body);

    if (!parsedBody.repositoryUrl) {
        return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    console.log("cwd()");
    console.log(cwd());

    // await simpleGit().clone(parsedBody.repositoryUrl, join(cwd(), "outputs", id));

    // const files = await getAllFiles(join(cwd(), "outputs", id));



    return NextResponse.json({ message: "Repository URL received" }, { status: 200 });
}
