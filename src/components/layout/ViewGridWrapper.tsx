'use client';
import { useViewMode } from '@/lib/providers/ViewModeProvider';
import { cn } from '@/lib/utils';
import React from 'react';

export function ViewGridWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  const { viewMode, isMounted } = useViewMode();
  
  // Default to grid to avoid hydration mismatch layout shift before mount
  if (!isMounted) {
    return <div className={cn("anime-grid", className)} data-view="grid">{children}</div>;
  }

  return (
    <div className={cn("anime-grid", className)} data-view={viewMode}>
      {children}
    </div>
  );
}
