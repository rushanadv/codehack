import path from 'path';
import fs from 'fs';
import { createInitialDemoData, DemoDataset } from './demo-data';

// ============================================================================
// SLOTLY UNIFIED DATA LAYER
// 1. Uses native better-sqlite3 locally with disk persistence (WAL mode)
// 2. Automatically falls back to high-performance in-memory demo engine on Vercel
//    or in read-only serverless environments.
// ============================================================================

export interface Statement<T = any> {
  all(...params: any[]): T[];
  get(...params: any[]): T | undefined;
  run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
}

export interface DatabaseInterface {
  prepare(sql: string): Statement;
  transaction<F extends (...args: any[]) => any>(fn: F): F;
  exec(sql: string): void;
  pragma(pragmaStr: string): any;
}

let inMemoryStore: DemoDataset | null = null;

export function getInMemoryStore(): DemoDataset {
  if (!inMemoryStore) {
    inMemoryStore = createInitialDemoData();
  }
  return inMemoryStore;
}

export function resetInMemoryStore(): void {
  inMemoryStore = createInitialDemoData();
}

// ----------------------------------------------------------------------------
// IN-MEMORY SQL QUERY EMULATOR (Zero-dependency serverless fallback)
// ----------------------------------------------------------------------------
function createInMemoryStatement(sql: string): Statement {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();

  return {
    all(...params: any[]): any[] {
      const store = getInMemoryStore();

      // 1. Resources Query (with joins to users)
      if (normalizedSql.includes('FROM resources r') || normalizedSql.includes('FROM resources')) {
        let results = store.resources.map(r => {
          const owner = store.users.find(u => u.id === r.owner_id);
          return {
            ...r,
            owner_name: owner?.name || 'Authorized Lab Custodian',
            owner_email: owner?.email || 'custodian@slotly.internal',
            owner_department: owner?.department || 'Research Operations',
          };
        });

        // Filter by category
        if (normalizedSql.includes('r.category = ?') || normalizedSql.includes('category = ?')) {
          const catParam = params[0];
          if (catParam && catParam !== 'all') {
            results = results.filter(r => r.category === catParam);
          }
        }

        // Filter by status
        if (normalizedSql.includes("r.status = ?")) {
          const statusParam = params.find(p => ['available', 'reserved', 'in_use', 'maintenance', 'restricted'].includes(p));
          if (statusParam && statusParam !== 'all') {
            results = results.filter(r => r.status === statusParam);
          }
        }
        if (normalizedSql.includes("status = 'available'")) {
          results = results.filter(r => r.status === 'available');
        }

        // Filter by ID exclusion
        if (normalizedSql.includes('id != ?')) {
          const excludeId = params.find(p => typeof p === 'string' && p.startsWith('res-'));
          if (excludeId) {
            results = results.filter(r => r.id !== excludeId);
          }
        }

        // Filter by location / building
        if (normalizedSql.includes('r.location LIKE ?')) {
          const locParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
          if (locParam) {
            const cleanLoc = locParam.replace(/%/g, '').toLowerCase();
            results = results.filter(r => 
              (r.location && r.location.toLowerCase().includes(cleanLoc)) ||
              (r.building && r.building.toLowerCase().includes(cleanLoc))
            );
          }
        }

        // Filter by hourly_rate <= ?
        if (normalizedSql.includes('r.hourly_rate <= ?')) {
          const priceParam = params.find(p => typeof p === 'number');
          if (priceParam !== undefined) {
            results = results.filter(r => r.hourly_rate <= priceParam);
          }
        }

        // Filter by text search q
        if (normalizedSql.includes('LOWER(r.title) LIKE ?')) {
          const searchParam = params[params.length - 1];
          if (typeof searchParam === 'string' && searchParam.startsWith('%')) {
            const cleanQ = searchParam.replace(/%/g, '').toLowerCase();
            results = results.filter(r =>
              r.title.toLowerCase().includes(cleanQ) ||
              r.description.toLowerCase().includes(cleanQ) ||
              r.subcategory.toLowerCase().includes(cleanQ)
            );
          }
        }

        // Sorting
        if (normalizedSql.includes('r.hourly_rate ASC')) {
          results.sort((a, b) => a.hourly_rate - b.hourly_rate);
        } else if (normalizedSql.includes('r.hourly_rate DESC')) {
          results.sort((a, b) => b.hourly_rate - a.hourly_rate);
        } else {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        // Limit
        if (normalizedSql.includes('LIMIT 3')) {
          results = results.slice(0, 3);
        }

        return results;
      }

      // 2. Resource Skills Query (with skills join)
      if (normalizedSql.includes('FROM resource_skills rs') || normalizedSql.includes('FROM resource_skills')) {
        let results = store.resourceSkills.map(rs => {
          const skill = store.skills.find(s => s.id === rs.skill_id);
          return {
            resource_id: rs.resource_id,
            id: skill?.id || rs.skill_id,
            name: skill?.name || 'Required Skill',
            category: skill?.category || 'General',
            is_mandatory: rs.is_mandatory,
          };
        });

        if (normalizedSql.includes('rs.resource_id = ?')) {
          const resId = params[0];
          results = results.filter(r => r.resource_id === resId);
        }

        return results;
      }

      // 3. User Skills Query
      if (normalizedSql.includes('FROM user_skills us') || normalizedSql.includes('FROM user_skills')) {
        let results = store.userSkills.map(us => {
          const skill = store.skills.find(s => s.id === us.skill_id);
          return {
            ...us,
            skill_name: skill?.name || 'Verified Skill',
            skill_category: skill?.category || 'General',
          };
        });

        if (normalizedSql.includes('us.user_id = ?') || normalizedSql.includes('user_id = ?')) {
          const userId = params[0];
          results = results.filter(u => u.user_id === userId);
        }

        if (normalizedSql.includes("status = 'verified'") || normalizedSql.includes("us.status = 'verified'")) {
          results = results.filter(u => u.status === 'verified');
        }

        return results;
      }

      // 4. Skills Query
      if (normalizedSql.includes('FROM skills')) {
        return [...store.skills];
      }

      // 5. Users Query
      if (normalizedSql.includes('FROM users')) {
        const users = [...store.users];
        if (normalizedSql.includes('ORDER BY role ASC, name ASC')) {
          users.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
        }
        return users;
      }

      // 6. Bookings Query (with resources & users join)
      if (normalizedSql.includes('FROM bookings b') || normalizedSql.includes('FROM bookings')) {
        let results = store.bookings.map(b => {
          const res = store.resources.find(r => r.id === b.resource_id);
          const user = store.users.find(u => u.id === b.user_id);
          return {
            ...b,
            resource_title: res?.title || 'Research Asset',
            resource_category: res?.category || 'equipment',
            resource_passport_id: res?.passport_id || 'IXP-001',
            resource_hourly_rate: res?.hourly_rate || 100,
            turnaround_buffer_mins: res?.turnaround_buffer_mins || 30,
            resource_image: res?.image_url || '',
            user_name: user?.name || 'Verified Researcher',
            user_email: user?.email || 'researcher@slotly.internal',
            user_role: user?.role || 'user',
          };
        });

        if (normalizedSql.includes('b.user_id = ?') || normalizedSql.includes('user_id = ?')) {
          const uid = params[0];
          if (uid) results = results.filter(b => b.user_id === uid);
        }

        if (normalizedSql.includes('b.status = ?') || normalizedSql.includes('status = ?')) {
          const st = params.find(p => ['pending', 'confirmed', 'in_progress', 'returned', 'delayed', 'cancelled', 'disputed'].includes(p));
          if (st) results = results.filter(b => b.status === st);
        }

        if (normalizedSql.includes('b.resource_id = ?') || normalizedSql.includes('resource_id = ?')) {
          const rid = params[0];
          if (rid && rid.startsWith('res-')) results = results.filter(b => b.resource_id === rid);
        }

        results.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        return results;
      }

      // 7. Disruptions Query
      if (normalizedSql.includes('FROM disruptions')) {
        let results = store.disruptions.map(d => {
          const delayedB = store.bookings.find(b => b.id === d.delayed_booking_id);
          const delayedR = delayedB ? store.resources.find(r => r.id === delayedB.resource_id) : null;
          const altR = d.suggested_alternative_resource_id ? store.resources.find(r => r.id === d.suggested_alternative_resource_id) : null;
          const affectedB = d.affected_booking_id ? store.bookings.find(b => b.id === d.affected_booking_id) : null;
          const affectedU = affectedB ? store.users.find(u => u.id === affectedB.user_id) : null;

          return {
            ...d,
            delayed_resource_title: delayedR?.title || 'Target Asset',
            suggested_alternative_title: altR?.title || null,
            affected_user_name: affectedU?.name || null,
          };
        });

        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return results;
      }

      // 8. Notifications Query
      if (normalizedSql.includes('FROM notifications')) {
        let results = [...store.notifications];
        if (normalizedSql.includes('user_id = ?')) {
          const uid = params[0];
          results = results.filter(n => n.user_id === uid);
        }
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return results;
      }

      // 9. Waitlist Query
      if (normalizedSql.includes('FROM waitlist')) {
        let results = store.waitlist.map(w => {
          const res = store.resources.find(r => r.id === w.resource_id);
          const user = store.users.find(u => u.id === w.user_id);
          return {
            ...w,
            resource_title: res?.title || 'Target Resource',
            resource_category: res?.category || 'equipment',
            user_name: user?.name || 'Queued Researcher',
            user_email: user?.email || '',
            user_department: user?.department || '',
          };
        });

        if (normalizedSql.includes('resource_id = ?')) {
          const rid = params[0];
          results = results.filter(w => w.resource_id === rid);
        }

        results.sort((a, b) => b.priority_score - a.priority_score || a.queue_position - b.queue_position);
        return results;
      }

      // 10. Condition Reports Query
      if (normalizedSql.includes('FROM condition_reports')) {
        let results = [...store.conditionReports];
        if (normalizedSql.includes('resource_id = ?')) {
          const rid = params[0];
          results = results.filter(c => c.resource_id === rid);
        }
        if (normalizedSql.includes('booking_id = ?')) {
          const bid = params[0];
          results = results.filter(c => c.booking_id === bid);
        }
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return results;
      }

      // 11. Maintenance Records Query
      if (normalizedSql.includes('FROM maintenance_records')) {
        let results = [...store.maintenanceRecords];
        if (normalizedSql.includes('resource_id = ?')) {
          const rid = params[0];
          results = results.filter(m => m.resource_id === rid);
        }
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return results;
      }

      // 12. Audit Events Query
      if (normalizedSql.includes('FROM audit_events')) {
        let results = [...store.auditEvents];
        if (normalizedSql.includes('entity_id = ?')) {
          const eid = params[0];
          results = results.filter(a => a.entity_id === eid);
        }
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return results;
      }

      return [];
    },

    get(...params: any[]): any {
      const store = getInMemoryStore();

      // 1. Single user
      if (normalizedSql.includes('FROM users WHERE id = ?')) {
        const id = params[0];
        return store.users.find(u => u.id === id);
      }
      if (normalizedSql.includes('SELECT id FROM users WHERE id = ?')) {
        const id = params[0];
        const u = store.users.find(u => u.id === id);
        return u ? { id: u.id } : undefined;
      }

      // 2. Single resource
      if (normalizedSql.includes('FROM resources') && (normalizedSql.includes('id = ?') || normalizedSql.includes('slug = ?'))) {
        const idOrSlug = params[0];
        const secondParam = params[1] || idOrSlug;
        const res = store.resources.find(r => r.id === idOrSlug || r.slug === idOrSlug || r.id === secondParam || r.slug === secondParam);
        if (!res) return undefined;
        const owner = store.users.find(u => u.id === res.owner_id);
        return {
          ...res,
          owner_name: owner?.name || 'Authorized Lab Custodian',
          owner_email: owner?.email || 'custodian@slotly.internal',
          owner_department: owner?.department || 'Research Operations',
        };
      }

      // 3. Next reservation on a resource (Promise Protection lookup)
      if (normalizedSql.includes('FROM bookings') && normalizedSql.includes('datetime(') && normalizedSql.includes('ORDER BY datetime(b.start_time) ASC')) {
        const resId = params[0];
        const excludeId = params[1];
        const afterTime = params[2];

        const next = store.bookings
          .filter(b => b.resource_id === resId && b.id !== excludeId && ['confirmed', 'pending'].includes(b.status) && new Date(b.start_time).getTime() >= new Date(afterTime).getTime())
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

        if (!next) return undefined;
        const user = store.users.find(u => u.id === next.user_id);
        return {
          ...next,
          user_name: user?.name || 'Affected User',
          user_email: user?.email || '',
        };
      }

      // 4. Booking overlap check
      if (normalizedSql.includes('FROM bookings') && (normalizedSql.includes('datetime(start_time)') || normalizedSql.includes('datetime('))) {
        const resId = params[0];
        const reqEnd = params[1];
        const bufferMins = typeof params[2] === 'number' ? params[2] : (typeof params[3] === 'number' ? params[3] : 30);
        const reqStart = params[params.length - 1];

        const bufferMs = bufferMins * 60000;
        const reqStartMs = new Date(reqStart).getTime();
        const reqEndPlusBuffer = new Date(reqEnd).getTime() + bufferMs;

        const conflict = store.bookings.find(b => {
          if (b.resource_id !== resId) return false;
          if (!['confirmed', 'in_progress', 'delayed'].includes(b.status)) return false;

          const bStartMs = new Date(b.start_time).getTime();
          const bEndPlusBuffer = new Date(b.end_time).getTime() + bufferMs;

          // Conflict condition matching SQL:
          // datetime(start_time) < datetime(reqEnd, '+buffer') AND datetime(end_time, '+buffer') > datetime(reqStart)
          return bStartMs < reqEndPlusBuffer && bEndPlusBuffer > reqStartMs;
        });

        return conflict ? { id: conflict.id, start_time: conflict.start_time, end_time: conflict.end_time, user_id: conflict.user_id } : undefined;
      }

      // 5. Single booking by ID
      if (normalizedSql.includes('FROM bookings') && (normalizedSql.includes('WHERE id = ?') || normalizedSql.includes('WHERE b.id = ?'))) {
        const bid = params[0];
        const b = store.bookings.find(b => b.id === bid);
        if (!b) return undefined;
        const res = store.resources.find(r => r.id === b.resource_id);
        const user = store.users.find(u => u.id === b.user_id);
        return {
          ...b,
          resource_title: res?.title || 'Research Asset',
          resource_category: res?.category || 'equipment',
          resource_passport_id: res?.passport_id || 'IXP-001',
          resource_hourly_rate: res?.hourly_rate || 100,
          turnaround_buffer_mins: res?.turnaround_buffer_mins || 30,
          resource_image: res?.image_url || '',
          user_name: user?.name || 'Verified Researcher',
          user_email: user?.email || 'researcher@slotly.internal',
          user_role: user?.role || 'user',
        };
      }

      // 6. Counts (e.g. waitlistCount, booking count)
      if (normalizedSql.toUpperCase().includes('COUNT(*)')) {
        if (normalizedSql.includes('FROM waitlist')) {
          if (normalizedSql.includes('resource_id = ?')) {
            const rid = params[0];
            const activeW = store.waitlist.filter(w => w.resource_id === rid && w.status === 'waiting');
            return { count: activeW.length, c: activeW.length };
          }
          const activeW = store.waitlist.filter(w => w.status === 'waiting');
          return { count: activeW.length, c: activeW.length };
        }
        if (normalizedSql.includes('FROM bookings')) {
          if (normalizedSql.includes('user_id = ?')) {
            const uid = params[0];
            const matched = store.bookings.filter(b => b.user_id === uid && ['confirmed', 'in_progress'].includes(b.status));
            return { count: matched.length, c: matched.length };
          }
          if (normalizedSql.includes('purpose = ?')) {
            const purpose = params[0];
            const matched = store.bookings.filter(b => b.purpose === purpose);
            return { count: matched.length, c: matched.length };
          }
          const activeB = store.bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
          return { count: activeB.length, c: activeB.length };
        }
      }

      // 7. Single disruption
      if (normalizedSql.includes('FROM disruptions WHERE id = ?')) {
        const id = params[0];
        return store.disruptions.find(d => d.id === id);
      }

      // 8. Single waitlist entry
      if (normalizedSql.includes('FROM waitlist WHERE id = ?')) {
        const id = params[0];
        return store.waitlist.find(w => w.id === id);
      }

      // Default: try calling all() and taking first element
      const allResults = this.all(...params);
      return allResults[0];
    },

    run(...params: any[]): { changes: number; lastInsertRowid: number | bigint } {
      const store = getInMemoryStore();

      // DYNAMIC INSERT HANDLER: parses column names from SQL string
      const insertMatch = normalizedSql.match(/INSERT INTO (\w+)\s*\(([^)]+)\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1].toLowerCase();
        const cols = insertMatch[2].split(',').map(c => c.trim().toLowerCase());
        const row: Record<string, any> = {};
        cols.forEach((col, idx) => {
          row[col] = params[idx];
        });

        if (tableName === 'bookings') {
          store.bookings.push(row as any);
          return { changes: 1, lastInsertRowid: store.bookings.length };
        }
        if (tableName === 'disruptions') {
          store.disruptions.push(row as any);
          return { changes: 1, lastInsertRowid: store.disruptions.length };
        }
        if (tableName === 'notifications') {
          store.notifications.push(row as any);
          return { changes: 1, lastInsertRowid: store.notifications.length };
        }
        if (tableName === 'audit_events') {
          store.auditEvents.push(row as any);
          return { changes: 1, lastInsertRowid: store.auditEvents.length };
        }
        if (tableName === 'condition_reports') {
          store.conditionReports.push(row as any);
          return { changes: 1, lastInsertRowid: store.conditionReports.length };
        }
        if (tableName === 'waitlist') {
          store.waitlist.push(row as any);
          return { changes: 1, lastInsertRowid: store.waitlist.length };
        }
        if (tableName === 'resources') {
          store.resources.push(row as any);
          return { changes: 1, lastInsertRowid: store.resources.length };
        }
        if (tableName === 'users') {
          store.users.push(row as any);
          return { changes: 1, lastInsertRowid: store.users.length };
        }
        if (tableName === 'skills') {
          store.skills.push(row as any);
          return { changes: 1, lastInsertRowid: store.skills.length };
        }
        if (tableName === 'user_skills') {
          store.userSkills.push(row as any);
          return { changes: 1, lastInsertRowid: store.userSkills.length };
        }
        if (tableName === 'resource_skills') {
          store.resourceSkills.push(row as any);
          return { changes: 1, lastInsertRowid: store.resourceSkills.length };
        }
        if (tableName === 'maintenance_records') {
          store.maintenanceRecords.push(row as any);
          return { changes: 1, lastInsertRowid: store.maintenanceRecords.length };
        }
      }

      // UPDATE bookings
      if (normalizedSql.startsWith('UPDATE bookings')) {
        const id = params[params.length - 1];
        const b = store.bookings.find(x => x.id === id);
        if (b) {
          if (normalizedSql.includes('resource_id = ?')) {
            b.resource_id = params[0];
          }
          if (normalizedSql.includes('status = ?')) {
            b.status = params[0];
          } else if (normalizedSql.includes("status = 'in_progress'")) {
            b.status = 'in_progress';
          } else if (normalizedSql.includes("status = 'returned'")) {
            b.status = 'returned';
            b.actual_return_time = new Date().toISOString();
          } else if (normalizedSql.includes("status = 'delayed'")) {
            b.status = 'delayed';
          }

          if (normalizedSql.includes('actual_return_time = ?')) {
            b.actual_return_time = params[1] || new Date().toISOString();
          }
          if (normalizedSql.includes('delay_minutes = ?')) {
            b.delay_minutes = params[0];
          }
          if (normalizedSql.includes('scheduled_return_time = ?')) {
            b.scheduled_return_time = params[1];
          }
          b.updated_at = new Date().toISOString();
          return { changes: 1, lastInsertRowid: 0 };
        }
      }

      // UPDATE user_skills
      if (normalizedSql.startsWith('UPDATE user_skills')) {
        const id = params[params.length - 1];
        const us = store.userSkills.find(x => x.id === id);
        if (us) {
          us.status = params[0];
          us.verified_at = params[1];
          us.verified_by = params[2];
          return { changes: 1, lastInsertRowid: 0 };
        }
      }

      // UPDATE resources
      if (normalizedSql.startsWith('UPDATE resources')) {
        const id = params[params.length - 1];
        const r = store.resources.find(x => x.id === id);
        if (r) {
          if (normalizedSql.includes("status = 'in_use'")) {
            r.status = 'in_use';
          } else if (normalizedSql.includes("status = 'available'")) {
            r.status = 'available';
          } else if (normalizedSql.includes('status = ?')) {
            r.status = params[0];
          }
          if (normalizedSql.includes('condition_rating = ?')) {
            r.condition_rating = params[0];
          }
          return { changes: 1, lastInsertRowid: 0 };
        }
      }

      // UPDATE notifications
      if (normalizedSql.startsWith('UPDATE notifications')) {
        if (normalizedSql.includes('WHERE user_id = ?')) {
          const uid = params[0];
          store.notifications.forEach(n => {
            if (n.user_id === uid) n.read_status = 1;
          });
          return { changes: store.notifications.length, lastInsertRowid: 0 };
        }
        if (normalizedSql.includes('WHERE id = ? AND user_id = ?')) {
          const [id, uid] = params;
          const notif = store.notifications.find(n => n.id === id && n.user_id === uid);
          if (notif) notif.read_status = 1;
          return { changes: 1, lastInsertRowid: 0 };
        }
      }

      // UPDATE disruptions
      if (normalizedSql.startsWith('UPDATE disruptions')) {
        const id = params[params.length - 1];
        const d = store.disruptions.find(x => x.id === id);
        if (d) {
          d.resolution_action = params[0];
          d.resolved_at = params[1];
          d.resolved_by = params[2];
          d.notes = params[3];
          return { changes: 1, lastInsertRowid: 0 };
        }
      }

      // DELETE FROM
      if (normalizedSql.startsWith('DELETE FROM')) {
        const deleteMatch = normalizedSql.match(/DELETE FROM (\w+)/i);
        if (deleteMatch) {
          const tbl = deleteMatch[1].toLowerCase();
          if (tbl === 'bookings') store.bookings = [];
          if (tbl === 'resources') store.resources = [];
          if (tbl === 'users') store.users = [];
          if (tbl === 'skills') store.skills = [];
          if (tbl === 'user_skills') store.userSkills = [];
          if (tbl === 'resource_skills') store.resourceSkills = [];
          if (tbl === 'waitlist') store.waitlist = [];
          if (tbl === 'condition_reports') store.conditionReports = [];
          if (tbl === 'maintenance_records') store.maintenanceRecords = [];
          if (tbl === 'disruptions') store.disruptions = [];
          if (tbl === 'notifications') store.notifications = [];
          if (tbl === 'audit_events') store.auditEvents = [];
        }
        return { changes: 0, lastInsertRowid: 0 };
      }

      return { changes: 1, lastInsertRowid: 0 };
    }
  };
}

