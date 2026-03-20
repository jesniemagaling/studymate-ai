import { z } from "zod";

export const reviewerSchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
});

export const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        answer: z.string().min(1),
      }),
    )
    .min(1),
});

export const flashcardsSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        keyword: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function extractJsonObject(raw: string): string {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw.trim();
}
