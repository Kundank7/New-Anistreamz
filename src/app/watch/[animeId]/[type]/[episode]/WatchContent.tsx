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

  const displayTitle = titleLang === 'en' && rawTitleEnglish ? rawTitleEnglish : (rawTitle || animeTitle);
  const episodeDisplay = React.useMemo(() => {
    if (!episodeData?.title) return `Episode ${episode}`;
    const match = episodeData.title.match(/Episode\s*(\d+(\.\d+)?)/i);
    return match ? `Episode ${match[1]}` : episodeData.title;
  }, [episodeData, episode]);

  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [currentResolution, setCurrentResolution] = useState<string>('');
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

  // Derived next/prev episodes from database list for better reliability
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

  // Auto-scroll to active episode
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

  // Load Theater Mode preference
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

  // Handle Keyboard Shortcuts
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
    if (!episodeData || !rawTitle || historySaved) return;
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
  }, [episodeData, rawTitle, rawTitleEnglish, animeId, displayTitle, animeImg, episode, saveToHistory, markAsWatched, historySaved, animeTitle]);

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
      
      // Anikoto payload nests the content inside the 'ssub' object
      const ssubData = data?.ssub;
      
      if (ssubData && ssubData.streams) {
        // Map native 'streams' to match your components structure (we prioritize type 'embed' to dodge CORS header locks)
        const mappedServers = ssubData.streams.map((s: any) => ({
          name: s.server,
          embed: s.url,
          type: s.type,
          isDefault: s.default || false
        }));

        setEpisodeData({
          title: `Episode ${episode}`,
          allServers: mappedServers,
          downloadUrl: data?.downloadUrl || null
        });

        // Auto-select preferred fallback server (Default stream or structural embed options)
        const preferredServer = 
          mappedServers.find((s: any) => s.type === "embed" && s.isDefault) ||
          mappedServers.find((s: any) => s.type === "embed") || 
          mappedServers[0];

        if (preferredServer) {
          setCurrentServer(preferredServer.name);
          setCurrentUrl(preferredServer.embed);
        }
      } else {
        setEpisodeData(null);
      }

      const anime = await getAnimeById(animeId);
      if (anime) {
        setAnimeTitle(anime.title?.english || anime.title?.romaji || "");
        setAnimeImg(anime.coverImage?.extraLarge || "");
      }
      
    } catch (err) {
      console.error(err);
      setEpisodeData(null);
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
          title: ep.title || `Episode ${ep.number}`
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
            <div className="hidden lg:flex items-center gap-4">
              <Skeleton className="flex-grow h-[76px] rounded-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }} />
              <div className="shrink-0 flex items-center gap-3">
                <Skeleton className="h-[42px] w-[42px] rounded-none" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} />
                <Skeleton className="h-[42px] w-[42px] rounded-none" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card/50 p-6 space-y-4" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-border">
                <Skeleton className="w-1 h-4 rounded-none" />
                <Skeleton className="w-3.5 h-3.5 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-[38px] rounded-none" />
                <Skeleton className="h-[38px] rounded-none" />
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-3 w-28 rounded-none" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-none" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-[42px] w-full mt-2 rounded-none" />
            </div>
            <div className="bg-card/50 p-6 space-y-6" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-border">
                <Skeleton className="w-1 h-4 rounded-none" />
                <Skeleton className="w-3.5 h-3.5 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded-none" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-[34px] w-[88px] rounded-none" />
                    <Skeleton className="h-[34px] w-[88px] rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full mt-6 rounded-none" />
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

        {isCinemaMode && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/80 border border-secondary/30 text-secondary text-[10px] font-mono font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.15)] z-[70] transition-opacity duration-300 ${showExitHint ? 'opacity-100' : 'opacity-0'}`}
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            Click to Exit Focus Mode
          </div>
        )}

        {/* Main Content: Video Player */}
        <motion.div layout transition={{ duration: 0.1, ease: 'easeInOut' }} className={`self-start ${isCinemaMode ? 'relative z-[60]' : ''} ${isTheaterMode ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          
          {/* Mobile Title */}
          <div className="lg:hidden mb-4 p-4 sm:p-5 bg-card border-l-4 border-secondary shadow-md">
            <h1 className="text-base sm:text-lg font-serif font-black tracking-tighter uppercase leading-tight">{displayTitle}{episodeDisplay ? ` ${episodeDisplay}` : ''}</h1>
            <p className="text-secondary font-bold text-[10px] mt-2 tracking-[0.2em] uppercase opacity-60">Streaming</p>
          </div>

          <div className={`relative aspect-video bg-black border-b-4 border-secondary/20 shadow-2xl overflow-hidden group transition-all duration-500 ${isCinemaMode ? 'shadow-[0_0_50px_rgba(34,197,94,0.15)] ring-1 ring-secondary/30' : ''}`}>
            {serverLoading && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Renew className="w-10 h-10 text-secondary animate-spin" />
              </div>
            )}
            {currentUrl && currentUrl !== 'No iframe found' ? (
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
            <div className="absolute inset-0 pointer-events-none border-x border-border z-10" />
          </div>

          <div className={`hidden lg:flex items-center gap-4 transition-all duration-500 self-start ${isCinemaMode ? 'relative z-[60]' : ''} ${isTheaterMode ? 'lg:col-span-1 lg:col-start-1 lg:row-start-2' : 'lg:col-span-1 lg:col-start-1 lg:row-start-2'}`}>
            <div
              className="px-6 py-4 bg-card shadow-lg relative overflow-hidden group flex-grow"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
            >
              <div className="relative z-10">
                <h1 className="text-xl font-serif font-black tracking-tighter uppercase leading-tight">{displayTitle}{episodeDisplay ? ` ${episodeDisplay}` : ''}</h1>
                <p className="text-secondary font-bold text-xs mt-2 tracking-[0.3em] uppercase opacity-60 flex items-center">
                  <ServerDns className="w-3 h-3 mr-2" />
                  Streaming from {currentServer || 'Primary Server'} {currentResolution && `• ${currentResolution}`}
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0 flex items-center gap-3">
              <Tooltip content={isTheaterMode ? 'Default View (T)' : 'Theater Mode (T)'} position="top">
                <button
                  onClick={toggleTheaterMode}
                  className={`p-3 transition-all border ${isTheaterMode ? 'bg-secondary text-white dark:text-black border-secondary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white dark:hover:text-black border-secondary/30 hover:border-secondary shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                >
                  <Theater className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content={isCinemaMode ? 'Exit Focus (F)' : 'Focus Mode (F)'} position="top">
                <button
                  onClick={() => setIsCinemaMode(!isCinemaMode)}
                  className={`p-3 transition-all border ${isCinemaMode ? 'bg-secondary text-white dark:text-black border-secondary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white dark:hover:text-black border-secondary/30 hover:border-secondary shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                >
                  <Screen className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </motion.div>

        {/* Sidebar: Controls & Info */}
        <div className={`w-full ${isTheaterMode ? 'lg:col-span-2 grid lg:grid-cols-[350px_1fr] lg:gap-8 lg:items-stretch space-y-8 lg:space-y-0' : 'lg:col-span-1 lg:col-start-2 lg:row-span-2 space-y-8'} shrink-0`}>
          <div
            className="bg-card/50 border-l-4 border-secondary/50 p-6 space-y-4 relative overflow-hidden"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <div className="flex items-center space-x-2 border-b border-border pb-3 mb-4 relative z-10">
              <div className="w-1 h-4 bg-secondary" />
              <Grid className="w-3.5 h-3.5 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Navigation</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {prevEp ? (
                <Tooltip content="Shift + P" position="top" wrapperClassName="w-full">
                  <Link
                    href={`/watch/${animeId}/${type}/${prevEp.eps}`}
                    className="btn-accent w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center"
                  >
                    Prev
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip content="Shift + P" position="top" wrapperClassName="w-full">
                  <div className="btn-accent w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center opacity-30 pointer-events-none grayscale cursor-not-allowed">
                    Prev
                  </div>
                </Tooltip>
              )}

              {nextEp ? (
                <Tooltip content="Shift + N" position="top" wrapperClassName="w-full">
                  <Link
                    href={`/watch/${animeId}/${type}/${nextEp.eps}`}
                    className="btn-primary w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center"
                  >
                    Next
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip content="Shift + N" position="top" wrapperClassName="w-full">
                  <div className="btn-primary w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center opacity-30 pointer-events-none grayscale cursor-not-allowed">
                    Next
                  </div>
                </Tooltip>
              )}
            </div>
            
            {animeData?.episodeList && animeData.episodeList.length > 0 && (
              <div className="mt-6 space-y-3 relative z-10">
                <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-text">All Episodes</h4>
                <div 
                  ref={scrollContainerRef}
                  className="grid grid-cols-5 gap-2 max-h-[130px] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {animeData.episodeList.map((ep: any, index: number) => {
                    const epMatch = ep.title.match(/Episode\s+(\d+(\.\d+)?)/i);
                    const epNum = epMatch ? epMatch[1] : (index + 1);
                    const isActive = Number(ep.eps) === Number(episode);

                    return (
                      <Link
                        key={ep.episodeId}
                        ref={isActive ? (activeEpisodeRef as any) : null}
                        href={`/watch/${animeId}/${type}/${ep.eps}`}
                        className={`w-full aspect-square flex items-center justify-center text-xs font-bold transition-all ${isActive
                            ? 'bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.3)] pointer-events-none'
                            : 'bg-background hover:bg-secondary/20 border border-border hover:border-secondary/50 text-foreground/70 hover:text-secondary'
                          }`}
                        title={ep.title}
                      >
                        {epNum}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 relative z-10">
              <Link
                href={`/anime/${animeId}`}
                className="btn-accent w-full py-3 text-[10px] tracking-[0.2em] flex justify-center items-center opacity-80 hover:opacity-100"
              >
                Back to Anime Detail
              </Link>
            </div>
          </div>

          <div
            className="bg-card/50 border-l-4 border-secondary/30 p-6 space-y-6 relative"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <div className="flex items-center space-x-2 border-b border-border pb-3 mb-4 relative z-10">
              <div className="w-1 h-4 bg-secondary" />
              <Video className="w-3.5 h-3.5 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Video Servers</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {episodeData?.allServers?.map((server: any) => (
                <button
                  key={server.name}
                  onClick={() => {
                    setCurrentUrl(server.embed);
                    setCurrentServer(server.name);
                  }}
                  className={cn(
                    "px-3 py-2 bg-background/50 border-l-2 text-[10px] font-bold uppercase tracking-tighter hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all",
                    currentServer === server.name ? "border-secondary text-secondary bg-secondary/5" : "border-secondary/20 text-foreground/70"
                  )}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Download Links */}
      {episodeData?.downloadUrl?.qualities && episodeData.downloadUrl.qualities.length > 0 && (
        <div 
          className={cn(
            "bg-card/50 border-y border-secondary/30 p-10 relative overflow-hidden mb-12",
            isTheaterMode ? "mt-6" : "mt-8 lg:mt-12"
          )}
          style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
        >
          <div className="flex flex-col items-center mb-12 relative z-10 text-center">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6 text-secondary" />
              <h3 className="text-2xl font-serif font-black uppercase tracking-widest text-foreground">Download Links<span className="text-secondary opacity-70">_</span></h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
            {episodeData.downloadUrl.qualities.map((quality: any) => (
              <div key={quality.title} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{quality.title.replace('Mp4_', '')}</span>
                  {quality.size && <span className="text-[9px] font-mono font-bold text-muted-text opacity-60 bg-foreground/5 px-1.5 py-0.5">{quality.size}</span>}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {quality.urls?.map((item: any) => (
                    <a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-background/50 border-l-2 border-secondary/20 text-[10px] font-bold uppercase tracking-tighter hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all cursor-pointer text-left"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
