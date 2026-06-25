import { AnimeCard } from './AnimeCard';

export function ForYouHome({ recommendations }: { recommendations: any[] }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-secondary font-mono font-black text-lg leading-none">{'//'}</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black uppercase tracking-tighter">For You</h2>
        </div>
      </div>
      <div className="mobile-snap-scroll gap-4 md:gap-6">
        {recommendations.map((anime: any) => (
          <AnimeCard
            key={anime.slug}
            id={anime.slug}
            title={anime.title}
            titleEnglish={anime.title_english}
            image={anime.poster}
            rating={String(anime.score)}
            status={anime.status}
            episode={`${anime.episodes_count || '??'} eps`}
            totalEpisodes={anime.actual_episodes_count}
            forceGrid={true}
          />
        ))}
      </div>
    </section>
  );
}
