import { HeroCarouselSkeleton } from '@/components/anime/HeroCarousel';
import { HeroCarouselMobileSkeleton } from '@/components/anime/HeroCarouselMobile';
import { ContinueWatchingHomeSkeleton } from '@/components/anime/ContinueWatchingHome';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/Skeleton';

function SectionHeaderSkeleton() {
  return (
    <div className="flex items-end justify-between mb-8 border-b border-border pb-4">
      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <Skeleton className="h-7 w-7 rounded-none" />
          <Skeleton className="h-8 w-52 rounded-none" />
        </div>
        <Skeleton className="h-4 w-40 ml-8 rounded-none" />
      </div>
      <Skeleton className="h-10 w-28 rounded-none hidden sm:flex" />
    </div>
  );
}

function SectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mobile-snap-scroll gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} forceGrid={true} />
      ))}
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="pb-20 -mt-20">
      <div className="hidden lg:block">
        <HeroCarouselSkeleton />
      </div>
      <div className="block lg:hidden">
        <HeroCarouselMobileSkeleton />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <ContinueWatchingHomeSkeleton />

        <section>
          <SectionHeaderSkeleton />
          <SectionGridSkeleton count={6} />
        </section>

        <section>
          <SectionHeaderSkeleton />
          <SectionGridSkeleton count={6} />
        </section>

        <section className="bg-card/40 border-t border-b border-secondary/30 p-8 md:p-12 relative overflow-hidden mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 border-b border-border pb-6">
            <div className="space-y-1 flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-none" />
              <div>
                <Skeleton className="h-8 w-56 rounded-none" />
                <Skeleton className="h-4 w-44 mt-1 rounded-none" />
              </div>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background/30 border-b border-border">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-6 rounded-none" />
                  <Skeleton className="h-4 w-72 rounded-none" />
                </div>
                <Skeleton className="w-4 h-4 rounded-none" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
