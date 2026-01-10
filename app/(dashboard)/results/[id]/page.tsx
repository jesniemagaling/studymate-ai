'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ResultViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the result
  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await fetch(`/api/results/get/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'Failed to load result');
          return;
        }

        setResult(data.result);
      } catch (err) {
        toast.error('Failed to fetch result');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.content || '');
    toast.success('Copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    const res = await fetch(`/api/results/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Failed to delete');
      return;
    }

    toast.success('Deleted successfully');
    router.push('/dashboard/results');
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
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-5xl shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/results')}
            >
              <ArrowLeft />
            </Button>

            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <FileText className="h-6 w-6 text-primary" />
              {result.title || 'Generated Result'}
            </CardTitle>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed text-sm">
            {result.content}
          </p>

          <p className="mt-6 text-xs text-muted-foreground">
            Saved on: {new Date(result.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
