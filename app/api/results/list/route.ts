import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import { debug } from "@/lib/debug";
import {
  normalizeStoredResult,
  type LegacyResult,
} from "@/lib/results/normalize";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    debug("Unauthorized request to /results/list");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  debug("Fetching results for:", token.id);

  await connectDB();
  debug("DB connected");

  const rawResults = await Result.find({ userId: token.id })
    .sort({ createdAt: -1 })
    .lean();

  const results = rawResults.map(
    (raw) => normalizeStoredResult(raw as LegacyResult).result,
  );

  debug("Returning results:", results.length);

  return NextResponse.json({ results });
}
