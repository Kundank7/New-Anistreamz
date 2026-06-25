'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CaretRight, SkipForwardFilled } from '@carbon/icons-react';
import { useHistory, WatchHistory } from '@/lib/hooks/useHistory';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

export function ContinueWatching({ 
  animeId, 
  animeTitle, 
  animeTitleEnglish,
  animeImage,
  source,
  episodes = []
}: { 
  animeId: string; 
  animeTitle: string; 
  animeTitleEnglish?: string;
  animeImage: string;
  source: string;
  episodes?: any[];
}) {
  const { titleLang } = useTitleLang();
  const displayTitle = titleLang === 'en' && animeTitleEnglish ? animeTitleEnglish : animeTitle;
  const { history } = useHistory();
  const [lastWatched, setLastWatched] = useState<WatchHistory | null>(null);
  const [nextEp, setNextEp] = useState<any>(null);

  useEffect(() => {
    const saved = history.find(h => h.animeId === animeId);
    if (saved) {
      setLastWatched(saved);
      
      // Find next episode logic
      if (episodes.length > 0) {
        // Find index of current episode (API usually descending)
        const currentIndex = episodes.findIndex(ep => (ep.episodeId || ep.id) === saved.lastEpisodeId);
        if (currentIndex !== -1 && currentIndex > 0) {
          // In descending list, next episode is the one BEFORE (currentIndex - 1)
          setNextEp(episodes[currentIndex - 1]);
        }
      }
    }
  }, [history, animeId, episodes]);

  const watchUrl = (id: string) => `/watch/${id}`;

  if (!lastWatched) {
    if (episodes.length === 0) return null;
    
    // Start watching from the first episode (usually the last in the array)
    const firstEp = episodes[episodes.length - 1];
    const firstEpId = firstEp.episodeId || firstEp.id;
    const firstEpNum = firstEp.eps || 1;

    return (
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <Link
          href={`/watch/${animeId}/sub/1`}
          className="btn-primary w-full flex items-center justify-center space-x-2 group py-4"
        >
          <CaretRight className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          <span className="text-lg font-black uppercase tracking-tighter">Start Watching</span>
        </Link>
      </div>
    );
  }

  // Extract episode number precisely from the stored title
  const epNumber = lastWatched.lastEpisodeTitle.match(/Episode\s*(\d+)/i)?.[1] || 
                   lastWatched.lastEpisodeTitle.match(/(\d+)/)?.[0] || '';

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <Link
        href={watchUrl(lastWatched.lastEpisodeId)}
        className="btn-primary w-full flex items-center justify-center space-x-2 group py-4"
      >
        <CaretRight className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
        <span className="text-lg font-black uppercase tracking-tighter">Continue Episode {epNumber}</span>
      </Link>
      
      {nextEp && (
        <Link
          href={watchUrl(nextEp.episodeId || nextEp.id)}
          className="btn-accent w-full flex items-center justify-center space-x-2 group"
        >
          <SkipForwardFilled className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
          <span className="text-[11px]">Next: Episode {nextEp.eps || (episodes.length - episodes.indexOf(nextEp))}</span>
        </Link>
      )}

      <p className="text-[9px] text-center font-bold text-secondary uppercase tracking-[0.2em] opacity-40">
        Saved to your device
      </p>
    </div>
  );
}

export function ContinueWatchingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full h-[60px] rounded-none" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }} />
      <Skeleton className="w-full h-12 rounded-none" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }} />
      <div className="flex justify-center">
        <Skeleton className="h-3 w-40 rounded-none" />
      </div>
    </div>
  );
}
