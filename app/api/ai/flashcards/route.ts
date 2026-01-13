import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

type Flashcard = {
  front: string;
  back: string;
  keyword: string;
};

export async function POST(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text }: { text: string } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  // ---------- BASIC FLASHCARD LOGIC ----------
  const sentences: string[] = text
    .split('.')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 20);

  const flashcards: Flashcard[] = [];

  sentences.forEach((sentence: string, index: number) => {
    const words: string[] = sentence.split(' ');

    const keyword: string =
      words.find((w: string) => w.length > 6 && /^[A-Za-z]+$/.test(w)) ??
      `Concept ${index + 1}`;

    flashcards.push({
      front: `What is ${keyword}?`,
      back: `${sentence}.`,
      keyword,
    });
  });

  return NextResponse.json({ flashcards });
}
