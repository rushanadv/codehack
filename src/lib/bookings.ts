import { getDb } from './db';
import { Booking, BookingStatus, ConditionReport } from './types';

export interface CreateBookingParams {
  resourceId: string;
  userId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  purpose: string;
}

export interface BookingResult {
  success: boolean;
  booking?: Booking;
  conflict?: boolean;
  conflictingBookingId?: string;
  missingSkills?: string[];
  error?: string;
}

export function createBooking(params: CreateBookingParams): BookingResult {
  const db = getDb();

  return db.transaction(() => {
    // 1. Validate resource exists
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(params.resourceId) as any;
    if (!resource) {
      return { success: false, error: 'Resource not found' };
    }

    if (resource.status === 'maintenance') {
      return { success: false, error: 'Resource is currently flagged under offline maintenance.' };
    }

    // 2. Validate time duration integrity
    const start = new Date(params.startTime);
    const end = new Date(params.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start.getTime() >= end.getTime()) {
      return { success: false, error: 'Invalid reservation time window: Start time must precede end time.' };
    }

    // 3. SkillGate Verification (Strict server-side check)
    const requiredSkills = db.prepare(`
      SELECT s.id, s.name, rs.is_mandatory
      FROM resource_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.resource_id = ? AND rs.is_mandatory = 1
    `).all(params.resourceId) as any[];

    if (requiredSkills.length > 0) {
      const userSkills = db.prepare(`
        SELECT skill_id 
        FROM user_skills 
        WHERE user_id = ? AND status = 'verified'
      `).all(params.userId) as any[];

      const verifiedSkillIds = new Set(userSkills.map(us => us.skill_id));
      const missingSkills = requiredSkills.filter(req => !verifiedSkillIds.has(req.id));

      if (missingSkills.length > 0) {
        return {
          success: false,
          missingSkills: missingSkills.map(m => m.name),
          error: `SkillGate Block: You have not verified the mandatory qualification: "${missingSkills[0].name}". Access denied.`
        };
      }
    }

    // 4. Concurrency & Overlap Prevention (ATOMIC CHECK IN TRANSACTION)
    // Enforces atomic lock across requested interval and automated turnaround buffer window
    const bufferMins = resource.turnaround_buffer_mins || 0;
    const conflicting = db.prepare(`
      SELECT id, start_time, end_time, user_id 
      FROM bookings
      WHERE resource_id = ?
        AND status IN ('confirmed', 'in_progress', 'delayed')
        AND (datetime(start_time) < datetime(?, '+' || ? || ' minutes') AND datetime(end_time, '+' || ? || ' minutes') > datetime(?))
      LIMIT 1
    `).get(params.resourceId, params.endTime, bufferMins, bufferMins, params.startTime) as any;

    if (conflicting) {
      return {
        success: false,
        conflict: true,
        conflictingBookingId: conflicting.id,
        error: `Booking Conflict: The requested slot overlaps with confirmed reservation [${new Date(conflicting.start_time).toLocaleTimeString()} - ${new Date(conflicting.end_time).toLocaleTimeString()}]. Consider joining the FairShare waitlist or exploring Slotly Match alternatives.`
      };
    }

    // 5. Calculate total cost
    const durationHours = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const totalCost = Math.round(durationHours * (resource.hourly_rate || 0));

    // 5. Insert Booking
    const bookingId = `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO bookings (
        id, resource_id, user_id, start_time, end_time, scheduled_return_time,
        status, purpose, total_cost, delay_minutes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingId,
      params.resourceId,
      params.userId,
      params.startTime,
      params.endTime,
      params.endTime,
      'confirmed', // Instantly confirmed when constraints pass!
      params.purpose,
      totalCost,
      0,
      nowIso,
      nowIso
    );

    // 6. Log audit event
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-bkg-${Date.now()}`,
      'booking',
      bookingId,
      'BOOKING_CREATED_AND_CONFIRMED',
      params.userId,
      JSON.stringify({ resourceId: params.resourceId, startTime: params.startTime, endTime: params.endTime, totalCost }),
      nowIso
    );

    // 7. Notify Resource Owner
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `notif-bkg-${Date.now()}`,
      resource.owner_id,
      'New Confirmed Reservation',
      `A new reservation was confirmed for ${resource.title} (${durationHours.toFixed(1)} hrs).`,
      'info',
      `/bookings/${bookingId}`,
      nowIso
    );

    const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as Booking;
    return { success: true, booking: created };
  })();
}

