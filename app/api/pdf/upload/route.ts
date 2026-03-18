import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { processPdfUpload } from "@/lib/services/pdf-upload";

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError({
        message: "No file uploaded",
        status: 400,
        errorCode: "NO_FILE",
      });
    }

    if (file.type !== "application/pdf") {
      return apiError({
        message: "Only PDF files allowed",
        status: 400,
        errorCode: "INVALID_FILE_TYPE",
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processPdfUpload({
      userId,
      fileName: file.name || "uploaded.pdf",
      mimeType: file.type,
      size: file.size,
      buffer,
    });

    if (result.status === "success") {
      return apiSuccess(
        {
          message: result.message,
          text: result.text,
        },
        result.message,
      );
    }

    if (result.status === "fallback") {
      return apiSuccess(
        {
          message: result.message,
          needsManualText: false,
          extractionMode: "fallback",
          code: result.code,
          warning: result.warning,
          text: result.text,
        },
        result.message,
      );
    }

    return apiSuccess(
      {
        message: result.message,
        needsManualText: true,
        extractionMode: "failed",
        code: result.code,
        warning: result.warning,
        text: "",
      },
      result.message,
    );
  } catch (error) {
    console.error("PDF upload error:", error);
    return apiError({
      message: "Failed to process PDF upload",
      status: 500,
      errorCode: "PDF_UPLOAD_FAILED",
    });
  }
}
