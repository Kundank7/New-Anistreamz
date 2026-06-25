import React from 'react';
import { AnimeService } from '@/lib/services/anime';
import Link from 'next/link';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Calendar, FaceDissatisfied } from '@carbon/icons-react';
import { formatNextAiring } from '@/lib/utils';
import { ViewGridWrapper } from '@/components/layout/ViewGridWrapper';
import { ViewToggle } from '@/components/layout/ViewToggle';
import { MobileNavSelect } from '@/components/layout/MobileNavSelect';

export const metadata = {
  title: 'Anime Schedule - Anistreamz',
  description: 'Weekly anime release schedule.',
};

const DAY_MAP: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday',
  3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SchedulePageProps {
  searchParams: Promise<{ day?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const scheduleData = await AnimeService.getSchedule();
  const rawParams = await searchParams;
  
  // Default to today if no day parameter is provided
  const currentJsDay = new Date().getDay();
  const defaultDay = DAY_MAP[currentJsDay];
  
  // Ensure day is valid, fallback to defaultDay
  let activeDay = rawParams.day || defaultDay;
  if (!DAY_ORDER.includes(activeDay)) {
    activeDay = defaultDay;
  }

  // Compute counts per day
  const dayCounts = DAY_ORDER.reduce<Record<string, number>>((acc, day) => {
    acc[day] = (scheduleData[day] || []).length;
    return acc;
  }, {});
  const totalScheduled = DAY_ORDER.reduce((sum, day) => sum + dayCounts[day], 0);

  // Find the anime list for the active day
  const animeList = scheduleData[activeDay] || [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Calendar className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Schedule<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
               style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
              Weekly anime release schedule
            </p>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div 
        className="mb-8 bg-card/50 border-y border-secondary/30 p-6 md:p-8 relative hidden md:block"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar justify-start md:justify-center gap-3 relative z-10 pb-2">
          {DAY_ORDER.map((day) => {
            const isActive = day === activeDay;
            return (
              <Link
                key={day}
                href={`/schedule?day=${day}`}
                className={`px-6 py-2.5 flex items-center shrink-0 snap-center gap-2 font-bold text-sm transition-all uppercase tracking-widest ${
                  isActive
                    ? 'bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)] pointer-events-none border border-transparent'
                    : 'bg-background/80 text-foreground/70 hover:bg-secondary/20 hover:text-secondary border border-secondary/20 hover:border-secondary/50'
                }`}
              >
                {day} // {dayCounts[day]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <MobileNavSelect 
          options={DAY_ORDER.map(d => ({ value: d, label: `${d} (${dayCounts[d]})` }))}
          currentValue={activeDay}
          baseUrl="/schedule"
          paramName="day"
        />
        <div className="hidden md:block flex-1" />
        <ViewToggle />
      </div>

      {/* Anime Grid */}
      {animeList.length > 0 ? (
        <ViewGridWrapper>
          {animeList.map((anime: any) => (
            <AnimeCard
              key={anime.slug}
              id={anime.slug}
              title={anime.title}
              titleEnglish={anime.title_english}
              image={anime.poster}
              rating={String(anime.score)}
              episode={`ep ${anime.latest_episode || '??'}`}
              status={anime.next_episode && anime.next_airing_at ? formatNextAiring(anime.next_episode, anime.next_airing_at, true) ?? undefined : undefined}
              synopsis={anime.synopsis}
              genres={anime.genres ? anime.genres.split(',') : []}
            />
          ))}
        </ViewGridWrapper>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-secondary/20 bg-card">
          <FaceDissatisfied className="w-12 h-12 text-muted-text" />
          <div className="space-y-2">
            <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
              No anime scheduled for {activeDay}
            </p>
            <p className="text-[10px] font-mono text-muted-text/50">
              {totalScheduled > 0
                ? `Try another day — ${totalScheduled} anime scheduled this week`
                : 'Schedule data has not been loaded yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
