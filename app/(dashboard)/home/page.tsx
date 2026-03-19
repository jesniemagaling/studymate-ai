"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  Bookmark,
  UploadCloud,
  Sparkles,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/layout/ModuleShell";

type AnalyticsSummary = {
  pdfsUploaded: number;
  reviewersGenerated: number;
  quizzesGenerated: number;
  flashcardsGenerated: number;
  totalStudyMaterials: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  lastQuizScore: number | null;
  lastQuizAttemptAt: string | null;
  lastGenerated: {
    title: string;
    type: "reviewer" | "quiz" | "flashcards";
    createdAt: string;
  } | null;
};

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    pdfsUploaded: 0,
    reviewersGenerated: 0,
    quizzesGenerated: 0,
    flashcardsGenerated: 0,
    totalStudyMaterials: 0,
    totalQuizzesTaken: 0,
    averageQuizScore: 0,
    lastQuizScore: null,
    lastQuizAttemptAt: null,
    lastGenerated: null,
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const firstName = session?.user?.firstName || "Student";
  const heroSurfaceClass =
    "overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-sm";
  const surfaceCardClass = "border-border/60 bg-card shadow-sm";
  const metricCardClass = `group ${surfaceCardClass} py-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md`;

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics/track", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setAnalytics(data as AnalyticsSummary);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <ModulePage
      className="max-w-7xl space-y-4 sm:space-y-6"
      aria-label="Dashboard home"
    >
      <Card className={heroSurfaceClass}>
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Study dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Hi, {firstName}! Welcome to StudyMate AI
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Your personal AI-powered study space. Upload your notes and let
              StudyMate AI generate reviewers, quizzes, and flashcards to help
              you study smarter.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/upload")}
                className="h-10 px-5"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/generate")}
                className="h-10 px-5"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate materials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className={metricCardClass}>
          <CardContent className="flex items-center gap-4 px-5 py-4">
            <div className="rounded-xl border bg-background p-2.5 shadow-sm">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PDFs Uploaded</p>
              <p className="text-2xl font-bold">
                {loadingAnalytics ? "-" : analytics.pdfsUploaded}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex items-center gap-4 px-5 py-4">
            <div className="rounded-xl border bg-background p-2.5 shadow-sm">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Reviewers Generated
              </p>
              <p className="text-2xl font-bold">
                {loadingAnalytics ? "-" : analytics.reviewersGenerated}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex items-center gap-4 px-5 py-4">
            <div className="rounded-xl border bg-background p-2.5 shadow-sm">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quizzes Generated</p>
              <p className="text-2xl font-bold">
                {loadingAnalytics ? "-" : analytics.quizzesGenerated}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex items-center gap-4 px-5 py-4">
            <div className="rounded-xl border bg-background p-2.5 shadow-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Flashcards Generated
              </p>
              <p className="text-2xl font-bold">
                {loadingAnalytics ? "-" : analytics.flashcardsGenerated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card className={metricCardClass}>
          <CardContent className="px-5 py-4">
            <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
            <p className="mt-1 text-2xl font-bold">
              {loadingAnalytics ? "-" : analytics.totalQuizzesTaken}
            </p>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="px-5 py-4">
            <p className="text-sm text-muted-foreground">Average Quiz Score</p>
            <p className="mt-1 text-2xl font-bold">
              {loadingAnalytics ? "-" : `${analytics.averageQuizScore}%`}
            </p>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="px-5 py-4">
            <p className="text-sm text-muted-foreground">Last Quiz Score</p>
            <p className="mt-1 text-2xl font-bold">
              {loadingAnalytics
                ? "-"
                : analytics.lastQuizScore !== null
                  ? `${analytics.lastQuizScore}%`
                  : "N/A"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {loadingAnalytics
                ? ""
                : analytics.lastQuizAttemptAt
                  ? `Last attempt: ${new Date(analytics.lastQuizAttemptAt).toLocaleString()}`
                  : "No attempts recorded yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Per-Content-Type Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "Reviewers",
              value: analytics.reviewersGenerated,
            },
            {
              label: "Quizzes",
              value: analytics.quizzesGenerated,
            },
            {
              label: "Flashcards",
              value: analytics.flashcardsGenerated,
            },
          ].map((item) => {
            const total =
              analytics.reviewersGenerated +
              analytics.quizzesGenerated +
              analytics.flashcardsGenerated;
            const percent =
              total === 0 ? 0 : Math.round((item.value / total) * 100);

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {loadingAnalytics ? "-" : `${item.value} (${percent}%)`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${loadingAnalytics ? 0 : percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!loadingAnalytics && analytics.lastGenerated ? (
            <div className="rounded-lg border border-dashed p-6">
              <p className="text-sm font-medium">Last Generated</p>
              <p className="mt-1 text-base font-semibold">
                {analytics.lastGenerated.title || "Untitled Result"}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {analytics.lastGenerated.type}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(analytics.lastGenerated.createdAt).toLocaleString()}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Total Study Materials: {analytics.totalStudyMaterials}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">No recent activity yet</p>
              <p className="text-xs text-muted-foreground">
                Your uploads and AI generations will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ModulePage>
  );
}
