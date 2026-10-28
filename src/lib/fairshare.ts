import { getDb } from './db';
import { WaitlistEntry } from './types';

export interface FairShareEvaluation {
  allowed: boolean;
  action: 'confirmed' | 'waitlisted' | 'rejected_eligibility';
  queuePosition?: number;
  priorityScore: number;
  explanation: string;
}

export function evaluateFairShareAllocation(
  resourceId: string,
  userId: string,
  requestedStart: string,
  requestedEnd: string,
  academicPriorityReason: string = 'Standard Academic Research'
): FairShareEvaluation {
  const db = getDb();

  // 1. Check SkillGate eligibility first
  const requiredSkills = db.prepare(`
    SELECT s.id, s.name FROM resource_skills rs
    JOIN skills s ON rs.skill_id = s.id
    WHERE rs.resource_id = ? AND rs.is_mandatory = 1
  `).all(resourceId) as any[];

  if (requiredSkills.length > 0) {
    const userSkills = db.prepare(`
      SELECT skill_id FROM user_skills WHERE user_id = ? AND status = 'verified'
    `).all(userId) as any[];
    const verified = new Set(userSkills.map(us => us.skill_id));
    const missing = requiredSkills.filter(r => !verified.has(r.id));
    if (missing.length > 0) {
      return {
        allowed: false,
        action: 'rejected_eligibility',
        priorityScore: 0,
        explanation: `FairShare Allocation Rejection: Missing prerequisite clearance [${missing[0].name}]. Safety prerequisites cannot be bypassed.`
      };
    }
  }

  // 2. Check overlap
  const conflict = db.prepare(`
    SELECT id, start_time, end_time FROM bookings
    WHERE resource_id = ?
      AND status IN ('confirmed', 'in_progress', 'delayed')
      AND (datetime(start_time) < datetime(?) AND datetime(end_time) > datetime(?))
    LIMIT 1
  `).get(resourceId, requestedEnd, requestedStart) as any;

  // 3. Compute priority score:
  // Base 50 + thesis bonus (+20) + early registration bonus (+5) - active bookings penalty (-10 per existing active)
  let priorityScore = 50;
  if (academicPriorityReason.toLowerCase().includes('thesis') || academicPriorityReason.toLowerCase().includes('defense')) {
    priorityScore += 25;
  } else if (academicPriorityReason.toLowerCase().includes('funded') || academicPriorityReason.toLowerCase().includes('sponsored')) {
    priorityScore += 15;
  }

  const activeBookingsCount = (db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status IN ('confirmed', 'in_progress')
  `).get(userId) as any).count;

  priorityScore = Math.max(10, priorityScore - activeBookingsCount * 10);

  if (!conflict) {
    return {
      allowed: true,
      action: 'confirmed',
      priorityScore,
      explanation: 'Slot clear. Allocated directly with priority score ' + priorityScore + '.'
    };
  }

  // 4. Overlap exists -> Calculate waitlist queue position
  const existingWaiters = db.prepare(`
    SELECT COUNT(*) as count FROM waitlist 
    WHERE resource_id = ? AND status = 'waiting'
  `).get(resourceId) as any;

  const queuePosition = (existingWaiters?.count || 0) + 1;

  return {
    allowed: false,
    action: 'waitlisted',
    queuePosition,
    priorityScore,
    explanation: `Waitlisted: This slot has a confirmed booking. FairShare assigned queue position ${queuePosition} (Calculated Priority Score: ${priorityScore} based on department quotas and active commitments).`
  };
}

export function joinWaitlist(
  resourceId: string,
  userId: string,
  requestedStart: string,
  requestedEnd: string,
  notes: string = ''
): WaitlistEntry {
  const db = getDb();

  const evalResult = evaluateFairShareAllocation(resourceId, userId, requestedStart, requestedEnd, notes);
  const waitlistId = `wl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO waitlist (
      id, resource_id, user_id, requested_start, requested_end,
      priority_score, queue_position, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    waitlistId,
    resourceId,
    userId,
    requestedStart,
    requestedEnd,
    evalResult.priorityScore,
    evalResult.queuePosition || 1,
    'waiting',
    notes,
    nowIso
  );

  // Log audit event
  db.prepare(`
    INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `aud-wl-${Date.now()}`,
    'waitlist',
    waitlistId,
    'WAITLIST_ENTRY_QUEUED',
    userId,
    JSON.stringify({ queuePosition: evalResult.queuePosition, priorityScore: evalResult.priorityScore, explanation: evalResult.explanation }),
    nowIso
  );

  return db.prepare('SELECT * FROM waitlist WHERE id = ?').get(waitlistId) as WaitlistEntry;
}

export function getWaitlistForResource(resourceId: string): WaitlistEntry[] {
  const db = getDb();
  return db.prepare(`
    SELECT w.*, u.name as user_name, u.department as user_department, r.title as resource_title
    FROM waitlist w
    JOIN users u ON w.user_id = u.id
    JOIN resources r ON w.resource_id = r.id
    WHERE w.resource_id = ? AND w.status = 'waiting'
    ORDER BY w.queue_position ASC, w.priority_score DESC
  `).all(resourceId) as WaitlistEntry[];
}
