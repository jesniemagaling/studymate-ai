export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizQuestionType = "multiple_choice" | "fill_in_blank";

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
  return sentence
    .replace(/\s+/g, " ")
    .replace(/^[\d.\-\s]+/, "")
    .trim();
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
    .filter(Boolean)
    .slice(0, 8);

  return words.join(" ") || "this topic";
}

function pickAnswerKeyword(sentence: string) {
  const words = sentence
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);

  return (
    words.find((w) => w.length >= 5) ||
    words.find((w) => w.length >= 3) ||
    words[0] ||
    "Main idea"
  );
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
      const answer = pickAnswerKeyword(sentence);
      const promptSnippet = truncateAtWord(sentence);
      const topicLabel = buildTopicLabel(sentence);

      const mcqOptions = [
        answer,
        "Background information",
        "An example topic",
        "A definition or concept",
      ];

      const fillInQuestion = `Fill in the blank: In this lesson, _____ is an important concept related to ${topicLabel}.`;
      const mcqQuestion = `Which keyword best matches the concept about ${topicLabel}?`;

      return {
        id: idx + 1,
        question:
          questionType === "fill_in_blank" ? fillInQuestion : mcqQuestion,
        options: mcqOptions,
        answer,
        difficulty,
        questionType,
        contextHint: `Source hint: ${promptSnippet}`,
      };
    });
}
