'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Grid, List, ChevronRight } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface GenreViewProps {
  genres: any[];
}

import { Tooltip } from '@/components/ui/Tooltip';

export function GenreView({ genres }: GenreViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-8">
        <div className="relative inline-flex items-center gap-1 p-1 shrink-0">
          <div 
            className="absolute inset-0 w-full h-full bg-card/50 border border-secondary/30 pointer-events-none" 
            style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} 
          />
          <Tooltip content="Grid View" position="bottom" className="!text-[10px]" wrapperClassName="z-10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' 
                  ? "bg-secondary/20 text-secondary"
                  : "text-muted-text hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="List View" position="bottom" className="!text-[10px]" wrapperClassName="z-10">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' 
                  ? "bg-secondary/20 text-secondary"
                  : "text-muted-text hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "transition-all duration-300",
        viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          : "flex flex-col gap-3"
      )}>
        {genres.map((genre) => (
          <Link
            key={genre.genreId}
            href={`/genre/${genre.genreId}`}
            className={cn(
              "group relative flex items-center transition-all duration-300 overflow-hidden",
              viewMode === 'grid'
                ? "h-24 bg-card/40 border border-secondary/10 hover:border-secondary/40 justify-center hover:bg-secondary/10"
                : "p-4 bg-background/30 border-b border-border hover:bg-secondary/10"
            )}
            style={{
              clipPath: viewMode === 'grid' 
                ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                : 'none'
            }}
          >
            {/* Hover bar for grid */}
            <div className={cn(
              "absolute inset-0 bg-secondary/10 transition-transform duration-300 pointer-events-none",
              viewMode === 'grid' ? "translate-y-full group-hover:translate-y-0" : "hidden"
            )} />
            
            {/* Hover bar for list */}
            <div className={cn(
              "absolute inset-y-0 left-0 w-1 bg-secondary transition-transform origin-top duration-300 pointer-events-none",
              viewMode === 'list' ? "scale-y-0 group-hover:scale-y-100" : "hidden"
            )} />

            {/* Title & Count Wrapper */}
            <div className={cn(
              "relative z-10 flex w-full",
              viewMode === 'grid' 
                ? "flex-col items-center justify-center px-2" 
                : "items-center justify-between pl-2"
            )}>
              <span className={cn(
                "font-black uppercase tracking-widest group-hover:text-secondary transition-all duration-300",
                viewMode === 'grid' ? "text-sm text-center" : "text-sm sm:text-base"
              )}>
                {genre.title}
              </span>
              
              <div className={cn(
                "flex items-center transition-all duration-300",
                viewMode === 'grid' ? "mt-1" : "gap-4"
              )}>
                <span className="text-[11px] font-mono font-bold text-secondary/80 group-hover:text-secondary transition-colors">
                  [{genre.count}]
                </span>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  viewMode === 'list' ? "w-5 opacity-100" : "w-0 opacity-0"
                )}>
                  <ChevronRight className="w-5 h-5 text-muted-text group-hover:text-secondary transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
