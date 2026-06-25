'use client';

import React, { useState } from 'react';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Renew, ChevronDown } from '@carbon/icons-react';
import { ViewGridWrapper } from '@/components/layout/ViewGridWrapper';

interface GenreAnimeListProps {
  initialAnime: any[];
  slug: string;
  initialHasMore: boolean;
}

export function GenreAnimeList({ initialAnime, slug, initialHasMore }: GenreAnimeListProps) {
  const [animeList, setAnimeList] = useState<any[]>(initialAnime);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/anime/by-genre?slug=${slug}&page=${nextPage}&limit=24`);
      const data = await res.json();
      const newAnime = data.items || [];
      
      if (newAnime.length > 0) {
        setAnimeList((prev) => [...prev, ...newAnime]);
        setPage(nextPage);
        setHasMore(data.pagination.current_page < data.pagination.last_page);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more anime:', error);
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <ViewGridWrapper>
        {animeList.map((anime: any, index: number) => (
          <AnimeCard
            key={`${anime.slug}-${index}`}
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

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group flex items-center justify-center space-x-2 px-8 py-4 bg-background border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all w-full max-w-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
          >
            {loading ? (
              <>
                <Renew className="w-5 h-5 text-secondary animate-spin" />
                <span className="text-secondary">Scanning Data...</span>
              </>
            ) : (
              <>
                <span className="text-foreground group-hover:text-secondary transition-colors">Load More</span>
                <ChevronDown className="w-5 h-5 text-secondary group-hover:translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
