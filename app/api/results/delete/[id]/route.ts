import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const deleted = await Result.findOneAndDelete({
    _id: params.id,
    userId: token.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}
