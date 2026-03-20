import type {
  GeneratedQuizQuestion,
  QuizDifficulty,
  QuizQuestionType,
} from "@/lib/services/quiz-generator";

export type GenerationMode = "reviewer" | "quiz" | "flashcards";

export type Flashcard = {
  front: string;
  back: string;
  keyword?: string;
};

export type GenerationTelemetry = {
  generationMode: GenerationMode;
  pipelineVersion: string;
  provider: string;
  retryCount: number;
};

export type TextChunkingStats = {
  totalChunks: number;
  selectedChunks: number;
};

export type GenerationContext = {
  originalText: string;
  normalizedText: string;
  contextText: string;
  mode: GenerationMode;
  chunking: TextChunkingStats;
};

export type ReviewerGenerationInput = {
  text: string;
};

export type QuizGenerationInput = {
  text: string;
  difficulty?: QuizDifficulty;
  count?: number;
  questionType?: QuizQuestionType;
};

export type FlashcardGenerationInput = {
  text: string;
};

export type GenerationProvider = {
  name: string;
  generateReviewer: (context: GenerationContext) => Promise<string>;
  generateQuiz: (
    context: GenerationContext,
    input: Omit<QuizGenerationInput, "text">,
  ) => Promise<GeneratedQuizQuestion[]>;
  generateFlashcards: (context: GenerationContext) => Promise<Flashcard[]>;
};
