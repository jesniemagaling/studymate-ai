'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // remove login cookie
    document.cookie = 'isLoggedIn=; path=/; max-age=0';

    // redirect to login
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      {/* Left */}
      <h1 className="font-bold text-lg">StudyMate AI</h1>

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
