/**
 * Sanitize utility — strips internal database fields before sending to client.
 *
 * These fields are used server-side only and should never be exposed in API responses:
 * - `id`              — internal autoincrement PK, client uses `slug` for navigation
 * - `is_fully_scraped` — internal scraping workflow flag
 * - `is_protected`     — internal protection flag
 * - `last_updated`     — internal sync timestamp
 * - `anime_id`         — internal FK (episodes), client already knows the anime
 */

const ANIME_INTERNAL_FIELDS = ['id', 'is_fully_scraped', 'is_protected', 'last_updated'];
const EPISODE_INTERNAL_FIELDS = ['id', 'anime_id'];
const GENRE_INTERNAL_FIELDS = ['id'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripFields(data: any, fields: string[]): any {
  const clean = { ...data };
  for (const field of fields) {
    delete clean[field];
  }
  return clean;
}

/** Strip internal fields from a single anime object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeAnime(anime: any): any {
  const clean = stripFields(anime, ANIME_INTERNAL_FIELDS);

  // Also sanitize nested genres if present (array of {id, name, slug})
  if (Array.isArray(clean.genres) && clean.genres.length > 0 && typeof clean.genres[0] === 'object') {
    clean.genres = clean.genres.map((g: any) => stripFields(g, GENRE_INTERNAL_FIELDS));
  }

  return clean;
}

/** Strip internal fields from a list of anime objects */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeAnimeList(items: any[]): any[] {
  return items.map(sanitizeAnime);
}

/** Strip internal fields from a single episode object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeEpisode(episode: any): any {
  return stripFields(episode, EPISODE_INTERNAL_FIELDS);
}

/** Strip internal fields from a list of episode objects */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeEpisodeList(items: any[]): any[] {
  return items.map(sanitizeEpisode);
}

/** Strip internal fields from genre objects (removes numeric id, keeps name + slug) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeGenreList(items: any[]): any[] {
  return items.map(g => stripFields(g, GENRE_INTERNAL_FIELDS));
}

/** Maximum allowed value for the `limit` query parameter */
export const MAX_API_LIMIT = 50;

/** Clamp a user-provided limit to safe bounds */
export function clampLimit(raw: number, defaultVal = 24): number {
  const val = Number.isFinite(raw) && raw > 0 ? raw : defaultVal;
  return Math.min(val, MAX_API_LIMIT);
}
