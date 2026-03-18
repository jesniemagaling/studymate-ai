import { NextRequest } from "next/server";
import { debug } from "@/lib/debug";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { listResultsForUser } from "@/lib/services/results";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    debug("Unauthorized request to /results/list");
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  debug("Fetching results for:", userId);

  const results = await listResultsForUser(userId);

  debug("Returning results:", results.length);

  return apiSuccess({ results }, "Results fetched");
}
