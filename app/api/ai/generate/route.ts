import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { AIPipelineInputError, generateReviewer } from "@/lib/ai/service";

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
    const { text }: { text: string } = await req.json();
    const generated = await generateReviewer({ text });

    return apiSuccess(
      {
        reviewer: generated.reviewer,
        generationMode: generated.telemetry.generationMode,
        pipelineVersion: generated.telemetry.pipelineVersion,
        retryCount: generated.telemetry.retryCount,
        provider: generated.telemetry.provider,
      },
      "Reviewer generated",
    );
  } catch (error: unknown) {
    if (error instanceof AIPipelineInputError) {
      return apiError({
        message: error.message,
        status: 400,
        errorCode: "INVALID_GENERATION_INPUT",
      });
    }

    console.error("Reviewer generation error:", error);
    return apiError({
      message: "Failed to generate reviewer. Please try again.",
      status: 500,
      errorCode: "REVIEWER_GENERATION_FAILED",
    });
  }
}
