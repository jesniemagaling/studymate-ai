import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import {
  deleteResultForUser,
  ResultNotFoundError,
} from "@/lib/services/results";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  try {
    await deleteResultForUser(userId, id);

    return apiSuccess({}, "Deleted successfully");
  } catch (error) {
    if (error instanceof ResultNotFoundError) {
      return apiError({
        message: "Result not found",
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
      });
    }

    return apiError({
      message: "Failed to delete result",
      status: 500,
      errorCode: "RESULT_DELETE_FAILED",
    });
  }
}
