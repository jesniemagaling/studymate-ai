'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewer, setReviewer] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setText('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/pdf/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    // HANDLE UNAUTHORIZED
    if (res.status === 401) {
      setLoading(false);
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      alert(data.error || 'Failed to upload PDF');
      return;
    }

    setText(data.text || 'No text extracted.');
    setLoading(false);
  };

  const handleGenerateReviewer = async () => {
    if (!text) return;

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
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

          {/* Action Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Processing PDF...' : 'Upload & Extract Text'}
          </Button>

          {/* Extracted Text */}
          {text && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Extracted Text
              </h3>
              <Textarea value={text} readOnly className="h-64 resize-none" />
            </div>
          )}

          {!loading && text && (
            <Button onClick={handleGenerateReviewer} className="w-full">
              {loading ? 'Generating...' : 'Generate Reviewer'}
            </Button>
          )}

          {reviewer && (
            <Textarea
              value={reviewer}
              readOnly
              className="mt-4 h-64 resize-none"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
