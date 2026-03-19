"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { StudyResult } from "@/types/result";
import { ResultRenderer } from "@/components/results/ResultRenderer";
import { apiFetch } from "@/lib/api/client";

export default function ResultViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [result, setResult] = useState<StudyResult | null>(null);
  const [sourcePdfName, setSourcePdfName] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the result from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch<{ result: StudyResult }>(
          `/api/results/get/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        setResult(data.result);
        setTitleInput(data.result.title || "");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch result";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!result?.sourcePdfId) {
      setSourcePdfName(null);
      return;
    }

    const loadSourcePdf = async () => {
      try {
        const data = await apiFetch<{
          pdf: {
            fileName: string;
          };
        }>(`/api/pdf/get/${result.sourcePdfId}`, {
          method: "GET",
          credentials: "include",
        });

        setSourcePdfName(data.pdf.fileName || null);
      } catch {
        // Preserve core result rendering if source PDF lookup fails.
        setSourcePdfName(null);
      }
    };

    loadSourcePdf();
  }, [result?.sourcePdfId]);

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(
      typeof result.content === "string"
        ? result.content
        : JSON.stringify(result.content, null, 2),
    );
    toast.success("Copied to clipboard!");
  };

  const handleSaveTitle = async () => {
    if (!result) return;

    const nextTitle = titleInput.trim();
    if (!nextTitle) {
      toast.error("Please enter a title.");
      return;
    }

    setSavingTitle(true);

    try {
      const data = await apiFetch<{ title: string }>(
        `/api/results/update/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: nextTitle }),
        },
      );

      setResult({ ...result, title: data.title || nextTitle });
      toast.success("Title updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update title";
      toast.error(message);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;

    try {
      await apiFetch(`/api/results/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      toast.success("Deleted successfully");
      router.push("/results");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    }
  };

  const stripHeading = (value: string, heading: string) =>
    value.replace(new RegExp(`^${heading}:\\s*`, "i"), "").trim();

  const normalizeReviewerSummary = (summary: string) => {
    const cleaned = summary
      .replace(/^\[MOCK REVIEWER\]\s*/i, "")
      .replace(/\r/g, "")
      .trim();

    const keyPointsIndex = cleaned.search(/^key points:\s*$/im);
    const withoutKeyPoints =
      keyPointsIndex >= 0 ? cleaned.slice(0, keyPointsIndex).trim() : cleaned;

    return stripHeading(withoutKeyPoints, "Summary");
  };

  const normalizeReviewerKeyPoints = (summary: string, keyPoints: string[]) => {
    const parsedFromSummary = summary
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[-*]\s+/.test(line))
      .map((line) => line.replace(/^[-*]\s+/, "").trim());

    const merged = [...keyPoints, ...parsedFromSummary]
      .map((point) => point.trim())
      .map((point) => stripHeading(point, "Summary"))
      .map((point) => stripHeading(point, "Key Points"))
      .filter((point) => point.length > 0)
      .filter((point) => !/^\[MOCK REVIEWER\]$/i.test(point));

    const unique: string[] = [];
    merged.forEach((point) => {
      if (!unique.includes(point)) unique.push(point);
    });

    return unique;
  };

  const buildExportLines = (value: StudyResult) => {
    const lines: Array<{ text: string; type?: "header" | "body" | "spacer" }> =
      [];

    const pushHeader = (text: string) => lines.push({ text, type: "header" });
    const pushBody = (text: string) => lines.push({ text, type: "body" });
    const pushSpacer = () => lines.push({ text: "", type: "spacer" });

    pushHeader(value.title || "Generated Result");
    pushBody(`Type: ${value.type.toUpperCase()}`);
    pushBody(`Saved on: ${new Date(value.createdAt).toLocaleString()}`);
    pushSpacer();

    if (value.type === "reviewer") {
      const summary = normalizeReviewerSummary(value.content.summary || "");
      const keyPoints = normalizeReviewerKeyPoints(
        value.content.summary || "",
        value.content.keyPoints,
      );

      pushHeader("Summary");
      pushBody(summary || "No summary available.");
      pushSpacer();

      if (keyPoints.length > 0) {
        pushHeader("Key Points");
        keyPoints.forEach((point) => pushBody(`- ${point}`));
      }
    }

    if (value.type === "quiz") {
      value.content.questions.forEach((q, idx) => {
        pushHeader(`Question ${idx + 1}`);
        pushBody(q.question);
        pushBody(`Difficulty: ${q.difficulty}`);
        q.options.forEach((opt) => pushBody(`- ${opt}`));
        pushBody(`Answer: ${q.answer}`);
        if (q.contextHint) {
          pushBody(`Hint: ${q.contextHint}`);
        }
        pushSpacer();
      });
    }

    if (value.type === "flashcards") {
      value.content.cards.forEach((card, idx) => {
        pushHeader(`Card ${idx + 1}`);
        pushBody(`Front: ${card.front}`);
        pushBody(`Back: ${card.back}`);
        pushSpacer();
      });
    }

    return lines;
  };

  // EXPORT TO PDF
  const handleExportPDF = async () => {
    if (!result) return;

    toast.loading("Generating PDF...", { id: "pdf" });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 12;
      const headerHeight = 22;
      const footerHeight = 12;
      const lineHeight = 5.5;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = margin + headerHeight;

      const drawHeader = () => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("StudyMate AI", margin, margin - 2);

        const typeLabel = result.type.toUpperCase();
        const badgeColors: Record<
          StudyResult["type"],
          [number, number, number]
        > = {
          reviewer: [41, 98, 255],
          quiz: [18, 153, 110],
          flashcards: [120, 86, 255],
        };
        const [r, g, b] = badgeColors[result.type];
        const badgePaddingX = 3.5;
        const badgeHeight = 6;
        const badgeTextWidth = pdf.getTextWidth(typeLabel);
        const badgeWidth = badgeTextWidth + badgePaddingX * 2;
        const badgeX = margin + pageWidth - badgeWidth;
        const badgeY = margin - 7.5;

        pdf.setFillColor(r, g, b);
        pdf.rect(badgeX, badgeY, badgeWidth, badgeHeight, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.text(typeLabel, badgeX + badgePaddingX, badgeY + 4.2);
        pdf.setTextColor(0, 0, 0);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        // Keep timestamp below the top row so it never overlaps the type badge.
        pdf.text(
          `Exported: ${new Date().toLocaleString()}`,
          pageWidth + margin,
          margin + 5,
          { align: "right" },
        );

        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, margin, margin + pageWidth, margin);
      };

      const drawFooter = (page: number, total: number) => {
        const footerY = pageHeight - footerHeight + 4;
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, footerY - 5, margin + pageWidth, footerY - 5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`${result.title || "StudyMateAI-Result"}`, margin, footerY);
        pdf.text(`Page ${page} of ${total}`, margin + pageWidth, footerY, {
          align: "right",
        });
      };

      drawHeader();

      const lines = buildExportLines(result);

      for (const line of lines) {
        if (line.type === "header") {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
        }

        const wrapped =
          line.type === "spacer"
            ? [" "]
            : (pdf.splitTextToSize(line.text || " ", pageWidth) as string[]);

        const requiredHeight =
          wrapped.length * lineHeight + (line.type === "header" ? 1.5 : 0);

        if (y + requiredHeight > pageHeight - footerHeight - margin) {
          pdf.addPage();
          y = margin + headerHeight;
          drawHeader();
        }

        pdf.text(wrapped, margin, y);
        y += wrapped.length * lineHeight + (line.type === "header" ? 1.5 : 0);
      }

      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        drawFooter(page, totalPages);
      }

      pdf.save(`${result.title || "StudyMateAI-Result"}.pdf`);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("Failed to export PDF.", { id: "pdf" });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading result...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Result not found.
      </div>
    );
  }

  return (
    <section
      className="mx-auto w-full max-w-5xl space-y-4"
      aria-label="Result details"
    >
      <Card className="w-full border-border/60 py-4 shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/results")}
              aria-label="Back to results"
            >
              <ArrowLeft />
            </Button>

            <CardTitle className="flex min-w-0 items-center gap-2 text-xl font-semibold">
              <FileText className="h-6 w-6 text-primary" />
              <span className="truncate">
                {result.title || "Generated Result"}
              </span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" /> Export PDF
            </Button>

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Edit result title"
              className="h-10"
            />
            <Button
              onClick={handleSaveTitle}
              disabled={savingTitle}
              className="sm:w-auto"
            >
              {savingTitle ? "Saving..." : "Save Title"}
            </Button>
          </div>

          <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary border">
            {result.type.toUpperCase()}
          </div>

          {result.sourcePdfId && (
            <p className="text-xs text-muted-foreground">
              Generated from PDF:{" "}
              <span className="font-medium text-foreground">
                {sourcePdfName || "Unknown file"}
              </span>
            </p>
          )}

          <ResultRenderer
            result={result}
            onPracticeQuiz={() => router.push(`/quiz/${id}`)}
            onStudyFlashcards={() => router.push(`/study/${id}`)}
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Saved on: {new Date(result.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
