'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TrashCan } from '@carbon/icons-react';

export interface WatchHistory {
  animeId: string;
  animeTitle: string;
  animeTitleEnglish?: string;
  animeImage: string;
  lastEpisodeId: string;
  lastEpisodeTitle: string;
  updatedAt: number;
}

export function useHistory() {
  const [history, setHistory] = useState<WatchHistory[]>([]);

  const loadHistory = useCallback(() => {
    const saved = localStorage.getItem('anime_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    } else {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    window.addEventListener('history_updated', loadHistory);
    return () => window.removeEventListener('history_updated', loadHistory);
  }, [loadHistory]);

  const updateStorage = (newList: WatchHistory[]) => {
    localStorage.setItem('anime_history', JSON.stringify(newList));
    window.dispatchEvent(new Event('history_updated'));
  };

  const getLatestHistory = (): WatchHistory[] => {
    const saved = localStorage.getItem('anime_history');
    return saved ? JSON.parse(saved) : [];
  };

  const saveToHistory = useCallback((item: Omit<WatchHistory, 'updatedAt'>) => {
    const currentList = getLatestHistory();
    const newHistory = [...currentList];
    const index = newHistory.findIndex((h) => h.animeId === item.animeId);
    
    if (index !== -1) {
      newHistory[index] = { ...item, updatedAt: Date.now() };
    } else {
      newHistory.unshift({ ...item, updatedAt: Date.now() });
    }

    // Keep only last 50 items
    const limitedHistory = newHistory
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 50);

    updateStorage(limitedHistory);
  }, []);

  const removeFromHistory = useCallback((animeId: string) => {
    const currentList = getLatestHistory();
    const item = currentList.find(h => h.animeId === animeId);
    updateStorage(currentList.filter((h) => h.animeId !== animeId));
    if (item) {
      toast.error('Removed from History', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    }
  }, []);

  const removeMultipleFromHistory = useCallback((animeIds: string[]) => {
    const currentList = getLatestHistory();
    updateStorage(currentList.filter((h) => !animeIds.includes(h.animeId)));
    toast.error(`${animeIds.length} items removed from History`, {
      icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
    });
  }, []);

  return { history, saveToHistory, removeFromHistory, removeMultipleFromHistory };
}
