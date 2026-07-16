import Database from 'better-sqlite3'

export function openDb(path: string): Database.Database {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      due_at TEXT NOT NULL,
      completed_at TEXT,
      notified_at TEXT,
      created_at TEXT NOT NULL
    );
  `)
  return db
}
