import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getOpenAIClient } from "@/lib/openai";

function buildMockReviewer(text: string) {
  const cleaned = text
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  const sentenceCandidates = cleaned
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^[\d.\-\s]+/, "").trim())
    .filter((s) => s.length > 25)
    .filter((s) => !/^(summary|key points?|workflow|overview)$/i.test(s));

  const uniqueSentences: string[] = [];
  for (const item of sentenceCandidates) {
    if (!uniqueSentences.some((x) => x.toLowerCase() === item.toLowerCase())) {
      uniqueSentences.push(item);
    }
  }

  const summary = uniqueSentences.slice(0, 2).join(". ");
  const keyPoints = uniqueSentences
    .slice(0, 5)
    .map((s) => `- ${s.charAt(0).toUpperCase()}${s.slice(1)}`);

  return [
    "[MOCK REVIEWER]",
    "",
    "Summary:",
    summary || cleaned.slice(0, 400),
    "",
    "Key Points:",
    ...(keyPoints.length ? keyPoints : ["- No key points extracted."]),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestText = "";

  try {
    const { text } = await req.json();
    requestText = String(text || "");

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Set MOCK_AI_REVIEWER=true in .env.local to test reviewer flow without OpenAI billing.
    if (process.env.MOCK_AI_REVIEWER === "true") {
      return NextResponse.json({ reviewer: buildMockReviewer(text) });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reviewer: buildMockReviewer(text) });
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an academic assistant. Create a clear and concise reviewer.",
        },
        {
          role: "user",
          content: `Create a reviewer summary for the following text:\n\n${text}`,
        },
      ],
      temperature: 0.4,
    });

    const reviewer = completion.choices[0].message.content;

    return NextResponse.json({ reviewer });
  } catch (error: unknown) {
    console.error("AI generation error:", error);

    const err = error as { code?: string; status?: number };

    if (err?.code === "insufficient_quota") {
      return NextResponse.json({ reviewer: buildMockReviewer(requestText) });
    }

    if (err?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Too many AI requests right now. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    if (err?.status === 401) {
      return NextResponse.json({ reviewer: buildMockReviewer(requestText) });
    }

    return NextResponse.json(
      { error: "Failed to generate reviewer. Please try again." },
      { status: 500 },
    );
  }
}
