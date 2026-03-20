import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { getLocalProviderHealth } from "@/lib/ai/health";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  try {
    const health = await getLocalProviderHealth();

    return apiSuccess({ health }, "AI provider health fetched");
  } catch (error) {
    console.error("AI health route error:", error);
    return apiError({
      message: "Failed to fetch AI provider health",
      status: 500,
      errorCode: "AI_HEALTH_FETCH_FAILED",
    });
  }
}
