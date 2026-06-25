import { Suspense } from 'react';
import type { Metadata } from 'next';
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
  const params = await props.params;

  const title = `Episode ${params.episode} (${params.type.toUpperCase()})`;

  return {
    title,
    description: `Watch Episode ${params.episode} on Anistreamz`,
  };
}

export default async function WatchPage(
  props: {
    params: Promise<{
      animeId: string;
      type: string;
      episode: string;
    }>
  }
) {
  const params = await props.params;

  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="aspect-video w-full rounded-none" />
        </div>
      }
    >
      <WatchContent
        animeId={params.animeId}
        type={params.type}
        episode={params.episode}
      />
    </Suspense>
  );
}