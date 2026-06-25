import globalDb from '../db';
import { parseArrayField } from '../utils';

if (!globalDb) {
  throw new Error('Database connection not initialized');
}

const db = globalDb;

const MAX_CACHED_STMTS = 100;
const statementCache = new Map<string, any>();

function getPreparedStatement(sql: string) {
  if (!statementCache.has(sql)) {
    if (statementCache.size >= MAX_CACHED_STMTS) {
      const firstKey = statementCache.keys().next().value;
      if (firstKey !== undefined) statementCache.delete(firstKey);
    }
    statementCache.set(sql, db.prepare(sql));
  }
  return statementCache.get(sql);
}

export interface AnimeMetadata {
  id: number;
  slug: string;
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms?: string;
  type: string;
  status: string;
  season: string;
  year: number;
  score: number;
  scored_by: number;
  members: number;
  popularity: number;
  rank: number;
  synopsis: string;
  poster: string;
  duration_minutes: number;
  episodes_count: number;
  aired: string;
  producers: string;
  studios: string;
  rating: string;
  source: string;
  release_day: string;
  youtube_trailer_id: string;
  is_fully_scraped: number;
  last_updated: string;
  latest_episode?: number;
  actual_episodes_count?: number;
  anilist_id?: number;
  banner?: string;
  next_episode?: number;
  next_airing_at?: number;
}

export interface Episode {
  id: number;
  anime_id: number;
  slug: string;
  title: string;
  eps_number: number;
  uploaded_at: string;
}

/**
 * Cleans synopsis text by removing source credits and extra whitespace
 */
