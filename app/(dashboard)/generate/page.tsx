"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ListChecks, Layers, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const modes = [
  {
    title: "Reviewer",
    description: "Generate a concise summary of key concepts",
    icon: Brain,
  },
  {
    title: "Quiz",
    description: "Create questions from easy to hard",
    icon: ListChecks,
  },
  {
    title: "Flashcards",
    description: "Build flashcards for quick study",
    icon: Layers,
  },
];

export default function GeneratePage() {
  const router = useRouter();

  return (
    <section className="space-y-6" aria-label="Generate study materials">
      <Card className="w-full border-border/60 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold">
            Generate Study Materials
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick a study format to continue. You can generate all three from the
            same uploaded notes.
          </p>
        </CardHeader>

        <CardContent>
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
                    onClick={() => router.push("/upload")}
                  >
                    Select
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
