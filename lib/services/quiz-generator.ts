export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizQuestionType = "multiple_choice" | "fill_in_blank";
import { sanitizeStudyText } from "@/lib/text/sanitize";

export type GeneratedQuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: QuizDifficulty;
  questionType: QuizQuestionType;
  contextHint: string;
};

export class QuizGenerationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizGenerationInputError";
  }
}

function cleanSentence(sentence: string) {
  return sanitizeStudyText(
    sentence
      .replace(/\s+/g, " ")
      .replace(/^[\d.\-\s]+/, "")
      .trim(),
  );
}

function truncateAtWord(sentence: string, maxLength = 110) {
  if (sentence.length <= maxLength) return sentence;

  const clipped = sentence.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  const safe = lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;
  return `${safe}...`;
}

function buildTopicLabel(sentence: string) {
  const words = sentence
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9-]/g, ""))
    .filter((w) => w.length > 2)
    .filter((w) => !/^x+$|^y+$|^z+$/i.test(w))
    .slice(0, 8);

  return sanitizeStudyText(words.join(" ") || "this topic");
}

function pickAnswerKeyword(sentence: string) {
  const words = sentence
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter((w) => w.length > 1);

  return (
    words.find((w) => w.length >= 5) ||
    words.find((w) => w.length >= 3) ||
    words[0] ||
    "Main idea"
  );
}

function formatAnswerLabel(raw: string) {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (/^[A-Z]{2,5}$/.test(token)) {
        return token;
      }

      const lower = token.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function buildQuestionText(options: {
  difficulty: QuizDifficulty;
  questionType: QuizQuestionType;
  topicLabel: string;
}) {
  const { difficulty, questionType, topicLabel } = options;

  if (questionType === "fill_in_blank") {
    if (difficulty === "easy") {
      return `Fill in the blank: In this lesson, _____ is related to ${topicLabel}.`;
    }

    if (difficulty === "medium") {
      return `Fill in the blank: The key concept that completes this statement about ${topicLabel} is _____.`;
    }

    return `Fill in the blank: The most precise concept that completes this statement about ${topicLabel} is _____.`;
  }

  if (difficulty === "easy") {
    return `Which term is most related to ${topicLabel}?`;
  }

  if (difficulty === "medium") {
    return `Which keyword best represents the main concept in ${topicLabel}?`;
  }

  return `Which term most precisely captures the underlying concept in ${topicLabel}?`;
}

function buildDistractors(difficulty: QuizDifficulty) {
  if (difficulty === "easy") {
    return ["A simple definition", "A supporting detail", "An unrelated term"];
  }

  if (difficulty === "medium") {
    return [
      "A related but secondary idea",
      "A contextual background detail",
      "A partially correct concept",
    ];
  }

  return [
    "A broad contextual category",
    "A near-match but less precise term",
    "A concept from a different scope",
  ];
}

export function generateQuizQuestions(input: {
  text: string;
  difficulty?: QuizDifficulty;
  count?: number;
  questionType?: QuizQuestionType;
}): GeneratedQuizQuestion[] {
  const {
    text,
    difficulty = "medium",
    count = 5,
    questionType = "multiple_choice",
  } = input;

  if (!text || typeof text !== "string") {
    throw new QuizGenerationInputError("No text provided");
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new QuizGenerationInputError("Invalid difficulty");
  }

  if (!["multiple_choice", "fill_in_blank"].includes(questionType)) {
    throw new QuizGenerationInputError("Invalid question type");
  }

  const normalizedCount = Math.min(15, Math.max(1, Number(count) || 5));

  const sentences: string[] = text
    .split(".")
    .map((s: string) => cleanSentence(s))
    .filter((s: string) => s.length > 10);

  return sentences
    .slice(0, normalizedCount)
    .map((sentence: string, idx: number) => {
      const answer = formatAnswerLabel(pickAnswerKeyword(sentence));
      const promptSnippet = truncateAtWord(sentence);
      const topicLabel = buildTopicLabel(sentence);
      const question = buildQuestionText({
        difficulty,
        questionType,
        topicLabel,
      });

      const mcqOptions = [answer, ...buildDistractors(difficulty)];

      return {
        id: idx + 1,
        question,
        options: questionType === "fill_in_blank" ? [] : mcqOptions,
        answer,
        difficulty,
        questionType,
        contextHint: `Source hint: ${promptSnippet}`,
      };
    });
}
