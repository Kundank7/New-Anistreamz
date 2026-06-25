'use client';

import { useState, useEffect, useCallback } from 'react';

interface WatchedEpisodesStore {
  [animeSlug: string]: {
    [episodeSlug: string]: number;
  };
}

export function useWatchedEpisodes() {
  const [watched, setWatched] = useState<WatchedEpisodesStore>({});

  const load = useCallback(() => {
    try {
      const saved = localStorage.getItem('anime_watched_episodes');
      if (saved) setWatched(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('watched_updated', load);
    return () => window.removeEventListener('watched_updated', load);
  }, [load]);

  const markAsWatched = useCallback((animeSlug: string, episodeSlug: string) => {
    setWatched(prev => {
      const next = { ...prev };
      if (!next[animeSlug]) next[animeSlug] = {};
      next[animeSlug][episodeSlug] = Date.now();
      localStorage.setItem('anime_watched_episodes', JSON.stringify(next));
      window.dispatchEvent(new Event('watched_updated'));
      return next;
    });
  }, []);

  const isWatched = useCallback((animeSlug: string, episodeSlug: string): boolean => {
    return !!watched[animeSlug]?.[episodeSlug];
  }, [watched]);

  const getWatchedEpisodes = useCallback((animeSlug: string): string[] => {
    return watched[animeSlug] ? Object.keys(watched[animeSlug]) : [];
  }, [watched]);

  const getWatchedCount = useCallback((animeSlug: string): number => {
    return watched[animeSlug] ? Object.keys(watched[animeSlug]).length : 0;
  }, [watched]);

  const resetAnime = useCallback((animeSlug: string) => {
    setWatched(prev => {
      const next = { ...prev };
      delete next[animeSlug];
      localStorage.setItem('anime_watched_episodes', JSON.stringify(next));
      window.dispatchEvent(new Event('watched_updated'));
      return next;
    });
  }, []);

  return { watched, markAsWatched, isWatched, getWatchedEpisodes, getWatchedCount, resetAnime };
}
