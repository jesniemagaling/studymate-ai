'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Upload', href: '/upload' },
  { label: 'Library', href: '/library' },
  { label: 'Generate', href: '/generate' },
  { label: 'Results', href: '/results' },
];

export default function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpen(false); // close menu on mobile
  };

  return (
    <nav className="relative border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <h1
          className="cursor-pointer font-bold text-lg"
          onClick={() => router.push('/home')}
        >
          StudyMate AI
        </h1>

        {/* Desktop Nav */}
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

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>

          {/* Logout (desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hidden md:inline-flex"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden absolute left-0 right-0 top-full z-50 origin-top transform transition-all duration-200',
          open
            ? 'scale-y-100 opacity-100'
            : 'pointer-events-none scale-y-95 opacity-0'
        )}
      >
        <div className="flex flex-col gap-2 border-t bg-background p-4 shadow-md">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => handleNavigate(link.href)}
            >
              {link.label}
            </Button>
          ))}

          <Button
            variant="ghost"
            className="justify-start text-red-500"
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
