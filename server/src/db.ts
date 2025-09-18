import sqlite3 from 'sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { promisify } from 'util';

const dbPath = process.env.SQLITE_PATH || './data/islanders.db';
const dataDir = join(process.cwd(), 'data');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath);

const runAsync = promisify(db.run.bind(db));
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));

export const initializeDatabase = async () => {
  try {
    await runAsync(`PRAGMA foreign_keys = ON`);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        jersey_number INTEGER UNIQUE,
        role TEXT NOT NULL,
        batting_style TEXT,
        bowling_style TEXT,
        photo_url TEXT,
        bio TEXT,
        date_of_birth DATE,
        nationality TEXT DEFAULT 'India',
        is_active BOOLEAN DEFAULT 1,
        position TEXT,
        runs INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        matches_played INTEGER DEFAULT 0,
        batting_average REAL DEFAULT 0.0,
        bowling_average REAL DEFAULT 0.0,
        strike_rate REAL DEFAULT 0.0,
        economy_rate REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        opponent TEXT NOT NULL,
        venue TEXT NOT NULL,
        match_type TEXT DEFAULT 'League',
        result TEXT,
        our_score TEXT,
        opponent_score TEXT,
        man_of_match INTEGER,
        description TEXT,
        is_home BOOLEAN DEFAULT 1,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (man_of_match) REFERENCES players(id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS player_match_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        match_id INTEGER NOT NULL,
        batting_runs INTEGER DEFAULT 0,
        batting_balls INTEGER DEFAULT 0,
        batting_fours INTEGER DEFAULT 0,
        batting_sixes INTEGER DEFAULT 0,
        batting_how_out TEXT,
        bowling_overs REAL DEFAULT 0.0,
        bowling_runs INTEGER DEFAULT 0,
        bowling_wickets INTEGER DEFAULT 0,
        bowling_maidens INTEGER DEFAULT 0,
        fielding_catches INTEGER DEFAULT 0,
        fielding_stumpings INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        UNIQUE(player_id, match_id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        location TEXT,
        event_type TEXT DEFAULT 'social',
        cover_image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS event_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        photo_url TEXT NOT NULL,
        caption TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image_url TEXT,
        author TEXT DEFAULT 'Admin',
        published BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        match_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT,
        website_url TEXT,
        description TEXT,
        tier TEXT DEFAULT 'bronze',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS leadership (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        photo_url TEXT,
        bio TEXT,
        email TEXT,
        phone TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`CREATE INDEX IF NOT EXISTS idx_players_jersey ON players(jersey_number)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_match_stats(player_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_player_stats_match ON player_match_stats(match_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export { runAsync, getAsync, allAsync };
export default db;