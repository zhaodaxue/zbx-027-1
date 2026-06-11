import initSqlJs, { Database } from 'sql.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.resolve(__dirname, '..', 'data')
const DB_PATH = path.join(DB_DIR, 'bamboo.db')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: (file) =>
      path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
  })

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
  }
  return db
}

export function saveDb() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

export async function initDatabase() {
  const d = await getDb()
  d.run(`
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      batch_no TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('毛竹', '慈竹')),
      initial_moisture REAL NOT NULL,
      drying_days INTEGER NOT NULL,
      current_moisture REAL NOT NULL,
      usage TEXT NOT NULL CHECK(usage IN ('细编', '粗编')),
      status TEXT NOT NULL CHECK(status IN ('入棚中', '晾晒中', '可投产', '已投产', '已降级')),
      re_sun_count INTEGER DEFAULT 0,
      is_downgraded INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      moisture REAL,
      remark TEXT
    );

    CREATE TABLE IF NOT EXISTS production_records (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL UNIQUE,
      process TEXT NOT NULL,
      operator TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
  saveDb()
}