export function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  actorId: string,
  notes: string = ''
): boolean {
  const db = getDb();

  return db.transaction(() => {
    const booking = db.prepare(`
      SELECT b.*, r.title as resource_title, r.owner_id 
      FROM bookings b 
      JOIN resources r ON b.resource_id = r.id 
      WHERE b.id = ?
    `).get(bookingId) as any;

    if (!booking) return false;

    // Validate state transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['returned', 'delayed', 'disputed'],
      delayed: ['returned', 'disputed'],
      returned: [],
      cancelled: [],
      disputed: ['returned', 'cancelled']
    };

    const allowed = validTransitions[booking.status as BookingStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${booking.status} to ${newStatus}`);
    }

    const nowIso = new Date().toISOString();
    const actualReturnTime = (newStatus === 'returned') ? nowIso : booking.actual_return_time;

    db.prepare(`
      UPDATE bookings 
      SET status = ?, actual_return_time = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, actualReturnTime, nowIso, bookingId);

    // Update resource status if relevant
    if (newStatus === 'in_progress') {
      db.prepare("UPDATE resources SET status = 'in_use' WHERE id = ?").run(booking.resource_id);
    } else if (newStatus === 'returned' || newStatus === 'cancelled') {
      db.prepare("UPDATE resources SET status = 'available' WHERE id = ?").run(booking.resource_id);
    }

    // Log audit
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-stat-${Date.now()}`,
      'booking',
      bookingId,
      `STATUS_CHANGED_${newStatus.toUpperCase()}`,
      actorId,
      JSON.stringify({ previousStatus: booking.status, newStatus, notes }),
      nowIso
    );

    // Notify user
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `notif-stat-${Date.now()}`,
      booking.user_id,
      `Booking Status Updated: ${newStatus.toUpperCase()}`,
      `Your reservation for ${booking.resource_title} is now ${newStatus}.`,
      newStatus === 'confirmed' ? 'success' : 'info',
      `/bookings/${bookingId}`,
      nowIso
    );

    return true;
  })();
}

export function submitConditionReport(params: {
  bookingId: string;
  resourceId: string;
  reportType: 'checkout' | 'return';
  conditionRating: string;
  checklist: Record<string, any>;
  discrepancies?: string;
  photoUrl?: string;
  reportedBy: string;
}): boolean {
  const db = getDb();

  return db.transaction(() => {
    const reportId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO condition_reports (
        id, booking_id, resource_id, report_type, condition_rating,
        checklist, discrepancies, photo_url, reported_by, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      params.bookingId,
      params.resourceId,
      params.reportType,
      params.conditionRating,
      JSON.stringify(params.checklist),
      params.discrepancies || null,
      params.photoUrl || null,
      params.reportedBy,
      nowIso
    );

    // If report type is checkout, mark booking as in_progress
    if (params.reportType === 'checkout') {
      db.prepare("UPDATE bookings SET status = 'in_progress', updated_at = ? WHERE id = ?").run(nowIso, params.bookingId);
      db.prepare("UPDATE resources SET status = 'in_use' WHERE id = ?").run(params.resourceId);
    } else if (params.reportType === 'return') {
      db.prepare("UPDATE bookings SET status = 'returned', actual_return_time = ?, updated_at = ? WHERE id = ?").run(nowIso, nowIso, params.bookingId);
      db.prepare("UPDATE resources SET status = 'available', condition_rating = ? WHERE id = ?").run(params.conditionRating, params.resourceId);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-rep-${Date.now()}`,
      'condition_report',
      reportId,
      `CONDITION_REPORT_${params.reportType.toUpperCase()}`,
      params.reportedBy,
      JSON.stringify({ conditionRating: params.conditionRating, discrepancies: params.discrepancies }),
      nowIso
    );

    return true;
  })();
}

