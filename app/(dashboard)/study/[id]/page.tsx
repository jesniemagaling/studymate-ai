"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw } from "lucide-react";

type Flashcard = {
  front: string;
  back: string;
  keyword: string;
};

export default function FlashcardStudy() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cards, setCards] = useState<Flashcard[]>([]);
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

        setCards(data.result?.content || []);
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
      <div className="py-16 text-center text-muted-foreground">
        Loading flashcards...
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-muted-foreground">
          No flashcard data found for this result.
        </p>
        <Button variant="outline" onClick={() => router.push("/results")}>
          Back to Results
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Flashcard study mode">
      <Card className="w-full max-w-4xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Flashcard Study Mode</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/results")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Click a card to reveal the answer. Click again to flip it back.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
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
                    "min-h-40 rounded-xl border p-6 shadow-sm transition-all",
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

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setFlipIndex(null)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Flips
          </Button>

          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push("/results")}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
