"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { StudyResult } from "@/types/result";
import { ResultRenderer } from "@/components/results/ResultRenderer";

export default function ResultViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [result, setResult] = useState<StudyResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Reference for PDF content
  const pdfRef = useRef<HTMLDivElement | null>(null);

  // Fetch the result from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/results/get/${id}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to load result");
          return;
        }

        setResult(data.result);
      } catch {
        toast.error("Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(
      typeof result.content === "string"
        ? result.content
        : JSON.stringify(result.content, null, 2),
    );
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;

    const res = await fetch(`/api/results/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to delete");
      return;
    }

    toast.success("Deleted successfully");
    router.push("/results");
  };

  // EXPORT TO PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    toast.loading("Generating PDF...", { id: "pdf" });

    // capture the content
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${result.title || "StudyMateAI-Result"}.pdf`);

    toast.success("PDF downloaded!", { id: "pdf" });
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
    <section className="space-y-6" aria-label="Result details">
      <Card className="w-full max-w-5xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/results")}
              aria-label="Back to results"
            >
              <ArrowLeft />
            </Button>

            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <FileText className="h-6 w-6 text-primary" />
              {result.title || "Generated Result"}
            </CardTitle>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>

            <Button variant="secondary" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" /> Export PDF
            </Button>

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent ref={pdfRef} className="space-y-6">
          <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary border">
            {result.type.toUpperCase()}
          </div>

          <ResultRenderer
            result={result}
            onPracticeQuiz={() => router.push(`/quiz/${id}`)}
            onStudyFlashcards={() => router.push(`/study/${id}`)}
          />

          <p className="mt-6 text-xs text-muted-foreground">
            Saved on: {new Date(result.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
