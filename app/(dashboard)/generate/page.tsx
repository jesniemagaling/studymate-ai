'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ListChecks, Layers } from 'lucide-react';

const modes = [
  {
    title: 'Reviewer',
    description: 'Generate a concise summary of key concepts',
    icon: Brain,
  },
  {
    title: 'Quiz',
    description: 'Create questions from easy to hard',
    icon: ListChecks,
  },
  {
    title: 'Flashcards',
    description: 'Build flashcards for quick study',
    icon: Layers,
  },
];

export default function GeneratePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Generate Study Materials
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {modes.map((mode) => (
              <Card
                key={mode.title}
                className="group transition-all hover:shadow-lg"
              >
                <CardContent className="flex h-full flex-col items-center gap-3 p-6 text-center">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted transition group-hover:bg-primary/10">
                    <mode.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 text-lg font-semibold">{mode.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {mode.description}
                  </p>

                  {/* Push button to bottom */}
                  <Button className="mt-auto w-full">Select</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
