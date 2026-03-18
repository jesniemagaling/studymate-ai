import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { connectDB } from "@/lib/db";
import Pdf from "@/models/Pdf";

type PdfRecord = {
  _id: unknown;
  fileName: string;
  extractedText?: string;
  extractionStatus?: "success" | "fallback" | "failed";
  extractionError?: string;
  createdAt?: string | Date;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  const { id } = await params;

  await connectDB();

  const pdf = (await Pdf.findOne({ _id: id, userId })
    .select("fileName extractedText extractionStatus extractionError createdAt")
    .lean()) as PdfRecord | null;

  if (!pdf) {
    return apiError({
      message: "PDF not found",
      status: 404,
      errorCode: "PDF_NOT_FOUND",
    });
  }

  return apiSuccess(
    {
      pdf: {
        id: String(pdf._id),
        fileName: pdf.fileName,
        extractedText: String(pdf.extractedText || ""),
        extractionStatus: pdf.extractionStatus,
        extractionError: pdf.extractionError,
        createdAt: pdf.createdAt,
      },
    },
    "PDF fetched",
  );
}
