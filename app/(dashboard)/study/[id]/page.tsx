"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import type { FlashcardContent, StudyResult } from "@/types/result";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

export default function FlashcardStudy() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cards, setCards] = useState<FlashcardContent["cards"]>([]);
  const [flipIndex, setFlipIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Flashcard Study Mode</CardTitle>
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
            Flip cards to reveal answers and reinforce active recall.
          </p>
        </CardContent>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click a card to reveal the answer. Click again to flip it back.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((card, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setFlipIndex(flipIndex === index ? null : index)}
                className="cursor-pointer rounded-xl text-left"
                aria-label={`Flip flashcard ${index + 1}`}
              >
                <div
                  className={clsx(
                    "min-h-32 rounded-xl border p-5 shadow-sm transition-all",
                    flipIndex === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  {flipIndex === index ? (
                    <p>{card.back}</p>
                  ) : (
                    <p className="font-semibold">{card.front}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setFlipIndex(null)}
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
