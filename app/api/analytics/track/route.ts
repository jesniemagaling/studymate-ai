import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { connectDB } from "@/lib/db";
import Analytics from "@/models/Analytics";
import Result from "@/models/Result";
import Pdf from "@/models/Pdf";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (token.id as string | undefined) || token.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body?.eventType !== "quiz_attempt") {
    return NextResponse.json(
      { error: "Invalid analytics event type" },
      { status: 400 },
    );
  }

  const score = Number(body?.score);
  const totalQuestions = Number(body?.totalQuestions);

  if (!Number.isFinite(score) || !Number.isFinite(totalQuestions)) {
    return NextResponse.json(
      { error: "score and totalQuestions are required numbers" },
      { status: 400 },
    );
  }

  if (totalQuestions <= 0 || score < 0 || score > totalQuestions) {
    return NextResponse.json(
      { error: "Invalid score payload" },
      { status: 400 },
    );
  }

  const percentage = Math.round((score / totalQuestions) * 10000) / 100;

  await connectDB();

  await Analytics.create({
    userId,
    eventType: "quiz_attempt",
    resultId: body?.resultId ? String(body.resultId) : undefined,
    sourcePdfId: body?.sourcePdfId ? String(body.sourcePdfId) : undefined,
    score,
    totalQuestions,
    percentage,
  });

  return NextResponse.json({ message: "Analytics tracked" });
}

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
  const quizStatsPromise = Analytics.aggregate([
    { $match: { userId, eventType: "quiz_attempt" } },
    {
      $group: {
        _id: null,
        totalQuizzesTaken: { $sum: 1 },
        averageQuizScore: { $avg: "$percentage" },
      },
    },
  ]);
  const lastQuizAttemptPromise = Analytics.findOne({
    userId,
    eventType: "quiz_attempt",
  })
    .sort({ createdAt: -1 })
    .select("percentage createdAt score totalQuestions")
    .lean();
  const lastGeneratedPromise = Result.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("createdAt type title")
    .lean();
  const recentGeneratedPromise = Result.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("createdAt type title")
    .lean();

  const [
    pdfCount,
    breakdown,
    quizStats,
    lastQuizAttempt,
    lastGenerated,
    recentGenerated,
  ] = await Promise.all([
    pdfCountPromise,
    breakdownPromise,
    quizStatsPromise,
    lastQuizAttemptPromise,
    lastGeneratedPromise,
    recentGeneratedPromise,
  ]);

  const latestQuizAttempt = lastQuizAttempt as {
    percentage?: number;
    createdAt?: string | Date;
  } | null;

  const recent = lastGenerated as {
    title?: string;
    type?: "reviewer" | "quiz" | "flashcards";
    createdAt?: string | Date;
  } | null;
  const recentActivities = (
    recentGenerated as Array<{
      title?: string;
      type?: "reviewer" | "quiz" | "flashcards";
      createdAt?: string | Date;
    }>
  ).map((item) => ({
    title: item.title,
    type: item.type,
    createdAt: item.createdAt,
  }));

  const reviewerCount =
    breakdown.find((item) => item._id === "reviewer")?.count || 0;
  const quizCount = breakdown.find((item) => item._id === "quiz")?.count || 0;
  const flashcardsCount =
    breakdown.find((item) => item._id === "flashcards")?.count || 0;
  const quizMetrics = quizStats[0] || {
    totalQuizzesTaken: 0,
    averageQuizScore: 0,
  };

  return NextResponse.json({
    pdfsUploaded: pdfCount,
    reviewersGenerated: reviewerCount,
    quizzesGenerated: quizCount,
    flashcardsGenerated: flashcardsCount,
    totalStudyMaterials: reviewerCount + quizCount + flashcardsCount,
    totalQuizzesTaken: quizMetrics.totalQuizzesTaken,
    averageQuizScore:
      Math.round((quizMetrics.averageQuizScore || 0) * 100) / 100,
    lastQuizScore: latestQuizAttempt?.percentage ?? null,
    lastQuizAttemptAt: latestQuizAttempt?.createdAt ?? null,
    lastGenerated: recent
      ? {
          title: recent.title,
          type: recent.type,
          createdAt: recent.createdAt,
        }
      : null,
    recentActivities,
  });
}
