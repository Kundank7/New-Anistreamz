'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, Close, ChevronDown, Shuffle } from '@carbon/icons-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { SettingsAdjust, Asleep, AsleepFilled, Light, LightFilled } from '@carbon/icons-react';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

import { PreferenceMenu } from './PreferenceMenu';
import { LiveSearch } from '@/components/search/LiveSearch';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const tabletSearchRef = React.useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { titleLang, setTitleLang } = useTitleLang();
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  // Handle mounting on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);

    // Tablet CTRL+K handler
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (window.innerWidth >= 768 && window.innerWidth < 1280) {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleRandomAnime = async () => {
    if (isRandomLoading) return;
    setIsRandomLoading(true);
    try {
      const res = await fetch('/api/anime/random');
      const data = await res.json();
      if (data.slug) {
        router.push(`/anime/${data.slug}`);
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error('Failed to fetch random anime', error);
    } finally {
      setIsRandomLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (tabletSearchRef.current && !tabletSearchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
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

  const navLinks = [
    { name: 'Home', href: '/' },
    { 
      name: 'Browse', 
      type: 'dropdown',
      items: [
        { name: 'Ongoing', href: '/ongoing' },
        { name: 'Completed', href: '/completed' },
      ]
    },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Library', href: '/library' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background border-b border-secondary/10 shadow-[0_4px_30px_rgba(34,197,94,0.03)]" 
          : "bg-transparent border-b border-transparent shadow-none"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group py-2">
            <div className="relative w-36 md:w-48 h-8 md:h-10 transition-transform group-hover:scale-105">
              <Image 
                src="/Anistreamz_logo.png" 
                alt="Anistreamz" 
                fill 
                sizes="(max-width: 768px) 144px, 192px"
                className="object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                priority
              />
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden xl:flex flex-1 max-w-lg mx-12">
            <LiveSearch />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                return (
                  <div key={link.name} className="relative py-2" ref={desktopDropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setOpenDropdown(prev => prev === link.name ? null : link.name)}
                      className={cn(
                        "flex items-center text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary cursor-pointer",
                        (openDropdown === link.name || link.items?.some(item => pathname.startsWith(item.href))) ? "text-secondary" : "text-foreground/70"
                      )}
                    >
                      {link.name}
                      <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", openDropdown === link.name ? "rotate-180" : "")} />
                    </button>
                    {openDropdown === link.name && (
                      <div className="absolute top-full left-0 w-48 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">
                          {link.items?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={cn(
                                "px-4 py-3 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary border-b border-border last:border-0",
                                pathname.startsWith(item.href) ? "text-secondary bg-secondary/5" : "text-foreground/70"
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href as string}
                  className={cn(
                    "text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary relative group py-2",
                    pathname === link.href ? "text-secondary" : "text-foreground/70"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-[2px] bg-secondary transition-all duration-300",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-2 ml-2">
              {/* Tablet Search Button & Dropdown */}
              <div className="hidden md:flex xl:hidden relative" ref={tabletSearchRef}>
                <Tooltip content="Search" position="bottom">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={cn(
                      "relative p-2.5 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group",
                      isSearchOpen 
                        ? "border border-secondary bg-secondary/10 text-secondary"
                        : "border border-secondary/30 hover:border-secondary text-secondary"
                    )}
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </button>
                </Tooltip>
                
                {isSearchOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[400px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <LiveSearch autoFocus={true} onClose={() => setIsSearchOpen(false)} />
                  </div>
                )}
              </div>

              {/* Random Anime Button */}
              <Tooltip content="Random Anime" position="bottom">
                <button
                  onClick={handleRandomAnime}
                  disabled={isRandomLoading}
                  className="relative p-2.5 border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group disabled:opacity-50"
                  aria-label="Random Anime"
                >
                  <div className={cn("transition-transform duration-300 group-hover:scale-110", isRandomLoading && "animate-spin")}>
                    <Shuffle className="w-5 h-5" />
                  </div>
                </button>
              </Tooltip>
              
              {/* Preference Menu */}
              <PreferenceMenu />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2 relative" ref={mobileMenuRef}>
            <button
              onClick={handleRandomAnime}
              disabled={isRandomLoading}
              className="p-2.5 border border-secondary/30 text-secondary flex items-center justify-center min-w-[44px] min-h-[44px] disabled:opacity-50"
              aria-label="Random Anime"
            >
              <Shuffle className={cn("w-5 h-5", isRandomLoading && "animate-spin")} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "relative p-[2px] transition-all cursor-pointer min-w-[44px] h-[44px] group",
                isMenuOpen
                  ? "border border-secondary bg-secondary/10"
                  : "border border-secondary/30 hover:border-secondary"
              )}
              aria-label="Menu"
            >
              <div className={cn(
                "relative w-full h-full flex items-center justify-center transition-all overflow-hidden",
                isMenuOpen ? "bg-secondary/50" : "bg-secondary/30 group-hover:bg-secondary/50"
              )}>
                <div className="transition-transform duration-300 group-hover:scale-110 relative z-10 flex items-center justify-center">
                  {isMenuOpen ? <Close className="w-5 h-5 text-secondary" /> : <Menu className="w-5 h-5 text-secondary" />}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20" />
              </div>
            </button>
            
            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">
                  {/* Nav Links */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/30">Navigate</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <Link
                    href="/genre"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center h-[52px] px-4 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary",
                      pathname.startsWith('/genre') ? "text-secondary bg-secondary/5" : "text-foreground/70"
                    )}
                  >
                    Browse Genre
                  </Link>
                  <Link
                    href="/schedule"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center h-[52px] px-4 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary",
                      pathname.startsWith('/schedule') ? "text-secondary bg-secondary/5" : "text-foreground/70"
                    )}
                  >
                    Schedule
                  </Link>

                  {/* Settings section */}
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/30">Settings</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between h-[52px] px-4 hover:bg-secondary/10 transition-all">
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
                  <div className="flex items-center justify-between h-[52px] px-4 hover:bg-secondary/10 transition-all">
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/70">Title</span>
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
        </div>
      </div>
    </nav>
  );
}

