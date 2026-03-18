"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CircleCheck } from "lucide-react";
import type { QuizContent, StudyResult } from "@/types/result";

export default function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizContent["questions"]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
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
    if (!selected || !current) return;

    if (selected === current.answer) {
      setScore((prev) => prev + 1);
    }

    if (index + 1 < quiz.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Loading quiz...
      </div>
    );
  }

  if (!quiz.length) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-muted-foreground">
          No quiz data found for this result.
        </p>
        <Button variant="outline" onClick={() => router.push("/results")}>
          Back to Results
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Quiz practice">
      <Card className="w-full max-w-3xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quiz Practice</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/results")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {!finished && current ? (
            <>
              <p className="text-sm font-semibold text-muted-foreground">
                Question {index + 1} / {quiz.length}
              </p>

              <p className="text-lg font-medium">{current.question}</p>
              <p className="text-xs uppercase tracking-wide text-primary">
                {current.difficulty}
              </p>

              <div className="space-y-2">
                {current.options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selected === opt ? "default" : "secondary"}
                    className="w-full justify-start whitespace-normal"
                    onClick={() => setSelected(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={submitAnswer}
                disabled={!selected}
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-primary">
                <CircleCheck className="h-5 w-5" />
                <p className="text-center text-2xl font-bold">
                  Quiz Completed!
                </p>
              </div>
              <p className="text-center text-lg font-semibold">
                Score: {score} / {quiz.length}
              </p>

              <Button
                className="mt-4 w-full"
                onClick={() => router.push("/results")}
              >
                Back to Results
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
