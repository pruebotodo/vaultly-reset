import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../vaultly.db');
export const db = new Database(dbPath);

export function ensureDB() {
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL,
      platform TEXT,
      title TEXT,
      author TEXT,
      audio_path TEXT,
      transcript TEXT,
      summary TEXT,
      key_points TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      id, title, transcript, summary, content='items', content_rowid='rowid'
    );
  `);
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
      INSERT INTO items_fts(rowid, id, title, transcript, summary)
      VALUES (new.rowid, new.id, new.title, new.transcript, new.summary);
    END;
  `);
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, id, title, transcript, summary)
      VALUES('delete', old.rowid, old.id, old.title, old.transcript, old.summary);
    END;
  `);
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, id, title, transcript, summary)
      VALUES('delete', old.rowid, old.id, old.title, old.transcript, old.summary);
      INSERT INTO items_fts(rowid, id, title, transcript, summary)
      VALUES (new.rowid, new.id, new.title, new.transcript, new.summary);
    END;
  `);
}

export function insertItem(item) {
  db.prepare(`
    INSERT INTO items(id, source_url, platform, title, author, audio_path, transcript, summary, key_points)
    VALUES(@id, @source_url, @platform, @title, @author, @audio_path, @transcript, @summary, @key_points)
  `).run(item);
}

export function updateItemSummaryAndTranscript(id, transcript, summary, keyPointsJson) {
  db.prepare('UPDATE items SET transcript=?, summary=?, key_points=? WHERE id=?')
    .run(transcript, summary, keyPointsJson, id);
}

export function searchItems(q) {
  if (!q || !q.trim()) {
    return db.prepare(`
      SELECT id, source_url, platform, title, author, substr(summary,1,300) AS summary_snippet, created_at
      FROM items ORDER BY datetime(created_at) DESC LIMIT 100
    `).all();
  }
  return db.prepare(`
    SELECT i.id, i.source_url, i.platform, i.title, i.author,
           substr(i.summary,1,300) AS summary_snippet, i.created_at
    FROM items i
    JOIN items_fts f ON i.rowid = f.rowid
    WHERE items_fts MATCH ?
    ORDER BY rank
    LIMIT 100
  `).all(q);
}

export function getItem(id) {
  return db.prepare('SELECT * FROM items WHERE id=?').get(id);
}
