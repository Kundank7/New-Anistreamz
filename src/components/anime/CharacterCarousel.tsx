"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, StarFilled } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

function CharacterCard({ character, va, charItem }: { character: any; va: any; charItem: any }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="min-w-[120px] max-w-[120px] flex-shrink-0 space-y-2 snap-start group">
      <div className="aspect-[3/4] relative overflow-hidden bg-black ring-1 ring-border group-hover:ring-secondary/50 transition-all duration-300" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
        {!imgLoaded && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <img
          src={character.images?.webp?.image_url}
          alt={character.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-80",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-secondary opacity-0 group-hover:opacity-100 transform -translate-y-full group-hover:translate-y-40 transition-all duration-500 ease-linear shadow-[0_0_10px_rgba(34,197,94,0.8)]" />

        {va && (
          <div
            className="absolute bottom-0 right-0 w-12 h-12 border-l-2 border-t-2 border-secondary/50 overflow-hidden z-10 bg-black group-hover:border-secondary transition-colors"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)' }}
          >
            <img
              src={va.images?.jpg?.image_url}
              alt={va.name}
              loading="lazy"
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              title={`VA: ${va.name}`}
            />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold truncate text-foreground">{character.name.split(',').reverse().join(' ').trim()}</p>
        <p className="text-[10px] uppercase tracking-widest text-secondary truncate">{charItem.role}</p>
        {va && (
          <p className="text-[9px] uppercase tracking-widest text-muted-text truncate mt-1 border-t border-border pt-1" title={va.name}>
            VA: {va.name.split(',').reverse().join(' ').trim()}
          </p>
        )}
      </div>
    </div>
  );
}

interface CharacterCarouselProps {
  characters: any[];
}

export function CharacterCarousel({ characters }: CharacterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(true);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [characters]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 136 * 3;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-6 pt-4 relative">
      <div className="flex items-center justify-between border-b-2 border-secondary/20 pb-4">
        <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
          <div className="w-1.5 h-6 bg-secondary" />
          <StarFilled className="w-5 h-5 text-secondary" />
          <h2>Characters<span className="text-secondary opacity-70">_</span></h2>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "w-8 h-8 flex items-center justify-center bg-card border transition-colors",
              canScrollLeft
                ? "border-border hover:border-secondary hover:text-secondary cursor-pointer"
                : "border-border text-muted-text/30 cursor-default"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "w-8 h-8 flex items-center justify-center bg-card border transition-colors",
              canScrollRight
                ? "border-border hover:border-secondary hover:text-secondary cursor-pointer"
                : "border-border text-muted-text/30 cursor-default"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {characters.slice(0, 15).map((charItem: any) => {
          const character = charItem.character;
          const va = charItem.voice_actors?.find((v: any) => v.language === 'Japanese')?.person;
          
          if (!character) return null;
          
          return <CharacterCard key={character.mal_id} character={character} va={va} charItem={charItem} />;
        })}
      </div>
    </div>
  );
}

export function CharacterCarouselSkeleton() {
  return (
    <div className="space-y-6 pt-4 relative">
      <div className="flex items-center justify-between border-b-2 border-secondary/20 pb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-1.5 h-6 rounded-none" />
          <Skeleton className="w-5 h-5 rounded-none" />
          <Skeleton className="h-6 w-40 rounded-none" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-none" />
          <Skeleton className="w-8 h-8 rounded-none" />
        </div>
      </div>

      <div
        className="flex overflow-x-auto pb-4 gap-4 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-[120px] max-w-[120px] flex-shrink-0 space-y-2 snap-start group">
            <Skeleton className="aspect-[3/4] rounded-none" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-3 w-2/3 rounded-none" />
              <Skeleton className="h-3 w-1/2 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
