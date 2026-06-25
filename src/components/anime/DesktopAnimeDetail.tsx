import { Information, StarFilled, Grid } from "@carbon/icons-react";
import Link from "next/link";
import { ContinueWatching } from "@/components/anime/ContinueWatching";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { BookmarkButton } from "@/components/anime/BookmarkButton";
import { CharacterCarousel } from "@/components/anime/CharacterCarousel";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { AnimeTitleDisplay } from "@/components/anime/AnimeTitleDisplay";
import { LazyIframe } from "@/components/ui/LazyIframe";

export interface AnimeDetailProps {
  id: string;
  data: any;
  source: string;
  similarAnime: any[];
  charactersData: any[];
}

export function DesktopAnimeDetail({ id, data, source, similarAnime, charactersData }: AnimeDetailProps) {
  const poster = data.poster;
  const banner = data.banner || poster;
  const episodes = data.episodeList || [];
  const genres = data.genres || [];
  const synopsis = data.synopsis || "No synopsis available.";
  const rating = data.score;
  const status = data.status;
  
  const totalEpisodes = data.episodes_count > 0 ? data.episodes_count : '??';
  const numEpisodes = `${totalEpisodes} eps`;
  
  const studios = Array.isArray(data.studios) ? data.studios.join(', ') : (data.studios || 'Unknown');
  const aired = data.aired || 'Unknown';
  const animeType = data.type || 'Unknown';
  const animeSource = data.source || 'Unknown';
  const ageRating = data.rating || 'Unknown';
  const duration = data.duration_minutes ? `${data.duration_minutes} min` : 'Unknown';
  const season = data.season && data.year ? `${data.season} ${data.year}` : 'Unknown';
  
  const trailerUrl = data.youtube_trailer_id
    ? `https://www.youtube.com/embed/${data.youtube_trailer_id}?autoplay=0`
    : null;

  return (
    <div className="pb-20 -mt-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={banner}
            alt={data.title}
            loading="eager"
            className="w-full h-full object-cover object-[center_25%] blur-sm opacity-50 dark:opacity-100 brightness-110 dark:brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex gap-8">
          {/* Poster & Action Sidebar */}
          <div className="w-[280px] shrink-0 space-y-6">
            <div className="aspect-[3/4] border-4 border-background shadow-2xl relative">
              <img src={poster} alt={data.title} loading="eager" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-secondary/20 pointer-events-none" />
            </div>

            <ContinueWatching 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              source={source} 
              episodes={episodes}
            />

            {/* Bookmark Button */}
            <BookmarkButton 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              variant="full"
              className="w-full"
            />
            
            <div className="space-y-4">
              {rating && (
                <div 
                  className="flex items-center justify-between p-4 bg-card/50 border-l-4 border-secondary/50 relative overflow-hidden group hover:border-secondary transition-colors"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center space-x-2 relative z-10">
                    <StarFilled className="text-secondary w-5 h-5" />
                    <span className="font-serif font-black text-xl">{rating}</span>
                  </div>
                  <span className="text-[10px] text-muted-text uppercase font-black tracking-widest relative z-10">Score</span>
                </div>
              )}
              
              <div 
                className="p-5 bg-card/50 border-l-4 border-secondary/20 space-y-4 relative"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Status</span>
                  <span className="text-secondary">{status}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Episodes</span>
                  <span className="text-foreground">{numEpisodes}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider border-t border-border pt-2">
                  <span className="text-muted-text">Type</span>
                  <span className="text-foreground text-right">{animeType}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Source</span>
                  <span className="text-foreground text-right">{animeSource}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Season</span>
                  <span className="text-foreground text-right capitalize">{season}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Studio</span>
                  <span className="text-foreground text-right leading-relaxed">{studios}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Aired</span>
                  <span className="text-foreground text-right leading-relaxed">{aired}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Duration</span>
                  <span className="text-foreground text-right leading-relaxed">{duration}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Rating</span>
                  <span className="text-foreground text-right leading-relaxed">{ageRating}</span>
                </div>
                {data.anilist_id && (
                  <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4 border-t border-border pt-2">
                    <span className="text-muted-text shrink-0">External</span>
                    <a 
                      href={`https://anilist.co/anime/${data.anilist_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      AniList
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar Trailer */}
              {trailerUrl && (
                <div className="aspect-video w-full bg-black border-4 border-background shadow-2xl relative group">
                  <LazyIframe
                    src={trailerUrl}
                    title="Anime Trailer"
                    poster={banner || poster}
                    overlayText="WATCH TRAILER"
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                  />
                  <div className="absolute inset-0 pointer-events-none border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors duration-300" />
                </div>
              )}
            </div>
          </div>

          {/* Info & Content */}
          <div className="flex-grow min-w-0 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-serif font-black leading-none tracking-tighter">
                <AnimeTitleDisplay title={data.title} titleEnglish={data.title_english} />
              </h1>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any, idx: number) => {
                  return (
                    <Link 
                      key={genre.slug || `genre-${idx}`} 
                      href={`/genre/${genre.slug}`}
                      className="px-3 py-1 bg-secondary text-background text-[10px] font-black uppercase tracking-widest clip-path-polygon-small hover:bg-secondary/80 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
                <div className="w-1.5 h-6 bg-secondary" />
                <Information className="w-5 h-5 text-secondary" />
                <h2>Synopsis<span className="text-secondary opacity-70">_</span></h2>
              </div>
              <div className="text-foreground/70 leading-relaxed text-base border-l-4 border-secondary/20 pl-6 pr-6 py-4 bg-secondary/[0.02]">
                {synopsis.split(/\n\s*\n+/).filter(Boolean).map((paragraph: string, i: number) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Episode List Section */}
            <div className="space-y-6 pt-4">
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
            <CharacterCarousel characters={charactersData} />

            {/* Similar Anime Section */}
            {similarAnime.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
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
      </div>
    </div>
  );
}
