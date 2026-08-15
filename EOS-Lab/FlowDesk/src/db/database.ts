import { DatabaseSync } from 'node:sqlite';

export function createDbConnection(dbPath: string = 'flowdesk.db'): DatabaseSync {
  const db = new DatabaseSync(dbPath);

  // Pragmas for performance and WAL concurrency
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // Schema Initialization
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('NUEVO', 'CONTACTADO', 'CALIFICADO', 'GANADO', 'PERDIDO')),
      notes TEXT,
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lead_activities (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_activities_lead ON lead_activities(lead_id);
  `);

  return db;
}
