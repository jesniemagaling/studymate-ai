import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an academic assistant. Create a clear and concise reviewer.',
        },
        {
          role: 'user',
          content: `Create a reviewer summary for the following text:\n\n${text}`,
        },
      ],
      temperature: 0.4,
    });

    const reviewer = completion.choices[0].message.content;

    return NextResponse.json({ reviewer });
  } catch (error: any) {
    console.error('AI generation error:', error);
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return NextResponse.json(
        {
          error:
            'AI usage limit reached. Please try again later or contact support.',
        },
        { status: 429 }
      );
    }
    if (error?.message) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Failed to generate reviewer. Please try again.' },
      { status: 500 }
    );
  }
}
