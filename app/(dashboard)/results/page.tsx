"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { StudyResult } from "@/types/result";
import { apiFetch } from "@/lib/api/client";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<StudyResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await apiFetch<{ results: StudyResult[] }>(
          "/api/results/list",
          {
            method: "GET",
            credentials: "include",
          },
        );

        setResults(data.results || []);
      } catch (err) {
        console.error("Failed to load results:", err);
        toast.error("Failed to load saved results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  return (
    <section
      className="mx-auto w-full max-w-5xl space-y-4"
      aria-label="Generated results"
    >
      <Card className="w-full border-border/60 py-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileSearch className="h-6 w-6 text-primary" />
            Generated Results
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review, practice, export, or manage your saved study outputs.
          </p>
        </CardHeader>

        <CardContent>
          {/* LOADING STATE */}
          {loading && (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              Loading results...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No saved results yet</p>
              <p className="text-xs text-muted-foreground">
                Your generated reviewers, quizzes, or flashcards will appear
                here.
              </p>
            </div>
          )}

          {/* RESULTS LIST */}
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="border-border/60 py-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />

                      <div>
                        <p className="font-medium">
                          {result.title || "Untitled result"}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {result.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saved on{" "}
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/results/${result.id}`)}
                    >
                      View
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
