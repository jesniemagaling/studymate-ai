"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, CircleCheck, ListChecks } from "lucide-react";
import type { QuizContent, StudyResult } from "@/types/result";

export default function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizContent["questions"]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [sourcePdfId, setSourcePdfId] = useState<string | undefined>(undefined);
  const [attemptTracked, setAttemptTracked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const loadQuiz = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/results/get/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(data.error || "Failed to load quiz result.");
          return;
        }

        const result = data.result as StudyResult | undefined;

        if (!result || result.type !== "quiz") {
          toast.error("This result is not a quiz.");
          return;
        }

        setQuiz(result.content.questions);
        setSourcePdfId(result.sourcePdfId);
      } catch {
        toast.error("Failed to load quiz result.");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [params?.id]);

  const current = quiz[index];

  const submitAnswer = () => {
    if (!current) return;

    const submittedAnswer =
      current.questionType === "fill_in_blank" ? typedAnswer.trim() : selected;

    if (!submittedAnswer) return;

    const isCorrect =
      submittedAnswer.toLowerCase() === current.answer.toLowerCase();
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    if (index + 1 < quiz.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setTypedAnswer("");
    } else {
      setFinalScore(nextScore);
      setFinished(true);
    }
  };

  useEffect(() => {
    if (!finished || attemptTracked || finalScore === null || !quiz.length) {
      return;
    }

    const trackAttempt = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            eventType: "quiz_attempt",
            resultId: params?.id,
            sourcePdfId,
            score: finalScore,
            totalQuestions: quiz.length,
          }),
        });
      } catch {
        // Do not block quiz completion for analytics failures.
      }
    };

    setAttemptTracked(true);
    trackAttempt();
  }, [
    finished,
    attemptTracked,
    finalScore,
    quiz.length,
    params?.id,
    sourcePdfId,
  ]);

  if (loading) {
    return (
      <section
        className="mx-auto w-full max-w-4xl space-y-4"
        aria-label="Quiz practice loading"
      >
        <Card className="w-full border-border/60 py-4 shadow-sm">
          <CardContent className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            Loading quiz...
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!quiz.length) {
    return (
      <section
        className="mx-auto w-full max-w-4xl space-y-4"
        aria-label="Quiz practice empty"
      >
        <Card className="w-full border-border/60 py-4 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
            <ListChecks className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No quiz data found</p>
            <p className="text-xs text-muted-foreground">
              Save a generated quiz first, then start practice here.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/results")}
            >
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      className="mx-auto w-full max-w-4xl space-y-4"
      aria-label="Quiz practice"
    >
      <Card className="w-full border-border/60 py-4 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl">Quiz Practice</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/results")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>

        <CardContent className="pb-0">
          <p className="text-sm text-muted-foreground">
            Practice one question at a time and track your score as you go.
          </p>
        </CardContent>

        <CardContent className="space-y-5">
          {!finished && current ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                  <p>
                    Question {index + 1} / {quiz.length}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-primary">
                    {current.difficulty}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${((index + 1) / quiz.length) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-2xl font-semibold leading-tight">
                {current.question}
              </p>

              {current.contextHint && (
                <details className="rounded-lg border border-dashed bg-muted/20 px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Why this question?
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {current.contextHint}
                  </p>
                </details>
              )}

              {current.questionType === "fill_in_blank" ? (
                <div className="space-y-2">
                  <Input
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your answer"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the missing keyword.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {current.options.map((opt, optionIndex) => (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected === opt ? "default" : "outline"}
                      className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
                      onClick={() => setSelected(opt)}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{opt}</span>
                    </Button>
                  ))}
                </div>
              )}

              <Button
                className="mt-2 h-11 w-full"
                onClick={submitAnswer}
                disabled={
                  current.questionType === "fill_in_blank"
                    ? !typedAnswer.trim()
                    : !selected
                }
              >
                Submit
              </Button>
            </>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CircleCheck className="h-5 w-5" />
                <p className="text-center text-2xl font-bold">
                  Quiz Completed!
                </p>
              </div>
              <p className="text-center text-lg font-semibold">
                Score: {finalScore ?? score} / {quiz.length}
              </p>

              <Button
                className="mx-auto mt-2 w-full sm:w-auto"
                onClick={() => router.push("/results")}
              >
                Back to Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
