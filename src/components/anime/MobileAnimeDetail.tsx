'use client';

import { Information, StarFilled, Grid, ChevronDown, PlayOutline } from "@carbon/icons-react";
import Link from "next/link";
import { useState } from "react";
import { ContinueWatching } from "@/components/anime/ContinueWatching";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { BookmarkButton } from "@/components/anime/BookmarkButton";
import { CharacterCarousel } from "@/components/anime/CharacterCarousel";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { AnimeTitleDisplay } from "@/components/anime/AnimeTitleDisplay";
import { LazyIframe } from "@/components/ui/LazyIframe";
import { AnimeDetailProps } from "./DesktopAnimeDetail";

export function MobileAnimeDetail({ id, data, source, similarAnime, charactersData }: AnimeDetailProps) {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const poster = data.poster;
  const banner = data.banner || poster;
  const episodes = data.episodeList || [];
  const genres = data.genres || [];
  const synopsis = data.synopsis || "No synopsis available.";
  const rating = data.score;
  const status = data.status;
  
  const totalEpisodes = data.episodes_count > 0 ? data.episodes_count : '??';
  const numEpisodes = `${totalEpisodes} eps`;
  
  const animeType = data.type || 'Unknown';
  const season = data.season && data.year ? `${data.season} ${data.year}` : 'Unknown';
  
  const trailerUrl = data.youtube_trailer_id
    ? `https://www.youtube.com/embed/${data.youtube_trailer_id}?autoplay=0`
    : null;

  return (
    <div className="pb-20 -mt-20">
      {/* Hero Section: Backdrop + Poster + Title */}
      <div className="relative w-full pb-8">
        {/* Blurred Background Banner */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img
            src={banner}
            alt="Background"
            className="w-full h-full object-cover blur-md opacity-40 brightness-75 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        {/* Content Over Banner */}
        <div className="relative z-10 pt-32 sm:pt-36 px-4">
          <div className="flex gap-4">
            {/* Small Poster */}
            <div className="w-[120px] shrink-0 aspect-[3/4] border-2 border-background shadow-xl relative overflow-hidden">
              <img src={poster} alt={data.title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Key Info */}
            <div className="flex flex-col justify-end pb-1 space-y-2">
              <h1 className="text-xl sm:text-2xl font-serif font-black leading-tight tracking-tighter">
                <AnimeTitleDisplay title={data.title} titleEnglish={data.title_english} />
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {genres.slice(0, 3).map((genre: any, idx: number) => (
                  <Link 
                    key={genre.slug || `genre-${idx}`} 
                    href={`/genre/${genre.slug}`}
                    className="px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 text-[9px] font-black uppercase tracking-widest clip-path-polygon-small"
                  >
                    {genre.name}
                  </Link>
                ))}
                {genres.length > 3 && (
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary/70 border border-secondary/20 text-[9px] font-black uppercase tracking-widest clip-path-polygon-small">
                    +{genres.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Scrollable Metadata Badges */}
          <div className="flex overflow-x-auto gap-3 py-4 mt-2 no-scrollbar snap-x">
            {rating && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border shrink-0 snap-start">
                <StarFilled className="text-secondary w-3.5 h-3.5" />
                <span className="text-xs font-black">{rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border shrink-0 snap-start text-xs font-bold uppercase tracking-wider text-muted-text">
              Status <span className="text-secondary ml-1">{status}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border shrink-0 snap-start text-xs font-bold uppercase tracking-wider text-muted-text">
              Eps <span className="text-foreground ml-1">{numEpisodes}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border shrink-0 snap-start text-xs font-bold uppercase tracking-wider text-muted-text">
              Season <span className="text-foreground ml-1 capitalize">{season}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border shrink-0 snap-start text-xs font-bold uppercase tracking-wider text-muted-text">
              Type <span className="text-foreground ml-1">{animeType}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mt-2">
            <ContinueWatching 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              source={source} 
              episodes={episodes}
            />
            <BookmarkButton 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              variant="full"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-8">
        {/* Synopsis */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest border-b-2 border-secondary/20 pb-4 mb-2">
            <div className="w-1.5 h-6 bg-secondary" />
            <Information className="w-5 h-5 text-secondary" />
            <h2>Synopsis<span className="text-secondary opacity-70">_</span></h2>
          </div>
          <div className="relative">
            <div className={`text-foreground/70 leading-relaxed text-sm ${!showFullSynopsis ? 'line-clamp-4' : ''}`}>
              {synopsis.split(/\n\s*\n+/).filter(Boolean).map((paragraph: string, i: number) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>
                  {paragraph.trim()}
                </p>
              ))}
            </div>
            {!showFullSynopsis && synopsis.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent flex items-end justify-center">
                <button 
                  onClick={() => setShowFullSynopsis(true)}
                  className="text-secondary text-xs font-bold uppercase tracking-wider bg-background px-4 py-1 border-t border-x border-secondary/20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] clip-path-polygon-small"
                >
                  Read More
                </button>
              </div>
            )}
            {showFullSynopsis && (
              <button 
                onClick={() => setShowFullSynopsis(false)}
                className="text-secondary text-xs font-bold uppercase tracking-wider mt-2 w-full text-center"
              >
                Show Less
              </button>
            )}
          </div>
        </div>

        {/* Episode List Section */}
        <div className="space-y-4">
          <EpisodeList 
            episodes={episodes} 
            animeId={id} 
            animeTitle={data.title} 
            animeTitleEnglish={data.title_english}
            poster={poster} 
            source={source} 
          />
        </div>

        {/* Characters Section */}
        {charactersData && charactersData.length > 0 && (
          <div className="pt-2">
            <CharacterCarousel characters={charactersData} />
          </div>
        )}

        {/* Trailer */}
        {trailerUrl && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest border-b-2 border-secondary/20 pb-4 mb-2">
              <div className="w-1.5 h-6 bg-secondary" />
              <PlayOutline className="w-5 h-5 text-secondary" />
              <h2>Trailer<span className="text-secondary opacity-70">_</span></h2>
            </div>
            <div className="aspect-video w-full bg-black border-2 border-border relative group">
              <LazyIframe
                src={trailerUrl}
                title="Anime Trailer"
                poster={banner || poster}
                overlayText="WATCH TRAILER"
                className="absolute inset-0 w-full h-full pointer-events-auto"
              />
            </div>
          </div>
        )}

        {/* Similar Anime Section */}
        {similarAnime.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest border-b-2 border-secondary/20 pb-4 mb-2">
              <div className="w-1.5 h-6 bg-secondary" />
              <Grid className="w-5 h-5 text-secondary" />
              <h2>Similar Anime<span className="text-secondary opacity-70">_</span></h2>
            </div>
            <div className="anime-grid">
              {similarAnime.map((anime: any) => (
                <AnimeCard
                  key={anime.slug}
                  id={anime.slug}
                  title={anime.title}
                  titleEnglish={anime.title_english}
                  image={anime.poster}
                  rating={String(anime.score)}
                  episode={anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`}
                  totalEpisodes={anime.actual_episodes_count}
                  forceGrid={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
