import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AnimeService } from '@/lib/services/anime';
import { Skeleton } from '@/components/ui/Skeleton';
import WatchContent from './WatchContent';

export async function generateMetadata(
  props: {
  params: Promise<{
    animeId: string;
    type: string;
    episode: string;
  }>
}
): Promise<Metadata> {
  const episodeSlug = (await props.params).id;
  
  let formattedEpisode = episodeSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  try {
    const episode = await AnimeService.getEpisodeBySlug(episodeSlug);
    if (episode && episode.title) {
      formattedEpisode = episode.title;
    }
  } catch (error) {
    // fallback to formatted slug
  }

  const cleanEpisodeTitle = formattedEpisode.replace(/\s*Subtitle\s+Indonesia\s*$/i, '').trim();
  
  return {
    title: cleanEpisodeTitle,
    description: `Streaming ${cleanEpisodeTitle} on Anistreamz`,
  };
}
export default async function WatchPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

return (
  <WatchContent
    animeId={params.animeId}
    type={params.type}
    episode={params.episode}
  />
);
    </Suspense>
  );
}
