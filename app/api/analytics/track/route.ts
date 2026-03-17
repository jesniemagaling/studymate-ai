import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
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

  const pdfCountPromise = Pdf.countDocuments({ userId });
  const breakdownPromise = Result.aggregate([
    { $match: { userId } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);
  const lastGeneratedPromise = Result.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("createdAt type title")
    .lean();

  const [pdfCount, breakdown, lastGenerated] = await Promise.all([
    pdfCountPromise,
    breakdownPromise,
    lastGeneratedPromise,
  ]);

  const reviewerCount =
    breakdown.find((item) => item._id === "reviewer")?.count || 0;
  const quizCount = breakdown.find((item) => item._id === "quiz")?.count || 0;
  const flashcardsCount =
    breakdown.find((item) => item._id === "flashcards")?.count || 0;

  return NextResponse.json({
    pdfsUploaded: pdfCount,
    reviewersGenerated: reviewerCount,
    quizzesGenerated: quizCount,
    flashcardsGenerated: flashcardsCount,
    totalStudyMaterials: reviewerCount + quizCount + flashcardsCount,
    lastGenerated: lastGenerated
      ? {
          title: lastGenerated.title,
          type: lastGenerated.type,
          createdAt: lastGenerated.createdAt,
        }
      : null,
  });
}
