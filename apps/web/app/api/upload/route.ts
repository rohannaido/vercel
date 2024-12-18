import { cloneAndUploadRepository } from "@/app/lib/upload";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    cloneAndUploadRepository(id, parsedBody.repositoryUrl);

    return NextResponse.json({ message: "Repository URL received", id, }, { status: 200 });
}
