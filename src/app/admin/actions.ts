'use server';

import { getSession, logout } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parseIndonesianDate } from '@/lib/utils';

const execFilePromise = promisify(execFile);
const getScriptPath = (name: string) => ['dist', `${name}.js`].join('/');

async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function getAnomalies(page: number = 1) {
  await checkAuth();
  
  if (!db) throw new Error("Database connection failed");
  const limit = 50;
  const offset = (page - 1) * limit;

  const countStmt = db.prepare('SELECT COUNT(*) as total FROM anime WHERE anilist_id IS NULL');
  const total = (countStmt.get() as any).total;

  const stmt = db.prepare('SELECT id, slug, title, type FROM anime WHERE anilist_id IS NULL ORDER BY id DESC LIMIT ? OFFSET ?');
  const rows = stmt.all(limit, offset);
  
  return { items: rows, total, totalPages: Math.ceil(total / limit) };
}

export async function getNoEpisodesAnime(page: number = 1) {
  await checkAuth();
  
  if (!db) throw new Error("Database connection failed");
  const limit = 50;
  const offset = (page - 1) * limit;

  const countStmt = db.prepare('SELECT COUNT(*) as total FROM anime WHERE id NOT IN (SELECT DISTINCT anime_id FROM episodes)');
  const total = (countStmt.get() as any).total;

  const stmt = db.prepare('SELECT id, slug, title, type FROM anime WHERE id NOT IN (SELECT DISTINCT anime_id FROM episodes) ORDER BY id DESC LIMIT ? OFFSET ?');
  const rows = stmt.all(limit, offset);
  
  return { items: rows, total, totalPages: Math.ceil(total / limit) };
}

export async function injectMetadata(animeId: number, anilistId: number) {
  await checkAuth();

  if (!anilistId) {
    return { success: false, error: 'Must provide AniList ID' };
  }

  try {
    const updateQuery = ['anilist_id = ?'];
    const params: any[] = [anilistId, animeId];

    if (!db) throw new Error("Database connection failed");
    const stmt = db.prepare(`UPDATE anime SET ${updateQuery.join(', ')} WHERE id = ?`);
    const info = stmt.run(...params);

    if (info.changes > 0) {
      await execFilePromise('node', [getScriptPath('fill-from-anilist'), `--id=${animeId}`], { cwd: path.join(process.cwd(), 'backend') });
      revalidatePath('/admin');
      revalidatePath('/');
      return { success: true };
    }
    
    return { success: false, error: 'Anime not found or no changes made' };
  } catch (error: any) {
    console.error('Error injecting metadata:', error);
    return { success: false, error: error.message || 'Database error occurred' };
  }
}

