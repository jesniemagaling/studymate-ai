"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";

type PdfLibraryItem = {
  id: string;
  fileName: string;
  size: number;
  extractedTextPreview: string;
  extractionStatus?: "success" | "fallback" | "failed";
  extractionError?: string;
  createdAt: string;
};

type PdfDetailsResponse = {
  pdf: {
    id: string;
    fileName: string;
    extractedText: string;
    extractionStatus?: "success" | "fallback" | "failed";
    extractionError?: string;
    createdAt?: string;
  };
};

export default function LibraryPage() {
  const router = useRouter();
  const [pdfs, setPdfs] = useState<PdfLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<
    PdfDetailsResponse["pdf"] | null
  >(null);

  useEffect(() => {
    const loadPdfs = async () => {
      try {
        const data = await apiFetch<{ pdfs: PdfLibraryItem[] }>(
          "/api/pdf/list",
          {
            method: "GET",
            credentials: "include",
          },
        );

        setPdfs(data.pdfs || []);
      } catch {
        setPdfs([]);
        toast.error("Failed to load your PDF library.");
      } finally {
        setLoading(false);
      }
    };

    loadPdfs();
  }, []);

  const handleViewPdf = async (id: string) => {
    setOpenView(true);
    setViewLoading(true);
    setSelectedPdf(null);

    try {
      const data = await apiFetch<PdfDetailsResponse>(`/api/pdf/get/${id}`, {
        method: "GET",
        credentials: "include",
      });

      setSelectedPdf(data.pdf);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load PDF details.";
      toast.error(message);
      setOpenView(false);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-5xl space-y-4"
      aria-label="PDF library"
    >
      <Card className="w-full border-border/60 py-4 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            My PDF Library
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reuse uploaded documents without re-uploading and continue
            generating instantly.
          </p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              Loading library...
            </div>
          ) : pdfs.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl border border-dashed bg-muted/30 px-8 py-16 text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.98_0_0),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.24_0_0),transparent_60%)]" />
              <div className="relative flex flex-col items-center justify-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border bg-background shadow-sm">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>

                <h3 className="text-lg font-semibold">No PDFs uploaded yet</h3>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Upload your documents to start generating reviewers, quizzes,
                  and flashcards.
                </p>

                <Button
                  className="mt-6 flex items-center gap-2"
                  onClick={() => router.push("/upload")}
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pdfs.map((pdf) => (
                <Card
                  key={pdf.id}
                  className="border-border/60 bg-muted/30 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md border bg-background p-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold leading-tight">
                          {pdf.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(pdf.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-muted-foreground">
                      {pdf.extractedTextPreview ||
                        "No extracted preview available."}
                    </p>

                    {pdf.extractionStatus === "fallback" && (
                      <p className="text-xs text-amber-500">
                        Auto-recovered text from malformed PDF.
                      </p>
                    )}

                    {pdf.extractionStatus === "failed" && (
                      <p className="text-xs text-destructive">
                        Extraction failed. You can still reuse this file in
                        manual text mode.
                      </p>
                    )}

                    <p className="border-t pt-2 text-xs text-muted-foreground">
                      Uploaded: {new Date(pdf.createdAt).toLocaleString()}
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewPdf(pdf.id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/upload?pdfId=${pdf.id}`)}
                      >
                        Use This PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPdf?.fileName || "PDF Preview"}</DialogTitle>
            <DialogDescription>
              Review extracted text before using this PDF for generation.
            </DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              Loading PDF preview...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {(selectedPdf?.extractionStatus || "unknown").toUpperCase()}
                  </span>
                </p>
                <p>
                  Updated:{" "}
                  <span className="font-medium text-foreground">
                    {selectedPdf?.createdAt
                      ? new Date(selectedPdf.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </p>
              </div>

              {selectedPdf?.extractionStatus === "failed" && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Extraction failed. You can still use this file in manual text
                  mode.
                </p>
              )}

              {selectedPdf?.extractionStatus === "fallback" && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                  Auto-recovered text from a malformed PDF.
                </p>
              )}

              <div className="max-h-[52vh] overflow-y-auto rounded-lg border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedPdf?.extractedText?.trim() ||
                  "No extracted text available."}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={() => setOpenView(false)}>
                  Close
                </Button>
                {selectedPdf?.id && (
                  <Button
                    onClick={() => {
                      setOpenView(false);
                      router.push(`/upload?pdfId=${selectedPdf.id}`);
                    }}
                  >
                    Use This PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
