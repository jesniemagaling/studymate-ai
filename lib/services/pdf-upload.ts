import {
  extractTextFromPDF,
  extractTextFromPDFMalformedFallback,
  PdfExtractionError,
} from "@/lib/pdf";
import { connectDB } from "@/lib/db";
import Pdf from "@/models/Pdf";

type PdfUploadSuccess = {
  status: "success";
  message: string;
  pdfId: string;
  text: string;
};

type PdfUploadFallback = {
  status: "fallback";
  message: string;
  pdfId: string;
  text: string;
  warning: string;
  code: "MALFORMED_PDF" | "EMPTY_TEXT";
};

type PdfUploadFailed = {
  status: "failed";
  message: string;
  pdfId: string;
  text: "";
  warning: string;
  code: "MALFORMED_PDF" | "EMPTY_TEXT";
};

export type PdfUploadResult =
  | PdfUploadSuccess
  | PdfUploadFallback
  | PdfUploadFailed;

export async function processPdfUpload(input: {
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}): Promise<PdfUploadResult> {
  const { userId, fileName, mimeType, size, buffer } = input;

  try {
    const text = await extractTextFromPDF(buffer);

    await connectDB();
    const created = await Pdf.create({
      userId,
      fileName,
      mimeType,
      size,
      extractedText: text,
      extractionStatus: "success",
    });

    return {
      status: "success",
      message: "PDF processed successfully",
      pdfId: String(created._id),
      text,
    };
  } catch (error) {
    if (!(error instanceof PdfExtractionError)) {
      throw error;
    }

    if (error.code !== "MALFORMED_PDF" && error.code !== "EMPTY_TEXT") {
      throw error;
    }

    const fallbackText = extractTextFromPDFMalformedFallback(buffer);

    await connectDB();
    const created = await Pdf.create({
      userId,
      fileName,
      mimeType,
      size,
      extractedText: fallbackText,
      extractionStatus: fallbackText ? "fallback" : "failed",
      extractionError: error.message,
    });

    if (fallbackText) {
      return {
        status: "fallback",
        message:
          "PDF uploaded. We auto-recovered text from a malformed file; review it before generating.",
        pdfId: String(created._id),
        text: fallbackText,
        warning: error.message,
        code: error.code,
      };
    }

    return {
      status: "failed",
      message:
        "PDF uploaded, but text extraction failed. You can paste text manually to continue.",
      pdfId: String(created._id),
      text: "",
      warning: error.message,
      code: error.code,
    };
  }
}
