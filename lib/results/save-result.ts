import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import {
  ResultValidationError,
  saveResultForUser,
} from "@/lib/services/results";

export async function saveResultHandler(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  try {
    const rawBody = await req.json();

    const created = await saveResultForUser(userId, rawBody);

    return apiSuccess({ result: created }, "Saved");
  } catch (error) {
    if (error instanceof ResultValidationError) {
      return apiError({
        message: error.message,
        status: 400,
        errorCode: "INVALID_RESULT_PAYLOAD",
        details: error.details,
      });
    }

    console.error("Save result error:", error);
    return apiError({
      message: "Failed to save result",
      status: 500,
      errorCode: "SAVE_RESULT_FAILED",
    });
  }
}
