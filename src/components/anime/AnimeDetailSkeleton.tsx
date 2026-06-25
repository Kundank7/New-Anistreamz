import { Skeleton } from '@/components/ui/Skeleton';
import { EpisodeListSkeleton } from '@/components/anime/EpisodeList';
import { CharacterCarouselSkeleton } from '@/components/anime/CharacterCarousel';
import { ContinueWatchingSkeleton } from '@/components/anime/ContinueWatching';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';

export function AnimeDetailSkeleton() {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className="lg:hidden pb-20 -mt-20">
        <div className="relative w-full pb-8">
          <div className="absolute inset-0 h-[350px] w-full overflow-hidden z-0">
            <Skeleton className="w-full h-full rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="relative z-10 pt-32 sm:pt-36 px-4">
            <div className="flex gap-4">
              <Skeleton className="w-[120px] shrink-0 aspect-[3/4] border-2 border-background shadow-xl rounded-none" />
              <div className="flex flex-col justify-end pb-1 space-y-2 flex-grow">
                <Skeleton className="h-6 w-full rounded-none" />
                <Skeleton className="h-6 w-2/3 rounded-none" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Skeleton className="h-5 w-12 rounded-none" />
                  <Skeleton className="h-5 w-16 rounded-none" />
                </div>
              </div>
            </div>

            <div className="flex overflow-hidden gap-3 py-4 mt-2">
              <Skeleton className="h-8 w-16 shrink-0 rounded-none" />
              <Skeleton className="h-8 w-24 shrink-0 rounded-none" />
              <Skeleton className="h-8 w-20 shrink-0 rounded-none" />
              <Skeleton className="h-8 w-24 shrink-0 rounded-none" />
            </div>

            <div className="space-y-3 mt-2">
              <ContinueWatchingSkeleton />
              <Skeleton className="w-full h-12 rounded-none" />
            </div>
          </div>
        </div>

        <div className="px-4 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-1 h-4 rounded-none" />
              <Skeleton className="w-4 h-4 rounded-none" />
              <Skeleton className="h-5 w-24 rounded-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="h-4 w-3/4 rounded-none" />
            </div>
          </div>

          <div className="space-y-4">
            <EpisodeListSkeleton />
          </div>

          <CharacterCarouselSkeleton />

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-1 h-4 rounded-none" />
              <Skeleton className="w-4 h-4 rounded-none" />
              <Skeleton className="h-5 w-32 rounded-none" />
            </div>
            <div className="anime-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden lg:block pb-20 -mt-20">
        <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
          <Skeleton className="absolute inset-0 rounded-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full max-w-[280px] mx-auto lg:mx-0 shrink-0 space-y-6">
              <Skeleton className="aspect-[3/4] border-4 border-background shadow-2xl rounded-none" />

              <ContinueWatchingSkeleton />

              <Skeleton className="w-full h-12 rounded-none" />

              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-none" />
                <Skeleton className="h-[264px] w-full rounded-none" />
                <Skeleton className="aspect-video w-full rounded-none" />
              </div>
            </div>

            <div className="flex-grow min-w-0 space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <Skeleton className="h-14 w-3/4 rounded-none" />
                <Skeleton className="h-14 w-1/2 rounded-none" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-none" />
                  <Skeleton className="h-7 w-24 rounded-none" />
                  <Skeleton className="h-7 w-16 rounded-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-1.5 h-6 rounded-none" />
                  <Skeleton className="w-5 h-5 rounded-none" />
                  <Skeleton className="h-6 w-28 rounded-none" />
                </div>
                <div className="space-y-2 border-l-4 border-secondary/20 pl-6 pr-6 py-4">
                  <Skeleton className="h-4 w-full rounded-none" />
                  <Skeleton className="h-4 w-full rounded-none" />
                  <Skeleton className="h-4 w-3/4 rounded-none" />
                  <Skeleton className="h-4 w-full rounded-none" />
                  <Skeleton className="h-4 w-1/2 rounded-none" />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <EpisodeListSkeleton />
              </div>

              <CharacterCarouselSkeleton />

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-1.5 h-6 rounded-none" />
                  <Skeleton className="w-5 h-5 rounded-none" />
                  <Skeleton className="h-6 w-36 rounded-none" />
                </div>
                <div className="anime-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
