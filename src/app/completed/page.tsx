import { Metadata } from 'next';
import { getHomeData } from "@/lib/services/anilist";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Checkmark, FaceDissatisfied } from "@carbon/icons-react";
import { ViewGridWrapper } from "@/components/layout/ViewGridWrapper";
import { ViewToggle } from "@/components/layout/ViewToggle";

export const metadata: Metadata = {
  title: 'Completed Anime - Anistreamz',
  description: 'Browse all completed anime series.',
};

export default async function CompletedPage() {
  const { completed } = await getHomeData();

  const complete = completed || [];
  const error = complete.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Checkmark className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">
            Completed
            <span className="text-secondary">_</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
              Finished series library
            </p>
          </div>

          <div className="hidden sm:block">
            <ViewToggle />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20">
          <FaceDissatisfied className="w-12 h-12 text-foreground/20" />

          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">
            No completed anime found.
          </p>
        </div>
      )}

      {complete.length > 0 && (
        <>
          <div className="flex justify-end mb-4 sm:hidden">
            <ViewToggle />
          </div>

          <ViewGridWrapper>
            {complete.map((anime: any) => (
              <AnimeCard
                key={anime.id}
                id={String(anime.id)}
                title={anime.title?.romaji || ""}
                titleEnglish={anime.title?.english || ""}
                image={anime.coverImage?.extraLarge || ""}
                rating={String(anime.averageScore || 0)}
                episode={`${anime.episodes || "??"} eps`}
				status={anime.status}
                totalEpisodes={anime.episodes}
                forceGrid={true}
              />
            ))}
          </ViewGridWrapper>
        </>
      )}
    </div>
  );
}