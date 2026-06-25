'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContinueWatchingHome } from '../anime/ContinueWatchingHome';
import { ForYouHome } from '../anime/ForYouHome';

export function HomeClientWrapper({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchForyou = async () => {
      // Read directly from localStorage to avoid waiting for hook hydration
      const savedHistory = localStorage.getItem('anime_history');
      const savedWatchlist = localStorage.getItem('anime_watchlist');
      
      const h = savedHistory ? JSON.parse(savedHistory) : [];
      const w = savedWatchlist ? JSON.parse(savedWatchlist) : [];
      
      const slugs = new Set([...h.map((x:any) => x.animeId), ...w.map((x:any) => x.animeId)]);
      
      if (slugs.size < 5) {
        // Minimal delay for smooth visual transition if there is no fetch
        setTimeout(() => {
          if (isMounted) setIsReady(true);
        }, 150);
        return;
      }
      
      try {
        const res = await fetch('/api/anime/foryou', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: Array.from(slugs) })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setRecommendations(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch For You recommendations:', error);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };
    
    fetchForyou();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="relative min-h-[40vh]">
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-4 pt-16"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-secondary/10 border-b-secondary rounded-full animate-spin-reverse" style={{ animationDuration: '1.5s' }}></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            </div>
            <p className="text-secondary font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
              Synchronizing Data...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-16"
          >
            <ContinueWatchingHome />
            <ForYouHome recommendations={recommendations} />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
