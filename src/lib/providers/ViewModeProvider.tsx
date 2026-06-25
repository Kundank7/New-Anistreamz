'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'grid' | 'detailed' | 'list';

interface ViewModeContextType {
  viewMode: ViewMode;
  changeViewMode: (mode: ViewMode) => void;
  isMounted: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('anime_view_mode') as ViewMode;
    if (saved === 'grid' || saved === 'detailed' || saved === 'list') {
      setViewMode(saved);
    }
    setIsMounted(true);
  }, []);

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('anime_view_mode', mode);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, changeViewMode, isMounted }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
