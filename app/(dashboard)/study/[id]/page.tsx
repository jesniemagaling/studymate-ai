"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import type { FlashcardContent, StudyResult } from "@/types/result";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

export default function FlashcardStudy() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cards, setCards] = useState<FlashcardContent["cards"]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const toggleCard = (index: number) => {
    setFlippedCards((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const resetFlips = () => {
    setFlippedCards(new Set());
  };

  useEffect(() => {
    if (!params?.id) return;

    const loadCards = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/results/get/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(data.error || "Failed to load flashcards.");
          return;
        }

        const result = data.result as StudyResult | undefined;

        if (!result || result.type !== "flashcards") {
          toast.error("This result is not flashcards.");
          return;
        }

        setCards(result.content.cards);
      } catch {
        toast.error("Failed to load flashcards.");
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [params?.id]);

  if (loading) {
    return (
      <ModulePage aria-label="Flashcard study loading">
        <ModuleCard>
          <CardContent className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            Loading flashcards...
          </CardContent>
        </ModuleCard>
      </ModulePage>
    );
  }

  if (!cards.length) {
    return (
      <ModulePage aria-label="Flashcard study empty">
        <ModuleCard>
          <CardContent className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No flashcard data found</p>
            <p className="text-xs text-muted-foreground">
              Save generated flashcards first, then launch study mode.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/results")}
            >
              Back to Results
            </Button>
          </CardContent>
        </ModuleCard>
      </ModulePage>
    );
  }

  return (
    <ModulePage aria-label="Flashcard study mode">
      <ModuleCard>
        <CardHeader className="grid gap-4 border-b pb-5 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              StudyMate AI
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Flashcard Study Mode
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Flip cards to reveal answers and reinforce active recall.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {cards.length} cards loaded
              </span>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Active Recall
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/results")}
            className="w-full md:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>

        <CardContent>
          <p className="rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
            Click a card to reveal the answer. Click again to flip it back.
          </p>
        </CardContent>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((card, index) => (
              <button
                type="button"
                key={index}
                onClick={() => toggleCard(index)}
                className="group cursor-pointer rounded-xl text-left"
                aria-label={`Flip flashcard ${index + 1}`}
              >
                <div
                  className={clsx(
                    "min-h-36 rounded-xl border p-5 shadow-sm transition-all duration-200",
                    flippedCards.has(index)
                      ? "border-primary/70 bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-background group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:bg-muted/40 group-hover:shadow-md",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide">
                    <span
                      className={clsx(
                        "rounded-full border px-2 py-0.5",
                        flippedCards.has(index)
                          ? "border-primary-foreground/40 text-primary-foreground/90"
                          : "border-border/70 text-muted-foreground",
                      )}
                    >
                      Card {index + 1}
                    </span>
                    <span
                      className={clsx(
                        flippedCards.has(index)
                          ? "text-primary-foreground/90"
                          : "text-muted-foreground",
                      )}
                    >
                      {flippedCards.has(index) ? "Back" : "Front"}
                    </span>
                  </div>

                  {flippedCards.has(index) ? (
                    <p className="text-sm leading-relaxed">{card.back}</p>
                  ) : (
                    <p className="text-base font-semibold leading-relaxed">
                      {card.front}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={resetFlips}
              disabled={flippedCards.size === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Flips
            </Button>

            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push("/results")}
            >
              Back to Results
            </Button>
          </div>
        </CardContent>
      </ModuleCard>
    </ModulePage>
  );
}
