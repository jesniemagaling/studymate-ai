import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function getUserIdFromRequest(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return null;
  }

  return (token.id as string | undefined) || token.sub || null;
}
