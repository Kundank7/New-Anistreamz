import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

declare global {
  var db: Database.Database | undefined;
}

function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }

  const selfDir = path.dirname(fileURLToPath(import.meta.url));

  const animeDb = path.join(selfDir, 'anime.db');
  if (fs.existsSync(animeDb)) return animeDb;

  const cwdAnime = path.join(process.cwd(), 'anime.db');
  if (fs.existsSync(cwdAnime)) return cwdAnime;

  const exampleDb = path.join(selfDir, 'example-anime.db');
  if (fs.existsSync(exampleDb)) return exampleDb;

  return path.join(process.cwd(), 'anime.db');
}

const dbPath = resolveDbPath();

if (!global.db) {
  global.db = new Database(dbPath, {
    readonly: false,
    fileMustExist: true,
  });

  global.db.pragma('journal_mode = WAL');
  global.db.pragma('synchronous = NORMAL');

  const indexStmts = [
    `CREATE INDEX IF NOT EXISTS idx_anime_status_last_updated ON anime(status, last_updated DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_popularity ON anime(status, popularity ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_score ON anime(status, score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_popularity ON anime(popularity ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_score ON anime(score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_slug ON anime(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_title ON anime(title COLLATE NOCASE)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_title ON anime(status, title COLLATE NOCASE)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_release_day ON anime(status, release_day)`,
    `CREATE INDEX IF NOT EXISTS idx_episodes_anime_eps ON episodes(anime_id, eps_number DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_episodes_slug ON episodes(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_genres_anime ON anime_genres(anime_id)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_genres_genre ON anime_genres(genre_id)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_characters_anime ON anime_characters(anime_id)`,
    `CREATE INDEX IF NOT EXISTS idx_character_voice_actors_anime ON character_voice_actors(anime_id)`,
  ];

  for (const stmt of indexStmts) {
    global.db.exec(stmt);
  }
}

export default global.db;
