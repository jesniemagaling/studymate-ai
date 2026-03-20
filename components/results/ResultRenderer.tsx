"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, ListChecks, Sparkles } from "lucide-react";

import type {
  FlashcardsResult,
  QuizResult,
  ReviewerResult,
  StudyResult,
} from "@/types/result";

function ReviewerView({ data }: { data: ReviewerResult["content"] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-background/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Reviewer Summary
        </p>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {data.summary}
        </pre>
      </div>

      {data.keyPoints.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Key Points
          </h3>
          <ul className="space-y-1.5 text-sm">
            {data.keyPoints.map((point, index) => (
              <li
                key={`${point}-${index}`}
                className="rounded-md border bg-background px-3 py-2"
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
      <div className="rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
        Preview generated questions below, then start practice mode.
      </div>

      {data.questions.map((q, i) => (
        <div
          key={`${q.question}-${i}`}
          className="rounded-xl border bg-muted/30 p-4"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="font-semibold leading-relaxed">
              {i + 1}. {q.question}
            </p>
            <p className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary">
              {q.difficulty}
            </p>
          </div>

          {q.contextHint && (
            <details className="mb-2 rounded-md border border-dashed bg-background/50 px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Why this question?
              </summary>
              <p className="mt-2 text-xs text-muted-foreground">
                {q.contextHint}
              </p>
            </details>
          )}

          {q.questionType !== "fill_in_blank" && (
            <div className="ml-1 space-y-1">
              {q.options.map((opt) => (
                <p key={opt} className="text-sm text-muted-foreground">
                  • {opt}
                </p>
              ))}
            </div>
          )}
          <details className="mt-2 rounded-md border border-dashed bg-background/50 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-primary">
              Show answer
            </summary>
            <p className="mt-2 text-xs text-primary">Answer: {q.answer}</p>
          </details>
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
