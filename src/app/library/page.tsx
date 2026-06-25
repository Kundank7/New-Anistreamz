'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHistory } from '@/lib/hooks/useHistory';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { useWatchedEpisodes } from '@/lib/hooks/useWatchedEpisodes';
import { AnimeCard, AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { Bookmark, Time, TrashCan, CaretRight, Grid, CheckboxChecked, Checkmark } from '@carbon/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';

type TabType = 'watchlist' | 'history';
type DeleteActionType = 'all' | 'bulk' | null;

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pb-12">
        <div className="anime-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimeCardSkeleton key={i} forceGrid={true} />
          ))}
        </div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}

function LibraryContent() {
  const { history, removeFromHistory, removeMultipleFromHistory } = useHistory();
  const { watchlist, removeFromWatchlist, removeMultipleFromWatchlist } = useWatchlist();
  const { getWatchedCount, resetAnime } = useWatchedEpisodes();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
  const [mounted, setMounted] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteAction, setDeleteAction] = useState<DeleteActionType>(null);

  useEffect(() => {
    setMounted(true);
    
    // 1. Check URL param first (priority)
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam === 'history' || tabParam === 'watchlist') {
      setActiveTab(tabParam);
      localStorage.setItem('library_active_tab', tabParam);
      return;
    }

    // 2. Check localStorage if no URL param
    const savedTab = localStorage.getItem('library_active_tab') as TabType;
    if (savedTab === 'history' || savedTab === 'watchlist') {
      setActiveTab(savedTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('library_active_tab', tab);
    
    // Update URL without full refresh to stay in sync
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/library?${params.toString()}`, { scroll: false });
    
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const toggleSelection = (animeId: string) => {
    setSelectedIds(prev => 
      prev.includes(animeId) ? prev.filter(id => id !== animeId) : [...prev, animeId]
    );
  };

  const executeDelete = () => {
    if (deleteAction === 'all') {
      localStorage.removeItem('anime_history');
      localStorage.removeItem('anime_watched_episodes');
      window.dispatchEvent(new Event('history_updated'));
      window.dispatchEvent(new Event('watched_updated'));
      toast.error('History Cleared', {
        description: 'All your watch history has been permanently removed.',
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    } else if (deleteAction === 'bulk') {
      if (selectedIds.length > 0) {
        if (activeTab === 'watchlist') {
          removeMultipleFromWatchlist(selectedIds);
        } else {
          selectedIds.forEach(id => resetAnime(id));
          removeMultipleFromHistory(selectedIds);
        }
        setIsSelectionMode(false);
        setSelectedIds([]);
      }
    }
    setDeleteAction(null);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-border pb-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
              <Grid className="w-8 h-8 relative z-10" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-secondary font-mono font-black text-xl leading-none mb-1">{'//'} MY LIBRARY</span>
              <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">
                {activeTab === 'watchlist' ? 'Watchlist' : 'History'}
                <span className="text-secondary">_</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleTabChange('watchlist')}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                activeTab === 'watchlist' 
                  ? "bg-secondary/10 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                  : "bg-card/50 text-muted-text border border-border hover:border-secondary/30 hover:text-foreground"
              )}
            >
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full transition-all",
                activeTab === 'watchlist' ? "bg-secondary scale-x-100" : "bg-secondary scale-x-0 group-hover:scale-x-100"
              )} />
              <Bookmark className="w-4 h-4" />
              <span>Watchlist</span>
            </button>
            <button 
              onClick={() => handleTabChange('history')}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                activeTab === 'history' 
                  ? "bg-secondary/10 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                  : "bg-card/50 text-muted-text border border-border hover:border-secondary/30 hover:text-foreground"
              )}
            >
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full transition-all",
                activeTab === 'history' ? "bg-secondary scale-x-100" : "bg-secondary scale-x-0 group-hover:scale-x-100"
              )} />
              <Time className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>
        
        {/* Bulk Action Controls */}
        {((activeTab === 'watchlist' && watchlist.length > 0) || (activeTab === 'history' && history.length > 0)) && (
          <div className={cn(
            "flex flex-wrap items-center justify-end gap-3",
            isSelectionMode
              ? "fixed bottom-[100px] left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto z-[45]"
              : "relative"
          )}>
            {isSelectionMode ? (
              <>
                <button 
                  onClick={() => setDeleteAction('bulk')}
                  disabled={selectedIds.length === 0}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.5)] md:shadow-none",
                    selectedIds.length > 0
                      ? "bg-danger hover:bg-danger/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-card/90 text-muted-text cursor-not-allowed"
                  )}
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <TrashCan className="w-4 h-4 shrink-0" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
                <button 
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-6 py-3 bg-card border border-border hover:border-foreground/30 text-foreground transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.5)] md:shadow-none"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {activeTab === 'history' && history.length > 0 && (
                  <Tooltip content="Irreversible Action" position="bottom" className="!border-danger !text-danger !shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <button 
                      onClick={() => setDeleteAction('all')}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                      style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                    >
                    <TrashCan className="w-4 h-4 shrink-0" />
                    <span>Clear All</span>
                    </button>
                  </Tooltip>
                )}
                <Tooltip content="Select multiple items for bulk deletion" position="bottom">
                  <button 
                    onClick={() => setIsSelectionMode(true)}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-secondary text-background hover:bg-secondary/90 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  >
                    <CheckboxChecked className="w-4 h-4" />
                    <span>Select Items</span>
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {/* Watchlist View */}
        {activeTab === 'watchlist' && (
          watchlist.length === 0 ? (
            <EmptyState 
              icon={Bookmark} 
              title="Watchlist is empty" 
              subtitle="Save anime to watch later" 
            />
          ) : (
            <div className="anime-grid">
              {watchlist.map((item) => (
                <div 
                  key={item.animeId} 
                  className={cn(
                    "relative transition-all duration-300",
                    !isSelectionMode && "group",
                    isSelectionMode && "group/sel cursor-pointer hover:scale-[1.02] hover:z-10",
                    isSelectionMode && selectedIds.includes(item.animeId) ? "ring-2 ring-secondary ring-offset-4 ring-offset-background scale-[1.02]" : ""
                  )}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(item.animeId);
                  }}
                >
                  <div className={cn("transition-all duration-300", isSelectionMode ? "pointer-events-none opacity-50 group-hover/sel:opacity-80" : "")}>
                    <AnimeCard
                      id={item.animeId}
                      title={item.animeTitle}
                      titleEnglish={item.animeTitleEnglish}
                      image={item.animeImage}
                      hideBookmark={true}
                      disableHover={isSelectionMode}
                      forceGrid={true}
                    />
                  </div>

                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 transition-all duration-300",
                        selectedIds.includes(item.animeId) 
                          ? "bg-secondary border-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                          : "border-border0 text-muted-text bg-black/50 group-hover/sel:border-secondary/50 group-hover/sel:text-secondary/50"
                      )}
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                        <CheckboxChecked className={cn("w-6 h-6", selectedIds.includes(item.animeId) ? "fill-current" : "")} />
                      </div>
                    </div>
                  )}

                  {!isSelectionMode && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Remove Item" position="left" className="!border-danger !text-danger !text-[9px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(item.animeId);
                          }}
                          className="w-8 h-8 bg-danger/80 text-white flex items-center justify-center hover:bg-danger/80 border border-border"
                          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                        >
                          <TrashCan className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* History View */}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <EmptyState 
              icon={Time} 
              title="No history detected" 
              subtitle="Start watching to track progress" 
            />
          ) : (
            <div className="anime-grid">
              {history.map((item) => (
                <div 
                  key={item.animeId} 
                  className={cn(
                    "relative transition-all duration-300",
                    !isSelectionMode && "group",
                    isSelectionMode && "group/sel cursor-pointer hover:scale-[1.02] hover:z-10",
                    isSelectionMode && selectedIds.includes(item.animeId) ? "ring-2 ring-secondary ring-offset-4 ring-offset-background scale-[1.02]" : ""
                  )}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(item.animeId);
                  }}
                >
                  <div className={cn("transition-all duration-300", isSelectionMode ? "pointer-events-none opacity-50 group-hover/sel:opacity-80" : "")}>
                    <AnimeCard
                      id={item.animeId}
                      title={item.animeTitle}
                      titleEnglish={item.animeTitleEnglish}
                      image={item.animeImage}
                      hideBookmark={true}
                      disableHover={isSelectionMode}
                      forceGrid={true}
                    />
                    
                    <Link 
                      href={`/watch/${item.lastEpisodeId}`}
                      onClick={(e) => { if (isSelectionMode) e.preventDefault(); }}
                      className="mt-3 p-3 bg-card border border-secondary/10 hover:border-secondary/50 transition-all relative block group/card"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-center justify-between mb-1.5 relative z-10">
                        <p className="text-[9px] text-muted-text font-black uppercase tracking-[0.2em]">
                          Resume Point
                        </p>
                        {(() => {
                          const wc = getWatchedCount(item.animeId);
                          return wc > 0 ? (
                            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-secondary">
                              <Checkmark className="hidden sm:block w-2.5 h-2.5 fill-current" />
                              {wc} watched
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[11px] font-bold truncate pr-3 group-hover/card:text-secondary transition-colors uppercase tracking-widest leading-relaxed">
                          Episode {item.lastEpisodeTitle.match(/Episode\s*(\d+)/i)?.[1] || item.lastEpisodeTitle.match(/(\d+)/)?.[0] || '??'}
                        </span>
                        <div className="w-6 h-6 bg-secondary/10 flex items-center justify-center group-hover/card:bg-secondary/20 transition-colors shrink-0">
                          <CaretRight className="w-3 h-3 text-secondary fill-current" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 transition-all duration-300",
                        selectedIds.includes(item.animeId) 
                          ? "bg-secondary border-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                          : "border-border0 text-muted-text bg-black/50 group-hover/sel:border-secondary/50 group-hover/sel:text-secondary/50"
                      )}
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                        <CheckboxChecked className={cn("w-6 h-6", selectedIds.includes(item.animeId) ? "fill-current" : "")} />
                      </div>
                    </div>
                  )}

                  {/* Delete Button (Top Right) */}
                  {!isSelectionMode && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Remove Item" position="left" className="!border-danger !text-danger !text-[9px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetAnime(item.animeId);
                            removeFromHistory(item.animeId);
                          }}
                          className="w-8 h-8 bg-danger/80 text-white flex items-center justify-center hover:bg-danger/80 border border-border"
                          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                        >
                          <TrashCan className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal
        isOpen={deleteAction !== null}
        onClose={() => setDeleteAction(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <h2 className="text-danger text-xs font-mono font-black uppercase tracking-[0.4em]">
              Delete <span className="text-foreground/50">//</span> Confirm Action
            </h2>
          </div>
        }
        footer={
          <>
            <button
              onClick={() => setDeleteAction(null)}
              className="px-4 py-2 font-black uppercase text-xs tracking-widest text-muted-text hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-danger hover:bg-danger/80 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
            >
              <TrashCan className="w-4 h-4" />
              <span>Confirm Delete</span>
            </button>
          </>
        }
      >
        <p className="text-muted-text">
          {deleteAction === 'all' 
            ? "Are you sure you want to clear your entire watch history? This action cannot be undone."
            : `Are you sure you want to delete the selected ${selectedIds.length} item(s)?`}
        </p>
      </Modal>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-card/30 border-y border-secondary/20 relative"
      style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
    >
      <div 
        className="w-20 h-20 bg-card flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] border border-secondary/30"
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
      >
        <Icon className="w-10 h-10 text-foreground/20" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold uppercase">{title}</h2>
        <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
      <Link href="/" className="btn-primary mt-4 inline-block">
        Browse Anime
      </Link>
    </div>
  );
}
