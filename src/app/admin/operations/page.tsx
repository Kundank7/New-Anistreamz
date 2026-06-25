'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { getAnomalies, getNoEpisodesAnime, injectMetadata, handleLogout, triggerScraper, triggerScrapeSlug } from '../actions';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Tooltip } from '@/components/ui/Tooltip';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Warning, Video, Renew } from '@carbon/icons-react';

type Anomaly = {
  id: number;
  slug: string;
  title: string;
  type: string | null;
};

const SCRAPERS = [
  { id: 'scrape:latest', name: 'Scrape Latest', desc: 'Fetch recent episodes from source grid' },
  { id: 'scrape:ongoing', name: 'Scrape Ongoing', desc: 'Synchronize active simulcast transmissions' },
  { id: 'update:metadata', name: 'Update Metadata', desc: 'Align entity records with AniList databanks' },
  { id: 'fill:schedule', name: 'Fill Schedule', desc: 'Refresh global broadcast timetables' },
];

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-full p-4 md:p-8 font-sans">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'unmatched' | 'noEpisodes'>('unmatched');
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [anomaliesPage, setAnomaliesPage] = useState(1);
  const [anomaliesTotalPages, setAnomaliesTotalPages] = useState(1);
  const [anomaliesTotal, setAnomaliesTotal] = useState(0);

  const [noEpisodeAnomalies, setNoEpisodeAnomalies] = useState<Anomaly[]>([]);
  const [noEpisodePage, setNoEpisodePage] = useState(1);
  const [noEpisodeTotalPages, setNoEpisodeTotalPages] = useState(1);
  const [noEpisodeTotal, setNoEpisodeTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check URL param first (priority)
    const tabParam = searchParams.get('tab') as 'unmatched' | 'noEpisodes';
    if (tabParam === 'unmatched' || tabParam === 'noEpisodes') {
      setActiveTab(tabParam);
    } else {
      // Check localStorage if no URL param
      const savedTab = localStorage.getItem('operations_active_tab') as 'unmatched' | 'noEpisodes';
      if (savedTab === 'unmatched' || savedTab === 'noEpisodes') {
        setActiveTab(savedTab);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'unmatched' | 'noEpisodes') => {
    setActiveTab(tab);
    localStorage.setItem('operations_active_tab', tab);
    
    // Update URL without full refresh to stay in sync
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/admin/operations?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!mounted) return;
    setIsLoading(true);
    if (activeTab === 'unmatched') {
      getAnomalies(anomaliesPage).then((data) => {
        setAnomalies(data.items as Anomaly[]);
        setAnomaliesTotal(data.total);
        setAnomaliesTotalPages(data.totalPages);
        setIsLoading(false);
      });
    } else {
      getNoEpisodesAnime(noEpisodePage).then((data) => {
        setNoEpisodeAnomalies(data.items as Anomaly[]);
        setNoEpisodeTotal(data.total);
        setNoEpisodeTotalPages(data.totalPages);
        setIsLoading(false);
      });
    }
  }, [activeTab, anomaliesPage, noEpisodePage, mounted, refreshTrigger]);

  const handleInject = (animeId: number, formData: FormData) => {
    const anilistIdRaw = formData.get('anilistId') as string;
    
    const anilistId = anilistIdRaw ? parseInt(anilistIdRaw, 10) : null;

    if (!anilistId) {
      toast.error('You must provide an AniList ID');
      return;
    }

    startTransition(async () => {
      const result = await injectMetadata(animeId, anilistId);
      if (result.success) {
        toast.success('Metadata injected successfully');
        setAnomalies((prev) => prev.filter(a => a.id !== animeId));
      } else {
        toast.error('Failed to inject: ' + result.error);
      }
    });
  };

  const handleTriggerScraper = (scriptId: string) => {
    startTransition(async () => {
      toast.info(`Initiating process: ${scriptId}...`);
      const result = await triggerScraper(scriptId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleTriggerScrapeSlug = (slug: string, formData?: FormData) => {
    startTransition(async () => {
      const correctSlug = formData?.get('correctSlug') as string || slug;
      
      const result = await triggerScrapeSlug(slug, correctSlug);
      if (result.success) {
        toast.success(result.message || `Successfully scraped episodes for ${correctSlug}`);
        setNoEpisodeAnomalies((prev) => prev.filter(a => a.slug !== slug));
      } else {
        toast.error('Scraping failed', {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* Header */}
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
            System Operations
          </h1>
          <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
            Manual Override & Backend Telemetry
          </p>
        </header>

        {/* Telemetry / Scraper Controls */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">Backend Telemetry</h2>
            <p className="text-sm text-muted-text mt-1">Manual invocation of background scraper routines</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCRAPERS.map((scraper) => (
              <div key={scraper.id} className="border border-border bg-card p-4 flex flex-col justify-between hover:border-secondary transition-colors">
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">{scraper.name}</h3>
                  <p className="text-xs text-muted-text">{scraper.desc}</p>
                </div>
                <button
                  onClick={() => handleTriggerScraper(scraper.id)}
                  disabled={isPending}
                  className="bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-white dark:hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full"
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Content Section: Anomalies Toggle */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider">System Anomalies</h2>
              <p className="text-sm text-muted-text mt-1">Review missing parameters and telemetry gaps</p>
            </div>
            <div className="text-xs font-mono bg-card px-3 py-1 border border-border uppercase tracking-widest text-muted-text">
              {activeTab === 'unmatched' ? anomaliesTotal : noEpisodeTotal} ENTRIES TOTAL
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleTabChange('unmatched')}
                className={cn(
                  "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                  activeTab === 'unmatched' 
                    ? "bg-secondary/10 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                    : "bg-card/50 text-muted-text border border-border hover:border-secondary/30 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "absolute bottom-0 left-0 h-1 w-full transition-all",
                  activeTab === 'unmatched' ? "bg-secondary scale-x-100" : "bg-secondary scale-x-0 group-hover:scale-x-100"
                )} />
                <Warning className="w-4 h-4" />
                <span>Unmatched Entities</span>
              </button>
              <button 
                onClick={() => handleTabChange('noEpisodes')}
                className={cn(
                  "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                  activeTab === 'noEpisodes' 
                    ? "bg-danger/10 text-danger border border-danger/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                    : "bg-card/50 text-muted-text border border-border hover:border-danger/30 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "absolute bottom-0 left-0 h-1 w-full transition-all",
                  activeTab === 'noEpisodes' ? "bg-danger scale-x-100" : "bg-danger scale-x-0 group-hover:scale-x-100"
                )} />
                <Video className="w-4 h-4" />
                <span>No Episodes</span>
              </button>
            </div>

            <Tooltip content="Refresh Data" position="bottom">
            <button
              onClick={() => setRefreshTrigger(p => p + 1)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-border bg-card/50 hover:bg-card hover:border-secondary hover:text-secondary text-muted-text text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50"
            >
              <Renew className={cn("w-4 h-4", isLoading && "animate-spin text-secondary")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            </Tooltip>
          </div>

          {activeTab === 'unmatched' && (
            <div className="overflow-x-auto border border-border bg-card/30 animate-in fade-in duration-300">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-normal w-[15%]">ID / Type</th>
                    <th className="px-6 py-4 font-normal w-[55%]">Source Title (Otakudesu)</th>
                    <th className="px-6 py-4 font-normal text-right w-[30%]">Inject Anilist ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-text font-mono">
                        Scanning databanks...
                      </td>
                    </tr>
                  ) : anomalies.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-secondary font-mono">
                        No anomalies detected. Grid is optimal.
                      </td>
                    </tr>
                  ) : (
                    anomalies.map((anime) => (
                      <tr key={anime.id} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-muted-text mr-2">#{anime.id}</span>
                          <span className="bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 text-[10px] uppercase">
                            {anime.type || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[250px] truncate" title={anime.title}>
                          {anime.title}
                          <div className="text-[10px] text-muted-text font-mono mt-1 truncate">{anime.slug}</div>
                        </td>
                        
                        {/* Inject Form */}
                        <td className="px-6 py-2">
                          <form action={(formData) => handleInject(anime.id, formData)} className="flex items-center justify-end gap-3 w-full">
                            <input 
                              name="anilistId"
                              type="number" 
                              placeholder="Anilist ID" 
                              className="w-28 bg-transparent border border-border px-3 py-1.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-mono text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              type="submit" 
                              disabled={isPending}
                              className="bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-white dark:hover:text-black px-4 py-1.5 font-bold uppercase tracking-wider text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Inject
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!isLoading && anomaliesTotalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-card">
                  <span className="text-xs text-muted-text font-mono uppercase tracking-wider">
                    Page {anomaliesPage} of {anomaliesTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnomaliesPage(p => Math.max(1, p - 1))}
                      disabled={anomaliesPage === 1 || isPending || isLoading}
                      className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/30 disabled:opacity-50 text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white dark:hover:text-black transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setAnomaliesPage(p => Math.min(anomaliesTotalPages, p + 1))}
                      disabled={anomaliesPage === anomaliesTotalPages || isPending || isLoading}
                      className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/30 disabled:opacity-50 text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white dark:hover:text-black transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'noEpisodes' && (
            <div className="overflow-x-auto border border-border bg-card/30 animate-in fade-in duration-300">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-normal w-[15%]">ID / Type</th>
                    <th className="px-6 py-4 font-normal w-[55%]">Title (Otakudesu)</th>
                    <th className="px-6 py-4 font-normal text-right w-[30%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-text font-mono">
                        Scanning databanks...
                      </td>
                    </tr>
                  ) : noEpisodeAnomalies.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-secondary font-mono">
                        No anomalies detected. Grid is optimal.
                      </td>
                    </tr>
                  ) : (
                    noEpisodeAnomalies.map((anime) => (
                      <tr key={`noep-${anime.id}`} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-muted-text mr-2">#{anime.id}</span>
                          <span className="bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 text-[10px] uppercase">
                            {anime.type || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[250px] truncate" title={anime.title}>
                          {anime.title}
                          <div className="text-[10px] text-muted-text font-mono mt-1 truncate">{anime.slug}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <form action={(formData) => handleTriggerScrapeSlug(anime.slug, formData)} className="flex items-center justify-end gap-3 w-full">
                            <input 
                              name="correctSlug"
                              type="text" 
                              placeholder="Correct Slug (Optional)" 
                              defaultValue={anime.slug}
                              className="w-48 bg-transparent border border-border px-3 py-1.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-mono text-xs"
                            />
                            <button
                              type="submit"
                              disabled={isPending}
                              className="bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-white dark:hover:text-black px-4 py-1.5 font-bold uppercase tracking-wider text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                            >
                              Fix (Scrape)
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!isLoading && noEpisodeTotalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-card">
                  <span className="text-xs text-muted-text font-mono uppercase tracking-wider">
                    Page {noEpisodePage} of {noEpisodeTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNoEpisodePage(p => Math.max(1, p - 1))}
                      disabled={noEpisodePage === 1 || isPending || isLoading}
                      className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/30 disabled:opacity-50 text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white dark:hover:text-black transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setNoEpisodePage(p => Math.min(noEpisodeTotalPages, p + 1))}
                      disabled={noEpisodePage === noEpisodeTotalPages || isPending || isLoading}
                      className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/30 disabled:opacity-50 text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white dark:hover:text-black transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
