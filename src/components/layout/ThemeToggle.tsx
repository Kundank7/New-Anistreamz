'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  };

  if (!mounted) {
    return (
      <div className="p-2.5 min-w-[44px] min-h-[44px] border border-secondary/30 flex items-center justify-center">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <Tooltip content={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} position="bottom">
      <button
        onClick={toggleTheme}
        className="relative p-2.5 rounded-none border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Toggle theme"
      >
        <div className="transition-transform duration-300 group-hover:scale-110">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </div>
      </button>
    </Tooltip>
  );
}
