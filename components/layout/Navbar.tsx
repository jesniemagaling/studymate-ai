'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="flex items-center justify-between border-b p-4">
      <h1 className="font-bold text-lg">StudyMate AI</h1>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-5 w-5 dark:hidden" />
        <Moon className="h-5 w-5 hidden dark:block" />
      </Button>
    </nav>
  );
}
