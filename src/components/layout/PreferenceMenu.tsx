'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SettingsAdjust, Asleep, AsleepFilled, Light, LightFilled } from '@carbon/icons-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';
import { Tooltip } from '@/components/ui/Tooltip';

export function PreferenceMenu() {
  const { theme, setTheme } = useTheme();
  const { titleLang, setTitleLang } = useTitleLang();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (next: string) => {
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  };

  if (!mounted) {
    return (
      <div className="min-w-[44px] h-[44px] border border-secondary/30 p-[2px]">
        <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
          <div className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip content="Preference" position="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative p-[2px] transition-all cursor-pointer min-w-[44px] h-[44px] group",
            isOpen
              ? "border border-secondary bg-secondary/10"
              : "border border-secondary/30 hover:border-secondary"
          )}
          aria-label="Preference menu"
        >
          <div className={cn(
            "relative w-full h-full flex items-center justify-center transition-all overflow-hidden",
            isOpen ? "bg-secondary/50" : "bg-secondary/30 group-hover:bg-secondary/50"
          )}>
            <div className="transition-transform duration-300 group-hover:scale-110 relative z-10 flex items-center justify-center">
              <SettingsAdjust className="w-5 h-5 text-secondary" />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20" />
          </div>
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute top-full right-0 w-56 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">

            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-4 h-[52px] border-b border-secondary/20">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/70">Theme</span>
              <div className="inline-flex bg-card/50 border border-secondary/30 p-0.5">
                <button
                  onClick={() => changeTheme('dark')}
                  className={cn(
                    "px-3 py-1.5 flex items-center justify-center transition-all",
                    theme === 'dark'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  {theme === 'dark' ? <AsleepFilled className="w-3.5 h-3.5" /> : <Asleep className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => changeTheme('light')}
                  className={cn(
                    "px-3 py-1.5 flex items-center justify-center transition-all",
                    theme === 'light'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  {theme === 'light' ? <LightFilled className="w-3.5 h-3.5" /> : <Light className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Title Language Toggle */}
            <div className="flex items-center justify-between px-4 h-[52px]">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/70">Title Lang</span>
              <div className="inline-flex bg-card/50 border border-secondary/30 p-0.5">
                <button
                  onClick={() => setTitleLang('jp')}
                  className={cn(
                    "px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] transition-all",
                    titleLang === 'jp'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  JP
                </button>
                <button
                  onClick={() => setTitleLang('en')}
                  className={cn(
                    "px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] transition-all",
                    titleLang === 'en'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
