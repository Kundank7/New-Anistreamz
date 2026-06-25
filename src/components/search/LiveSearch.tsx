'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SettingsAdjust } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

interface SearchResult {
  id: number;
  slug: string;
  title: string;
  title_english: string;
  poster: string;
  status: string;
  type: string;
  year: number;
  score: number;
}

export interface LiveSearchProps {
  onClose?: () => void;
  dropdownPosition?: 'top' | 'bottom';
  onQueryChange?: (query: string) => void;
  autoFocus?: boolean;
}

export function LiveSearch({ onClose, dropdownPosition = 'bottom', onQueryChange, autoFocus = false }: LiveSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutLabel = isMac ? '\u2318K' : 'Ctrl+K';

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    
    setIsOpen(true);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/live?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Limit to 4 results
        const fetched = data.data || [];
        setResults(fetched);
        setActiveIndex(-1);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (activeIndex >= 0 && results[activeIndex]) {
      router.push(`/anime/${results[activeIndex].slug}`);
      setIsOpen(false);
      setQuery('');
      if (onClose) onClose();
      return;
    }

    const targetUrl = query.trim() 
      ? `/search?q=${encodeURIComponent(query)}` 
      : `/search`;
    
    router.push(targetUrl);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      if (onClose) onClose();
      return;
    }

    if (!isOpen) return;

    const totalItems = results.length + 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSubmit();
      } else if (activeIndex === results.length) {
        e.preventDefault();
        setActiveIndex(-1);
        setTimeout(() => handleSubmit(), 0);
      }
    }
  };

  return (
    <div className="relative w-full group">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onQueryChange) onQueryChange(e.target.value);
          }}
          onFocus={() => { setIsFocused(true); if (query.length >= 2) setIsOpen(true); }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full bg-card/40 border border-secondary/20 hover:border-secondary/40 focus:border-secondary focus:bg-card rounded-none py-2.5 pl-14 pr-[72px] focus:outline-none transition-all font-mono font-bold text-sm tracking-widest text-foreground placeholder:text-muted-foreground"
          style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
        />
        <div 
          className="absolute left-1.5 top-1.5 bottom-1.5 w-10 bg-secondary/20 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-secondary/30" 
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
        >
          <Search className="text-secondary w-3.5 h-3.5" />
        </div>
        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1.5 z-20">
          {/* CTRL+K Badge */}
          {!query && !isFocused && (
            <div className="w-max h-7 pointer-events-none hidden md:flex items-center">
              <div
                className="px-1.5 h-full flex items-center bg-warning/10 border border-warning/40 text-warning"
                style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
              >
                <span className="text-[9px] font-black uppercase tracking-wider">{isMac ? '\u2318 + K' : 'Ctrl + K'}</span>
              </div>
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (onQueryChange) onQueryChange('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="w-7 h-7 bg-danger/10 border border-danger/30 hover:bg-danger/20 text-danger flex items-center justify-center transition-all"
              style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
              aria-label="Clear search"
            >
              <div className="relative w-4 h-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
              </div>
            </button>
          )}

          {/* Filter Badge */}
          <Tooltip content="Advanced Search / Filters" position="bottom">
            <Link
              href="/search"
              onClick={() => { setIsOpen(false); if (onClose) onClose(); }}
              className="w-max h-7 flex items-center group/filter"
            >
            <div
              className="px-2 h-full flex items-center bg-secondary/10 border border-secondary/30 group-hover/filter:border-secondary group-hover/filter:bg-secondary/20 text-secondary transition-all"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
            >
              <SettingsAdjust className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="text-[9px] font-black uppercase tracking-wider hidden md:inline">Search</span>
            </div>
          </Link>
          </Tooltip>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute left-0 right-0 z-50 animate-in fade-in duration-200",
            dropdownPosition === 'top' 
              ? "bottom-full mb-2 slide-in-from-bottom-2" 
              : "top-full mt-2 slide-in-from-top-2"
          )}
        >
          <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border-b border-border">
                    <Skeleton className="w-12 h-16 shrink-0 rounded-none bg-secondary/10" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-none bg-secondary/10" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-[18px] w-10 rounded-none bg-secondary/10" />
                        <Skeleton className="h-3 w-24 rounded-none bg-secondary/10" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 rounded-none bg-secondary/10" />
                  </div>
                ))}
              </>
            ) : results.length > 0 ? (
              <>
                {results.map((anime, index) => (
                  <SearchResultItem
                    key={anime.slug}
                    anime={anime}
                    isActive={activeIndex === index}
                    onSelect={() => { setIsOpen(false); setQuery(''); if (onClose) onClose(); }}
                    onHover={() => setActiveIndex(index)}
                  />
                ))}
                <button
                  onClick={() => { handleSubmit(); if (onClose) onClose(); }}
                  onMouseEnter={() => setActiveIndex(results.length)}
                  className={cn(
                    "w-full p-3 text-[10px] uppercase tracking-[0.3em] font-black text-center border-t border-border transition-all",
                    activeIndex === results.length 
                      ? "bg-secondary text-background shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                      : "bg-secondary/5 hover:bg-secondary/10 text-secondary"
                  )}
                >
                  See all results
                </button>
              </>
            ) : (
              <div className="p-4 text-center text-sm font-bold text-muted-foreground font-mono">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ anime, isActive, onSelect, onHover }: { anime: SearchResult; isActive: boolean; onSelect: () => void; onHover: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { titleLang } = useTitleLang();
  const displayTitle = titleLang === 'en' && anime.title_english ? anime.title_english : anime.title;

  return (
    <Link
      href={`/anime/${anime.slug}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "flex items-center gap-4 p-3 border-b border-border last:border-0 transition-all group/item",
        isActive ? "bg-secondary/20" : "hover:bg-secondary/10"
      )}
    >
      <div className={cn(
        "relative w-12 h-16 flex-shrink-0 bg-card border-2 transition-colors overflow-hidden",
        isActive ? "border-secondary" : "border-secondary/20 group-hover/item:border-secondary"
      )}>
        {!imgLoaded && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <img
          src={anime.poster}
          alt={anime.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isActive ? "scale-110" : "group-hover/item:scale-110",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-black truncate uppercase tracking-tighter transition-colors",
          isActive ? "text-secondary" : "group-hover/item:text-secondary"
        )}>{displayTitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-black text-secondary bg-secondary/10 px-1.5 py-0.5 border border-secondary/30 uppercase tracking-tighter">{anime.score || '??'}</span>
          <p className="text-[10px] text-muted-text font-bold uppercase tracking-widest truncate">
            {anime.type} • {anime.year || '????'}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-secondary font-black whitespace-nowrap">{anime.status}</span>
      </div>
    </Link>
  );
}

export function LiveSearchSkeleton({ dropdownPosition = 'bottom' }: { dropdownPosition?: 'top' | 'bottom' }) {
  return (
    <div className="relative w-full group">
      <div className="relative w-full">
        <Skeleton className="w-full h-[46px] rounded-none" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} />
        <Skeleton
          className="absolute left-1.5 top-1.5 bottom-1.5 w-10 rounded-none"
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
        />
      </div>
      <div 
        className={cn(
          "absolute left-0 right-0 z-50",
          dropdownPosition === 'top' ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border-b border-border">
              <Skeleton className="w-12 h-16 shrink-0 rounded-none" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-none" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[18px] w-10 rounded-none" />
                  <Skeleton className="h-3 w-24 rounded-none" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-none" />
            </div>
          ))}
          <Skeleton className="w-full h-[42px] rounded-none" />
        </div>
      </div>
    </div>
  );
}
