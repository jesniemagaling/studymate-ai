"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, MailCheck, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const heroSurfaceClass =
    "overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-sm";
  const surfaceCardClass = "border-border/60 bg-card shadow-sm";

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const maskEmail = (raw: string) => {
    const [localPart, domain] = raw.split("@");

    if (!localPart || !domain) {
      return raw;
    }

    const visibleChars = localPart.slice(0, 2);
    const maskedTail = "*".repeat(
      Math.max(1, localPart.length - visibleChars.length),
    );
    return `${visibleChars}${maskedTail}@${domain}`;
  };

  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your email first.");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      toast.error("Please complete the bot verification request.");
      return;
    }

    if (resendCooldown > 0) {
      toast.error(
        `Please wait ${resendCooldown}s before requesting a new code.`,
      );
      return;
    }

    setSendingCode(true);

    try {
      const res = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          turnstileToken,
        }),
      });

      const data = await res.json().catch(() => null);
      const message = data?.message || data?.error;

      if (!res.ok) {
        toast.error(message || "Unable to send verification code.");
        return;
      }

      setCodeSent(true);
      setCodeSentTo(normalizedEmail);
      setResendCooldown(60);
      toast.success("Verification code sent. Check your inbox.");
    } catch {
      toast.error("Unable to send code right now. Please try again.");
    } finally {
      setTurnstileToken(null);
      setTurnstileReset((current) => current + 1);
      setSendingCode(false);
    }
  };

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !firstName ||
      !lastName ||
      !normalizedEmail ||
      !password ||
      !verificationCode
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!codeSent) {
      toast.error("Please request and verify your email code first.");
      return;
    }

    if (normalizedEmail !== codeSentTo) {
      toast.error("Email changed. Please request a new verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: normalizedEmail,
          password,
          verificationCode,
        }),
      });

      const data = await res.json().catch(() => null);
      const message = data?.message || data?.error;

      if (!res.ok) {
        toast.error(message || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created! You can now log in.");
      router.push("/login");
    } catch {
      toast.error(
        "Unable to connect. Please check your internet and try again.",
      );
    } finally {
      setLoading(false);
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
                  Build your StudyMate account
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Create your account to start your progress, generate new study
                  materials, and keep your momentum going.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Verified Sign-up
              </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              <Card className={`${surfaceCardClass} border bg-background/60`}>
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Create your account
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Verify your email first, then complete registration.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegister();
                    }}
                  >
                    <Input
                      aria-label="First name"
                      placeholder="First Name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 border-border/70 bg-background/60"
                      required
                    />

                    <Input
                      aria-label="Last name"
                      placeholder="Last Name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 border-border/70 bg-background/60"
                      required
                    />

                    <div className="space-y-2">
                      <Input
                        aria-label="Email address"
                        placeholder="name@email.com"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          const nextEmail = e.target.value;
                          const normalizedNextEmail = nextEmail
                            .trim()
                            .toLowerCase();

                          setEmail(nextEmail);

                          if (
                            codeSent &&
                            codeSentTo &&
                            normalizedNextEmail !== codeSentTo
                          ) {
                            setCodeSent(false);
                            setVerificationCode("");
                          }
                        }}
                        className="h-11 border-border/70 bg-background/60"
                        required
                      />

                      <TurnstileWidget
                        onTokenChange={setTurnstileToken}
                        resetSignal={turnstileReset}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full"
                        onClick={handleSendCode}
                        disabled={sendingCode || resendCooldown > 0}
                      >
                        <MailCheck className="mr-2 h-4 w-4" />
                        {sendingCode
                          ? "Sending code..."
                          : resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : codeSent
                              ? "Resend verification code"
                              : "Send verification code"}
                      </Button>

                      {resendCooldown > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          You can request a new code in {resendCooldown}s.
                        </p>
                      ) : null}
                    </div>

                    <Input
                      aria-label="Verification code"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="h-11 border-border/70 bg-background/60 tracking-normal placeholder:tracking-normal"
                      maxLength={6}
                      required
                    />

                    <div className="relative">
                      <Input
                        aria-label="Password"
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 border-border/70 bg-background/60 pr-11"
                        minLength={8}
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

                    {codeSent ? (
                      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                        Verification code sent to {maskEmail(codeSentTo)}. Use
                        the latest code from your email.
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Register"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      {googleLoading
                        ? "Redirecting..."
                        : "Continue with Google"}
                    </Button>

                    <p className="pt-1 text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-medium underline underline-offset-4"
                      >
                        Login
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
