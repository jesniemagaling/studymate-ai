'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReviewer, setLoadingReviewer] = useState(false);
  const [reviewer, setReviewer] = useState('');

  // UPLOAD PDF AND EXTRACT TEXT
  const handleUpload = async () => {
    if (!file) return;

    setLoadingUpload(true);
    setText('');
    setReviewer('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/pdf/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (res.status === 401) {
      setLoadingUpload(false);
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setLoadingUpload(false);
      alert(data.error || 'Failed to upload PDF');
      return;
    }

    setText(data.text || 'No text extracted.');
    setLoadingUpload(false);
  };

  // GENERATE REVIEWER USING AI
  const handleGenerateReviewer = async () => {
    if (!text) return;

    setLoadingReviewer(true);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setLoadingReviewer(false);

    if (!res.ok) {
      alert(data.error || 'Failed to generate reviewer');
      return;
    }

    setReviewer(data.reviewer);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UploadCloud className="h-5 w-5 text-primary" />
            Upload PDF
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Box */}
          <label
            htmlFor="pdf-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition hover:bg-muted"
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

          {/* Extracted Text */}
          {text && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Extracted Text
              </h3>
              <Textarea
                value={text}
                readOnly
                className="h-64 resize-none bg-muted"
              />
            </div>
          )}

          {/* Generate Reviewer Button */}
          {text && !reviewer && (
            <Button
              onClick={handleGenerateReviewer}
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

          {/* Reviewer Output */}
          {reviewer && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                AI-Generated Reviewer
              </h3>

              <Textarea
                value={reviewer}
                readOnly
                className="h-64 resize-none bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
