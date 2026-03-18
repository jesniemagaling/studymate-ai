import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import formidable from "formidable";
import fs from "fs";
import {
  extractTextFromPDF,
  extractTextFromPDFMalformedFallback,
  PdfExtractionError,
} from "@/lib/pdf";
import { connectDB } from "@/lib/db";
import Pdf from "@/models/Pdf";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let uploadedFileName = "uploaded.pdf";
  let uploadedFileSize = 0;
  let uploadedBuffer: Buffer | null = null;

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (token.id as string | undefined) || token.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const files = await new Promise<formidable.Files>((resolve, reject) => {
      const form = formidable();

      form.parse(req, (err, _fields, parsedFiles) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(parsedFiles);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    uploadedFileName = file.originalFilename || "uploaded.pdf";
    uploadedFileSize = file.size;

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files allowed" });
    }

    const buffer = fs.readFileSync(file.filepath);
    uploadedBuffer = buffer;
    const text = await extractTextFromPDF(buffer);

    await connectDB();
    await Pdf.create({
      userId,
      fileName: uploadedFileName,
      mimeType: file.mimetype,
      size: uploadedFileSize,
      extractedText: text,
      extractionStatus: "success",
    });

    console.log("PDF TEXT LENGTH:", text.length);

    return res.status(200).json({
      message: "PDF processed successfully",
      text,
    });
  } catch (error) {
    console.error("PDF upload error:", error);

    if (error instanceof PdfExtractionError) {
      if (error.code === "MALFORMED_PDF" || error.code === "EMPTY_TEXT") {
        const fallbackText = uploadedBuffer
          ? extractTextFromPDFMalformedFallback(uploadedBuffer)
          : "";

        try {
          const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
          });
          const userId = (token?.id as string | undefined) || token?.sub;

          if (userId) {
            await connectDB();
            await Pdf.create({
              userId,
              fileName: uploadedFileName,
              mimeType: "application/pdf",
              size: uploadedFileSize,
              extractedText: fallbackText,
              extractionStatus: fallbackText ? "fallback" : "failed",
              extractionError: error.message,
            });
          }
        } catch (saveError) {
          console.error(
            "Failed to save failed-extraction PDF record:",
            saveError,
          );
        }

        if (fallbackText) {
          return res.status(200).json({
            message:
              "PDF uploaded. We auto-recovered text from a malformed file; review it before generating.",
            needsManualText: false,
            extractionMode: "fallback",
            code: error.code,
            warning: error.message,
            text: fallbackText,
          });
        }

        return res.status(200).json({
          message:
            "PDF uploaded, but text extraction failed. You can paste text manually to continue.",
          needsManualText: true,
          extractionMode: "failed",
          code: error.code,
          warning: error.message,
          text: "",
        });
      }

      return res.status(500).json({ error: error.message, code: error.code });
    }

    return res.status(500).json({ error: "Failed to process PDF upload" });
  }
}
