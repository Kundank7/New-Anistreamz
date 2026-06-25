'use client';

import React from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import { AnimeCard, AnimeCardSkeleton } from './AnimeCard';
import { ChevronRight } from '@carbon/icons-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export function ContinueWatchingHome() {
  const { history } = useHistory();

  // If no history, don't show the section
  if (!history || history.length === 0) return null;

  // Manual limit of 6 items for 1 row on desktop
  const displayItems = history.slice(0, 6);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-secondary font-mono font-black text-lg leading-none">{'//'}</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black uppercase tracking-tighter">
            <span className="sm:hidden">Continue</span>
            <span className="hidden sm:inline">Continue Watching</span>
          </h2>
        </div>
        <Link
          href="/library?tab=history"
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest bg-card/30 border border-muted-text/20 hover:border-secondary/30 transition-colors text-muted-text hover:text-foreground"
        >
          View History <ChevronRight className="w-3.5 h-3.5 text-secondary" />
        </Link>
      </div>

      <div className="mobile-snap-scroll gap-4 md:gap-6">
        {displayItems.map((item) => {
          // Extract episode number if possible from title for cleaner display
          const epMatch = item.lastEpisodeTitle.match(/Episode\s+(\d+)/i);
          const displayEp = epMatch ? `Episode ${epMatch[1]}` : item.lastEpisodeTitle;

          return (
            <AnimeCard
              key={item.animeId}
              id={item.animeId}
              title={item.animeTitle}
              titleEnglish={item.animeTitleEnglish}
              image={item.animeImage}
              episode={displayEp}
              hideBookmark
              forceGrid={true}
            />
          );
        })}
      </div>
    </section>
  );
}

export function ContinueWatchingHomeSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-none" />
          <Skeleton className="h-6 w-56 rounded-none" />
        </div>
        <Skeleton className="h-4 w-28 rounded-none" />
      </div>
      <div className="mobile-snap-scroll gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <AnimeCardSkeleton key={i} forceGrid={true} />
        ))}
      </div>
    </section>
  );
}