export async function getAdminStats() {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  
  const totalAnime = (db.prepare('SELECT COUNT(*) as count FROM anime').get() as any).count;
  const totalEpisodes = (db.prepare('SELECT COUNT(*) as count FROM episodes').get() as any).count;
  const totalCharacters = (db.prepare('SELECT COUNT(*) as count FROM characters').get() as any).count;
  const totalVoiceActors = (db.prepare('SELECT COUNT(*) as count FROM voice_actors').get() as any).count;
  const noEpisodes = (db.prepare('SELECT COUNT(*) as count FROM anime WHERE id NOT IN (SELECT DISTINCT anime_id FROM episodes)').get() as any).count;
  const missingAnilistId = (db.prepare('SELECT COUNT(*) as count FROM anime WHERE anilist_id IS NULL OR anilist_id = 0').get() as any).count;

  // Get Last Updated
  const lastUpdatedObj = db.prepare('SELECT MAX(last_updated) as last FROM anime').get() as any;
  const lastSync = lastUpdatedObj?.last ? new Date(lastUpdatedObj.last + 'Z').toLocaleString('en-US', { timeZone: 'Asia/Jakarta', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

  // Get DB Size
  let dbSizeMB = '0.00';
  try {
    const dbPath = path.join(process.cwd(), 'anime.db');
    const stats = fs.statSync(dbPath);
    dbSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  } catch(e) {}

  return {
    totalAnime,
    totalEpisodes,
    totalCharacters,
    totalVoiceActors,
    noEpisodes,
    missingAnilistId,
    lastSync,
    dbSizeMB
  };
}

export async function getRecentOngoingEpisodes(limit: number = 10) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  const query = `
    SELECT 
      e.id, 
      e.title as episode_title, 
      e.eps_number, 
      e.uploaded_at,
      a.title as anime_title, 
      a.slug as anime_slug
    FROM episodes e
    JOIN anime a ON e.anime_id = a.id
    WHERE a.status = 'Ongoing' COLLATE NOCASE
    ORDER BY e.id DESC
    LIMIT 100
  `;

  const rows = db.prepare(query).all() as {
    id: number;
    episode_title: string;
    eps_number: number;
    uploaded_at: string;
    anime_title: string;
    anime_slug: string;
  }[];

  // Sort by parsed date descending
  rows.sort((a, b) => {
    const dateA = new Date(parseIndonesianDate(a.uploaded_at)).getTime();
    const dateB = new Date(parseIndonesianDate(b.uploaded_at)).getTime();
    
    // If dates are valid and different, sort by date
    if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
      return dateB - dateA;
    }
    // Fallback to insertion order (ID) if dates are same or invalid
    return b.id - a.id;
  });

  return rows.slice(0, limit);
}

export async function getAnimeListAdmin({ page = 1, limit = 50, search = '', sort = 'id', order = 'desc', source = '' }) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  const offset = (page - 1) * limit;
  let query = 'SELECT id, slug, title, source, mal_id, anilist_id, is_fully_scraped, is_protected, last_updated FROM anime';
  const params: any[] = [];
  const conditions: string[] = [];

  if (search) {
    conditions.push('(title LIKE ? OR slug LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Safe sorting
  const validSortColumns = ['id', 'title', 'source', 'mal_id', 'anilist_id', 'is_protected', 'last_updated'];
  const validOrder = ['asc', 'desc'];
  const sortCol = validSortColumns.includes(sort) ? sort : 'id';
  const sortDir = validOrder.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

  query += ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  
  let countQuery = 'SELECT COUNT(*) as total FROM anime';
  const countParams: any[] = [];
  
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
    // The params array has search and source params. We can reuse them without LIMIT and OFFSET
    // params currently has limit and offset at the end.
    countParams.push(...params.slice(0, -2)); 
  }
  const total = (db.prepare(countQuery).get(...countParams) as any).total;

  return {
    items: rows as any[],
    total,
    totalPages: Math.ceil(total / limit)
  };
}

