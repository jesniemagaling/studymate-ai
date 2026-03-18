import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { getResultForUser, ResultNotFoundError } from "@/lib/services/results";

export async function GET(
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
    const result = await getResultForUser(userId, id);

    return apiSuccess({ result }, "Result fetched");
  } catch (error) {
    if (error instanceof ResultNotFoundError) {
      return apiError({
        message: "Result not found",
        status: 404,
        errorCode: "RESULT_NOT_FOUND",
      });
    }

    return apiError({
      message: "Failed to fetch result",
      status: 500,
      errorCode: "RESULT_FETCH_FAILED",
    });
  }
}
