"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const heroSurfaceClass =
    "overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-sm";
  const surfaceCardClass = "border-border/60 bg-card shadow-sm";

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      toast.error("Please enter email and password");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      toast.error("Please complete the bot verification request.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password: normalizedPassword,
      turnstileToken,
      redirect: false,
    });

    setLoading(false);
    setTurnstileToken(null);
    setTurnstileReset((current) => current + 1);

    if (result?.error) {
      if (result.error === "BOT_VERIFICATION_FAILED") {
        toast.error("Bot verification failed. Please try again.");
        return;
      }

      if (result.error === "CredentialsSignin") {
        toast.error("Invalid email or password");
        return;
      }

      toast.error(`Login failed: ${result.error}`);
    } else {
      toast.success("Login successful");
      router.push("/home");
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) {
      return;
    }

    setGoogleLoading(true);
    await signIn("google", {
      callbackUrl: "/home",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
        <Card className={`${heroSurfaceClass} w-full`}>
          <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
            <div className="flex flex-col gap-4 p-5 sm:p-6 md:p-8 lg:min-h-[340px] lg:justify-between lg:gap-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  StudyMate AI
                </p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Welcome back to StudyMate AI
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Sign in to continue your progress, generate new study
                  materials, and keep your momentum going.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Secure Sign-in
              </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              <Card className={`${surfaceCardClass} border bg-background/60`}>
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Login to continue
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Access your dashboard and pick up where you left off.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >
                    <Input
                      aria-label="Email address"
                      placeholder="name@email.com"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-border/70 bg-background/60"
                      required
                    />

                    <div className="relative">
                      <Input
                        aria-label="Password"
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 border-border/70 bg-background/60 pr-11"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <TurnstileWidget
                      onTokenChange={setTurnstileToken}
                      resetSignal={turnstileReset}
                    />

                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Login"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      {googleLoading ? "Redirecting..." : "Sign in with Google"}
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="font-medium underline underline-offset-4"
                      >
                        Register
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
