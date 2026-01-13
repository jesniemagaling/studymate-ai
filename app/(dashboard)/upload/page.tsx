'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Loader2, ListChecks } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [quiz, setQuiz] = useState<any[]>([]);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReviewer, setLoadingReviewer] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // PDF UPLOAD & TEXT EXTRACTION
  const handleUpload = async () => {
    if (!file) return;

    setLoadingUpload(true);
    setReviewer('');
    setQuiz([]);
    setText('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/pdf/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (res.status === 401) {
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }

    const data = await res.json();
    setLoadingUpload(false);

    if (!res.ok) return alert(data.error || 'Failed to extract text');

    setText(data.text);
  };

  // GENERATE REVIEWER
  const generateReviewer = async () => {
    setLoadingReviewer(true);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setLoadingReviewer(false);

    if (!res.ok) return alert(data.error || 'Failed to generate reviewer');

    setReviewer(data.reviewer);
  };

  // GENERATE QUIZ (NO OPENAI)
  const generateQuiz = async () => {
    setLoadingQuiz(true);

    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setLoadingQuiz(false);

    if (!res.ok) return alert(data.error || 'Failed to generate quiz');

    setQuiz(data.questions);
  };

  // SAVE REVIEWER TO DATABASE
  const saveReviewer = async () => {
    const res = await fetch('/api/results/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'reviewer',
        content: reviewer,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert('Reviewer saved!');
  };

  // SAVE QUIZ TO DATABASE
  const saveQuiz = async () => {
    const res = await fetch('/api/results/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'quiz',
        content: quiz,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert('Quiz saved!');
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
              {file ? file.name : 'Click to upload a PDF file'}
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
              'Upload & Extract Text'
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
                'Generate Reviewer'
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
                  Save Reviewer
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
                  Save Quiz
                </Button>
              </div>

              {quiz.map((q) => (
                <div key={q.id} className="border rounded-lg p-4 bg-muted/40">
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
        </CardContent>
      </Card>
    </div>
  );
}
