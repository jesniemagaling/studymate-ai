import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
};

const DIFFICULTY_PREFIX: Record<"easy" | "medium" | "hard", string> = {
  easy: "Basic concept",
  medium: "Application concept",
  hard: "Advanced concept",
};

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      text,
      difficulty = "medium",
    }: {
      text: string;
      difficulty?: "easy" | "medium" | "hard";
    } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 },
      );
    }

    const sentences: string[] = text
      .split(".")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);

    const questions: QuizQuestion[] = sentences
      .slice(0, 5)
      .map((sentence: string, idx: number) => {
        const words = sentence.split(" ");
        const answer = words[0];

        return {
          id: idx + 1,
          question: `${DIFFICULTY_PREFIX[difficulty]}: What is the main topic discussed in "${sentence.substring(
            0,
            40,
          )}..."?`,
          options: [
            answer,
            "Background information",
            "An example topic",
            "A definition or concept",
          ],
          answer,
          difficulty,
        };
      });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
