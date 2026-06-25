'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CaretRight, StarFilled, Terminal, Warning } from '@carbon/icons-react';
import { BookmarkButton } from './BookmarkButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';
import { useViewMode } from '@/lib/providers/ViewModeProvider';

export interface AnimeCardProps {
  id: string;
  title: string;
  titleEnglish?: string;
  image: string;
  status?: string;
  rating?: string;
  episode?: string;
  type?: string;
  hideBookmark?: boolean;
  disableHover?: boolean;
  totalEpisodes?: number;
  synopsis?: string;
  genres?: string[];
  forceGrid?: boolean;
}

export function AnimeCard({ 
  id, title, titleEnglish, image, status, rating, episode, type, 
  hideBookmark = false, disableHover = false, totalEpisodes, 
  synopsis, genres, forceGrid = false
}: AnimeCardProps) {
  const isEmpty = totalEpisodes === 0;
  const [imgLoaded, setImgLoaded] = useState(false);
  const { titleLang } = useTitleLang();
  const displayTitle = titleLang === 'en' && titleEnglish ? titleEnglish : title;
  const { viewMode, isMounted } = useViewMode();

  // On Home page and Carousels, we force grid mode
  const activeMode = forceGrid || !isMounted ? 'grid' : viewMode;
  const isDetailed = activeMode === 'detailed';
  const isCompactList = activeMode === 'list';
  const isHorizontal = isDetailed || isCompactList;

  return (
    <div
      className={cn(
        "relative flex h-full animate-in fade-in zoom-in-95 duration-300",
        !disableHover && "group",
        isHorizontal 
          ? "flex-row p-3 gap-4 bg-card/50 border border-border hover:border-secondary/30" 
          : "flex-col bg-card/0 border border-border/0"
      )}
    >
      {/* Cover Image Container */}
      <Link href={`/anime/${id}`} className={cn(
        "block relative overflow-hidden flex-shrink-0",
        isHorizontal 
          ? cn("self-start aspect-[3/4] border border-border", isCompactList ? "w-20 md:w-24" : "w-24 md:w-32")
          : "w-full aspect-[3/4] border-2 border-secondary/20 group-hover:border-secondary",
        !isHorizontal && isEmpty && "border-[#EAB308]"
      )}>
        {!imgLoaded && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        )}
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            imgLoaded ? "opacity-100 group-hover:scale-110" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />

        {/* Warning Layer for Empty Episodes */}
        {isEmpty && !isHorizontal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60">
            <div className="w-16 h-16 bg-[#EAB308] flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
              <Warning className="w-8 h-8 text-black fill-current" />
            </div>
            <div className="mt-4 bg-[#EAB308] text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              NO EPISODE IN DB
            </div>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {!isEmpty && !isHorizontal && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-secondary text-background flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.6)] animate-pulse">
              <CaretRight className="fill-current w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Badges on Grid Mode */}
        {!isHorizontal && (
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 items-start">
            {rating && (
              <div className={cn(
                "flex items-center space-x-1.5 px-2 py-1 bg-background/90 border text-[10px] font-black uppercase tracking-tighter",
                isEmpty ? "border-[#EAB308]/50 text-[#EAB308]" : "border-secondary/50 text-secondary"
              )}>
                <StarFilled className="w-3 h-3 fill-current" />
                <span>{rating}</span>
              </div>
            )}
            {status && (
              <div className={cn(
                "flex items-center space-x-1.5 px-2 py-1 text-background text-[10px] font-black uppercase tracking-tighter",
                isEmpty ? "bg-[#EAB308] text-black" : "bg-secondary"
              )}>
                <Terminal className="w-3 h-3" />
                <span>{status}</span>
              </div>
            )}
          </div>
        )}

        {/* Episode Badge */}
        {episode && !isEmpty && (
          <div className={cn(
            "absolute px-3 py-1 bg-background/90 text-[10px] font-black text-foreground tracking-widest uppercase z-20",
            isHorizontal ? "top-0 left-0 border-r border-b border-border" : "bottom-3 right-3 border-r-4 border-secondary"
          )}>
            {episode}
          </div>
        )}

      </Link>

      {/* Content Area */}
      <div className={cn(
        "flex flex-col flex-grow",
        isHorizontal ? "py-1 pr-2" : "mt-4 space-y-2"
      )}>
        {/* Title */}
        <div className="flex justify-between items-start gap-4">
          <Link href={`/anime/${id}`} className="group/title min-w-0 flex-1 mb-1 sm:mb-2">
            <h3 className={cn(
              "font-black transition-colors",
              isHorizontal 
                ? "tracking-tight text-foreground group-hover/title:text-secondary text-sm md:text-base lg:text-lg line-clamp-2" 
                : "font-serif uppercase tracking-widest text-xs line-clamp-2 h-8 group-hover/title:text-secondary",
              isEmpty && (isHorizontal ? "text-[#EAB308]/70 group-hover/title:text-[#EAB308]" : "text-[#EAB308]/70 group-hover/title:text-[#EAB308]")
            )} title={displayTitle}>
              {displayTitle}
            </h3>
          </Link>

          {/* Bookmark Button */}
          {!hideBookmark && (
            <div className={cn(
              "z-40 transition-opacity",
              isHorizontal ? "opacity-100 flex-shrink-0" : "absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            )}>
              <BookmarkButton animeId={id} animeTitle={title} animeTitleEnglish={titleEnglish} animeImage={image} />
            </div>
          )}
        </div>

        {/* Detailed Mode Extra Info */}
        {isHorizontal && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {rating && (
                <div className="flex items-center space-x-1 text-secondary text-xs font-mono">
                  <StarFilled className="w-3 h-3" />
                  <span>{rating}</span>
                </div>
              )}
              {status && (
                <div className="px-2 py-0.5 bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-mono font-bold uppercase tracking-widest">
                  {status}
                </div>
              )}
              {type && (
                <div className="px-2 py-0.5 bg-foreground/5 border border-border text-muted-text text-[10px] font-mono uppercase tracking-widest">
                  {type}
                </div>
              )}
            </div>

            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 4).map(g => (
                  <span key={g} className="text-[9px] uppercase font-black tracking-widest text-muted-text bg-foreground/5 px-1.5 py-0.5 border border-border">
                    {g.trim()}
                  </span>
                ))}
                {genres.length > 4 && <span className="text-[9px] text-muted-text font-mono mt-1">+{genres.length - 4}</span>}
              </div>
            )}
          </div>
        )}

        {/* Detailed View Extras */}
        {isDetailed && !isCompactList && (
          <div className="mt-3">
            {synopsis && (
              <p className="text-xs text-muted-text mt-2 font-sans leading-relaxed line-clamp-2">
                {synopsis.replace(/<[^>]*>?/gm, '')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AnimeCardSkeleton({ forceGrid = false }: { forceGrid?: boolean }) {
  const { viewMode, isMounted } = useViewMode();
  const activeMode = forceGrid || !isMounted ? 'grid' : viewMode;
  const isDetailed = activeMode === 'detailed';
  const isCompactList = activeMode === 'list';
  const isHorizontal = isDetailed || isCompactList;

  return (
    <div className={cn(
      "relative flex",
      isHorizontal ? "flex-row p-3 gap-4 bg-card/50 border border-border" : "flex-col h-full bg-transparent"
    )}>
      <div className={cn(
        "block relative overflow-hidden bg-card flex-shrink-0",
        isHorizontal ? cn("self-start aspect-[3/4] border border-border", isCompactList ? "w-20 md:w-24" : "w-24 md:w-32") : "w-full aspect-[3/4] border-2 border-secondary/10"
      )}>
        <Skeleton className="absolute inset-0" />
        {!isHorizontal && (
          <>
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              <Skeleton className="w-14 h-[22px]" />
              <Skeleton className="w-[76px] h-[22px]" />
            </div>
            <Skeleton className="absolute bottom-3 right-3 w-[68px] h-[22px]" />
          </>
        )}
      </div>
      
      <div className={cn(
        "flex flex-col flex-1",
        isDetailed ? "py-1" : "mt-4 space-y-2"
      )}>
        <Skeleton className={cn("w-full", isDetailed ? "h-6 mb-3" : "h-8")} />
        {isDetailed && (
          <div className="space-y-3 mt-2">
            <Skeleton className="w-32 h-5" />
            <div className="flex gap-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-full h-10 mt-2" />
          </div>
        )}
      </div>
    </div>
  );
}
