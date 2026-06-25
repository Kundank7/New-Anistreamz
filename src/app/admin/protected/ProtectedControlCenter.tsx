'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateProtectedAnimeData, getAnimeEpisodes, getOrphanedEpisodes, unlinkEpisode, attachEpisode } from '../actions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Edit, Link, Unlink, Checkmark, Close, Add, Renew } from '@carbon/icons-react';
import { Checkbox } from '@/components/ui/Checkbox';

export function ProtectedControlCenter({ initialData }: { initialData: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  
  // Editing states
  const [editData, setEditData] = useState<any>({});
  const [autoSync, setAutoSync] = useState(false);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [orphanedEpisodes, setOrphanedEpisodes] = useState<any[]>([]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleEditClick = async (anime: any) => {
    setSelectedAnime(anime);
    setEditData({
      title: anime.title || '',
      slug: anime.slug || '',
      synopsis: anime.synopsis || '',
      anilist_id: anime.anilist_id || '',
      poster: anime.poster || '',
      duration_minutes: anime.duration_minutes || '',
      episodes_count: anime.episodes_count || '',
      score: anime.score || '',
      status: anime.status || '',
      type: anime.type || '',
      source: anime.source || '',
      season: anime.season || '',
      studios: anime.studios || '',
      aired: anime.aired || '',
      rating: anime.rating || '',
      banner: anime.banner || '',
    });
    setAutoSync(false);
    
    // Fetch episodes and orphaned
    const eps = await getAnimeEpisodes(anime.id);
    const orphaned = await getOrphanedEpisodes();
    setEpisodes(eps);
    setOrphanedEpisodes(orphaned);
    
    setShowModal(true);
  };

  const handleSaveMetadata = () => {
    startTransition(async () => {
      let submitData = { ...editData };
      const anilistId = submitData.anilist_id ? parseInt(submitData.anilist_id) : null;
      const slug = submitData.slug;
      
      delete submitData.anilist_id;
      delete submitData.slug;

      if (autoSync) {
        submitData = {}; // Clear to only update ID
      }
      
      const result = await updateProtectedAnimeData(selectedAnime.id, anilistId, slug, submitData);
      
      if (result.success) {
        toast.success(autoSync ? 'Metadata auto-sync triggered' : 'Metadata updated manually');
        setShowModal(false);
      } else {
        toast.error(`Failed to update: ${result.error}`);
      }
    });
  };

  const handleUnlink = async (episodeId: number) => {
    startTransition(async () => {
      const result = await unlinkEpisode(episodeId);
      if (result.success) {
        toast.success('Episode unlinked successfully');
        // Refresh local state
        setEpisodes(episodes.filter(e => e.id !== episodeId));
        const updatedOrphaned = await getOrphanedEpisodes();
        setOrphanedEpisodes(updatedOrphaned);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  const handleAttach = async (episodeId: number) => {
    startTransition(async () => {
      const result = await attachEpisode(selectedAnime.id, episodeId);
      if (result.success) {
        toast.success('Episode attached successfully');
        // Refresh local state
        const eps = await getAnimeEpisodes(selectedAnime.id);
        const orphaned = await getOrphanedEpisodes();
        setEpisodes(eps);
        setOrphanedEpisodes(orphaned);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border border-border bg-card/30">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
            <tr>
              <th className="px-4 py-3 font-normal">ID</th>
              <th className="px-4 py-3 font-normal">Title / Slug</th>
              <th className="px-4 py-3 font-normal">AniList ID</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-text font-mono">
                  No protected anime found.
                </td>
              </tr>
            ) : (
              data.map((anime) => (
                <tr key={anime.id} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-text">#{anime.id}</td>
                  <td className="px-4 py-3 font-medium max-w-[300px] truncate">
                    <div className="flex flex-col">
                      <span className="truncate">{anime.title}</span>
                      <span className="text-[10px] text-muted-text font-mono mt-0.5 truncate">{anime.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs ${anime.anilist_id ? 'text-secondary' : 'text-danger'}`}>
                      {anime.anilist_id || 'NULL'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEditClick(anime)}
                      className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white dark:hover:text-black border border-secondary/50 text-[10px] uppercase tracking-widest transition-colors font-bold inline-flex items-center gap-1.5"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        size="xl" 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={
          <div className="flex items-center gap-3 flex-1 overflow-hidden mr-4">
            <div className="w-1.5 h-6 bg-secondary shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0" />
            <h2 className="text-secondary text-xs font-mono font-black uppercase tracking-[0.4em] truncate">
              Manage <span className="text-foreground/50">//</span> {selectedAnime?.title || 'Anime'}
            </h2>
          </div>
        }
      >
        <div className="space-y-8 pb-4">
          
          {/* Metadata Section */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest font-bold text-secondary border-b border-border pb-2">Metadata Configuration</h3>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                id="autoSync"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                label="Auto-Sync Metadata with AniList (Uses AniList ID)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">AniList ID</label>
                <input
                  type="number"
                  value={editData.anilist_id}
                  onChange={e => setEditData({ ...editData, anilist_id: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Slug (Must be unique)</label>
                <input
                  type="text"
                  value={editData.slug}
                  onChange={e => setEditData({ ...editData, slug: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            {!autoSync && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Duration (mins)</label>
                    <input
                      type="number"
                      value={editData.duration_minutes}
                      onChange={e => setEditData({ ...editData, duration_minutes: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Episodes Count</label>
                    <input
                      type="number"
                      value={editData.episodes_count}
                      onChange={e => setEditData({ ...editData, episodes_count: e.target.value })}
                      placeholder="e.g. 24"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Score</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editData.score}
                      onChange={e => setEditData({ ...editData, score: e.target.value })}
                      placeholder="e.g. 8.7"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Status</label>
                    <input
                      type="text"
                      value={editData.status}
                      onChange={e => setEditData({ ...editData, status: e.target.value })}
                      placeholder="e.g. Finished Airing"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Type</label>
                    <input
                      type="text"
                      value={editData.type}
                      onChange={e => setEditData({ ...editData, type: e.target.value })}
                      placeholder="e.g. TV"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Source</label>
                    <input
                      type="text"
                      value={editData.source}
                      onChange={e => setEditData({ ...editData, source: e.target.value })}
                      placeholder="e.g. Manga"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Season</label>
                    <input
                      type="text"
                      value={editData.season}
                      onChange={e => setEditData({ ...editData, season: e.target.value })}
                      placeholder="e.g. Fall 2023"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Studios</label>
                    <input
                      type="text"
                      value={editData.studios}
                      onChange={e => setEditData({ ...editData, studios: e.target.value })}
                      placeholder="e.g. MAPPA"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Aired</label>
                    <input
                      type="text"
                      value={editData.aired}
                      onChange={e => setEditData({ ...editData, aired: e.target.value })}
                      placeholder="e.g. 2023-10-01"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Rating</label>
                    <input
                      type="text"
                      value={editData.rating}
                      onChange={e => setEditData({ ...editData, rating: e.target.value })}
                      placeholder="e.g. PG-13"
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Poster URL</label>
                    <input
                      type="text"
                      value={editData.poster}
                      onChange={e => setEditData({ ...editData, poster: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Banner URL</label>
                  <input
                    type="text"
                    value={editData.banner}
                    onChange={e => setEditData({ ...editData, banner: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Synopsis</label>
                  <textarea
                    value={editData.synopsis}
                    onChange={e => setEditData({ ...editData, synopsis: e.target.value })}
                    rows={4}
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors custom-scrollbar"
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={handleSaveMetadata}
              disabled={isPending}
              className="w-full py-2.5 bg-secondary text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] hover:opacity-80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
            >
              <Checkmark className="w-4 h-4" /> Save Metadata
            </button>
          </div>

          {/* Episodes Section */}
          <div className="space-y-4 pt-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-secondary border-b border-border pb-2">Linked Episodes ({episodes.length})</h3>
            <div className="max-h-48 overflow-y-auto border border-border bg-background">
              {episodes.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-text font-mono">No linked episodes</p>
              ) : (
                <ul className="divide-y divide-border">
                  {episodes.map(ep => (
                    <li key={ep.id} className="flex items-center justify-between p-3 hover:bg-card/30">
                      <div className="flex flex-col">
                        <span className="text-sm">Eps {ep.eps_number} - {ep.title}</span>
                        <span className="text-[10px] text-muted-text font-mono">{ep.slug}</span>
                      </div>
                      <button
                        onClick={() => handleUnlink(ep.id)}
                        disabled={isPending}
                        className="p-1.5 text-danger/80 hover:text-red-300 hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-all disabled:opacity-50 tooltip-trigger"
                        title="Unlink Episode"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Orphaned Episodes Section */}
          <div className="space-y-4 pt-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-secondary border-b border-border pb-2">Attach Orphaned Episodes</h3>
            <div className="max-h-48 overflow-y-auto border border-border bg-background">
              {orphanedEpisodes.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-text font-mono">No orphaned episodes found</p>
              ) : (
                <ul className="divide-y divide-border">
                  {orphanedEpisodes.map(ep => (
                    <li key={ep.id} className="flex items-center justify-between p-3 hover:bg-card/30">
                      <div className="flex flex-col">
                        <span className="text-sm text-yellow-500/80">Eps {ep.eps_number} - {ep.title}</span>
                        <span className="text-[10px] text-muted-text font-mono">{ep.slug}</span>
                      </div>
                      <button
                        onClick={() => handleAttach(ep.id)}
                        disabled={isPending}
                        className="px-3 py-1 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white dark:hover:text-black border border-secondary/50 text-[10px] uppercase tracking-widest transition-colors font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Link className="w-3 h-3" /> Attach
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Spacer for bottom corner L-Shape */}
            <div className="h-4" />
          </div>

        </div>
      </Modal>
    </div>
  );
}
