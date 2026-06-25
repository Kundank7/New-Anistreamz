'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { SmartWatchButton } from './SmartWatchButton';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';
import { formatNextAiring } from '@/lib/utils';
import { AnimeTitleDisplay } from './AnimeTitleDisplay';

interface HeroCarouselProps {
  items: any[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
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

  const { titleLang } = useTitleLang();

  if (!items.length) return null;

  const current = items[currentIndex];
  const nextAiringStr = isMounted && current.next_episode && current.next_airing_at
    ? formatNextAiring(current.next_episode, current.next_airing_at, true)
    : null;

  return (
    <section 
      className="relative w-full h-[75vh] min-h-[650px] overflow-hidden group bg-background"
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
          {/* Background Image with Theme Tint */}
          <div className="absolute inset-0">
            <img
              src={current.banner || current.poster || current.image}
              alt={current.title}
              loading="eager"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className={cn("w-full h-full object-cover object-[center_25%] scale-105 transition-opacity duration-700", imgLoaded ? "opacity-30" : "opacity-0")}
            />
            {/* Cyberpunk Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            {/* Subtle Scanning Line Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center pt-20">
        {/* Top Label with Theme Accent */}
        <div className="absolute top-36 left-4 sm:left-6 lg:left-12 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-secondary shadow-[0_0_10px_var(--color-secondary)]" />
          <h2 className="text-secondary text-xs font-mono font-black uppercase tracking-[0.4em]">
            Trending <span className="text-foreground/50">//</span> Popular New Titles
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 mt-16">
          {/* Cyberpunk Poster on Left */}
          <div className="flex flex-col gap-6 items-center md:items-start">
            <motion.div
              key={`poster-${current.id}`}
              initial={{ x: -30, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative shrink-0 w-[200px] md:w-[280px] aspect-[2/3] border-4 border-background shadow-2xl overflow-hidden"
            >
              <img
                src={current.poster || current.image}
                alt={current.title}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110"
              />
              {/* Internal border like in /anime */}
              <div className="absolute inset-0 border-2 border-secondary/20 pointer-events-none" />
              
              {/* Rating Badge */}
              {current.score && (
                <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 px-2.5 py-1.5 bg-background/90 backdrop-blur-md border border-secondary/50 text-secondary text-[12px] font-black uppercase tracking-tighter z-20">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{current.score}</span>
                </div>
              )}
            </motion.div>
            
            {/* Author Name with Mono Styling */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-text font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <span className="text-secondary">#</span> {current.studios || 'PROD_UNKNOWN'}
            </motion.div>
          </div>

          {/* Content on Right */}
          <motion.div 
            key={`content-${current.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 text-center md:text-left pt-2"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black leading-tight tracking-tighter text-foreground mb-2 uppercase line-clamp-2">
              <AnimeTitleDisplay title={current.title} titleEnglish={current.title_english} />
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-secondary/50 shrink-0" />
              <span className="text-secondary/80 text-[11px] font-mono font-black uppercase tracking-[0.35em]">
                {current.status === 'Ongoing'
                  ? `Episode ${current.latest_episode || '?'}`
                  : `${current.episodes_count || '?'} Episodes`}
              </span>
              {nextAiringStr && (
                <>
                  <div className="w-2 h-[1px] bg-secondary/30 shrink-0" />
                  <span className="text-secondary/60 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
                    {nextAiringStr}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
              {current.genres?.slice(0, 3).map((genre: string, idx: number) => (
                <Link 
                  key={idx}
                  href={`/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1 border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-widest skew-x-[-15deg] hover:bg-secondary/10 transition-all"
                >
                  <span className="inline-block skew-x-[15deg]">{genre}</span>
                </Link>
              ))}
              {current.genres?.length > 3 && (
                <span className="text-[10px] text-muted-text font-mono font-bold">
                  +{current.genres.length - 3}
                </span>
              )}
            </div>

            <p className="text-muted-text text-[14px] md:text-[15px] leading-relaxed w-full mb-10 font-medium tracking-wide line-clamp-3">
              {current.synopsis}
            </p>

            {/* Cyberpunk CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <SmartWatchButton 
                animeId={current.id} 
                animeTitle={current.title} 
                animeImage={current.poster || current.image} 
                className="h-12 px-8 text-sm uppercase tracking-[0.2em] font-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:neon-glow"
              />
              <Link 
                href={`/anime/${current.id}`} 
                className="h-12 px-8 flex items-center justify-center border-2 border-secondary/30 text-secondary hover:border-secondary hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] font-black uppercase tracking-[0.2em] text-sm transition-all duration-300"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                Details
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Navigation Controls with Theme Accents */}
        <div className="absolute bottom-16 right-4 sm:right-6 lg:right-12 flex items-center gap-10">
          <div className="flex flex-col items-end gap-1">
            <span className="text-secondary/50 font-mono text-[10px] font-black uppercase tracking-[0.4em]">Index_</span>
            <div className="text-foreground font-serif font-black text-2xl tracking-tighter flex items-baseline gap-2">
              <span className="text-secondary text-sm">#</span>
              <span>{(currentIndex + 1).toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 flex items-center justify-center bg-card border border-secondary/20 text-secondary hover:bg-secondary hover:text-background transition-all cursor-pointer shadow-lg group"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 flex items-center justify-center bg-card border border-secondary/20 text-secondary hover:bg-secondary hover:text-background transition-all cursor-pointer shadow-lg group"
            >
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <section className="relative w-full h-[75vh] min-h-[650px] overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center pt-20">
        <div className="absolute top-36 left-4 sm:left-6 lg:left-12 flex items-center gap-3">
          <Skeleton className="w-1.5 h-6 rounded-none" />
          <Skeleton className="h-4 w-64 rounded-none" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 mt-16">
          <div className="flex flex-col gap-6 items-center md:items-start">
            <Skeleton className="w-[200px] md:w-[280px] aspect-[2/3] border-4 border-background shadow-2xl rounded-none" />
            <Skeleton className="h-3 w-32 rounded-none" />
          </div>

          <div className="flex-1 text-center md:text-left pt-2 space-y-4">
            <Skeleton className="h-12 w-full max-w-lg rounded-none" />
            <Skeleton className="h-12 w-3/4 max-w-md rounded-none" />
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-[1px] rounded-none" />
              <Skeleton className="h-4 w-24 rounded-none" />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
              <Skeleton className="h-7 w-20 rounded-none" />
              <Skeleton className="h-7 w-24 rounded-none" />
              <Skeleton className="h-7 w-16 rounded-none" />
            </div>
            <div className="space-y-3 mb-10">
              <Skeleton className="h-4 w-full max-w-xl rounded-none" />
              <Skeleton className="h-4 w-full max-w-lg rounded-none" />
              <Skeleton className="h-4 w-2/3 max-w-md rounded-none" />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <Skeleton className="h-12 w-44 rounded-none" />
              <Skeleton className="h-12 w-32 rounded-none" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 right-4 sm:right-6 lg:right-12 flex items-center gap-10">
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-3 w-16 rounded-none" />
            <Skeleton className="h-6 w-12 rounded-none" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-none" />
            <Skeleton className="w-12 h-12 rounded-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
