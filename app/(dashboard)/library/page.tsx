"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const router = useRouter();

  return (
    <section className="space-y-6" aria-label="PDF library">
      <Card className="w-full border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            My PDF Library
          </CardTitle>
        </CardHeader>

        <CardContent>
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
        </CardContent>
      </Card>
    </section>
  );
}
