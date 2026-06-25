'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { SmartWatchButton } from './SmartWatchButton';
import { formatNextAiring } from '@/lib/utils';
import { AnimeTitleDisplay } from './AnimeTitleDisplay';

interface HeroCarouselMobileProps {
  items: any[];
}

export function HeroCarouselMobile({ items }: HeroCarouselMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setImgLoaded(false);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setImgLoaded(false);
  }, [items.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (!items.length) return null;

  const current = items[currentIndex];
  const nextAiringStr = isMounted && current.next_episode && current.next_airing_at
    ? formatNextAiring(current.next_episode, current.next_airing_at, true)
    : null;

  return (
    <section
      className="relative w-full min-h-[300px] flex flex-col overflow-hidden group bg-background"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0">
            <img
              src={current.banner || current.poster || current.image}
              alt={current.title}
              loading="eager"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className={cn("w-full h-full object-cover object-[center_25%] scale-105 transition-opacity duration-700", imgLoaded ? "opacity-40" : "opacity-0")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-10" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full flex-1 flex flex-col max-w-[1440px] mx-auto px-4 sm:px-6 pt-24 pb-4">
        {/* Trending - statis, tidak ikut animasi */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-0.5 h-3.5 bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />
          <h2 className="text-secondary/80 text-[8px] font-mono font-black uppercase tracking-[0.35em]">
            Trending <span className="text-foreground/40">//</span> Popular
          </h2>
        </div>

        {/* Content + Poster row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-auto">
          {/* Poster - hanya muncul di sm+ */}
          <motion.div
            key={`poster-${current.id}`}
            initial={{ x: -30, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:block relative shrink-0 w-[90px] md:w-[130px] aspect-[2/3] border-4 border-background shadow-2xl overflow-hidden"
          >
            <img
              src={current.poster || current.image}
              alt={current.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-secondary/20 pointer-events-none" />
          </motion.div>

          {/* Content yang berubah tiap slide - pb-1 offsets the 4px border of the poster */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 pb-1">
            <motion.h1
              key={`title-${current.id}`}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[15px] sm:text-lg md:text-xl font-serif font-black leading-tight tracking-tighter text-foreground uppercase line-clamp-2 sm:max-w-[85%] md:max-w-[75%]"
            >
              <AnimeTitleDisplay title={current.title} titleEnglish={current.title_english} />
            </motion.h1>

            <motion.div
              key={`info-${current.id}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="text-secondary/80 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-[0.25em]">
                {current.status === 'Ongoing'
                  ? `EP ${current.latest_episode || '?'}`
                  : `${current.episodes_count || '?'} EP`}
              </span>
              {current.score && (
                <>
              <span className="text-secondary/40 text-[8px] sm:text-[9px]">/</span>
              <span className="text-secondary/70 text-[9px] sm:text-[10px] font-mono font-bold">{current.score}</span>
                </>
              )}
              {nextAiringStr && (
                <>
                  <span className="text-secondary/30 text-[8px] mx-0.5">•</span>
                  <span className="text-secondary/50 text-[7px] font-mono font-bold uppercase tracking-[0.2em]">
                    {nextAiringStr}
                  </span>
                </>
              )}
            </motion.div>

            {current.genres?.length > 0 && (
              <motion.div
                key={`genres-${current.id}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-1.5"
              >
                {current.genres.slice(0, 2).map((genre: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[7px] sm:text-[8px] font-mono font-black uppercase tracking-[0.25em] text-secondary/50 border border-secondary/20 px-1.5 py-0.5"
                  >
                    {genre}
                  </span>
                ))}
                {current.genres.length > 2 && (
                  <span className="text-[7px] sm:text-[8px] text-muted-text font-mono font-bold ml-0.5">
                    +{current.genres.length - 2}
                  </span>
                )}
              </motion.div>
            )}

            {current.synopsis && (
              <div className="hidden md:block mt-1 mb-1 max-w-[90%]">
                <motion.p
                  key={`synopsis-${current.id}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.32 }}
                  className="text-[10px] md:text-[11px] text-foreground/60 leading-relaxed line-clamp-2"
                >
                  {current.synopsis}
                </motion.p>
              </div>
            )}

            <motion.div
              key={`cta-${current.id}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex items-center gap-2"
            >
              <SmartWatchButton
                animeId={current.id}
                animeTitle={current.title}
                animeImage={current.poster || current.image}
                label="Watch"
                iconSize={4}
              className="h-7 sm:h-8 px-4 py-0 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black shadow-[0_0_12px_rgba(34,197,94,0.25)] hover:neon-glow"
            />
            <Link
              href={`/anime/${current.id}`}
              className="h-7 sm:h-8 px-4 flex items-center justify-center border-2 border-secondary/30 text-secondary/80 hover:border-secondary hover:text-secondary font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px] transition-all duration-300"
                style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 70%, 92% 100%, 0 100%, 0 30%)' }}
              >
                Details
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end gap-4 pt-5">
          <div className="flex items-baseline gap-1">
            <span className="text-secondary font-serif font-black text-sm tracking-tighter">#</span>
            <span className="text-foreground font-serif font-black text-sm tracking-tighter">{(currentIndex + 1).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="w-6 h-6 flex items-center justify-center bg-background/60 border border-secondary/20 text-secondary/70 hover:bg-secondary hover:text-background hover:border-secondary transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={nextSlide}
              className="w-6 h-6 flex items-center justify-center bg-background/60 border border-secondary/20 text-secondary/70 hover:bg-secondary hover:text-background hover:border-secondary transition-all cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselMobileSkeleton() {
  return (
    <section className="relative w-full min-h-[300px] flex flex-col overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col max-w-[1440px] mx-auto px-4 sm:px-6 pt-24 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-0.5 h-3.5 rounded-none" />
          <Skeleton className="h-2.5 w-32 rounded-none" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-auto">
          <Skeleton className="hidden sm:block shrink-0 w-[90px] md:w-[130px] aspect-[2/3] border-4 border-background shadow-2xl rounded-none" />

          <div className="flex flex-col gap-1.5 flex-1 min-w-0 pb-1">
            <Skeleton className="h-4 md:h-5 w-3/4 max-w-[200px] rounded-none" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-14 rounded-none" />
              <Skeleton className="h-3 w-6 rounded-none" />
            </div>

            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-16 rounded-none" />
              <Skeleton className="h-3.5 w-14 rounded-none" />
            </div>

            <div className="hidden md:flex flex-col gap-1 mt-1 mb-1">
              <Skeleton className="h-2 w-[90%] rounded-none" />
              <Skeleton className="h-2 w-[80%] rounded-none" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 rounded-none" />
              <Skeleton className="h-7 w-16 rounded-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-5">
          <div className="flex items-baseline gap-1">
            <Skeleton className="h-4 w-3 rounded-none" />
            <Skeleton className="h-4 w-7 rounded-none" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="w-6 h-6 rounded-none" />
            <Skeleton className="w-6 h-6 rounded-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
