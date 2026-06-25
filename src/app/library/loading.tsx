import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LibraryLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-border pb-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-14 h-14 rounded-none" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-5 w-40 rounded-none" />
              <Skeleton className="h-10 w-52 rounded-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-none" />
            <Skeleton className="h-10 w-28 rounded-none" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-28 rounded-none" />
          <Skeleton className="h-10 w-36 rounded-none" />
        </div>
      </div>

      <div className="anime-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
