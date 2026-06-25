import React from 'react';
import { Tag, FaceDissatisfied } from '@carbon/icons-react';
import { GenreView } from './GenreView';

export const metadata = {
  title: 'Browse by Genre - Anistreamz',
  description: 'Explore anime by genre.',
};

export default async function GenrePage() {
  const genres = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Ecchi',
    'Fantasy',
    'Horror',
    'Mahou Shoujo',
    'Mecha',
    'Music',
    'Mystery',
    'Psychological',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Supernatural',
    'Thriller'
  ].map((genre) => ({
    genreId: genre.toLowerCase().replace(/\s+/g, '-'),
    title: genre,
    count: 0
  }));

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Tag className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">
            Browse by Genre
            <span className="text-secondary">_</span>
          </h1>
        </div>

        <div
          className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            Discover anime across {genres.length} categories
          </p>
        </div>
      </div>

      {genres.length > 0 ? (
        <GenreView genres={genres} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <FaceDissatisfied className="w-12 h-12 text-muted-text" />

          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            Failed to load genres.
          </p>
        </div>
      )}
    </div>
  );
}