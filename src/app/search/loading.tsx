import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <Skeleton className="flex-1 h-14 rounded-none" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36 rounded-none" />
            <Skeleton className="h-10 w-36 rounded-none" />
            <Skeleton className="h-10 w-36 rounded-none" />
            <Skeleton className="h-10 w-36 rounded-none" />
          </div>
        </div>
        <Skeleton className="h-5 w-48 rounded-none" />
      </div>

      <div className="anime-grid">
        {Array.from({ length: 24 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
