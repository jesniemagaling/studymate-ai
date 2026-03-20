import { getOpenAIClient } from "@/lib/openai";
import {
  extractJsonObject,
  flashcardsSchema,
  quizSchema,
  reviewerSchema,
  safeJsonParse,
} from "@/lib/ai/schemas";
import type {
  Flashcard,
  GenerationProvider,
  QuizGenerationInput,
} from "@/lib/ai/types";

async function askOpenAI(prompt: string) {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: "Return only strict JSON without markdown formatting.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return String(completion.choices[0]?.message?.content || "").trim();
}

function parseReviewer(raw: string) {
  const candidate = extractJsonObject(raw);
  const parsed = safeJsonParse<unknown>(candidate);
  const validated = reviewerSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("OPENAI_REVIEWER_SCHEMA_INVALID");
  }

  return [
    "Summary:",
    validated.data.summary,
    "",
    "Key Points:",
    ...validated.data.keyPoints.map((value) => `- ${value}`),
  ].join("\n");
}

function parseQuiz(raw: string, input: Omit<QuizGenerationInput, "text">) {
  const candidate = extractJsonObject(raw);
  const parsed = safeJsonParse<unknown>(candidate);
  const validated = quizSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("OPENAI_QUIZ_SCHEMA_INVALID");
  }

  const difficulty = input.difficulty || "medium";
  const questionType = input.questionType || "multiple_choice";

  return validated.data.questions
    .slice(0, input.count || 5)
    .map((question, index) => ({
      id: index + 1,
      question: question.question,
      options: question.options,
      answer: question.answer,
      difficulty,
      questionType,
      contextHint: "Generated with OpenAI structured output.",
    }));
}

function parseFlashcards(raw: string): Flashcard[] {
  const candidate = extractJsonObject(raw);
  const parsed = safeJsonParse<unknown>(candidate);
  const validated = flashcardsSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("OPENAI_FLASHCARDS_SCHEMA_INVALID");
  }

  return validated.data.flashcards;
}

export const openAIProvider: GenerationProvider = {
  name: "openai",
  async generateReviewer(context) {
    const prompt = [
      "Return only valid JSON with this shape:",
      '{"summary":"...","keyPoints":["..."]}',
      "Create a concise reviewer for this study text:",
      context.contextText,
    ].join("\n\n");

    const raw = await askOpenAI(prompt);
    return parseReviewer(raw);
  },
  async generateQuiz(context, input) {
    const prompt = [
      "Return only valid JSON with this shape:",
      '{"questions":[{"question":"...","options":["A","B","C","D"],"answer":"A"}]}',
      `Create ${input.count || 5} ${input.difficulty || "medium"} ${input.questionType || "multiple_choice"} questions from this text:`,
      context.contextText,
    ].join("\n\n");

    const raw = await askOpenAI(prompt);
    return parseQuiz(raw, input);
  },
  async generateFlashcards(context) {
    const prompt = [
      "Return only valid JSON with this shape:",
      '{"flashcards":[{"front":"...","back":"...","keyword":"..."}]}',
      "Create useful study flashcards from this text:",
      context.contextText,
    ].join("\n\n");

    const raw = await askOpenAI(prompt);
    return parseFlashcards(raw);
  },
};
