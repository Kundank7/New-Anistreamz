import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full border-t border-secondary/10 bg-background shadow-[0_-4px_30px_rgba(34,197,94,0.03)] relative overflow-hidden mt-auto">
      {/* A-Z Navigation Bar */}
      <div className="border-b border-secondary/10 bg-card/50 py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-1.5 lg:gap-2">
            {["ALL", "#", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((letter) => (
              <Link
                key={letter}
                href={`/az-list?letter=${encodeURIComponent(letter)}`}
                className="text-[10px] md:text-xs font-black hover:text-secondary transition-colors text-muted-text w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border border-transparent hover:border-secondary/30"
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pb-12 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8">
          <Link href="/" className="relative w-60 h-12 block">
            <Image
              src="/Anistreamz_logo.png"
              alt="Anistreamz"
              fill
              sizes="240px"
              className="object-contain opacity-90 hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.1)]"
              priority
            />
          </Link>
          
          <div className="flex items-center justify-center space-x-8 md:space-x-12">
            <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-secondary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/dmca" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-secondary transition-colors">
              DMCA
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-3 pt-8 w-full max-w-md relative">
            {/* Subtle Cyberpunk Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-secondary/50" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }} />
            
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Anistreamz
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
