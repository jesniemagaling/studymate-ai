'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  FileText,
  Brain,
  Bookmark,
  UploadCloud,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const firstName = session?.user?.firstName || 'Student';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* HERO */}
        <Card className="bg-muted/40 border-none">
          <CardContent className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Hi, {firstName}! Welcome to StudyMate AI
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Your personal AI-powered study space. Upload your notes and let
              StudyMate AI generate reviewers, quizzes, and flashcards to help
              you study smarter.
            </p>
          </CardContent>
        </Card>

        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">PDFs Uploaded</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <Brain className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">AI Generations</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <Bookmark className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Saved Results</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="transition hover:shadow-md">
            <CardContent className="flex flex-col justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-7 w-7 text-primary" />
                <div>
                  <p className="font-semibold">Upload PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your study materials to get started
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push('/upload')}>Upload PDF</Button>
            </CardContent>
          </Card>

          <Card className="transition hover:shadow-md">
            <CardContent className="flex flex-col justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-primary" />
                <div>
                  <p className="font-semibold">Generate Study Materials</p>
                  <p className="text-sm text-muted-foreground">
                    Create reviewers, quizzes, and flashcards
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/generate')}
              >
                Generate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Empty state for now */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">No recent activity yet</p>
              <p className="text-xs text-muted-foreground">
                Your uploads and AI generations will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
