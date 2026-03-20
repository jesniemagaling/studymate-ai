"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, FileText, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { StudyResult } from "@/types/result";
import { apiFetch } from "@/lib/api/client";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

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
    <ModulePage aria-label="Generated results">
      <ModuleCard>
        <CardHeader className="space-y-1 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <FileSearch className="h-6 w-6 text-primary" />
            Generated Results
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review, practice, export, or manage your saved study outputs.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {loading ? "Loading..." : `${results.length} saved results`}
            </span>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Study Library
            </span>
          </div>
        </CardHeader>

        <CardContent className="">
          {/* LOADING STATE */}
          {loading && (
            <div className="rounded-lg border border-dashed border-border/70 bg-background/60 py-12 text-center text-muted-foreground">
              Loading results...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/60 p-12 text-center">
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
                  className="border-border/60 bg-muted/20 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />

                      <div className="min-w-0">
                        <p className="font-medium leading-relaxed">
                          {result.title || "Untitled result"}
                        </p>
                        <p className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                          {result.type}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Saved on{" "}
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
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
      </ModuleCard>
    </ModulePage>
  );
}
