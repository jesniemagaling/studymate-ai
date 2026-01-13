import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/db';
import Result from '@/models/Result';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const result = await Result.findOne({
    _id: params.id,
    userId: token.id,
  });

  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  return NextResponse.json({ result });
}
