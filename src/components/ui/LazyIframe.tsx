'use client';

import React, { useState } from 'react';
import { PlayFilledAlt } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface LazyIframeProps {
  src: string;
  title: string;
  poster?: string;
  overlayText?: string;
  className?: string;
  iframeClassName?: string;
  forceLoad?: boolean;
}

export function LazyIframe({ src, title, poster, overlayText, className, iframeClassName, forceLoad }: LazyIframeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded || forceLoad) {
    // Append autoplay parameter if not already present
    const autoplayUrl = src.includes('?') 
      ? (src.includes('autoplay') ? src.replace('autoplay=0', 'autoplay=1') : `${src}&autoplay=1`) 
      : `${src}?autoplay=1`;

    return (
      <iframe
        src={autoplayUrl}
        title={title}
        className={cn("w-full h-full border-none m-0 p-0", iframeClassName)}
        allowFullScreen
        scrolling="no"
        style={{ objectFit: 'contain' }}
        allow="autoplay; encrypted-media"
      />
    );
  }

  return (
    <div 
      className={cn("relative w-full h-full cursor-pointer group flex items-center justify-center bg-black", className)}
      onClick={() => setIsLoaded(true)}
    >
      {poster ? (
        <img 
          src={poster} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-300"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-secondary/10" />
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
      
      {/* Cyberpunk Play Button */}
      <div 
        className="z-10 flex items-center justify-center gap-3 bg-secondary/90 text-background px-6 py-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] group-hover:scale-105 group-hover:bg-secondary transition-all duration-300"
        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
      >
        <PlayFilledAlt className="w-5 h-5 sm:w-6 sm:h-6" />
        {overlayText && (
          <span className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] pt-0.5">
            {overlayText}
          </span>
        )}
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-30" />
    </div>
  );
}
