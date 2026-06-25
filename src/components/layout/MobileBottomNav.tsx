'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Search, Checkmark, Bookmark, Close } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Ongoing', href: '/ongoing', icon: Activity },
    { 
      name: 'Search', 
      icon: (isSearchOpen && pathname !== '/search') ? Close : Search, 
      action: () => {
        if (pathname === '/search') {
          const input = document.getElementById('search-page-input');
          if (input) {
            input.focus();
          }
        } else {
          setIsSearchOpen(!isSearchOpen);
        }
      } 
    },
    { name: 'Completed', href: '/completed', icon: Checkmark },
    { name: 'Library', href: '/library', icon: Bookmark },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-secondary/20 safe-area-pb">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = item.href ? (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) : false;
            const Icon = item.icon;

            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="relative -top-5 flex flex-col items-center justify-center transition-all group"
                >
                  <div 
                    className={cn(
                      "flex items-center justify-center w-[56px] h-[56px] shadow-lg border-2 transition-all duration-300 relative",
                      (isSearchOpen || pathname === '/search')
                        ? "bg-background text-secondary border-secondary shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                        : "bg-card border-secondary/50 text-secondary group-hover:bg-secondary/10 group-active:scale-95 group-hover:border-secondary shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                    )}
                    style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }}
                  >
                    {(isSearchOpen || pathname === '/search') && (
                      <div className="absolute inset-0 bg-secondary/20" />
                    )}
                    <Icon className="w-6 h-6 relative z-10" />
                  </div>
                  <span className={cn(
                    "absolute -bottom-4 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors",
                    (isSearchOpen || pathname === '/search') ? "text-secondary" : "text-foreground/60 group-hover:text-foreground"
                  )}>
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full transition-all group",
                  isActive ? "text-secondary" : "text-foreground/60 hover:text-foreground"
                )}
              >
                <div className="p-1 transition-all duration-300">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300", 
                      isActive 
                        ? "drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] stroke-[0.5px]" 
                        : "group-active:scale-90"
                    )} 
                  />
                </div>
                <span className="text-[10px] font-mono font-bold mt-0.5 tracking-wider uppercase">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <MobileSearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
