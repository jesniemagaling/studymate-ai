'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            My PDF Library
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 px-6 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="text-base font-semibold">No PDFs uploaded yet</h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload your study materials to generate reviewers, quizzes, and
              flashcards.
            </p>

            <Button
              className="mt-6 flex items-center gap-2"
              onClick={() => router.push('/upload')}
            >
              <UploadCloud className="h-4 w-4" />
              Upload PDF
            </Button>
          </div>

          {/* Future: PDF List */}
          {/*
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            PDF cards go here
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
