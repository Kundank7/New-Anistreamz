'use client';

import React, { useEffect, useState, Suspense, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWatch, getEpisodes } from '@/lib/services/anivexa';
import { useHistory } from '@/lib/hooks/useHistory';
import { useWatchedEpisodes } from '@/lib/hooks/useWatchedEpisodes';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';
import { ChevronRight, Grid, Renew, Video, ServerDns, Screen, Theater, Download } from '@carbon/icons-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/ui/Skeleton';
import { LazyIframe } from '@/components/ui/LazyIframe';
import { cn } from '@/lib/utils';
import { getAnimeById } from '@/lib/services/anilist';

export default function WatchContent({
  animeId,
  type,
  episode
}: {
  animeId: string;
  type: string;
  episode: string;
}) {
  const router = useRouter();
  const { titleLang } = useTitleLang();

  const [episodeData, setEpisodeData] = useState<any>(null);
  const [animeData, setAnimeData] = useState<any>(null);
  const [animeTitle, setAnimeTitle] = useState('');
  const [animeImg, setAnimeImg] = useState('');
  const [rawTitle, setRawTitle] = useState('');
  const [rawTitleEnglish, setRawTitleEnglish] = useState('');

  // New state to manage the servers parsed from your new JSON layout
  const [servers, setServers] = useState<any[]>([]);

  const displayTitle = titleLang === 'en' && rawTitleEnglish ? rawTitleEnglish : (rawTitle || animeTitle);
  const episodeDisplay = React.useMemo(() => {
    if (!episodeData?.title) return '';
    const match = episodeData.title.match(/Episode\s*(\d+(\.\d+)?)/i);
    return match ? `Episode ${match[1]}` : episodeData.title;
  }, [episodeData]);

  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [currentServer, setCurrentServer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);
  const [forceLoadIframe, setForceLoadIframe] = useState(false);
  const { saveToHistory } = useHistory();
  const { markAsWatched } = useWatchedEpisodes();
  const activeEpisodeRef = React.useRef<HTMLAnchorElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { prevEp, nextEp } = React.useMemo(() => {
    if (!animeData?.episodeList || animeData.episodeList.length === 0) return { prevEp: null, nextEp: null };
    
    const list = animeData.episodeList;
    const currentIndex = list.findIndex(
      (ep: any) => Number(ep.eps) === Number(episode)
    );
    
    if (currentIndex === -1) return { prevEp: null, nextEp: null };
    
    const next = currentIndex > 0 ? list[currentIndex - 1] : null;
    const prev = currentIndex < list.length - 1 ? list[currentIndex + 1] : null;
    
    return { prevEp: prev, nextEp: next };
  }, [animeData, episode]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (activeEpisodeRef.current && scrollContainerRef.current && !loading) {
      timeoutId = setTimeout(() => {
        activeEpisodeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [episode, loading, animeData]);

  useEffect(() => {
    const saved = localStorage.getItem('theaterMode');
    if (saved === 'true') {
      setIsTheaterMode(true);
    }
  }, []);

  const toggleTheaterMode = useCallback(() => {
    setIsTheaterMode(prev => {
      const newValue = !prev;
      localStorage.setItem('theaterMode', String(newValue));
      return newValue;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        toggleTheaterMode();
      }
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        setIsCinemaMode(prev => !prev);
      }
      if (e.key.toLowerCase() === 'n' && e.shiftKey && nextEp) {
        router.push(`/watch/${animeId}/${type}/${nextEp.eps}`);
      }
      if (e.key.toLowerCase() === 'p' && e.shiftKey && prevEp) {
        router.push(`/watch/${animeId}/${type}/${prevEp.eps}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCinemaMode, toggleTheaterMode, prevEp, nextEp, router, animeId, type]);

  const [historySaved, setHistorySaved] = useState(false);
  
  useEffect(() => {
    setHistorySaved(false);
  }, [episode]);

  useEffect(() => {
    if (!episodeData || historySaved) return;
    saveToHistory({
      animeId,
      animeTitle: rawTitle || animeTitle,
      animeTitleEnglish: rawTitleEnglish || undefined,
      animeImage: animeImg,
      lastEpisodeId: episode,
      lastEpisodeTitle: episodeData.title || `Episode ${episode}`,
    });
    markAsWatched(animeId, episode);
    setHistorySaved(true);
  }, [episodeData, rawTitle, rawTitleEnglish, animeId, displayTitle, animeImg, episode, saveToHistory, markAsWatched, historySaved]);

  const fetchEpisode = useCallback(async () => {
    if (!animeId || !episode) return;

    setLoading(true);

    try {
      const data = await getWatch(
        "anikoto",
        Number(animeId),
        type,
        `anikoto-${episode}`
      );
      
      setEpisodeData(data);

      // Dig out the stream items from your new format container (fallback to sub/dub keys depending on layout)
      const targetContainer = data?.sdub || data?.sub || data?.dub || data;
      const streamList = targetContainer?.streams || [];

      if (streamList.length > 0) {
        setServers(streamList);

        // Find the designated default stream item, or use an embed setup first if your layout uses clean iframe embeds
        const defaultStream = streamList.find((s: any) => s.default === true) || 
                              streamList.find((s: any) => s.type === 'embed') || 
                              streamList[0];

        setCurrentServer(defaultStream.server || 'Primary');
        setCurrentUrl(defaultStream.url);
      }

      const anime = await getAnimeById(animeId);
      if (anime) {
        setAnimeTitle(anime.title?.english || anime.title?.romaji || "");
        setAnimeImg(anime.coverImage?.extraLarge || "");
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [animeId, type, episode]);

  const fetchAnimeDataFrom = useCallback(async () => {
    try {
      const data = await getEpisodes(Number(animeId));

      const providerEpisodes =
        type === "dub"
          ? data?.anikoto?.episodes?.dub
          : data?.anikoto?.episodes?.sub;

      setAnimeData({
        episodeList: (providerEpisodes || []).map((ep: any) => ({
          episodeId: ep.number,
          eps: ep.number,
          title: ep.title
        }))
      });
    } catch (err) {
      console.error(err);
    }
  }, [animeId, type]);

  useEffect(() => {
    fetchEpisode();
  }, [fetchEpisode]);
  
  useEffect(() => {
    fetchAnimeDataFrom();
  }, [fetchAnimeDataFrom]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-96 mb-6 rounded-none" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-x-8 gap-y-6">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (!episodeData) return (
    <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
      <h2 className="text-xl font-bold">Episode not found</h2>
      <Link href="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs Status Bar */}
      <div
        className="flex items-center gap-3 bg-card px-5 py-2.5 mb-6 relative overflow-hidden text-[10px] font-black uppercase tracking-[0.2em] text-muted-text w-max max-w-full shadow-lg"
        style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
      >
        <div className="relative z-10 flex items-center space-x-2 whitespace-nowrap overflow-hidden pr-2">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-secondary" />
          <Link href={`/anime/${animeId}`} className="hover:text-foreground truncate max-w-[120px] sm:max-w-[200px] transition-colors">{displayTitle}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-secondary" />
          <span className="text-secondary truncate max-w-[150px] sm:max-w-[300px]">{episodeDisplay || displayTitle}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-x-8 gap-y-6">
        {/* Cinema Mode Overlay */}
        {isCinemaMode && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] transition-all duration-500 cursor-pointer"
            onClick={() => setIsCinemaMode(false)}
            onMouseEnter={() => setShowExitHint(true)}
            onMouseLeave={() => setShowExitHint(false)}
          />
        )}

        {/* Main Content: Video Player */}
        <motion.div layout transition={{ duration: 0.1, ease: 'easeInOut' }} className={`self-start ${isCinemaMode ? 'relative z-[60]' : ''} ${isTheaterMode ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <div className={`relative aspect-video bg-black border-b-4 border-secondary/20 shadow-2xl overflow-hidden group transition-all duration-500 ${isCinemaMode ? 'shadow-[0_0_50px_rgba(34,197,94,0.15)] ring-1 ring-secondary/30' : ''}`}>
            {serverLoading && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Renew className="w-10 h-10 text-secondary animate-spin" />
              </div>
            )}
            
            {currentUrl ? (
              /* Notice: Standard HLS files (.m3u8) don't load naturally inside iframe sources. 
                 This uses your LazyIframe component perfectly for embed files, or if your iframe loader is custom-coded for streaming files. */
              <LazyIframe
                src={currentUrl}
                title="Episode Video Player"
                poster={animeImg}
                overlayText={episodeDisplay ? `PLAY ${episodeDisplay.toUpperCase()}` : "PLAY EPISODE"}
                className="absolute inset-0 w-full h-full"
                forceLoad={forceLoadIframe}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Video className="w-12 h-12 text-muted-text mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-text">Video source offline</p>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4 mt-4">
            <div className="px-6 py-4 bg-card shadow-lg relative overflow-hidden group flex-grow" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
              <h1 className="text-xl font-serif font-black tracking-tighter uppercase leading-tight">{displayTitle}{episodeDisplay ? ` ${episodeDisplay}` : ''}</h1>
              <p className="text-secondary font-bold text-xs mt-2 tracking-[0.3em] uppercase opacity-60 flex items-center">
                <ServerDns className="w-3 h-3 mr-2" />
                Streaming from {currentServer || 'Primary Server'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sidebar: Controls & Info */}
        <div className={`w-full ${isTheaterMode ? 'lg:col-span-2 grid lg:grid-cols-[350px_1fr] lg:gap-8 lg:items-stretch space-y-8 lg:space-y-0' : 'lg:col-span-1 lg:col-start-2 lg:row-span-2 space-y-8'} shrink-0`}>
          <div className="bg-card/50 border-l-4 border-secondary/50 p-6 space-y-4 relative overflow-hidden" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <div className="flex items-center space-x-2 border-b border-border pb-3 mb-4">
              <div className="w-1 h-4 bg-secondary" />
              <Grid className="w-3.5 h-3.5 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Navigation</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href={prevEp ? `/watch/${animeId}/${type}/${prevEp.eps}` : '#'} className={cn("btn-accent w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center", !prevEp && "opacity-30 pointer-events-none")}>
                Prev
              </Link>
              <Link href={nextEp ? `/watch/${animeId}/${type}/${nextEp.eps}` : '#'} className={cn("btn-primary w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center", !nextEp && "opacity-30 pointer-events-none")}>
                Next
              </Link>
            </div>

            {animeData?.episodeList && animeData.episodeList.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-text">All Episodes</h4>
                <div ref={scrollContainerRef} className="grid grid-cols-5 gap-2 max-h-[130px] overflow-y-auto pr-2 custom-scrollbar">
                  {animeData.episodeList.map((ep: any, index: number) => {
                    const epMatch = ep.title.match(/Episode\s+(\d+(\.\d+)?)/i);
                    const epNum = epMatch ? epMatch[1] : (index + 1);
                    const isActive = Number(ep.eps) === Number(episode);

                    return (
                      <Link
                        key={ep.episodeId}
                        ref={isActive ? activeEpisodeRef : null}
                        href={`/watch/${animeId}/${type}/${ep.eps}`}
                        className={cn("w-full aspect-square flex items-center justify-center text-xs font-bold transition-all", isActive ? 'bg-secondary text-background pointer-events-none' : 'bg-background hover:bg-secondary/20 border border-border text-foreground/70')}
                        title={ep.title}
                      >
                        {epNum}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Servers Panel - Remapped dynamically using your stream array */}
          <div className="bg-card/50 border-l-4 border-secondary/30 p-6 space-y-6 relative" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <div className="flex items-center space-x-2 border-b border-border pb-3 mb-4">
              <div className="w-1 h-4 bg-secondary" />
              <Video className="w-3.5 h-3.5 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Video Servers</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {servers.map((server: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentUrl(server.url);
                    setCurrentServer(`${server.server} (${server.type})`);
                  }}
                  className={cn(
                    "px-3 py-2 bg-background/50 border-l-2 text-[10px] font-bold uppercase tracking-tighter hover:bg-secondary/10 transition-all",
                    currentUrl === server.url ? "border-secondary text-secondary" : "border-secondary/20"
                  )}
                >
                  {server.server} <span className="text-[8px] opacity-60">[{server.type}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
