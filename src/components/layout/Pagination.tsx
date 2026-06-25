'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, OverflowMenuHorizontal } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  // Logic to show page numbers
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  const getHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-16">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Previous */}
        <Link
          href={getHref(Math.max(1, currentPage - 1))}
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border transition-all cursor-pointer flex items-center justify-center",
            currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {rangeWithDots.map((p, idx) => {
            if (p === '...') {
              return (
                <div key={`dot-${idx}`} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-secondary/30">
                  <OverflowMenuHorizontal className="w-4 h-4" />
                </div>
              );
            }

            const pageNum = p as number;
            return (
              <Link
                key={`page-${pageNum}`}
                href={getHref(pageNum)}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-mono font-black text-sm transition-all cursor-pointer border",
                  currentPage === pageNum
                    ? "bg-secondary text-background border-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10"
                    : "bg-card border-border text-foreground/50 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50"
                )}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next */}
        <Link
          href={getHref(Math.min(totalPages, currentPage + 1))}
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border transition-all cursor-pointer flex items-center justify-center",
            currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
        <span className="w-1.5 h-1.5 bg-secondary" />
        <span>Page {currentPage} // {totalPages}</span>
      </div>
    </div>
  );
}
