'use client';

import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Pagination } from '@/components/layout/Pagination';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, FaceDissatisfied, Filter } from '@carbon/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { ViewGridWrapper } from '@/components/layout/ViewGridWrapper';
import { ViewToggle } from '@/components/layout/ViewToggle';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';
  const genresParam = searchParams.get('genres') || '';
  const genreMode = searchParams.get('genreMode') || 'any';
  const status = searchParams.get('status') || 'All';
  const type = searchParams.get('type') || 'All';
  const order = searchParams.get('order') || 'popularity';
  const year = searchParams.get('year') || 'All';
  const season = searchParams.get('season') || 'All';
  const source = searchParams.get('source') || 'All';
  const rating = searchParams.get('rating') || 'All';
  const studiosParam = searchParams.get('studios') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const selectedGenres = genresParam ? genresParam.split(',').filter(Boolean) : [];
  const selectedStudios = studiosParam ? studiosParam.split(',').filter(Boolean) : [];

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false); // Default to false for mobile
  const { titleLang } = useTitleLang();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setShowFilters(true);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function doSearch() {
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
        if (genreMode !== 'any') params.set('genreMode', genreMode);
        if (status !== 'All') params.set('status', status);
        if (type !== 'All') params.set('type', type);
        if (order !== 'popularity') params.set('order', order);
        if (year !== 'All') params.set('year', year);
        if (season !== 'All') params.set('season', season);
        if (source !== 'All') params.set('source', source);
        if (rating !== 'All') params.set('rating', rating);
        if (selectedStudios.length > 0) params.set('studios', selectedStudios.join(','));
        params.set('page', page.toString());
        params.set('titleLang', titleLang);

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setResults(data.items || []);
        setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    }

    setLoading(true); // Trigger loading state instantly
    timeoutId = setTimeout(() => {
      doSearch();
    }, 500); // Debounce API call by 500ms

    return () => clearTimeout(timeoutId);
  }, [query, genresParam, genreMode, status, type, order, year, season, source, rating, studiosParam, page, titleLang]);

  const updateFilters = useCallback((updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'All' || value === 'ALL' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    if (!updates.page) {
      params.set('page', '1');
    }
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <SearchIcon className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Advanced Search<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            {query ? <>Results for <span className="text-secondary ml-1">"{query}"</span></> : 'Refine your search parameters below'}
          </p>
        </div>
      </div>

      <div className="sticky top-[76px] md:relative md:top-0 z-[45] bg-background/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 flex items-stretch gap-3 mb-6">
        <div className="relative flex-1">
          <DebouncedSearchInput
            initialValue={query}
            onSearch={(q) => updateFilters({ q })}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 md:px-5 border-2 text-sm font-black uppercase tracking-wider transition-all shrink-0 aspect-square md:aspect-auto",
            showFilters
              ? "bg-secondary text-background border-secondary"
              : "bg-card/50 text-muted-text border-secondary/20 hover:border-secondary/50"
          )}
        >
          <Filter className="w-4 h-4 shrink-0" />
          <span className="relative hidden md:grid">
            <span className="invisible col-start-1 row-start-1">Show Filters</span>
            <span className="col-start-1 row-start-1">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </span>
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            key="filters"
            className="max-md:fixed max-md:inset-0 max-md:z-50 max-md:bg-background/95 max-md:backdrop-blur-xl"
          >
          <div className="space-y-4 p-4 md:bg-card/20 md:border md:border-secondary/10 max-md:p-6 max-md:pb-[260px] max-md:overflow-y-auto max-md:h-[100dvh]">
            
            {/* Mobile Close Button */}
            <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-secondary/20">
              <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 transition-colors">
                <div className="relative w-5 h-5">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
                </div>
              </button>
            </div>

          </div>
            {/* Mobile Apply Button */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 z-[60] bg-background border-t border-secondary/20 p-4 px-6 pb-[84px]">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-4 bg-secondary text-background font-black uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
              >
                Apply Filters & Close
              </button>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-secondary" />
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
              Found <span className="text-secondary">{pagination.total}</span> Results
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold text-muted-text uppercase tracking-widest hidden sm:block">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <ViewToggle />
          </div>
        </div>

        {loading ? (
          <ViewGridWrapper>
            {Array.from({ length: 24 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </ViewGridWrapper>
        ) : results.length > 0 ? (
          <>
            <ViewGridWrapper>
              {results.map((anime: any) => (
                <AnimeCard
                  key={anime.slug}
                  id={anime.slug}
                  title={anime.title}
                  titleEnglish={anime.title_english}
                  image={anime.poster}
                  rating={String(anime.score)}
                  status={anime.status}
                  episode={anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`}
                  totalEpisodes={anime.actual_episodes_count}
                  synopsis={anime.synopsis}
                  genres={anime.genres ? anime.genres.split(',') : []}
                />
              ))}
            </ViewGridWrapper>
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              baseUrl="/search"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center bg-card/10 border border-dashed border-secondary/20">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border group">
              <FaceDissatisfied className="w-10 h-10 text-muted-text group-hover:text-secondary transition-colors" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black uppercase tracking-tighter">Negative Identification</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-text max-w-xs mx-auto">No anime signatures match your current parameters. Reset protocols and try again.</p>
              <button
                onClick={() => router.push('/search')}
                className="mt-4 px-6 py-2 bg-secondary text-background text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
              >
                Reset Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DebouncedSearchInput({ initialValue, onSearch }: { initialValue: string; onSearch: (q: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(newVal);
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch('');
  };

  return (
    <div className="relative w-full group">
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-7 bg-secondary/20 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-secondary/30"
        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
      >
        <SearchIcon className="text-secondary w-3.5 h-3.5" />
      </div>
      <input
        id="search-page-input"
        type="text"
        placeholder="Search by title..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-card/50 border-2 border-secondary/20 focus:border-secondary/50 focus:ring-0 text-foreground py-4 pl-16 pr-12 font-mono text-sm tracking-wider outline-none transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-danger/10 border border-danger/30 hover:bg-danger/20 text-danger flex items-center justify-center transition-all"
          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
          aria-label="Clear search"
        >
          <div className="relative w-4 h-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ViewGridWrapper>
          {Array.from({ length: 24 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </ViewGridWrapper>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}