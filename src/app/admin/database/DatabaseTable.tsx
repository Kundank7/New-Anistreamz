'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateAnimeMapping, deleteAnime, addAnimeMinimal, toggleProtectedStatus } from '../actions';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Renew, Checkmark, Close, ChevronLeft, ChevronRight, TrashCan, Add, Locked } from '@carbon/icons-react';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

type AnimeRow = {
  id: number;
  slug: string;
  title: string;
  source: string;
  mal_id: number | null;
  anilist_id: number | null;
  is_fully_scraped: number;
  is_protected: number;
  last_updated: string;
};

interface DatabaseTableProps {
  initialData: AnimeRow[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentSort: string;
  currentOrder: string;
  currentSource?: string;
}

export function DatabaseTable({ 
  initialData, 
  total, 
  totalPages, 
  currentPage, 
  currentSearch, 
  currentSort, 
  currentOrder,
  currentSource = ''
}: DatabaseTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{malId: string, anilistId: string}>({ malId: '', anilistId: '' });
  const [animeToDelete, setAnimeToDelete] = useState<{id: number, title: string} | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnime, setNewAnime] = useState<{slug: string, anilistId: string}>({ slug: '', anilistId: '' });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateQuery({ search: searchValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const updateQuery = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (column: string) => {
    const isAsc = currentSort === column && currentOrder === 'asc';
    updateQuery({ sort: column, order: isAsc ? 'desc' : 'asc' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateQuery({ page: newPage });
    }
  };

  const startEditing = (anime: AnimeRow) => {
    setEditingId(anime.id);
    setEditValues({
      malId: anime.mal_id ? String(anime.mal_id) : '',
      anilistId: anime.anilist_id ? String(anime.anilist_id) : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ malId: '', anilistId: '' });
  };

  const saveMapping = (id: number, resync: boolean) => {
    const malIdParsed = editValues.malId ? parseInt(editValues.malId, 10) : null;
    const anilistIdParsed = editValues.anilistId ? parseInt(editValues.anilistId, 10) : null;

    startTransition(async () => {
      const result = await updateAnimeMapping(id, malIdParsed, anilistIdParsed, resync);
      if (result.success) {
        toast.success(`Mapping saved${resync ? ' & resync triggered' : ''}`);
        setEditingId(null);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  const handleAddAnime = () => {
    startTransition(async () => {
      const anilistParsed = newAnime.anilistId ? parseInt(newAnime.anilistId, 10) : null;
      const result = await addAnimeMinimal(newAnime.slug, anilistParsed);
      if (result.success) {
        toast.success(result.message);
        setShowAddModal(false);
        setNewAnime({ slug: '', anilistId: '' });
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  const handleToggleProtected = (id: number, currentStatus: number) => {
    startTransition(async () => {
      const newStatus = !currentStatus;
      const result = await toggleProtectedStatus(id, newStatus);
      if (result.success) {
        toast.success(`Anime ${newStatus ? 'protected' : 'unprotected'} successfully`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  const handleDelete = (id: number, title: string) => {
    setAnimeToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (!animeToDelete) return;
    startTransition(async () => {
      const result = await deleteAnime(animeToDelete.id);
      if (result.success) {
        toast.success(result.message || `Anime deleted successfully`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
      setAnimeToDelete(null);
    });
  };

  const renderSortIcon = (column: string) => {
    if (currentSort !== column) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronDown /></div>;
    return currentOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card border border-border p-4">
        {/* Left: Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input 
              type="text" 
              placeholder="Search by Title or Slug..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-secondary transition-colors placeholder:text-muted-text"
            />
          </div>
          <div className="w-full sm:w-[220px]">
            <CustomSelect
              value={currentSource}
              onChange={(val) => updateQuery({ source: val, page: 1 })}
              options={[
                { value: "", label: "All Sources" },
                { value: "ORIGINAL", label: "Original" },
                { value: "MANGA", label: "Manga" },
                { value: "LIGHT NOVEL", label: "Light Novel" },
                { value: "VISUAL NOVEL", label: "Visual Novel" },
                { value: "VIDEO GAME", label: "Video Game" },
                { value: "OTHER", label: "Other" }
              ]}
              placeholder="All Sources"
            />
          </div>
        </div>
        
        {/* Right: Info & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between xl:justify-end gap-4 w-full xl:w-auto">
          <div className="text-xs font-mono text-muted-text">
            Showing <span className="text-secondary font-black">{initialData.length}</span> of {total} entries
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tooltip content="Refresh Data" position="bottom">
            <button
              onClick={() => startTransition(() => router.refresh())}
              disabled={isPending}
              className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2.5 bg-card hover:bg-card/80 border border-border hover:border-secondary/50 text-muted-text hover:text-secondary text-xs uppercase font-bold tracking-widest transition-colors"
            >
              <Renew className={cn("w-4 h-4", isPending && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            </Tooltip>
            <Tooltip content="Add New Anime" position="bottom">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-6 py-2.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white dark:hover:text-black border border-secondary/50 text-xs uppercase font-bold tracking-widest transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]"
            >
              <Add className="w-4 h-4" />
              <span>Add Anime</span>
            </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-border bg-card/30">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
            <tr>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group w-12 text-center" onClick={() => handleSort('is_protected')}>
                <div className="flex items-center justify-center gap-2"><Locked className="w-4 h-4 text-secondary" /></div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-2">ID {renderSortIcon('id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-2">Title / Slug {renderSortIcon('title')}</div>
              </th>
              <th className="px-4 py-3 font-normal text-muted-text">
                <div className="flex items-center gap-2">Source</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('mal_id')}>
                <div className="flex items-center gap-2">MAL ID {renderSortIcon('mal_id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('anilist_id')}>
                <div className="flex items-center gap-2">AniList ID {renderSortIcon('anilist_id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('last_updated')}>
                <div className="flex items-center gap-2">Last Updated {renderSortIcon('last_updated')}</div>
              </th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-text font-mono">
                  No records found matching your query.
                </td>
              </tr>
            ) : (
              initialData.map((anime) => {
                const isEditing = editingId === anime.id;
                
                return (
                  <tr key={anime.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3 text-center border-r border-border w-12">
                      <Checkbox 
                        checked={anime.is_protected === 1}
                        onChange={() => handleToggleProtected(anime.id, anime.is_protected)}
                        disabled={isPending}
                        className="mx-auto"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-text">#{anime.id}</td>
                    <td className="px-4 py-3 font-medium max-w-[300px] truncate" title={anime.title}>
                      <div className="flex flex-col">
                        <span className="truncate">{anime.title}</span>
                        <span className="text-[10px] text-muted-text font-mono mt-0.5 truncate">{anime.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-foreground/5 text-foreground px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border border-border">
                        {anime.source}
                      </span>
                    </td>
                    
                    {/* MAL ID COLUMN */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editValues.malId}
                          onChange={(e) => setEditValues({...editValues, malId: e.target.value})}
                          placeholder="Empty"
                          className="w-24 bg-background border border-secondary/50 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className={`font-mono text-xs ${anime.mal_id ? 'text-secondary' : 'text-danger'}`}>
                          {anime.mal_id || 'NULL'}
                        </span>
                      )}
                    </td>

                    {/* ANILIST ID COLUMN */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editValues.anilistId}
                          onChange={(e) => setEditValues({...editValues, anilistId: e.target.value})}
                          placeholder="Empty"
                          className="w-24 bg-background border border-secondary/50 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className={`font-mono text-xs ${anime.anilist_id ? 'text-secondary' : 'text-danger'}`}>
                          {anime.anilist_id || 'NULL'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-text font-mono">
                      {new Date(anime.last_updated).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Cancel" position="bottom">
                          <button 
                            onClick={cancelEditing}
                            className="p-1.5 text-muted-text hover:text-foreground bg-foreground/5 hover:bg-foreground/20 transition-colors border border-transparent hover:border-border"
                          >
                            <Close className="w-4 h-4" />
                          </button>
                          </Tooltip>
                          <Tooltip content="Save Mapping" position="bottom">
                          <button 
                            onClick={() => saveMapping(anime.id, false)}
                            disabled={isPending}
                            className="p-1.5 text-secondary bg-secondary/10 hover:bg-secondary hover:text-white dark:hover:text-black transition-colors border border-secondary/30 disabled:opacity-50"
                          >
                            <Checkmark className="w-4 h-4" />
                          </button>
                          </Tooltip>
                          <Tooltip content="Save & Trigger Resync Scraper" position="bottom">
                          <button 
                            onClick={() => saveMapping(anime.id, true)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 hover:bg-secondary hover:text-white dark:hover:text-black transition-colors border border-secondary/30 flex items-center gap-1 disabled:opacity-50"
                          >
                            <Renew className="w-3.5 h-3.5" /> Save & Sync
                          </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEditing(anime)}
                            className="text-[10px] uppercase font-bold tracking-widest text-muted-text hover:text-secondary px-3 py-1.5 border border-border hover:border-secondary/50 transition-colors bg-card"
                          >
                            EDIT ID
                          </button>
                          <Tooltip content="Delete Anime" position="bottom">
                          <button
                            onClick={() => handleDelete(anime.id, anime.title)}
                            disabled={isPending}
                            className="p-1.5 text-muted-text hover:text-danger bg-card hover:bg-danger/10 transition-colors border border-border hover:border-danger/50 disabled:opacity-50"
                          >
                            <TrashCan className="w-4 h-4" />
                          </button>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-card border border-border p-4">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border hover:border-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <div className="text-xs font-mono text-muted-text">
            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border hover:border-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={animeToDelete !== null}
        onClose={() => setAnimeToDelete(null)}
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
              onClick={() => setAnimeToDelete(null)}
              className="px-4 py-2 font-black uppercase text-xs tracking-widest text-muted-text hover:text-foreground transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex items-center space-x-2 px-6 py-2.5 bg-danger hover:bg-danger/80 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
              disabled={isPending}
            >
              {isPending ? <Renew className="w-4 h-4 animate-spin" /> : <TrashCan className="w-4 h-4" />}
              <span>{isPending ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-text">
          WARNING: Are you sure you want to permanently delete <strong className="text-foreground">"{animeToDelete?.title}"</strong> (ID: {animeToDelete?.id})?
        </p>
        <p className="text-sm text-danger/80 mt-4">
          This will remove the anime and cascade delete all its episodes and metadata. This action CANNOT be undone.
        </p>
      </Modal>

      {/* Add Anime Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-secondary shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h2 className="text-secondary text-xs font-mono font-black uppercase tracking-[0.4em]">
              Insert <span className="text-foreground/50">//</span> New Anime
            </h2>
          </div>
        }
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 font-black uppercase text-xs tracking-widest text-muted-text hover:text-foreground transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleAddAnime}
              className="flex items-center space-x-2 px-6 py-2.5 bg-secondary text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
              disabled={isPending || !newAnime.slug.trim()}
            >
              {isPending ? <Renew className="w-4 h-4 animate-spin" /> : <Add className="w-4 h-4" />}
              <span>{isPending ? 'Processing...' : 'Add Anime'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-text">
            Provide the <strong className="text-secondary">Slug</strong> and optionally the <strong className="text-secondary">AniList ID</strong>. The system will automatically scrape the metadata and episodes in the background once added. The title will be temporarily generated from the slug.
          </p>
          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <label className="block text-xs uppercase font-bold tracking-widest text-secondary mb-1">Slug (Required)</label>
              <input 
                type="text" 
                value={newAnime.slug}
                onChange={(e) => setNewAnime({...newAnime, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                placeholder="e.g. naruto-shippuden"
                className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-secondary transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold tracking-widest text-muted-text mb-1">AniList ID (Optional)</label>
              <input 
                type="number" 
                value={newAnime.anilistId}
                onChange={(e) => setNewAnime({...newAnime, anilistId: e.target.value})}
                placeholder="e.g. 1735"
                className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-secondary transition-colors text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
