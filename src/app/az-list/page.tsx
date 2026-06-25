import { Metadata } from 'next';
import { AnimeService } from "@/lib/services/anime";
import Link from "next/link";
import { AnimeTitleDisplay } from '@/components/anime/AnimeTitleDisplay';
import { Catalog, FaceDissatisfied, ChevronRight } from "@carbon/icons-react";
import { Pagination } from "@/components/layout/Pagination";
import { MobileNavSelect } from "@/components/layout/MobileNavSelect";
import { getAnimeByLetter } from "@/lib/services/anilist";

export const metadata: Metadata = {
  title: 'A-Z List - Anistreamz',
  description: 'Browse all anime from A to Z.',
};

import { cookies } from 'next/headers';

export default async function AZListPage(props: { searchParams: Promise<{ letter?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentLetter = searchParams.letter || "ALL";
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 24;

  const cookieStore = await cookies();
  const titleLang = cookieStore.get('titleLang')?.value || 'jp';

  const result = await getAnimeByLetter(
	  currentLetter,
	  currentPage,
	 24
	);

  const paginatedData = result.items;
  const totalItems = result.pagination.total;
  const totalPages = result.pagination.last_page;

  const letters = ["ALL", "#", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Catalog className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">A-Z Index<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            Browse archive by starting letter
          </p>
        </div>
      </div>

      <div 
        className="mb-12 bg-card/50 border-y border-secondary/30 p-6 relative hidden md:block"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="flex flex-wrap gap-2 justify-center relative z-10">
          {letters.map((letter) => (
            <Link
              key={letter}
              href={`/az-list?letter=${encodeURIComponent(letter)}`}
              className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all ${
                currentLetter === letter
                  ? "bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : "bg-background/80 text-foreground/70 hover:bg-secondary/20 hover:text-secondary border border-secondary/20 hover:border-secondary/50"
              }`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 border-b-2 border-secondary/20 pb-4 gap-4">
        <MobileNavSelect 
          options={letters.map(l => ({ value: l, label: `Letter: ${l}` }))}
          currentValue={currentLetter}
          baseUrl="/az-list"
          paramName="letter"
        />
        <span className="text-sm font-bold text-muted-text uppercase tracking-widest">
          Showing {totalItems} titles for "{currentLetter}"
        </span>
      </div>

      {paginatedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((anime: any, idx: number) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="group p-4 bg-background/30 hover:bg-secondary/10 border-b border-border transition-all flex items-center justify-between relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 mr-4 uppercase tracking-wider transition-colors pl-2">
                  <AnimeTitleDisplay
					title={anime.title?.romaji}
					titleEnglish={anime.title?.english}
					/>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/az-list"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <FaceDissatisfied className="w-12 h-12 text-muted-text" />
          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            No entries found for this letter.
          </p>
        </div>
      )}
    </div>
  );
}
