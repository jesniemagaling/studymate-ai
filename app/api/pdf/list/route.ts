import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { connectDB } from "@/lib/db";
import Pdf from "@/models/Pdf";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  await connectDB();

  const pdfs = await Pdf.find({ userId })
    .sort({ createdAt: -1 })
    .select(
      "fileName size extractedText extractionStatus extractionError createdAt",
    )
    .lean();

  return apiSuccess(
    {
      pdfs: pdfs.map((pdf) => ({
        id: String(pdf._id),
        fileName: pdf.fileName,
        size: pdf.size,
        extractedTextPreview: String(pdf.extractedText || "").slice(0, 180),
        extractionStatus: pdf.extractionStatus,
        extractionError: pdf.extractionError,
        createdAt: pdf.createdAt,
      })),
    },
    "PDF list fetched",
  );
}
