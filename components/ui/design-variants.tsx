import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

type DashboardCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
};

type HeroProps = {
  title: string;
  description: string;
  primaryAction: () => void;
  secondaryAction: () => void;
};

type FormShellProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  busyLabel: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
};

export function DashboardCardVariantA({
  label,
  value,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCardVariantB({
  label,
  value,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/60", className)}>
      <CardContent className="relative p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
          {icon}
        </div>
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardCardVariantC({
  label,
  value,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-sm",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

export function HeroVariantA({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroProps) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Study dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={primaryAction}>Primary Action</Button>
          <Button variant="outline" onClick={secondaryAction}>
            Secondary Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroVariantB({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          StudyMate AI
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={primaryAction}>Get Started</Button>
          <Button variant="ghost" onClick={secondaryAction}>
            Explore
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroVariantC({
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroProps) {
  return (
    <Card className="relative overflow-hidden border-border/60">
      <CardContent className="relative space-y-4 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={primaryAction}>Upload Notes</Button>
          <Button variant="secondary" onClick={secondaryAction}>
            Generate Materials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FormVariantA({
  title,
  subtitle,
  primaryLabel,
  busyLabel,
  isLoading,
  onSubmit,
  children,
}: FormShellProps) {
  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {children}
          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? busyLabel : primaryLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function FormVariantB({
  title,
  subtitle,
  primaryLabel,
  busyLabel,
  isLoading,
  onSubmit,
  children,
}: FormShellProps) {
  return (
    <Card className="w-full max-w-md overflow-hidden border-border/60">
      <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/30" />
      <CardHeader className="space-y-2 text-left">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {children}
          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? busyLabel : primaryLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function FormVariantC({
  title,
  subtitle,
  primaryLabel,
  busyLabel,
  isLoading,
  onSubmit,
  children,
}: FormShellProps) {
  return (
    <Card className="w-full max-w-md border-none bg-muted/30 shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {children}
          <div className="rounded-xl border bg-background p-3">
            <Input
              readOnly
              value="Tip: keep password at least 8 characters."
              className="border-none p-0 text-xs shadow-none"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? busyLabel : primaryLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
