import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OngoingLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="w-14 h-14 rounded-none" />
          <Skeleton className="h-12 w-56 rounded-none" />
        </div>
        <Skeleton className="h-12 w-80 rounded-none" />
      </div>

      <div className="anime-grid">
        {Array.from({ length: 24 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
