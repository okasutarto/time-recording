import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'timeRecording.db');

let db: SqlJsDatabase | null = null;
let SQL: any = null;

export async function initializeDatabase(): Promise<void> {
  SQL = await initSqlJs();

  // Load existing database or create new one
  let database: SqlJsDatabase;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    database = new SQL.Database(fileBuffer);
  } else {
    database = new SQL.Database();
  }
  db = database;

  // Create users table
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create work_schedules table
  database.run(`
    CREATE TABLE IF NOT EXISTS work_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      is_working_day INTEGER NOT NULL CHECK (is_working_day IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, day_of_week)
    )
  `);

  // Create work_config table
  database.run(`
    CREATE TABLE IF NOT EXISTS work_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      normal_hours_per_day REAL NOT NULL DEFAULT 8.0,
      normal_hours_per_week REAL NOT NULL DEFAULT 40.0
    )
  `);

  // Insert default config if not exists
  const configResult = database.exec('SELECT COUNT(*) as count FROM work_config');
  const configCount = configResult.length > 0 ? configResult[0].values[0][0] : 0;
  if (configCount === 0) {
    database.run('INSERT INTO work_config (id, normal_hours_per_day, normal_hours_per_week) VALUES (1, 8.0, 40.0)');
  }

  // Create time_records table
  database.run(`
    CREATE TABLE IF NOT EXISTS time_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      clock_in DATETIME NOT NULL,
      clock_out DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (clock_out IS NULL OR clock_out > clock_in)
    )
  `);

  // Create indexes
  database.run('CREATE INDEX IF NOT EXISTS idx_time_records_user_id ON time_records(user_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_time_records_clock_in ON time_records(clock_in)');
  database.run('CREATE INDEX IF NOT EXISTS idx_work_schedules_user_id ON work_schedules(user_id)');

  saveDatabase();
  console.log('Database initialized successfully');
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// Helper functions for sql.js
export function runQuery(sql: string, params: any[] = []): void {
  const database = getDatabase();
  database.run(sql, params);
  saveDatabase();
}

export function getOne(sql: string, params: any[] = []): any {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

export function getAll(sql: string, params: any[] = []): any[] {
  const database = getDatabase();
  const results: any[] = [];
  const stmt = database.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function insertAndGetId(sql: string, params: any[] = []): number {
  const database = getDatabase();
  database.run(sql, params);
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDatabase();
  return result[0].values[0][0] as number;
}

export function runAndGetChanges(sql: string, params: any[] = []): number {
  const database = getDatabase();
  database.run(sql, params);
  const result = database.exec('SELECT changes() as changes');
  saveDatabase();
  return result[0].values[0][0] as number;
}
