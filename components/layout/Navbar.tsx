'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Upload', href: '/upload' },
  { label: 'Library', href: '/library' },
  { label: 'Generate', href: '/generate' },
  { label: 'Results', href: '/results' },
  { label: 'Analytics', href: '/analytics' },
];

export default function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-6">
        <h1
          className="cursor-pointer font-bold text-lg"
          onClick={() => router.push('/home')}
        >
          StudyMate AI
        </h1>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'default' : 'ghost'}
              size="sm"
              onClick={() => router.push(link.href)}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
