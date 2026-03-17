import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import {
  normalizeStoredResult,
  type LegacyResult,
} from "@/lib/results/normalize";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const rawResult = await Result.findOne({
    _id: params.id,
    userId: token.id,
  }).lean();

  if (!rawResult) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const { result, migrated } = normalizeStoredResult(rawResult as LegacyResult);

  // One-time migration write-back for legacy documents.
  if (migrated) {
    await Result.updateOne(
      { _id: params.id, userId: token.id },
      {
        $set: {
          type: result.type,
          content: result.content,
        },
        $unset: {
          reviewer: "",
          quiz: "",
          flashcards: "",
        },
      },
    );
  }

  return NextResponse.json({ result });
}
