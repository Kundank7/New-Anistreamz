'use client';

import React from 'react';
import { useViewMode } from '@/lib/providers/ViewModeProvider';
import { Grid, ListBoxes, ListBulleted } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export function ViewToggle() {
  const { viewMode, changeViewMode, isMounted } = useViewMode();

  if (!isMounted) return null;

  return (
    <div className="relative inline-flex items-center gap-1 p-1 shrink-0">
      {/* Background with clip-path */}
      <div 
        className="absolute inset-0 w-full h-full bg-card/50 border border-secondary/30 pointer-events-none" 
        style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} 
      />
      
      <Tooltip content="Grid View" position="bottom" className="!text-[10px]" wrapperClassName="z-10">
        <button
          onClick={() => changeViewMode('grid')}
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
      <Tooltip content="Detailed View" position="bottom" className="!text-[10px]" wrapperClassName="z-10">
        <button
          onClick={() => changeViewMode('detailed')}
          className={cn(
            "p-2 transition-colors",
            viewMode === 'detailed' 
              ? "bg-secondary/20 text-secondary"
              : "text-muted-text hover:text-foreground hover:bg-foreground/5"
          )}
        >
          <ListBoxes className="w-5 h-5" />
        </button>
      </Tooltip>
      <Tooltip content="Compact List" position="bottom" className="!text-[10px]" wrapperClassName="z-10">
        <button
          onClick={() => changeViewMode('list')}
          className={cn(
            "p-2 transition-colors",
            viewMode === 'list' 
              ? "bg-secondary/20 text-secondary"
              : "text-muted-text hover:text-foreground hover:bg-foreground/5"
          )}
        >
          <ListBulleted className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  );
}
