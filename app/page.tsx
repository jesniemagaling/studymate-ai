import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">StudyMate AI</CardTitle>
          <p className="mt-2 text-muted-foreground">
            Turn your PDF study materials into reviewers, quizzes, and
            flashcards using AI.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Upload your notes or modules and choose how you want to study. No
            installation required.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/upload">
              <Button size="lg">Get Started</Button>
            </Link>

            <Link href="/login">
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
