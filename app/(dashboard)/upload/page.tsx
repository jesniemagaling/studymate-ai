"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  FileText,
  Loader2,
  ListChecks,
  Brain,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import type { FlashcardContent, QuizContent } from "@/types/result";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

type GenerationMode = "reviewer" | "quiz" | "flashcards";

const modeConfig: Record<
  GenerationMode,
  {
    label: string;
    description: string;
    icon: typeof Brain;
  }
> = {
  reviewer: {
    label: "Reviewer",
    description: "Create a concise study summary.",
    icon: Brain,
  },
  quiz: {
    label: "Quiz",
    description: "Generate practice questions by difficulty.",
    icon: ListChecks,
  },
  flashcards: {
    label: "Flashcards",
    description: "Build quick recall cards for review.",
    icon: Layers,
  },
};

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadedPdfIdRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [quiz, setQuiz] = useState<QuizContent["questions"]>([]);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReviewer, setLoadingReviewer] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardContent["cards"]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [manualTextMode, setManualTextMode] = useState(false);
  const [sourcePdfId, setSourcePdfId] = useState<string | null>(null);
  const [resultTitle, setResultTitle] = useState("");
  const [quizItemCount, setQuizItemCount] = useState(5);
  const [quizQuestionType, setQuizQuestionType] = useState<
    "multiple_choice" | "fill_in_blank"
  >("multiple_choice");
  const [quizDifficulty, setQuizDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [selectedMode, setSelectedMode] = useState<GenerationMode>("reviewer");

  const reviewerSectionRef = useRef<HTMLElement | null>(null);
  const quizSectionRef = useRef<HTMLElement | null>(null);
  const flashcardsSectionRef = useRef<HTMLElement | null>(null);

  const hasRichContent = Boolean(
    text || reviewer || quiz.length > 0 || flashcards.length > 0,
  );

  const createDefaultTitle = (mode: GenerationMode) => {
    const sourceName =
      file?.name?.replace(/\.pdf$/i, "") ||
      (searchParams?.get("pdfId") ? "Library PDF" : "Study Material");
    const label =
      mode === "reviewer"
        ? "Reviewer"
        : mode === "quiz"
          ? "Quiz"
          : "Flashcards";
    return `${sourceName} - ${label}`;
  };

  useEffect(() => {
    const mode = searchParams?.get("mode");
    if (mode === "reviewer" || mode === "quiz" || mode === "flashcards") {
      setSelectedMode(mode);
    }
  }, [searchParams]);

  useEffect(() => {
    const pdfId = searchParams?.get("pdfId");

    if (!pdfId || loadedPdfIdRef.current === pdfId) {
      return;
    }

    loadedPdfIdRef.current = pdfId;

    const loadPdf = async () => {
      try {
        const res = await fetch(`/api/pdf/get/${pdfId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.pdf) {
          toast.error(data.error || "Failed to load selected PDF.");
          return;
        }

        const extractedText = String(data.pdf.extractedText || "");

        if (data.pdf.extractionStatus === "failed") {
          setSourcePdfId(pdfId);
          setManualTextMode(true);
          setText(extractedText);
          toast.warning(
            data.pdf.extractionError ||
              "This PDF had extraction issues. You can paste/edit text and continue.",
          );
          return;
        }

        setManualTextMode(false);
        setText(extractedText);
        setFile(null);
        setSourcePdfId(pdfId);

        if (data.pdf.extractionStatus === "fallback") {
          toast.warning("Loaded recovered text from malformed PDF.");
        } else {
          toast.success("Loaded text from your library PDF.");
        }
      } catch {
        toast.error("Failed to load selected PDF.");
      }
    };

    loadPdf();
  }, [searchParams]);

  useEffect(() => {
    const target =
      selectedMode === "reviewer"
        ? reviewerSectionRef.current
        : selectedMode === "quiz"
          ? quizSectionRef.current
          : flashcardsSectionRef.current;

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedMode, text]);

  // PDF UPLOAD & TEXT EXTRACTION
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    setLoadingUpload(true);
    setReviewer("");
    setQuiz([]);
    setText("");
    setFlashcards([]);
    setResultTitle("");
    setManualTextMode(false);
    setSourcePdfId(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Failed to extract text");
        return;
      }

      if (data.extractionMode === "fallback" && data.text) {
        setSourcePdfId(String(data.pdfId || "") || null);
        setManualTextMode(false);
        setText(data.text);
        toast.warning(
          data.warning ||
            "Auto-recovered text from a malformed PDF. Please review before generating.",
        );
        return;
      }

      if (data.needsManualText) {
        setSourcePdfId(String(data.pdfId || "") || null);
        setManualTextMode(true);
        setText("");
        toast.warning(
          data.warning ||
            "PDF uploaded but text extraction failed. Paste text manually to continue.",
        );
        return;
      }

      setManualTextMode(false);
      setSourcePdfId(String(data.pdfId || "") || null);
      setText(data.text || "");
      toast.success("PDF uploaded and text extracted.");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoadingUpload(false);
    }
  };

  // GENERATE REVIEWER
  const generateReviewer = async () => {
    if (!text) {
      toast.error("No extracted text found. Upload a PDF first.");
      return;
    }

    setLoadingReviewer(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to generate reviewer");
        return;
      }

      setSelectedMode("reviewer");
      setReviewer(data.reviewer);
      if (!resultTitle.trim()) {
        setResultTitle(createDefaultTitle("reviewer"));
      }
      toast.success("Reviewer generated successfully.");
    } catch {
      toast.error("Failed to generate reviewer. Please try again.");
    } finally {
      setLoadingReviewer(false);
    }
  };

  // GENERATE QUIZ (NO OPENAI)
  const generateQuiz = async () => {
    if (!text) {
      toast.error("No extracted text found. Upload a PDF first.");
      return;
    }

    setLoadingQuiz(true);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          difficulty: quizDifficulty,
          count: quizItemCount,
          questionType: quizQuestionType,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to generate quiz");
        return;
      }

      setSelectedMode("quiz");
      setQuiz(data.questions);
      if (!resultTitle.trim()) {
        setResultTitle(createDefaultTitle("quiz"));
      }
      toast.success("Quiz generated successfully.");
    } catch {
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // GENERATE FLASHCARDS (NO OPENAI)
  const generateFlashcards = async () => {
    if (!text) {
      toast.error("No extracted text found. Upload a PDF first.");
      return;
    }

    setLoadingFlashcards(true);

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to generate flashcards");
        return;
      }

      setSelectedMode("flashcards");
      setFlashcards(data.flashcards);
      if (!resultTitle.trim()) {
        setResultTitle(createDefaultTitle("flashcards"));
      }
      toast.success("Flashcards generated successfully.");
    } catch {
      toast.error("Failed to generate flashcards. Please try again.");
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // SAVE REVIEWER TO DATABASE
  const saveReviewer = async () => {
    try {
      const reviewerPayload = {
        title: resultTitle.trim() || createDefaultTitle("reviewer"),
        sourcePdfId: sourcePdfId || undefined,
        type: "reviewer" as const,
        content: {
          summary: reviewer,
          keyPoints: reviewer
            .split("\n")
            .map((line) => line.trim().replace(/^[-*]\s*/, ""))
            .filter(Boolean)
            .slice(0, 5),
        },
      };

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewerPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to save reviewer");
        return;
      }

      toast.success("Reviewer saved!");
    } catch {
      toast.error("Failed to save reviewer. Please try again.");
    }
  };

  // SAVE QUIZ TO DATABASE
  const saveQuiz = async (startPractice = false) => {
    try {
      const quizPayload = {
        title: resultTitle.trim() || createDefaultTitle("quiz"),
        sourcePdfId: sourcePdfId || undefined,
        type: "quiz" as const,
        content: {
          questions: quiz,
        },
      };

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(quizPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to save quiz");
        return;
      }

      toast.success("Quiz saved!");

      if (startPractice) {
        const resultId = String(data?.result?._id || data?.result?.id || "");

        if (resultId) {
          router.push(`/quiz/${resultId}`);
          return;
        }

        toast.warning(
          "Quiz saved, but quiz practice could not be opened automatically.",
        );
      }
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  // SAVE FLASHCARDS TO DATABASE
  const saveFlashcards = async (startStudy = false) => {
    try {
      const flashcardsPayload = {
        title: resultTitle.trim() || createDefaultTitle("flashcards"),
        sourcePdfId: sourcePdfId || undefined,
        type: "flashcards" as const,
        content: {
          cards: flashcards,
        },
      };

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(flashcardsPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to save flashcards");
        return;
      }

      toast.success("Flashcards saved!");

      if (startStudy) {
        const resultId = String(data?.result?._id || data?.result?.id || "");

        if (resultId) {
          router.push(`/study/${resultId}`);
          return;
        }

        toast.warning(
          "Flashcards saved, but study mode could not be opened automatically.",
        );
      }
    } catch {
      toast.error("Failed to save flashcards. Please try again.");
    }
  };

  return (
    <ModulePage className="px-2 sm:px-0">
      <ModuleCard
        className={`flex w-full flex-col overflow-hidden ${
          hasRichContent ? "max-h-[calc(100vh-8.5rem)]" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <UploadCloud className="h-6 w-6 shrink-0 text-primary" />
            Upload & Generate Study Materials
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a PDF, choose a material type, and save directly into study
            mode.
          </p>
        </CardHeader>

        <CardContent
          className={`${
            hasRichContent ? "min-h-0 flex-1 overflow-y-auto pr-2" : ""
          } space-y-6`}
        >
          {/* UPLOAD BOX */}
          <label
            htmlFor="pdf-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/40"
          >
            <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {file ? file.name : "Click to upload a PDF file"}
            </p>
            <p className="text-xs text-muted-foreground">PDF files only</p>

            <Input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || loadingUpload}
            className="w-full"
          >
            {loadingUpload ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting text...
              </span>
            ) : (
              "Upload & Extract Text"
            )}
          </Button>

          {/* TEXT PREVIEW */}
          {(text || manualTextMode) && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {manualTextMode ? "Paste Text Manually" : "Extracted Text"}
              </h3>
              {manualTextMode && (
                <p className="text-xs text-muted-foreground">
                  This PDF could not be parsed automatically. Paste or type your
                  study text below, then continue generating materials.
                </p>
              )}
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                readOnly={!manualTextMode}
                className="h-64 resize-none bg-muted"
              />
            </section>
          )}

          {text && (
            <section className="space-y-3 rounded-xl border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Choose Material Type
              </h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["reviewer", "quiz", "flashcards"] as const).map((mode) => {
                  const config = modeConfig[mode];
                  const Icon = config.icon;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        selectedMode === mode
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 rounded-md bg-background p-1.5">
                          <Icon className="h-4 w-4 text-primary" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {config.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* GENERATE REVIEWER */}
          {text && selectedMode === "reviewer" && !reviewer && (
            <section ref={reviewerSectionRef} className="space-y-2">
              <Button
                onClick={generateReviewer}
                disabled={loadingReviewer}
                className="w-full"
              >
                {loadingReviewer ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating reviewer...
                  </span>
                ) : (
                  "Generate Reviewer"
                )}
              </Button>
            </section>
          )}

          {/* REVIEWER OUTPUT */}
          {selectedMode === "reviewer" && reviewer && (
            <section ref={reviewerSectionRef} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  AI Reviewer Output
                </h3>
                <Button size="sm" onClick={saveReviewer}>
                  Save Result
                </Button>
              </div>

              <Input
                value={resultTitle}
                onChange={(e) => setResultTitle(e.target.value)}
                placeholder="Enter a title for this result"
                className="h-10"
              />

              <Textarea
                value={reviewer}
                readOnly
                className="h-64 resize-none bg-muted"
              />
            </section>
          )}

          {/* GENERATE QUIZ */}
          {text && selectedMode === "quiz" && (
            <section
              ref={quizSectionRef}
              className="space-y-3 rounded-xl border bg-muted/20 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Quiz Settings
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose difficulty, type, and item count before generating.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Question Type
                  </p>
                  <div className="inline-flex rounded-lg border bg-background p-1">
                    {(
                      [
                        ["multiple_choice", "Multiple Choice"],
                        ["fill_in_blank", "Fill in the Blank"],
                      ] as const
                    ).map(([type, label]) => (
                      <Button
                        key={type}
                        type="button"
                        size="sm"
                        variant={
                          quizQuestionType === type ? "default" : "ghost"
                        }
                        onClick={() => setQuizQuestionType(type)}
                        disabled={loadingQuiz}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="quiz-item-count"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Number of Items
                  </label>
                  <Input
                    id="quiz-item-count"
                    type="number"
                    min={1}
                    max={15}
                    value={quizItemCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuizItemCount(Number.isNaN(value) ? 5 : value);
                    }}
                    className="h-9"
                    disabled={loadingQuiz}
                  />
                </div>
              </div>

              <div className="inline-flex rounded-lg border bg-background p-1">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={quizDifficulty === level ? "default" : "ghost"}
                    onClick={() => setQuizDifficulty(level)}
                    disabled={loadingQuiz}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>

              <Button
                onClick={generateQuiz}
                disabled={loadingQuiz}
                className="w-full"
                variant="outline"
              >
                {loadingQuiz ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating {quizDifficulty} quiz...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Generate{" "}
                    {quizDifficulty.charAt(0).toUpperCase() +
                      quizDifficulty.slice(1)}{" "}
                    {quizQuestionType === "fill_in_blank"
                      ? "Fill in the Blank Quiz"
                      : "Quiz"}
                  </span>
                )}
              </Button>
            </section>
          )}

          {/* QUIZ OUTPUT */}
          {selectedMode === "quiz" && quiz.length > 0 && (
            <section ref={quizSectionRef} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Generated Quiz
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveQuiz(false)}
                  >
                    Save Result
                  </Button>
                  <Button size="sm" onClick={() => saveQuiz(true)}>
                    Save & Start Quiz
                  </Button>
                </div>
              </div>

              <Input
                value={resultTitle}
                onChange={(e) => setResultTitle(e.target.value)}
                placeholder="Enter a title for this result"
                className="h-10"
              />

              {quiz.map((q, index) => (
                <div
                  key={`${q.question}-${index}`}
                  className="border rounded-lg p-4 bg-muted/40"
                >
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-primary">
                    {q.difficulty}
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {q.options.map((opt: string, i: number) => (
                      <li key={i}>• {opt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* GENERATE FLASHCARDS */}
          {text && selectedMode === "flashcards" && (
            <section ref={flashcardsSectionRef} className="space-y-2">
              <Button
                onClick={generateFlashcards}
                disabled={loadingFlashcards}
                className="w-full"
                variant="secondary"
              >
                {loadingFlashcards ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating flashcards...
                  </span>
                ) : (
                  "Generate Flashcards"
                )}
              </Button>
            </section>
          )}

          {/* FLASHCARDS PREVIEW */}
          {selectedMode === "flashcards" && flashcards.length > 0 && (
            <section ref={flashcardsSectionRef} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Generated Flashcards
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveFlashcards(false)}
                  >
                    Save Result
                  </Button>
                  <Button size="sm" onClick={() => saveFlashcards(true)}>
                    Save & Start Study
                  </Button>
                </div>
              </div>

              <Input
                value={resultTitle}
                onChange={(e) => setResultTitle(e.target.value)}
                placeholder="Enter a title for this result"
                className="h-10"
              />

              <div className="grid md:grid-cols-2 gap-4">
                {flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-muted/40"
                  >
                    <p className="font-semibold">{card.front}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {card.back}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </ModuleCard>
    </ModulePage>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-5xl px-2 py-8 text-center text-sm text-muted-foreground sm:px-0">
          Loading upload workspace...
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
