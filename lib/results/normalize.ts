import type { StudyResult } from "@/types/result";
import {
  FlashcardContentSchema,
  QuizContentSchema,
  ReviewerContentSchema,
} from "@/lib/validation/result";
import { sanitizeStudyText } from "@/lib/text/sanitize";

export type LegacyResult = {
  _id: unknown;
  userId: string;
  title?: string;
  sourcePdfId?: unknown;
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
    const content = raw.content as { summary: string; keyPoints: string[] };
    return {
      summary: sanitizeStudyText(content.summary),
      keyPoints: content.keyPoints.map((point) => sanitizeStudyText(point)),
    };
  }

  if (typeof raw.content === "string") {
    const summary = raw.content;
    const keyPoints = summary
      .split("\n")
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean)
      .slice(0, 5);

    return {
      summary: sanitizeStudyText(summary),
      keyPoints: keyPoints.map((point) => sanitizeStudyText(point)),
    };
  }

  if (typeof raw.reviewer === "string") {
    return {
      summary: sanitizeStudyText(raw.reviewer),
      keyPoints: raw.reviewer
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean)
        .slice(0, 5)
        .map((point) => sanitizeStudyText(point)),
    };
  }

  return { summary: "", keyPoints: [] };
}

function normalizeQuizContent(raw: LegacyResult): {
  questions: {
    question: string;
    options: string[];
    answer: string;
    difficulty: "easy" | "medium" | "hard";
    questionType?: "multiple_choice" | "fill_in_blank";
    contextHint?: string;
  }[];
} {
  if (QuizContentSchema.safeParse(raw.content).success) {
    const content = raw.content as {
      questions: {
        question: string;
        options: string[];
        answer: string;
        difficulty: "easy" | "medium" | "hard";
        questionType?: "multiple_choice" | "fill_in_blank";
        contextHint?: string;
      }[];
    };

    return {
      questions: content.questions.map((q) => ({
        ...q,
        question: sanitizeStudyText(q.question),
        options: q.options.map((opt) => sanitizeStudyText(opt)),
        answer: sanitizeStudyText(q.answer),
        contextHint: q.contextHint
          ? sanitizeStudyText(q.contextHint)
          : undefined,
      })),
    };
  }

  const withDefaultDifficulty = (items: unknown[]) => {
    return items.map((item) => {
      const q = item as {
        question?: string;
        options?: string[];
        answer?: string;
        difficulty?: "easy" | "medium" | "hard";
        questionType?: "multiple_choice" | "fill_in_blank";
        contextHint?: string;
      };

      return {
        question: sanitizeStudyText(q.question || ""),
        options: Array.isArray(q.options)
          ? q.options.map((opt) => sanitizeStudyText(opt))
          : [],
        answer: sanitizeStudyText(q.answer || ""),
        difficulty: q.difficulty || "medium",
        questionType: q.questionType || "multiple_choice",
        contextHint: q.contextHint
          ? sanitizeStudyText(q.contextHint)
          : undefined,
      };
    });
  };

  if (Array.isArray(raw.content)) {
    return {
      questions: withDefaultDifficulty(raw.content),
    };
  }

  if (Array.isArray(raw.quiz)) {
    return {
      questions: withDefaultDifficulty(raw.quiz),
    };
  }

  return { questions: [] };
}

function normalizeFlashcardsContent(raw: LegacyResult): {
  cards: { front: string; back: string }[];
} {
  const capitalizeLeadingWord = (value: string) => {
    const trimmed = sanitizeStudyText(value);
    if (!trimmed) return "";

    return trimmed.replace(/^([a-z])/, (match) => match.toUpperCase());
  };

  const sanitizeCards = (cards: { front: string; back: string }[]) => {
    return cards.map((card) => ({
      front: sanitizeStudyText(card.front).replace(
        /^What is\s+([a-z])(.*)\?$/,
        (_, first: string, rest: string) =>
          `What is ${first.toUpperCase()}${rest}?`,
      ),
      back: capitalizeLeadingWord(card.back),
    }));
  };

  if (FlashcardContentSchema.safeParse(raw.content).success) {
    return {
      cards: sanitizeCards(
        (raw.content as { cards: { front: string; back: string }[] }).cards,
      ),
    };
  }

  if (Array.isArray(raw.content)) {
    return {
      cards: sanitizeCards(raw.content as { front: string; back: string }[]),
    };
  }

  if (Array.isArray(raw.flashcards)) {
    return {
      cards: sanitizeCards(raw.flashcards as { front: string; back: string }[]),
    };
  }

  return { cards: [] };
}

export function normalizeStoredResult(raw: LegacyResult): NormalizedResult {
  const id = String(raw._id);
  const title = raw.title || "Untitled Result";
  const sourcePdfId = raw.sourcePdfId ? String(raw.sourcePdfId) : undefined;
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
        sourcePdfId,
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
        sourcePdfId,
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
      sourcePdfId,
      type: "reviewer",
      content,
      createdAt,
      updatedAt,
    },
    migrated,
  };
}
