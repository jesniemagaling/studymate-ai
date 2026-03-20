import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { AIPipelineInputError, generateQuiz } from "@/lib/ai/service";

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
    const {
      text,
      difficulty = "medium",
      count = 5,
      questionType = "multiple_choice",
    }: {
      text: string;
      difficulty?: "easy" | "medium" | "hard";
      count?: number;
      questionType?: "multiple_choice" | "fill_in_blank";
    } = await req.json();

    const generated = await generateQuiz({
      text,
      difficulty,
      count,
      questionType,
    });

    return apiSuccess(
      {
        questions: generated.questions,
        generationMode: generated.telemetry.generationMode,
        pipelineVersion: generated.telemetry.pipelineVersion,
        retryCount: generated.telemetry.retryCount,
        provider: generated.telemetry.provider,
      },
      "Quiz generated",
    );
  } catch (err) {
    if (err instanceof AIPipelineInputError) {
      return apiError({
        message: err.message,
        status: 400,
        errorCode: "INVALID_QUIZ_INPUT",
      });
    }

    console.error("Quiz generation error:", err);
    return apiError({
      message: "Failed to generate quiz",
      status: 500,
      errorCode: "QUIZ_GENERATION_FAILED",
    });
  }
}
