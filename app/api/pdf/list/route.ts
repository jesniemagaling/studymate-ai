import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { connectDB } from "@/lib/db";
import Pdf from "@/models/Pdf";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (token.id as string | undefined) || token.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const pdfs = await Pdf.find({ userId })
    .sort({ createdAt: -1 })
    .select(
      "fileName size extractedText extractionStatus extractionError createdAt",
    )
    .lean();

  return NextResponse.json({
    pdfs: pdfs.map((pdf) => ({
      id: String(pdf._id),
      fileName: pdf.fileName,
      size: pdf.size,
      extractedTextPreview: String(pdf.extractedText || "").slice(0, 180),
      extractionStatus: pdf.extractionStatus,
      extractionError: pdf.extractionError,
      createdAt: pdf.createdAt,
    })),
  });
}
