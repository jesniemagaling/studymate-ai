import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import { SaveResultSchema } from "@/lib/validation/result";

export async function saveResultHandler(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parsed = SaveResultSchema.parse(rawBody);

    await connectDB();

    const created = await Result.create({
      userId: token.id,
      title: parsed.title?.trim() || "Untitled Result",
      type: parsed.type,
      content: parsed.content,
    });

    return NextResponse.json({
      message: "Saved",
      result: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid result payload",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Save result error:", error);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 },
    );
  }
}
