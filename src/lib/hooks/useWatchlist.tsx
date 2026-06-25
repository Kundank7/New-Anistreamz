'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckboxChecked, TrashCan } from '@carbon/icons-react';

export interface WatchlistItem {
  animeId: string;
  animeTitle: string;
  animeTitleEnglish?: string;
  animeImage: string;
  addedAt: number;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const loadWatchlist = useCallback(() => {
    const saved = localStorage.getItem('anime_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watchlist', e);
      }
    } else {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
    window.addEventListener('watchlist_updated', loadWatchlist);
    return () => window.removeEventListener('watchlist_updated', loadWatchlist);
  }, [loadWatchlist]);

  const updateStorage = (newList: WatchlistItem[]) => {
    localStorage.setItem('anime_watchlist', JSON.stringify(newList));
    window.dispatchEvent(new Event('watchlist_updated'));
  };

  const getLatestWatchlist = (): WatchlistItem[] => {
    const saved = localStorage.getItem('anime_watchlist');
    return saved ? JSON.parse(saved) : [];
  };

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = getLatestWatchlist();
    if (currentList.some(w => w.animeId === item.animeId)) return;
    updateStorage([{ ...item, addedAt: Date.now() }, ...currentList]);
    toast.success('Added to Watchlist', {
      description: item.animeTitle,
      icon: <div className="w-8 h-8 bg-secondary/10 border border-secondary flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(34,197,94,0.3)]"><CheckboxChecked className="w-5 h-5 text-secondary" /></div>,
    });
  }, []);

  const removeFromWatchlist = useCallback((animeId: string) => {
    const currentList = getLatestWatchlist();
    const item = currentList.find(w => w.animeId === animeId);
    updateStorage(currentList.filter(w => w.animeId !== animeId));
    if (item) {
      toast.error('Removed from Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    }
  }, []);

  const isInWatchlist = useCallback((animeId: string) => {
    return watchlist.some(w => w.animeId === animeId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = getLatestWatchlist();
    const exists = currentList.some(w => w.animeId === item.animeId);
    if (exists) {
      updateStorage(currentList.filter(w => w.animeId !== item.animeId));
      toast.error('Removed from Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    } else {
      updateStorage([{ ...item, addedAt: Date.now() }, ...currentList]);
      toast.success('Added to Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-secondary/10 border border-secondary flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(34,197,94,0.3)]"><CheckboxChecked className="w-5 h-5 text-secondary" /></div>,
      });
    }
  }, []);

  const removeMultipleFromWatchlist = useCallback((animeIds: string[]) => {
    const currentList = getLatestWatchlist();
    updateStorage(currentList.filter(w => !animeIds.includes(w.animeId)));
    toast.error(`${animeIds.length} items removed from Watchlist`, {
      icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
    });
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    removeMultipleFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
}
