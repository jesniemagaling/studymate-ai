"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "Upload", href: "/upload" },
  { label: "Library", href: "/library" },
  { label: "Generate", href: "/generate" },
  { label: "Results", href: "/results" },
];

export default function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [canViewSettings, setCanViewSettings] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAccess = async () => {
      try {
        const res = await fetch("/api/ai/settings", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        setCanViewSettings(Boolean(data?.canEdit));
      } catch {
        if (!mounted) return;
        setCanViewSettings(false);
      }
    };

    loadAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleLinks = useMemo(() => {
    return canViewSettings
      ? [...navLinks, { label: "Settings", href: "/settings" }]
      : navLinks;
  }, [canViewSettings]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="group inline-flex items-center gap-2 rounded-md p-2 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Go to home"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            StudyMate AI
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex" role="menubar">
          {visibleLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(link.href)}
              className="rounded-full px-4"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hidden md:inline-flex"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={clsx(
          "absolute left-0 right-0 top-full z-50 origin-top transform border-b bg-background/95 shadow-lg backdrop-blur transition-all duration-200 md:hidden",
          open
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-95 opacity-0",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
          {visibleLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "default" : "ghost"}
              className="justify-start"
              onClick={() => handleNavigate(link.href)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Button>
          ))}

          <Button
            variant="ghost"
            className="justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
