import {
  generateQuizQuestions,
  type GeneratedQuizQuestion,
} from "@/lib/services/quiz-generator";
import type {
  Flashcard,
  GenerationContext,
  GenerationProvider,
  QuizGenerationInput,
} from "@/lib/ai/types";

export function buildDeterministicReviewer(text: string) {
  const cleaned = text
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  const sentenceCandidates = cleaned
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => sentence.replace(/^[\d.\-\s]+/, "").trim())
    .filter((sentence) => sentence.length > 25)
    .filter(
      (sentence) =>
        !/^(summary|key points?|workflow|overview)$/i.test(sentence),
    );

  const uniqueSentences: string[] = [];
  for (const sentence of sentenceCandidates) {
    if (
      !uniqueSentences.some(
        (value) => value.toLowerCase() === sentence.toLowerCase(),
      )
    ) {
      uniqueSentences.push(sentence);
    }
  }

  const summary = uniqueSentences.slice(0, 2).join(". ");
  const keyPoints = uniqueSentences
    .slice(0, 5)
    .map(
      (sentence) => `- ${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}`,
    );

  return [
    "Summary:",
    summary || cleaned.slice(0, 400),
    "",
    "Key Points:",
    ...(keyPoints.length ? keyPoints : ["- No key points extracted."]),
  ].join("\n");
}

function buildDeterministicFlashcards(text: string): Flashcard[] {
  const sentences = text
    .split(".")
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20)
    .slice(0, 20);

  return sentences.map((sentence, index) => {
    const words = sentence.split(/\s+/);
    const keyword =
      words.find((word) => word.length > 6 && /^[A-Za-z]+$/.test(word)) ||
      `Concept ${index + 1}`;

    return {
      front: `What is ${keyword}?`,
      back: `${sentence}.`,
      keyword,
    };
  });
}

function buildDeterministicQuiz(
  context: GenerationContext,
  input: Omit<QuizGenerationInput, "text">,
): GeneratedQuizQuestion[] {
  return generateQuizQuestions({
    text: context.contextText || context.normalizedText,
    ...input,
  });
}

export const deterministicProvider: GenerationProvider = {
  name: "deterministic",
  async generateReviewer(context) {
    return buildDeterministicReviewer(
      context.contextText || context.normalizedText,
    );
  },
  async generateQuiz(context, input) {
    return buildDeterministicQuiz(context, input);
  },
  async generateFlashcards(context) {
    return buildDeterministicFlashcards(
      context.contextText || context.normalizedText,
    );
  },
};
