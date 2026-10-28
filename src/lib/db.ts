import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'idlex.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'owner', 'admin')) NOT NULL DEFAULT 'user',
      department TEXT,
      institution TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      status TEXT CHECK(status IN ('verified', 'pending', 'rejected')) NOT NULL DEFAULT 'pending',
      certificate_ref TEXT,
      verified_at TEXT,
      verified_by TEXT,
      UNIQUE(user_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT CHECK(category IN ('equipment', 'space', 'digital')) NOT NULL,
      subcategory TEXT NOT NULL,
      description TEXT NOT NULL,
      specifications TEXT NOT NULL, -- JSON
      location TEXT NOT NULL,
      building TEXT NOT NULL,
      room TEXT NOT NULL,
      hourly_rate REAL NOT NULL DEFAULT 0,
      deposit REAL NOT NULL DEFAULT 0,
      turnaround_buffer_mins INTEGER NOT NULL DEFAULT 30,
      owner_id TEXT NOT NULL REFERENCES users(id),
      status TEXT CHECK(status IN ('available', 'reserved', 'in_use', 'maintenance', 'restricted')) NOT NULL DEFAULT 'available',
      condition_rating TEXT CHECK(condition_rating IN ('pristine', 'good', 'fair', 'maintenance_required')) NOT NULL DEFAULT 'pristine',
      serial_number TEXT NOT NULL,
      passport_id TEXT UNIQUE NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_skills (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      is_mandatory INTEGER NOT NULL DEFAULT 1,
      UNIQUE(resource_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      scheduled_return_time TEXT NOT NULL,
      actual_return_time TEXT,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'in_progress', 'returned', 'delayed', 'cancelled', 'disputed')) NOT NULL DEFAULT 'pending',
      purpose TEXT NOT NULL,
      total_cost REAL NOT NULL DEFAULT 0,
      delay_minutes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_resource_time 
    ON bookings (resource_id, start_time, end_time, status);

    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      requested_start TEXT NOT NULL,
      requested_end TEXT NOT NULL,
      priority_score INTEGER NOT NULL DEFAULT 50,
      queue_position INTEGER NOT NULL,
      status TEXT CHECK(status IN ('waiting', 'offered', 'fulfilled', 'cancelled')) NOT NULL DEFAULT 'waiting',
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS condition_reports (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      report_type TEXT CHECK(report_type IN ('checkout', 'return')) NOT NULL,
      condition_rating TEXT NOT NULL,
      checklist TEXT NOT NULL, -- JSON
      discrepancies TEXT,
      photo_url TEXT,
      reported_by TEXT NOT NULL REFERENCES users(id),
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      technician_id TEXT NOT NULL,
      maintenance_type TEXT NOT NULL,
      description TEXT NOT NULL,
      parts_replaced TEXT,
      cost REAL NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS disruptions (
      id TEXT PRIMARY KEY,
      delayed_booking_id TEXT NOT NULL REFERENCES bookings(id),
      affected_booking_id TEXT REFERENCES bookings(id),
      buffer_minutes INTEGER NOT NULL,
      delay_duration_minutes INTEGER NOT NULL,
      risk_level TEXT CHECK(risk_level IN ('critical', 'moderate', 'nominal')) NOT NULL,
      suggested_alternative_resource_id TEXT REFERENCES resources(id),
      resolution_action TEXT,
      resolved_at TEXT,
      resolved_by TEXT REFERENCES users(id),
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('info', 'warning', 'alert', 'success')) NOT NULL DEFAULT 'info',
      link TEXT,
      read_status INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      payload TEXT, -- JSON
      created_at TEXT NOT NULL
    );
  `);
}