export async function updateAnimeMapping(id: number, malId: number | null, anilistId: number | null, triggerResync: boolean = false) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  try {
    const stmt = db.prepare('UPDATE anime SET mal_id = ?, anilist_id = ? WHERE id = ?');
    const info = stmt.run(malId, anilistId, id);

    if (info.changes > 0) {
      if (triggerResync) {
        execFile('node', [getScriptPath('fill-from-anilist'), `--id=${id}`], { cwd: path.join(process.cwd(), 'backend') });
        await addSystemLog(`Updated mappings for anime ID ${id} and triggered background resync.`);
      } else {
        await addSystemLog(`Updated mappings for anime ID ${id}.`);
      }
      revalidatePath('/admin/database');
      revalidatePath('/');
      return { success: true };
    }
    return { success: false, error: 'Failed to update mapping' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function handleLogout() {
  await logout();
  redirect('/login');
}

export async function triggerScraper(scriptName: string) {
  await checkAuth();

  const allowedScripts = [
    'scrape:latest',
    'scrape:ongoing',
    'scrape:full',
    'update:metadata',
    'fill:schedule',
    'fill:trailers',
    'fill:characters',
  ];

  if (!allowedScripts.includes(scriptName)) {
    return { success: false, error: 'Unauthorized script execution' };
  }

  try {
    // Jalankan perintah di folder backend secara asynchronous (background)
    // Supaya Vercel/Next.js tidak timeout menunggu scraper selesai
    const child = execFile('npm', ['run', scriptName], { cwd: path.join(process.cwd(), 'backend') });
    
    // Kita bisa biarkan jalan di background, atau menyimpan log-nya ke file tertentu
    await addSystemLog(`Started scraper script: ${scriptName}`);
    revalidatePath('/');
    return { success: true, message: `Process '${scriptName}' initiated in background.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to spawn process' };
  }
}

export async function triggerScrapeSlug(slug: string, correctSlug?: string) {
  await checkAuth();

  try {
    let targetSlug = slug;
    
    if (correctSlug && correctSlug.trim() !== '' && correctSlug !== slug) {
      targetSlug = correctSlug.trim();
      // Update the slug in DB first so the scraper updates the right record
      if (!db) throw new Error("Database connection failed");
      const stmt = db.prepare('UPDATE anime SET slug = ? WHERE slug = ?');
      stmt.run(targetSlug, slug);
    }

    await execFilePromise('node', [getScriptPath('index'), `--slug=${targetSlug}`], { cwd: path.join(process.cwd(), 'backend') });
    revalidatePath('/admin/operations');
    revalidatePath('/');
    await addSystemLog(`Scraped data for slug: ${targetSlug}`, 'success');
    return { success: true, message: `Scraping process completed for ${targetSlug}.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to spawn process' };
  }
}

export async function deleteAnime(id: number) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  try {
    const stmt = db.prepare('DELETE FROM anime WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes > 0) {
      revalidatePath('/admin/database');
      revalidatePath('/admin/operations');
      revalidatePath('/');
      await addSystemLog(`Deleted anime ID ${id}`, 'warning');
      return { success: true, message: `Anime deleted successfully.` };
    }
    return { success: false, error: 'Anime not found' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete anime' };
  }
}

export async function addAnimeMinimal(slug: string, anilistId: number | null) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  try {
    if (!slug || slug.trim() === '') {
      return { success: false, error: 'Slug is required' };
    }
    const cleanSlug = slug.trim();

    const checkStmt = db.prepare('SELECT id FROM anime WHERE slug = ? OR (anilist_id = ? AND anilist_id IS NOT NULL)');
    const existing = checkStmt.get(cleanSlug, anilistId) as any;
    if (existing) {
      return { success: false, error: 'Anime with this slug or anilist_id already exists' };
    }

    const title = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const stmt = db.prepare('INSERT INTO anime (slug, anilist_id, title, source) VALUES (?, ?, ?, ?)');
    const info = stmt.run(cleanSlug, anilistId, title, 'otakudesu');

    if (info.changes > 0) {
      // Trigger background sync
      execFile('node', [getScriptPath('index'), `--slug=${cleanSlug}`], { cwd: path.join(process.cwd(), 'backend') }, (err) => {
        if (!err && anilistId) {
          execFile('node', [getScriptPath('fill-from-anilist'), `--id=${info.lastInsertRowid}`], { cwd: path.join(process.cwd(), 'backend') });
        }
      });
      
      revalidatePath('/admin/database');
      revalidatePath('/admin/operations');
      revalidatePath('/');
      await addSystemLog(`Manually added new anime slug: ${cleanSlug}`, 'success');
      return { success: true, message: `Anime added. Syncing metadata in background.` };
    }
    return { success: false, error: 'Failed to add anime' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add anime' };
  }
}

async function addSystemLog(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
  try {
    if (!db) return;
    const stmt = db.prepare(`INSERT INTO system_logs (message, type, created_at) VALUES (?, ?, datetime('now', 'localtime'))`);
    stmt.run(message, type);
  } catch (error) {
    console.error('Failed to add system log', error);
  }
}

export async function getSystemLogs(limit: number = 50) {
  await checkAuth();
  try {
    if (!db) return [];
    const stmt = db.prepare('SELECT id, message, type, created_at FROM system_logs ORDER BY id DESC LIMIT ?');
    return stmt.all(limit) as any[];
  } catch (error) {
    console.error('Failed to get system logs', error);
    return [];
  }
}

export async function getServerMetrics() {
  await checkAuth();
  return {
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    cpuUsage: os.loadavg(),
    uptime: os.uptime()
  };
}

export async function getTodaysScrapeSummary() {
  await checkAuth();
  try {
    if (!db) return { animeAdded: 0, episodesAdded: 0 };
    const animeStmt = db.prepare("SELECT COUNT(*) as count FROM anime WHERE DATE(created_at) = DATE('now', 'localtime')");
    const animeCount = (animeStmt.get() as any)?.count || 0;
    
    const epStmt = db.prepare("SELECT COUNT(*) as count FROM episodes WHERE DATE(created_at) = DATE('now', 'localtime')");
    const episodeCount = (epStmt.get() as any)?.count || 0;
    
    return {
      animeAdded: animeCount,
      episodesAdded: episodeCount
    };
  } catch (error) {
    console.error('Failed to get todays scrape summary', error);
    return { animeAdded: 0, episodesAdded: 0 };
  }
}

// ==========================================
// PROTECTED CONTROL CENTER ACTIONS
// ==========================================

export async function toggleProtectedStatus(id: number, isProtected: boolean) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  try {
    const stmt = db.prepare('UPDATE anime SET is_protected = ? WHERE id = ?');
    stmt.run(isProtected ? 1 : 0, id);
    revalidatePath('/admin/database');
    revalidatePath('/admin/protected');
    await addSystemLog(`${isProtected ? 'Protected' : 'Unprotected'} anime ID ${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProtectedAnime() {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  const stmt = db.prepare('SELECT * FROM anime WHERE is_protected = 1 ORDER BY last_updated DESC');
  return stmt.all() as any[];
}

export async function getAnimeEpisodes(animeId: number) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  const stmt = db.prepare('SELECT * FROM episodes WHERE anime_id = ? ORDER BY eps_number DESC');
  return stmt.all(animeId) as any[];
}

export async function updateProtectedAnimeData(id: number, anilistId: number | null, slug: string, data: any) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  try {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => data[k]);
      const stmt = db.prepare(`UPDATE anime SET ${setClause}, anilist_id = ?, slug = ? WHERE id = ?`);
      stmt.run(...values, anilistId, slug, id);
    } else {
      const stmt = db.prepare('UPDATE anime SET anilist_id = ?, slug = ? WHERE id = ?');
      stmt.run(anilistId, slug, id);
    }
    
    revalidatePath('/admin/protected');
    revalidatePath('/admin/database');
    revalidatePath(`/anime/${slug}`);
    await addSystemLog(`Updated protected metadata for anime ID ${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unlinkEpisode(episodeId: number) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  try {
    const stmt = db.prepare('UPDATE episodes SET anime_id = NULL WHERE id = ?');
    stmt.run(episodeId);
    revalidatePath('/admin/protected');
    await addSystemLog(`Unlinked episode ID ${episodeId} from its anime.`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function attachEpisode(animeId: number, episodeId: number) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  try {
    const stmt = db.prepare('UPDATE episodes SET anime_id = ? WHERE id = ?');
    stmt.run(animeId, episodeId);
    revalidatePath('/admin/protected');
    await addSystemLog(`Attached episode ID ${episodeId} to anime ID ${animeId}.`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrphanedEpisodes() {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  const stmt = db.prepare('SELECT * FROM episodes WHERE anime_id IS NULL ORDER BY id DESC LIMIT 100');
  return stmt.all() as any[];
}

