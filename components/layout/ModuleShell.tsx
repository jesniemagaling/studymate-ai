import type { ComponentPropsWithoutRef } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModulePageProps = ComponentPropsWithoutRef<"section">;

type ModuleCardProps = ComponentPropsWithoutRef<typeof Card>;

export function ModulePage({ className, ...props }: ModulePageProps) {
  return (
    <section
      className={cn("mx-auto w-full max-w-5xl space-y-4", className)}
      {...props}
    />
  );
}

export function ModuleCard({ className, ...props }: ModuleCardProps) {
  return (
    <Card
      className={cn(
        "w-full border-border/60 bg-gradient-to-b from-card to-muted/20 py-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
