import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import {
  ResultNotFoundError,
  ResultValidationError,
  updateResultTitleForUser,
} from "@/lib/services/results";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);

  const body = await req.json().catch(() => ({}));

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  try {
    const updatedTitle = await updateResultTitleForUser(
      userId,
      id,
      String(body?.title || ""),
    );

    return apiSuccess({ title: updatedTitle }, "Title updated");
  } catch (error) {
    if (error instanceof ResultValidationError) {
      return apiError({
        message: error.message,
        status: 400,
        errorCode: "INVALID_TITLE",
      });
    }

    if (error instanceof ResultNotFoundError) {
      return apiError({
        message: "Result not found",
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
      });
    }

    return apiError({
      message: "Failed to update title",
      status: 500,
      errorCode: "RESULT_UPDATE_FAILED",
    });
  }
}