function cleanSynopsis(synopsis: string): string {
  if (!synopsis) return '';
  return synopsis
    .replace(/\(Source:.*?\)/gi, '')
    .replace(/\[Written by.*?\]/gi, '')
    .replace(/Written by.*?$/gi, '')
    .replace(/Source:.*?$/gi, '')
    .replace(/(?:\n|<br\s*\/?>)*\s*\*?\*?Note:[\s\S]*$/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalizes raw status from DB to standard 'Ongoing' or 'Completed'
 */
function normalizeStatusValue(status: string): string {
  if (!status) return 'Unknown';
  const s = status.toLowerCase();
  if (s.includes('ongoing') || s.includes('currently airing')) return 'Ongoing';
  if (s.includes('completed') || s.includes('finished airing')) return 'Completed';
  return status;
}

/**
 * Smart status logic: if episodes reach the total count, it's Completed.
 */
function getSmartStatus(item: any): string {
  const normalized = normalizeStatusValue(item.status);
  const latest = item.latest_episode || 0;
  const total = item.episodes_count || 0;
  
  if (normalized === 'Ongoing' && total > 0 && latest >= total) {
    return 'Completed';
  }
  return normalized;
}

/**
 * SQL snippet for smart status filtering.
 */
const SMART_STATUS_CLAUSES = {
  Ongoing: `(status IN ('Ongoing', 'Currently Airing')) AND (episodes_count <= 0 OR (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) < episodes_count)`,
  Completed: `(status IN ('Completed', 'Finished Airing')) OR (episodes_count > 0 AND (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) >= episodes_count)`
};

// SQL subqueries for reuse
const SQL_LATEST_EP = `(SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id)`;
const SQL_LATEST_EP_DATE = `(SELECT MAX(
  SUBSTR(uploaded_at, -4) || 
  CASE 
    WHEN uploaded_at LIKE '%Januari%' THEN '01' 
    WHEN uploaded_at LIKE '%Februari%' THEN '02' 
    WHEN uploaded_at LIKE '%Maret%' THEN '03' 
    WHEN uploaded_at LIKE '%April%' THEN '04' 
    WHEN uploaded_at LIKE '%Mei%' THEN '05' 
    WHEN uploaded_at LIKE '%Juni%' THEN '06' 
    WHEN uploaded_at LIKE '%Juli%' THEN '07' 
    WHEN uploaded_at LIKE '%Agustus%' THEN '08' 
    WHEN uploaded_at LIKE '%September%' THEN '09' 
    WHEN uploaded_at LIKE '%Oktober%' THEN '10' 
    WHEN uploaded_at LIKE '%November%' THEN '11' 
    WHEN uploaded_at LIKE '%Desember%' THEN '12' 
    ELSE '00' 
  END || 
  PRINTF('%02d', CAST(SUBSTR(uploaded_at, 1, INSTR(uploaded_at, ' ') - 1) AS INTEGER))
) FROM episodes WHERE anime_id = a.id)`;
const SQL_ACTUAL_COUNT = `(SELECT COUNT(*) FROM episodes WHERE anime_id = a.id)`;
const SQL_GENRES = `(SELECT GROUP_CONCAT(g.name) FROM genres g JOIN anime_genres ag ON g.id = ag.genre_id WHERE ag.anime_id = a.id)`;
const SQL_BASE_SELECT = `a.*, ${SQL_LATEST_EP} as latest_episode, ${SQL_ACTUAL_COUNT} as actual_episodes_count, ${SQL_GENRES} as genres`;

export const AnimeService = {
  /**
   * Get a list of anime with pagination and optional filters
   */
  async getAnimeList({ 
    page = 1, 
    limit = 24, 
    status = null as string | null,
    orderBy = 'last_updated' as string
  }) {
    const offset = (page - 1) * limit;
    let query = `SELECT ${SQL_BASE_SELECT} FROM anime a`;
    
    if (status === 'Ongoing') {
      query += ` WHERE ${SMART_STATUS_CLAUSES.Ongoing}`;
    } else if (status === 'Completed') {
      query += ` WHERE ${SMART_STATUS_CLAUSES.Completed}`;
    } else if (status) {
      query += ` WHERE a.status = ?`;
    }

    const allowedOrderBy = ['last_updated', 'popularity', 'score', 'year', 'title'];
    let safeOrderBy = allowedOrderBy.includes(orderBy)
        ? (orderBy === 'title' ? "COALESCE(NULLIF(a.title_english, ''), a.title)" : `a.${orderBy}`)
        : 'a.last_updated';

    if (orderBy === 'last_updated' && (status === 'Ongoing' || status === 'Completed')) {
      safeOrderBy = `COALESCE(${SQL_LATEST_EP_DATE}, a.last_updated)`;
    }
    const direction = orderBy === 'title' ? 'ASC' : 'DESC';

    // De-prioritize anime with zero actual episodes
    query += ` ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, ${safeOrderBy} ${direction} LIMIT ? OFFSET ?`;
    
    const params: any[] = [];
    if (status && status !== 'Ongoing' && status !== 'Completed') params.push(status);
    params.push(limit, offset);

    const items = getPreparedStatement(query).all(...params) as any[];
    
    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM anime a';
    const countParams: any[] = [];
    if (status === 'Ongoing') {
      countQuery += ` WHERE ${SMART_STATUS_CLAUSES.Ongoing}`;
    } else if (status === 'Completed') {
      countQuery += ` WHERE ${SMART_STATUS_CLAUSES.Completed}`;
    } else if (status) {
      countQuery += ` WHERE status = ?`;
      countParams.push(status);
    }
    const total = (getPreparedStatement(countQuery).get(...countParams) as any).total;

    return {
      items: items.map(item => ({
        ...item,
        status: getSmartStatus(item),
        synopsis: cleanSynopsis(item.synopsis)
      })),
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total
      }
    };
  },

  /**
   * Get full details of an anime by its slug
   */
  async getAnimeBySlug(slug: string) {
    const anime = getPreparedStatement(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE a.slug = ?`).get(slug) as any | undefined;
    if (!anime) return null;

    const genres = getPreparedStatement(`
      SELECT g.name, g.slug 
      FROM genres g 
      JOIN anime_genres ag ON g.id = ag.genre_id 
      WHERE ag.anime_id = ?
    `).all(anime.id) as { name: string; slug: string }[];

    const characters = getPreparedStatement(`
      SELECT c.name, c.image, ac.role, va.name as va_name, va.image as va_image
      FROM characters c
      JOIN anime_characters ac ON c.id = ac.character_id
      LEFT JOIN character_voice_actors cva ON (c.id = cva.character_id AND ac.anime_id = cva.anime_id)
      LEFT JOIN voice_actors va ON cva.voice_actor_id = va.id
      WHERE ac.anime_id = ?
      LIMIT 15
    `).all(anime.id);

    return {
      ...anime,
      status: getSmartStatus(anime),
      synopsis: cleanSynopsis(anime.synopsis),
      genres,
      characters,
      studios: parseArrayField(anime.studios),
      producers: parseArrayField(anime.producers),
      title_synonyms: parseArrayField(anime.title_synonyms)
    };
  },

  /**
   * Live Search dropdown
   */
async searchAnime(query: string, limit = 5) {
  const gql = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME
          search: $search
          sort: SEARCH_MATCH
        ) {
          id

          title {
            romaji
            english
          }

          coverImage {
            extraLarge
          }

          averageScore

          status

          episodes

          genres
        }
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      query: gql,
      variables: {
        search: query,
        perPage: limit
      }
    }),
    next: {
      revalidate: 3600
    }
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json.errors?.[0]?.message || "AniList search failed"
    );
  }

  return (json.data?.Page?.media || []).map((anime: any) => ({
    id: anime.id,
    slug: String(anime.id),

    title: anime.title?.romaji || "",
    title_english: anime.title?.english || "",

    poster: anime.coverImage?.extraLarge || "",

    score: anime.averageScore || 0,

    status: anime.status,

    episodes_count: anime.episodes || 0,

    actual_episodes_count: anime.episodes || 0,

    latest_episode: anime.episodes || 0,

    genres: anime.genres?.join(",") || ""
  }));
},

  /**
   * Home page data
   */
  async getHomeData() {
    const popularSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.popularity DESC LIMIT 12`;
    const popular = getPreparedStatement(popularSql).all() as any[];

    const ongoingSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, COALESCE(${SQL_LATEST_EP_DATE}, a.last_updated) DESC LIMIT 12`;
    const ongoing = getPreparedStatement(ongoingSql).all() as any[];

    const completedSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Completed} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, COALESCE(${SQL_LATEST_EP_DATE}, a.last_updated) DESC LIMIT 12`;
    const completed = getPreparedStatement(completedSql).all() as any[];
    
    const normalizeItems = (list: any[]) => list.map(item => ({
      ...item,
      status: getSmartStatus(item),
      synopsis: cleanSynopsis(item.synopsis)
    }));

    return { 
      popular: normalizeItems(popular), 
      ongoing: normalizeItems(ongoing), 
      completed: normalizeItems(completed) 
    };
  },

  async getAllGenres() {
    return getPreparedStatement('SELECT g.*, COUNT(ag.anime_id) as total_anime FROM genres g JOIN anime_genres ag ON g.id = ag.genre_id GROUP BY g.id ORDER BY g.name ASC').all() as { id: number; name: string; slug: string; total_anime: number }[];
  },

  async getAnimeByGenre(genreSlug: string, page = 1, limit = 24) {
    const offset = (page - 1) * limit;
    const genre = getPreparedStatement('SELECT id, name FROM genres WHERE slug = ?').get(genreSlug) as { id: number, name: string } | undefined;
    if (!genre) return { items: [], pagination: { current_page: page, last_page: 0, total: 0 }, genreName: '' };

    const items = getPreparedStatement(`
      SELECT ${SQL_BASE_SELECT} 
      FROM anime a
      JOIN anime_genres ag ON a.id = ag.anime_id
      WHERE ag.genre_id = ?
      ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.last_updated DESC
      LIMIT ? OFFSET ?
    `).all(genre.id, limit, offset) as any[];

    const total = (getPreparedStatement(`SELECT COUNT(*) as total FROM anime_genres WHERE genre_id = ?`).get(genre.id) as any).total;

    return {
      items: items.map(item => ({ 
        ...item, 
        status: getSmartStatus(item),
        synopsis: cleanSynopsis(item.synopsis) 
      })),
      pagination: { current_page: page, last_page: Math.ceil(total / limit), total },
      genreName: genre.name
    };
  },

  async getSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule: Record<string, AnimeMetadata[]> = {};
    for (const day of days) {
      const items = getPreparedStatement(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} AND release_day = ? ORDER BY score DESC`).all(day) as any[];
      schedule[day] = items.map(item => ({ ...item, status: getSmartStatus(item), synopsis: cleanSynopsis(item.synopsis) }));
    }
    return schedule;
  },

  async advancedSearch({
  query = "",
  page = 1,
  limit = 24,
}: {
  query?: string;
  page?: number;
  limit?: number;
}) {
  const gql = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          lastPage
          total
        }

        media(
          type: ANIME
          search: $search
          sort: SEARCH_MATCH
        ) {
          id

          title {
            romaji
            english
          }

          coverImage {
            extraLarge
          }

          averageScore

          status

          episodes

          genres
        }
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: gql,
      variables: {
        search: query,
        page,
        perPage: limit,
      },
    }),
    next: {
      revalidate: 3600,
    },
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json.errors?.[0]?.message || "AniList search failed"
    );
  }

  const pageInfo = json.data.Page.pageInfo;

  return {
    items: (json.data.Page.media || []).map((anime: any) => ({
      id: anime.id,
      slug: String(anime.id),

      title: anime.title?.romaji || "",
      title_english: anime.title?.english || "",

      poster: anime.coverImage?.extraLarge || "",

      score: anime.averageScore || 0,

      status: anime.status,

      episodes_count: anime.episodes || 0,

      actual_episodes_count: anime.episodes || 0,

      latest_episode: anime.episodes || 0,

      genres: anime.genres?.join(",") || "",
    })),

    pagination: {
      current_page: pageInfo.currentPage,
      last_page: pageInfo.lastPage,
      total: pageInfo.total,
    },
  };
},

  async getSimilarAnime(animeId: number, limit = 5) {
    const items = getPreparedStatement(`
      SELECT ${SQL_BASE_SELECT},
        (SELECT COUNT(*) FROM anime_genres ag2 WHERE ag2.anime_id = a.id AND ag2.genre_id IN (
          SELECT genre_id FROM anime_genres WHERE anime_id = ?
        )) as genre_overlap
      FROM anime a
      WHERE a.id != ?
        AND EXISTS (
          SELECT 1 FROM anime_genres ag3 WHERE ag3.anime_id = a.id
          AND ag3.genre_id IN (SELECT genre_id FROM anime_genres WHERE anime_id = ?)
        )
      ORDER BY genre_overlap DESC, a.score DESC, a.popularity ASC
      LIMIT ?
    `).all(animeId, animeId, animeId, limit) as any[];

    return items.map(item => ({
      ...item,
      status: getSmartStatus(item),
      synopsis: cleanSynopsis(item.synopsis)
    }));
  },

  async getForYouRecommendations(slugs: string[], limit = 6) {
    if (!slugs || slugs.length === 0) return [];
    
    const placeholders = slugs.map(() => '?').join(',');
    
    const topGenres = getPreparedStatement(`
      SELECT ag.genre_id, COUNT(ag.genre_id) as freq
      FROM anime_genres ag
      JOIN anime a ON a.id = ag.anime_id
      WHERE a.slug IN (${placeholders})
      GROUP BY ag.genre_id
      ORDER BY freq DESC
      LIMIT 3
    `).all(...slugs) as { genre_id: number; freq: number }[];
    
    if (topGenres.length === 0) return [];
    
    const topGenreIds = topGenres.map(g => g.genre_id);
    const genrePlaceholders = topGenreIds.map(() => '?').join(',');
    
    const items = getPreparedStatement(`
      SELECT DISTINCT ${SQL_BASE_SELECT},
        (SELECT COUNT(*) FROM anime_genres ag2 WHERE ag2.anime_id = a.id AND ag2.genre_id IN (${genrePlaceholders})) as genre_overlap
      FROM anime a
      WHERE a.slug NOT IN (${placeholders})
        AND EXISTS (
          SELECT 1 FROM anime_genres ag3 WHERE ag3.anime_id = a.id AND ag3.genre_id IN (${genrePlaceholders})
        )
      ORDER BY genre_overlap DESC, CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.popularity DESC
      LIMIT ?
    `).all(...topGenreIds, ...slugs, ...topGenreIds, limit) as any[];

    return items.map(item => ({
      ...item,
      status: getSmartStatus(item),
      synopsis: cleanSynopsis(item.synopsis)
    }));
  },

  async getEpisodes(animeId: number) {
    return getPreparedStatement('SELECT * FROM episodes WHERE anime_id = ? ORDER BY eps_number DESC').all(animeId) as Episode[];
  },

  async getEpisodeBySlug(slug: string) {
    return getPreparedStatement('SELECT * FROM episodes WHERE slug = ?').get(slug) as Episode | undefined;
  },

  async getAnimeById(id: number) {
    const item = getPreparedStatement(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE id = ?`).get(id) as any | undefined;
    if (!item) return undefined;
    return { ...item, status: getSmartStatus(item), synopsis: cleanSynopsis(item.synopsis) };
  }
};
