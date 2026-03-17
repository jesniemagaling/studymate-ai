import type { StudyResult } from "@/types/result";
import {
  FlashcardContentSchema,
  QuizContentSchema,
  ReviewerContentSchema,
} from "@/lib/validation/result";

export type LegacyResult = {
  _id: unknown;
  userId: string;
  title?: string;
  type?: "reviewer" | "quiz" | "flashcards";
  content?: unknown;
  reviewer?: string;
  quiz?: unknown;
  flashcards?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type NormalizedResult = {
  result: StudyResult;
  migrated: boolean;
};

function toIsoDate(value: Date | string | undefined) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

function normalizeReviewerContent(raw: LegacyResult): {
  summary: string;
  keyPoints: string[];
} {
  if (ReviewerContentSchema.safeParse(raw.content).success) {
    return raw.content as { summary: string; keyPoints: string[] };
  }

  if (typeof raw.content === "string") {
    const summary = raw.content;
    const keyPoints = summary
      .split("\n")
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean)
      .slice(0, 5);

    return { summary, keyPoints };
  }

  if (typeof raw.reviewer === "string") {
    return {
      summary: raw.reviewer,
      keyPoints: raw.reviewer
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean)
        .slice(0, 5),
    };
  }

  return { summary: "", keyPoints: [] };
}

function normalizeQuizContent(raw: LegacyResult): {
  questions: { question: string; options: string[]; answer: string }[];
} {
  if (QuizContentSchema.safeParse(raw.content).success) {
    return raw.content as {
      questions: { question: string; options: string[]; answer: string }[];
    };
  }

  if (Array.isArray(raw.content)) {
    return {
      questions: raw.content as {
        question: string;
        options: string[];
        answer: string;
      }[],
    };
  }

  if (Array.isArray(raw.quiz)) {
    return {
      questions: raw.quiz as {
        question: string;
        options: string[];
        answer: string;
      }[],
    };
  }

  return { questions: [] };
}

function normalizeFlashcardsContent(raw: LegacyResult): {
  cards: { front: string; back: string }[];
} {
  if (FlashcardContentSchema.safeParse(raw.content).success) {
    return raw.content as { cards: { front: string; back: string }[] };
  }

  if (Array.isArray(raw.content)) {
    return { cards: raw.content as { front: string; back: string }[] };
  }

  if (Array.isArray(raw.flashcards)) {
    return { cards: raw.flashcards as { front: string; back: string }[] };
  }

  return { cards: [] };
}

export function normalizeStoredResult(raw: LegacyResult): NormalizedResult {
  const id = String(raw._id);
  const title = raw.title || "Untitled Result";
  const createdAt = toIsoDate(raw.createdAt);
  const updatedAt = toIsoDate(raw.updatedAt);

  if (raw.type === "quiz") {
    const content = normalizeQuizContent(raw);
    const migrated = !QuizContentSchema.safeParse(raw.content).success;
    return {
      result: {
        id,
        userId: raw.userId,
        title,
        type: "quiz",
        content,
        createdAt,
        updatedAt,
      },
      migrated,
    };
  }

  if (raw.type === "flashcards") {
    const content = normalizeFlashcardsContent(raw);
    const migrated = !FlashcardContentSchema.safeParse(raw.content).success;
    return {
      result: {
        id,
        userId: raw.userId,
        title,
        type: "flashcards",
        content,
        createdAt,
        updatedAt,
      },
      migrated,
    };
  }

  const content = normalizeReviewerContent(raw);
  const migrated = !ReviewerContentSchema.safeParse(raw.content).success;
  return {
    result: {
      id,
      userId: raw.userId,
      title,
      type: "reviewer",
      content,
      createdAt,
      updatedAt,
    },
    migrated,
  };
}
