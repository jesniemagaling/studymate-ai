"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, ListChecks } from "lucide-react";

import type {
  FlashcardsResult,
  QuizResult,
  ReviewerResult,
  StudyResult,
} from "@/types/result";

function ReviewerView({ data }: { data: ReviewerResult["content"] }) {
  return (
    <div className="space-y-4">
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed">
        {data.summary}
      </pre>

      {data.keyPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Key Points
          </h3>
          <ul className="space-y-1 text-sm">
            {data.keyPoints.map((point, index) => (
              <li
                key={`${point}-${index}`}
                className="rounded-md border bg-muted/40 px-3 py-2"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QuizView({
  data,
  onPractice,
}: {
  data: QuizResult["content"];
  onPractice: () => void;
}) {
  return (
    <div className="space-y-4">
      {data.questions.map((q, i) => (
        <div
          key={`${q.question}-${i}`}
          className="rounded-lg border bg-muted/40 p-4"
        >
          <p className="mb-2 font-semibold">
            {i + 1}. {q.question}
          </p>
          <div className="ml-4 space-y-1">
            {q.options.map((opt) => (
              <p key={opt} className="text-sm text-muted-foreground">
                • {opt}
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-primary">Answer: {q.answer}</p>
        </div>
      ))}

      <Button className="mt-2 flex w-full gap-2" onClick={onPractice}>
        <ListChecks className="h-4 w-4" />
        Start Quiz Practice
      </Button>
    </div>
  );
}

function FlashcardsView({
  data,
  onStudy,
}: {
  data: FlashcardsResult["content"];
  onStudy: () => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {data.cards.map((card, index) => (
          <div
            key={`${card.front}-${index}`}
            className="rounded-lg border bg-muted/40 p-4"
          >
            <p className="font-semibold">{card.front}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.back}</p>
          </div>
        ))}
      </div>

      <Button className="mt-2 flex w-full gap-2" onClick={onStudy}>
        <BookOpen className="h-4 w-4" />
        Study Flashcards
      </Button>
    </>
  );
}

export function ResultRenderer({
  result,
  onPracticeQuiz,
  onStudyFlashcards,
}: {
  result: StudyResult;
  onPracticeQuiz: () => void;
  onStudyFlashcards: () => void;
}) {
  switch (result.type) {
    case "reviewer":
      return <ReviewerView data={result.content} />;
    case "quiz":
      return <QuizView data={result.content} onPractice={onPracticeQuiz} />;
    case "flashcards":
      return (
        <FlashcardsView data={result.content} onStudy={onStudyFlashcards} />
      );
    default:
      return null;
  }
}
