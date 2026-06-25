'use client';

import React, { useEffect, useState } from 'react';
import { LiveSearch } from './LiveSearch';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const [currentQuery, setCurrentQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (!currentQuery.trim()) {
        onClose();
      } else {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[50] md:hidden bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackgroundClick}
    >
      <div className="flex flex-col justify-end h-full w-full max-w-[1440px] mx-auto px-4 pb-[120px] pointer-events-none">
        {/* Search Content */}
        <div className="w-full pointer-events-auto">
          <LiveSearch 
            dropdownPosition="top" 
            onQueryChange={setCurrentQuery}
          />
        </div>
      </div>
    </div>
  );
}
