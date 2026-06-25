-- NaiveStream Database Schema
-- SQLite 3
--
-- This file defines the complete database structure used by NaiveStream.
-- It is provided as a reference for understanding the data model and
-- for bootstrapping a new database instance.
--
-- Usage:
--   sqlite3 anime.db < schema.sql

-- ============================================================
-- ANIME
-- Core table for anime metadata.
-- Each row represents a unique anime identified by its slug.
-- ============================================================
CREATE TABLE IF NOT EXISTS anime (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    slug              TEXT UNIQUE NOT NULL,
    mal_id            INTEGER,
    title             TEXT NOT NULL,
    title_english     TEXT,
    title_japanese    TEXT,
    title_synonyms    TEXT,
    type              TEXT,
    status            TEXT,
    season            TEXT,
    year              INTEGER,
    score             REAL DEFAULT 0.0,
    scored_by         INTEGER DEFAULT 0,
    members           INTEGER DEFAULT 0,
    popularity        INTEGER,
    rank              INTEGER,
    synopsis          TEXT,
    poster            TEXT,
    duration_minutes  INTEGER,
    episodes_count    INTEGER,
    aired             TEXT,
    producers         TEXT,
    studios           TEXT,
    rating            TEXT,
    source            TEXT,
    release_day       TEXT,
    youtube_trailer_id TEXT,
    anilist_id        INTEGER,
    banner            TEXT,
    next_episode      INTEGER,
    next_airing_at    INTEGER,
    is_fully_scraped  INTEGER DEFAULT 0,
    is_protected      INTEGER DEFAULT 0,
    last_updated      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EPISODES
-- Individual episodes for each anime.
-- eps_number may contain decimals for specials (e.g. 5.5).
-- ============================================================
CREATE TABLE IF NOT EXISTS episodes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    anime_id          INTEGER,
    slug              TEXT UNIQUE NOT NULL,
    title             TEXT NOT NULL,
    eps_number        REAL,
    uploaded_at       TEXT,
    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
);

-- ============================================================
-- GENRES
-- Normalized genre list.
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT UNIQUE NOT NULL,
    slug              TEXT UNIQUE NOT NULL
);

-- Many-to-many: anime <-> genres
CREATE TABLE IF NOT EXISTS anime_genres (
    anime_id          INTEGER NOT NULL,
    genre_id          INTEGER NOT NULL,
    PRIMARY KEY (anime_id, genre_id),
    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- ============================================================
-- CHARACTERS & VOICE ACTORS
-- Anime characters with their associated voice actors.
-- Data sourced from AniList.
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    anilist_id        INTEGER UNIQUE,
    name              TEXT NOT NULL,
    image             TEXT
);

CREATE TABLE IF NOT EXISTS anime_characters (
    anime_id          INTEGER NOT NULL,
    character_id      INTEGER NOT NULL,
    role              TEXT,
    PRIMARY KEY (anime_id, character_id),
    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS voice_actors (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    anilist_id        INTEGER UNIQUE,
    name              TEXT NOT NULL,
    image             TEXT,
    language          TEXT
);

CREATE TABLE IF NOT EXISTS character_voice_actors (
    anime_id          INTEGER NOT NULL,
    character_id      INTEGER NOT NULL,
    voice_actor_id    INTEGER NOT NULL,
    PRIMARY KEY (anime_id, character_id, voice_actor_id),
    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (voice_actor_id) REFERENCES voice_actors(id) ON DELETE CASCADE
);

-- ============================================================
-- STREAM CACHE
-- Caches streaming URLs to avoid re-fetching from upstream.
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_cache (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_slug      TEXT NOT NULL,
    quality           TEXT,
    server_name       TEXT,
    iframe_url        TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- Performance indexes for common query patterns.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_anime_genres_anime_id ON anime_genres(anime_id);
CREATE INDEX IF NOT EXISTS idx_anime_genres_genre_id ON anime_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_anime_characters_anime_id ON anime_characters(anime_id);
CREATE INDEX IF NOT EXISTS idx_character_voice_actors_anime_id ON character_voice_actors(anime_id);
CREATE INDEX IF NOT EXISTS idx_stream_cache_episode_slug ON stream_cache(episode_slug);
CREATE INDEX IF NOT EXISTS idx_anime_status ON anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_slug ON anime(slug);
CREATE INDEX IF NOT EXISTS idx_anime_last_updated ON anime(last_updated);
