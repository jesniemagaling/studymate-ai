'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch } from 'lucide-react';

export default function ResultsPage() {
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
              <FileSearch className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No saved results yet</p>
            <p className="text-xs text-muted-foreground">
              Generated content will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
