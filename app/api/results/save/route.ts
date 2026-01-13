import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/db';
import Result from '@/models/Result';
import { debug } from '@/lib/debug';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    debug('Unauthorized request to /results/save');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, type } = await req.json();

  debug('Incoming Save Request:', { userId: token.id, title, type });

  if (!content || !type) {
    debug('Missing fields:', { content, type });
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await connectDB();
  debug('DB connected');

  const newResult = await Result.create({
    userId: token.id,
    title: title || 'Untitled Result',
    content,
    type,
  });

  debug('Saved Result:', newResult);

  return NextResponse.json({ message: 'Saved', result: newResult });
}
