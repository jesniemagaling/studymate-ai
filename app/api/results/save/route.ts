import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/db';
import SavedContent from '@/models/SavedContent';

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, pdfName } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    await connectDB();

    const saved = await SavedContent.create({
      userId: token.id,
      pdfName: pdfName || 'Unknown PDF',
      type: 'reviewer',
      content,
    });

    return NextResponse.json({ message: 'Reviewer saved', saved });
  } catch (error) {
    console.error('SAVE ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to save reviewer' },
      { status: 500 }
    );
  }
}
