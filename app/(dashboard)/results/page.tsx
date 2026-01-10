'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, FileText } from 'lucide-react';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await fetch('/api/results/list', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-5xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileSearch className="h-6 w-6 text-primary" />
            Generated Results
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* LOADING STATE */}
          {loading && (
            <div className="py-12 text-center text-muted-foreground">
              Loading results...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No saved results yet</p>
              <p className="text-xs text-muted-foreground">
                Your generated reviewers, quizzes, or flashcards will appear
                here.
              </p>
            </div>
          )}

          {/* RESULTS LIST */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <Card
                  key={result._id}
                  className="border shadow-sm transition hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />

                      <div>
                        <p className="font-medium">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved on{' '}
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
