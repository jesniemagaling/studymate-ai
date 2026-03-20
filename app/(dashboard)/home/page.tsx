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
  ShieldCheck,
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
  recentActivities: Array<{
    title: string;
    type: "reviewer" | "quiz" | "flashcards";
    createdAt: string;
  }>;
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
    recentActivities: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [activeBarTooltip, setActiveBarTooltip] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState({
    ready: "AI is ready",
    speed: "Generation speed is currently normal",
    fallback: "We are using safe fallback mode when needed",
  });

  const firstName = session?.user?.firstName || "Student";
  const heroSurfaceClass =
    "overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-sm";
  const surfaceCardClass = "border-border/60 bg-card shadow-sm";
  const panelCardClass = `${surfaceCardClass} overflow-hidden`;
  const metricCardClass = `group ${surfaceCardClass} py-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md`;
  const lastQuizScoreValue = analytics.lastQuizScore ?? 0;
  const quizAttemptsScaled = Math.min(100, analytics.totalQuizzesTaken * 10);
  const quizScoreBars = [
    {
      label: "Quiz Attempts",
      valueLabel: loadingAnalytics ? "-" : String(analytics.totalQuizzesTaken),
      barValue: loadingAnalytics ? 0 : quizAttemptsScaled,
      hint: "Completed quiz attempts",
    },
    {
      label: "Average Score",
      valueLabel: loadingAnalytics ? "-" : `${analytics.averageQuizScore}%`,
      barValue: loadingAnalytics ? 0 : analytics.averageQuizScore,
      hint: "Across all attempts",
    },
    {
      label: "Last Score",
      valueLabel:
        loadingAnalytics || analytics.lastQuizScore === null
          ? "N/A"
          : `${analytics.lastQuizScore}%`,
      barValue: loadingAnalytics ? 0 : lastQuizScoreValue,
      hint:
        loadingAnalytics || !analytics.lastQuizAttemptAt
          ? "No attempts recorded yet"
          : `Last attempt: ${new Date(analytics.lastQuizAttemptAt).toLocaleString()}`,
    },
  ];
  const chartScaleTicks = [100, 75, 50, 25, 0];

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

  useEffect(() => {
    const loadAiStatus = async () => {
      try {
        const res = await fetch("/api/ai/health", {
          method: "GET",
          credentials: "include",
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok || payload?.success === false) {
          return;
        }

        const health = payload?.health;
        const localUnavailable =
          Boolean(health?.localProvider?.enabled) &&
          !Boolean(health?.localProvider?.available);

        setAiStatus({
          ready: "AI is ready",
          speed: localUnavailable
            ? "Generation may be slower now"
            : "Generation speed is currently normal",
          fallback:
            localUnavailable || health?.providerMode === "deterministic"
              ? "We are using safe fallback mode"
              : "Primary mode is active with safe fallback available",
        });
      } catch {
        // Keep default friendly messages when status endpoint is unavailable.
      }
    };

    loadAiStatus();
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className={metricCardClass}>
          <CardContent className="flex min-h-[92px] items-center gap-3 px-4 py-3.5">
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                PDFs Uploaded
              </p>
              <p className="text-2xl font-semibold leading-none">
                {loadingAnalytics ? "-" : analytics.pdfsUploaded}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex min-h-[92px] items-center gap-3 px-4 py-3.5">
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Reviewers Generated
              </p>
              <p className="text-2xl font-semibold leading-none">
                {loadingAnalytics ? "-" : analytics.reviewersGenerated}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex min-h-[92px] items-center gap-3 px-4 py-3.5">
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quizzes Generated
              </p>
              <p className="text-2xl font-semibold leading-none">
                {loadingAnalytics ? "-" : analytics.quizzesGenerated}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={metricCardClass}>
          <CardContent className="flex min-h-[92px] items-center gap-3 px-4 py-3.5">
            <div className="rounded-lg border bg-background p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Flashcards Generated
              </p>
              <p className="text-2xl font-semibold leading-none">
                {loadingAnalytics ? "-" : analytics.flashcardsGenerated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={panelCardClass}>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            AI Status
          </CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Live guidance so you can focus on studying while AI handles fallback
            safely.
          </p>
        </CardHeader>
        <CardContent className="pb-4 pt-1">
          <div className="grid gap-2 rounded-xl border border-border/60 bg-transparent p-4 text-[15px] leading-6">
            <p className="font-medium text-foreground">{aiStatus.ready}</p>
            <p className="text-foreground">{aiStatus.speed}</p>
            <p className="text-foreground">{aiStatus.fallback}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className={`${panelCardClass} xl:col-span-2`}>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
              Quiz Performance Snapshot
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chart view of your latest quiz progress and scores.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            <div className="rounded-xl border border-dashed border-border/70 bg-transparent p-4">
              <div className="relative h-56">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {chartScaleTicks.map((tick) => (
                    <div
                      key={tick}
                      className="relative border-t border-border/60 first:border-transparent"
                    >
                      <span className="absolute -top-2.5 -left-0 text-[10px] font-medium text-muted-foreground">
                        {tick}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-x-8 bottom-0 top-0 flex items-end justify-between gap-3">
                  {quizScoreBars.map((item, index) => (
                    <div
                      key={item.label}
                      className="relative flex w-full max-w-[130px] flex-col items-center gap-2"
                    >
                      <div
                        className={`pointer-events-none absolute -top-2 left-1/2 z-20 w-44 -translate-x-1/2 -translate-y-full rounded-lg border border-border/80 bg-card/95 p-2 text-left shadow-lg backdrop-blur-sm transition-all duration-200 ${
                          activeBarTooltip === item.label
                            ? "scale-100 opacity-100"
                            : "scale-95 opacity-0"
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.valueLabel}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {item.hint}
                        </p>
                        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border/80 bg-card/95" />
                      </div>

                      <div className="text-xs font-semibold text-foreground">
                        {item.valueLabel}
                      </div>
                      <div className="relative flex h-40 w-12 items-end overflow-hidden rounded-t-md border border-border/70 bg-muted/35 transition-all duration-200 outline-none ring-offset-background sm:w-14 focus-visible:ring-2 focus-visible:ring-primary/60">
                        <div
                          tabIndex={0}
                          role="img"
                          aria-label={`${item.label}: ${item.valueLabel}. ${item.hint}`}
                          onMouseEnter={() => setActiveBarTooltip(item.label)}
                          onMouseLeave={() => setActiveBarTooltip(null)}
                          onFocus={() => setActiveBarTooltip(item.label)}
                          onBlur={() => setActiveBarTooltip(null)}
                          className="w-full rounded-t-sm bg-primary/85 transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          style={{
                            height: `${item.barValue}%`,
                            opacity: 1 - index * 0.12,
                          }}
                        />
                      </div>
                      <p className="text-center text-xs font-medium leading-tight text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {quizScoreBars.map((item) => (
                <div
                  key={`${item.label}-hint`}
                  className="rounded-lg border border-border/60 bg-transparent px-3 py-2"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.hint}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={panelCardClass}>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-4">
            {!loadingAnalytics && analytics.recentActivities.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentActivities.map((activity, index) => (
                  <div
                    key={`${activity.createdAt}-${activity.title}-${index}`}
                    className="rounded-xl border border-dashed border-border/70 bg-transparent p-3"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Activity {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-tight">
                      {activity.title || "Untitled Result"}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {activity.type}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                <p className="pt-1 text-xs text-muted-foreground">
                  Total Study Materials: {analytics.totalStudyMaterials}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center">
                <Clock className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No recent activity yet</p>
                <p className="text-xs text-muted-foreground">
                  Your uploads and AI generations will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={panelCardClass}>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
            Per-Content-Type Usage
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of generated study materials by content type.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
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
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {loadingAnalytics ? "-" : `${item.value} (${percent}%)`}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted/80">
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
    </ModulePage>
  );
}
