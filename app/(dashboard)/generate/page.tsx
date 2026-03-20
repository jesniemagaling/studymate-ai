"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ListChecks, Layers, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

const modes = [
  {
    key: "reviewer",
    title: "Reviewer",
    description: "Generate a concise summary of key concepts",
    icon: Brain,
  },
  {
    key: "quiz",
    title: "Quiz",
    description: "Create questions from easy to hard",
    icon: ListChecks,
  },
  {
    key: "flashcards",
    title: "Flashcards",
    description: "Build flashcards for quick study",
    icon: Layers,
  },
];

export default function GeneratePage() {
  const router = useRouter();

  return (
    <ModulePage aria-label="Generate study materials">
      <ModuleCard>
        <CardHeader className="space-y-1 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-6 w-6 shrink-0 text-primary" />
            Generate Study Materials
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick a study format to continue. You can generate all three from the
            same uploaded notes.
          </p>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map((mode) => (
              <Card
                key={mode.title}
                className="group border-border/60 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted transition group-hover:bg-primary/10">
                    <mode.icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="mt-2 text-lg font-semibold">{mode.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    {mode.description}
                  </p>

                  <Button
                    className="mt-auto w-full"
                    onClick={() => router.push(`/upload?mode=${mode.key}`)}
                  >
                    Select
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </ModuleCard>
    </ModulePage>
  );
}
