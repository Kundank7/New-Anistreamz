-- Anime listing & filtering
CREATE INDEX IF NOT EXISTS idx_anime_status_last_updated ON anime(status, last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_anime_status_popularity ON anime(status, popularity ASC);
CREATE INDEX IF NOT EXISTS idx_anime_status_score ON anime(status, score DESC);
CREATE INDEX IF NOT EXISTS idx_anime_popularity ON anime(popularity ASC);
CREATE INDEX IF NOT EXISTS idx_anime_score ON anime(score DESC);

-- Lookup by slug (detail page, search)
CREATE INDEX IF NOT EXISTS idx_anime_slug ON anime(slug);

-- Title sorting & letter filter (for advancedSearch ORDER BY title, letter filter)
CREATE INDEX IF NOT EXISTS idx_anime_title ON anime(title COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_anime_status_title ON anime(status, title COLLATE NOCASE);

-- NOTE: For LIKE '%query%' (leading wildcard), BTREE indexes are useless.
-- SQLite will always full-scan. For this data size (12MB, ~15k rows), it's acceptable.
-- If search becomes slow later, consider FTS5 virtual table.

-- Schedule & homepage
CREATE INDEX IF NOT EXISTS idx_anime_status_release_day ON anime(status, release_day);

-- Episodes
CREATE INDEX IF NOT EXISTS idx_episodes_anime_eps ON episodes(anime_id, eps_number DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_slug ON episodes(slug);

-- Join tables (foreign keys)
CREATE INDEX IF NOT EXISTS idx_anime_genres_anime ON anime_genres(anime_id);
CREATE INDEX IF NOT EXISTS idx_anime_genres_genre ON anime_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_anime_characters_anime ON anime_characters(anime_id);
CREATE INDEX IF NOT EXISTS idx_character_voice_actors_anime ON character_voice_actors(anime_id);
