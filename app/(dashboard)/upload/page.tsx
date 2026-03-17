"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileText, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardContent, QuizContent } from "@/types/result";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [quiz, setQuiz] = useState<QuizContent["questions"]>([]);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReviewer, setLoadingReviewer] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [flashcards, setFlashcards] = useState<FlashcardContent["cards"]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

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

      setText(data.text);
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

      setReviewer(data.reviewer);
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
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to generate quiz");
        return;
      }

      setQuiz(data.questions);
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

      setFlashcards(data.flashcards);
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
  const saveQuiz = async () => {
    try {
      const quizPayload = {
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
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  // SAVE FLASHCARDS TO DATABASE
  const saveFlashcards = async () => {
    try {
      const flashcardsPayload = {
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
    } catch {
      toast.error("Failed to save flashcards. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UploadCloud className="h-5 w-5 text-primary" />
            Upload & Generate Study Materials
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
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
          {text && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Extracted Text
              </h3>
              <Textarea
                value={text}
                readOnly
                className="h-64 resize-none bg-muted"
              />
            </section>
          )}

          {/* GENERATE REVIEWER */}
          {text && !reviewer && (
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
          )}

          {/* REVIEWER OUTPUT */}
          {reviewer && (
            <section className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  AI Reviewer Output
                </h3>
                <Button size="sm" onClick={saveReviewer}>
                  Save Result
                </Button>
              </div>

              <Textarea
                value={reviewer}
                readOnly
                className="h-64 resize-none bg-muted"
              />
            </section>
          )}

          {/* GENERATE QUIZ */}
          {text && (
            <Button
              onClick={generateQuiz}
              disabled={loadingQuiz}
              className="w-full"
              variant="outline"
            >
              {loadingQuiz ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating quiz...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Generate Quiz
                </span>
              )}
            </Button>
          )}

          {/* QUIZ OUTPUT */}
          {quiz.length > 0 && (
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Generated Quiz
                </h3>
                <Button size="sm" onClick={saveQuiz}>
                  Save Result
                </Button>
              </div>

              {quiz.map((q, index) => (
                <div
                  key={`${q.question}-${index}`}
                  className="border rounded-lg p-4 bg-muted/40"
                >
                  <p className="font-medium">{q.question}</p>
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
          {text && (
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
          )}

          {/* FLASHCARDS PREVIEW */}
          {flashcards.length > 0 && (
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Generated Flashcards
                </h3>

                <Button size="sm" onClick={saveFlashcards}>
                  Save Result
                </Button>
              </div>

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
      </Card>
    </div>
  );
}
