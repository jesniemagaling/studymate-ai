export type ResultType = "reviewer" | "quiz" | "flashcards";

export type ReviewerContent = {
  summary: string;
  keyPoints: string[];
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
};

export type QuizContent = {
  questions: QuizQuestion[];
};

export type Flashcard = {
  front: string;
  back: string;
};

export type FlashcardContent = {
  cards: Flashcard[];
};

export type ResultContentMap = {
  reviewer: ReviewerContent;
  quiz: QuizContent;
  flashcards: FlashcardContent;
};

export type StudyResultBase = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewerResult = StudyResultBase & {
  type: "reviewer";
  content: ReviewerContent;
};

export type QuizResult = StudyResultBase & {
  type: "quiz";
  content: QuizContent;
};

export type FlashcardsResult = StudyResultBase & {
  type: "flashcards";
  content: FlashcardContent;
};

export type StudyResult = ReviewerResult | QuizResult | FlashcardsResult;

export type SaveResultBody = {
  title?: string;
} & (
  | { type: "reviewer"; content: ReviewerContent }
  | { type: "quiz"; content: QuizContent }
  | { type: "flashcards"; content: FlashcardContent }
);
