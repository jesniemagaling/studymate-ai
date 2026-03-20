import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { AIPipelineInputError, generateFlashcards } from "@/lib/ai/service";

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
    const generated = await generateFlashcards({ text });

    return apiSuccess(
      {
        flashcards: generated.flashcards,
        generationMode: generated.telemetry.generationMode,
        pipelineVersion: generated.telemetry.pipelineVersion,
        retryCount: generated.telemetry.retryCount,
        provider: generated.telemetry.provider,
      },
      "Flashcards generated",
    );
  } catch (error) {
    if (error instanceof AIPipelineInputError) {
      return apiError({
        message: error.message,
        status: 400,
        errorCode: "INVALID_FLASHCARD_INPUT",
      });
    }

    console.error("Flashcard generation error:", error);
    return apiError({
      message: "Failed to generate flashcards",
      status: 500,
      errorCode: "FLASHCARD_GENERATION_FAILED",
    });
  }
}