class InMemoryDatabase implements DatabaseInterface {
  prepare(sql: string): Statement {
    return createInMemoryStatement(sql);
  }

  transaction<F extends (...args: any[]) => any>(fn: F): F {
    return ((...args: any[]) => fn(...args)) as F;
  }

  exec(sql: string): void {
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      createInMemoryStatement(stmt).run();
    }
  }

  pragma(pragmaStr: string): any {
    return null;
  }
}

// ----------------------------------------------------------------------------
// NATIVE BETTER-SQLITE3 ENGINE (Used when available locally)
// ----------------------------------------------------------------------------
let dbInstance: DatabaseInterface | null = null;

function initSchema(db: any) {
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
      specifications TEXT NOT NULL,
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
      checklist TEXT NOT NULL,
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
      payload TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function getDb(): DatabaseInterface {
  if (dbInstance) {
    return dbInstance;
  }

  // Check if we should use the in-memory demo engine directly
  // (e.g. Vercel serverless environment, read-only filesystem, or explicit demo mode)
  const isVercel = process.env.VERCEL === '1';
  const isExplicitDemo = process.env.SLOTLY_DEMO_MODE === 'true';

  if (isVercel || isExplicitDemo) {
    dbInstance = new InMemoryDatabase();
    return dbInstance;
  }

  try {
    // Attempt local better-sqlite3 with persistent disk file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BetterSqlite3 = require('better-sqlite3');
    const DB_DIR = path.join(process.cwd(), 'data');
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const DB_PATH = path.join(DB_DIR, 'idlex.db');
    const nativeDb = new BetterSqlite3(DB_PATH);
    nativeDb.pragma('journal_mode = WAL');
    nativeDb.pragma('foreign_keys = ON');
    initSchema(nativeDb);
    dbInstance = nativeDb as DatabaseInterface;
    return dbInstance;
  } catch (err) {
    // Graceful fallback to serverless in-memory demo engine
    console.warn('Native SQLite unavailable, activating Slotly in-memory demo engine:', err);
    dbInstance = new InMemoryDatabase();
    return dbInstance;
  }
}
