export const revalidate = 60;

import {getHomeData,getTodaySchedule} from "@/lib/services/anilist";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { HeroCarousel } from "@/components/anime/HeroCarousel";
import { HeroCarouselMobile } from "@/components/anime/HeroCarouselMobile";
import { HomeClientWrapper } from "@/components/home/HomeClientWrapper";
import { AnimeTitleDisplay } from '@/components/anime/AnimeTitleDisplay';
import { ChevronRight, Calendar, Time } from "@carbon/icons-react";
import Link from "next/link";
import { formatNextAiring } from "@/lib/utils";

const DAY_MAP: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday',
  3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export default async function HomePage() {
const { trending, popular, completed } =
  await getHomeData();

const ongoing = trending;
  
  // Fetch Schedule for today
  const todayAnimeList =
  await getTodaySchedule();

  // Format today's date for display
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Trending items for HeroCarousel — only ongoing with active episodes
  const trendingItems = trending.slice(0, 5).map((anime: any) => ({
  id: String(anime.id),

  title: anime.title?.romaji || "",
  title_english: anime.title?.english || "",

  image: anime.coverImage?.extraLarge || "",
  banner: anime.bannerImage || anime.coverImage?.extraLarge || "",

  rating: String(anime.averageScore || 0),

  episodes: anime.nextAiringEpisode?.episode
    ? `ep ${anime.nextAiringEpisode.episode}`
    : `${anime.episodes || "??"} eps`,

  genres: anime.genres || [],

  synopsis: anime.description || "",

  studios:
    anime.studios?.nodes?.map((s: any) => s.name) || []
}));

  return (
    <div className="pb-20 -mt-20">
      {/* Hero Carousel Section */}
      <div className="hidden lg:block">
        <HeroCarousel items={trendingItems} />
      </div>
      <div className="block lg:hidden">
        <HeroCarouselMobile items={trendingItems} />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <HomeClientWrapper>
        {/* Ongoing Section */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-secondary font-mono font-black text-lg leading-none">{'//'}</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black uppercase tracking-tighter">
                <span className="sm:hidden">Ongoing</span>
                <span className="hidden sm:inline">Ongoing Anime</span>
              </h2>
            </div>
            <Link
              href="/ongoing"
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest bg-card/30 border border-muted-text/20 hover:border-secondary/30 transition-colors text-muted-text hover:text-foreground"
            >
              View All <ChevronRight className="w-3.5 h-3.5 text-secondary" />
            </Link>
          </div>
          <div className="mobile-snap-scroll gap-4 md:gap-6">
            {ongoing.slice(0, 12).map((anime: any) => (
              <AnimeCard
                  key={anime.id}
				  id={String(anime.id)}
				  title={anime.title?.romaji || ""}
				  titleEnglish={anime.title?.english || ""}
				  image={anime.coverImage?.extraLarge || ""}
				  rating={String(anime.averageScore || 0)}
                episode={`ep ${anime.nextAiringEpisode?.episode || '??'}`}
                status={anime.status}
                totalEpisodes={anime.episodes}
                forceGrid={true}
              />
            ))}
          </div>
        </section>
		
		{/* Complete Section */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-secondary font-mono font-black text-lg leading-none">{'//'}</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black uppercase tracking-tighter">
                <span className="sm:hidden">Completed</span>
                <span className="hidden sm:inline">Completed Series</span>
              </h2>
            </div>
            <Link
              href="/completed"
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest bg-card/30 border border-muted-text/20 hover:border-secondary/30 transition-colors text-muted-text hover:text-foreground"
            >
              View All <ChevronRight className="w-3.5 h-3.5 text-secondary" />
            </Link>
          </div>
          <div className="mobile-snap-scroll gap-4 md:gap-6">
            {completed.slice(0, 12).map((anime: any) => (
              <AnimeCard
			  key={anime.id}
			  id={String(anime.id)}
			  title={anime.title?.romaji || ""}
			  titleEnglish={anime.title?.english || ""}
			  image={anime.coverImage?.extraLarge || ""}
			  rating={String(anime.averageScore || 0)}
			  episode={`${anime.episodes || "??"} eps`}
			  totalEpisodes={anime.episodes}
			  forceGrid={true}
			/>
            ))}
          </div>
        </section>
        </HomeClientWrapper>

        {/* Today's Schedule Section */}
        {todayAnimeList.length > 0 && (
          <section 
            className="bg-card/40 border-t border-b border-secondary/30 p-4 sm:p-8 md:p-12 relative overflow-hidden mt-16 sm:mt-20"
            style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-8 relative z-10 border-b border-border pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-secondary/10 text-secondary" style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                  <Calendar className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-serif font-black uppercase tracking-tighter text-foreground leading-none">
                    Today's Schedule
                  </h2>
                  <p className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-secondary mt-0.5 sm:mt-1">
                    {todayFormatted}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2 relative z-10">
              {todayAnimeList.slice(0, 5).map((anime: any, index: number) => {
                const nextAiring = new Date(
				  anime.airingAt * 1000
				).toLocaleTimeString([], {
				  hour: '2-digit',
				  minute: '2-digit'
				});
                return (
                  <Link 
                    key={`${anime.media.id}-${anime.episode}`} 
                    href={`/anime/${anime.media.id}`}
                    className="group flex items-center justify-between p-3 sm:p-4 bg-background/30 hover:bg-secondary/10 border-b border-border last:border-0 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                    <div className="flex items-center gap-3 sm:gap-4 pl-2 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-mono text-muted-text/50 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="font-bold text-xs sm:text-sm group-hover:text-secondary line-clamp-1 uppercase tracking-wider transition-colors">
                        <AnimeTitleDisplay
						  title={anime.media.title?.romaji}
						  titleEnglish={anime.media.title?.english}
						/>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {nextAiring && (
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-secondary/70 uppercase tracking-wider flex items-center gap-1">
                          <Time className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {nextAiring}
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-text group-hover:text-secondary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
              
              {todayAnimeList.length > 5 && (
                <div className="pt-4 sm:pt-6 text-center">
                  <Link 
                    href={`/schedule`}
                    className="inline-block px-6 py-3 sm:px-10 sm:py-4 bg-secondary text-background hover:bg-secondary/90 transition-colors text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                  >
                    Load Full Schedule ({todayAnimeList.length - 5} More)
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

