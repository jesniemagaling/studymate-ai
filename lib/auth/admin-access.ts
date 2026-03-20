import { NextRequest } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth/user-id";

export type AccessResult = {
  userId: string | null;
  isAllowed: boolean;
};

function isAllowedAdminEmail(email: string | undefined | null) {
  const list = String(process.env.AI_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !list.length) {
    return false;
  }

  return list.includes(email.toLowerCase());
}

export async function resolveAiSettingsAccess(
  req: NextRequest,
): Promise<AccessResult> {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return { userId: null, isAllowed: false };
  }

  try {
    await connectDB();
    const user = (await User.findById(userId).select("role email").lean()) as {
      role?: string;
      email?: string;
    } | null;

    const allowed =
      (user?.role || "").toLowerCase() === "admin" ||
      isAllowedAdminEmail(user?.email);

    return { userId, isAllowed: allowed };
  } catch {
    return { userId, isAllowed: false };
  }
}
