import { getDb } from './db';
import { DisruptionEvent, Booking, Resource } from './types';

export interface DelaySimulationResult {
  disruption: DisruptionEvent;
  delayedBooking: Booking;
  affectedBooking: Booking | null;
  suggestedAlternative: Resource | null;
  bufferMinutes: number;
  slackMinutes: number;
  riskLevel: 'critical' | 'moderate' | 'nominal';
  explanation: string;
}

export function simulateDelay(
  bookingId: string,
  delayMinutes: number,
  actorId: string,
  reason: string = 'Operational overrun during experiment run'
): DelaySimulationResult {
  const db = getDb();

  // Run in transaction to guarantee consistency
  const result = db.transaction(() => {
    // 1. Fetch delayed booking & resource
    const delayedBooking = db.prepare(`
      SELECT b.*, r.title as resource_title, r.owner_id, r.turnaround_buffer_mins, r.category as resource_category, r.subcategory as resource_subcategory
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      WHERE b.id = ?
    `).get(bookingId) as any;

    if (!delayedBooking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const turnaroundBuffer = delayedBooking.turnaround_buffer_mins || 30;
    const currentDelay = (delayedBooking.delay_minutes || 0) + delayMinutes;

    // Calculate new projected return time
    const originalEnd = new Date(delayedBooking.scheduled_return_time || delayedBooking.end_time);
    const newProjectedReturn = new Date(originalEnd.getTime() + currentDelay * 60000);
    const bufferClearanceTime = new Date(newProjectedReturn.getTime() + turnaroundBuffer * 60000);

    // Update delayed booking
    db.prepare(`
      UPDATE bookings 
      SET delay_minutes = ?, status = 'delayed', updated_at = ?
      WHERE id = ?
    `).run(currentDelay, new Date().toISOString(), bookingId);

    // 2. Find next scheduled reservation for this resource
    const nextBooking = db.prepare(`
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.resource_id = ? 
        AND b.id != ?
        AND b.status IN ('confirmed', 'pending')
        AND datetime(b.start_time) >= datetime(?)
      ORDER BY datetime(b.start_time) ASC
      LIMIT 1
    `).get(delayedBooking.resource_id, bookingId, delayedBooking.start_time) as any;

    let riskLevel: 'critical' | 'moderate' | 'nominal' = 'nominal';
    let slackMinutes = 999;
    let suggestedAlternative: Resource | null = null;
    let affectedBooking: Booking | null = null;
    let explanation = '';

    if (nextBooking) {
      affectedBooking = nextBooking;
      const nextStart = new Date(nextBooking.start_time);
      slackMinutes = Math.round((nextStart.getTime() - newProjectedReturn.getTime()) / 60000);

      if (nextStart.getTime() < newProjectedReturn.getTime()) {
        riskLevel = 'critical';
        explanation = `CRITICAL CASCADE: Delay of +${currentDelay}m pushes completion to ${newProjectedReturn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, directly colliding with ${nextBooking.user_name}'s reservation starting at ${nextStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (deficit of ${Math.abs(slackMinutes)} mins).`;
      } else if (nextStart.getTime() < bufferClearanceTime.getTime()) {
        riskLevel = 'moderate';
        explanation = `BUFFER BREACH: Completion estimated at ${newProjectedReturn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} encroaches on the mandatory ${turnaroundBuffer}m decontamination & turnaround buffer before ${nextBooking.user_name}'s session at ${nextStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      } else {
        riskLevel = 'nominal';
        explanation = `ABSORBED BY BUFFER: Delay of +${currentDelay}m is absorbed within existing gap (${slackMinutes} mins available). No immediate reservation collision.`;
      }

      // If at risk, proactively identify an alternative available resource
      if (riskLevel !== 'nominal') {
        const alternative = db.prepare(`
          SELECT r.*
          FROM resources r
          WHERE r.category = ?
            AND r.id != ?
            AND r.status = 'available'
            AND r.id NOT IN (
              SELECT resource_id FROM bookings
              WHERE status IN ('confirmed', 'in_progress', 'delayed')
                AND (start_time < ? AND end_time > ?)
            )
          ORDER BY CASE WHEN r.subcategory = ? THEN 0 ELSE 1 END, r.hourly_rate ASC
          LIMIT 1
        `).get(
          delayedBooking.resource_category,
          delayedBooking.resource_id,
          nextBooking.end_time,
          nextBooking.start_time,
          delayedBooking.resource_subcategory
        ) as Resource | undefined;

        if (alternative) {
          suggestedAlternative = alternative;
          explanation += ` Suggested zero-conflict equivalent: ${alternative.title} (${alternative.location}).`;
        }
      }
    } else {
      explanation = `NO DOWNSTREAM IMPACT: No reservations currently queued after this slot. Delay of +${currentDelay}m absorbed without customer impact.`;
    }

    // 3. Record Disruption Event
    const disruptionId = `disrupt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO disruptions (
        id, delayed_booking_id, affected_booking_id, buffer_minutes,
        delay_duration_minutes, risk_level, suggested_alternative_resource_id,
        notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      disruptionId,
      bookingId,
      affectedBooking ? affectedBooking.id : null,
      turnaroundBuffer,
      currentDelay,
      riskLevel,
      suggestedAlternative ? suggestedAlternative.id : null,
      reason,
      new Date().toISOString()
    );

    // 4. Dispatch in-app notifications
    // A) To delayed user
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `notif-del-${Date.now()}`,
      delayedBooking.user_id,
      'Session Delay Registered',
      `Delay of +${delayMinutes}m recorded for ${delayedBooking.resource_title}. New target return: ${newProjectedReturn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      riskLevel === 'critical' ? 'alert' : 'warning',
      `/bookings/${bookingId}`,
      new Date().toISOString()
    );

    // B) To Owner
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `notif-own-${Date.now()}`,
      delayedBooking.owner_id,
      `Promise Protection Alert: ${delayedBooking.resource_title}`,
      `Delayed return flagged (+${delayMinutes}m). Downstream impact: ${riskLevel.toUpperCase()}.`,
      riskLevel === 'critical' ? 'alert' : 'info',
      '/incidents',
      new Date().toISOString()
    );

    // C) To affected user if critical/moderate
    if (affectedBooking && riskLevel !== 'nominal') {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `notif-aff-${Date.now()}`,
        affectedBooking.user_id,
        'Schedule Advisory: Potential Buffer Conflict',
        `Preceding reservation is running ${delayMinutes}m behind schedule. Promise Protection is tracking alternative routing.`,
        'warning',
        `/bookings/${affectedBooking.id}`,
        new Date().toISOString()
      );
    }

    // 5. Audit Event
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-del-${Date.now()}`,
      'disruption',
      disruptionId,
      'PROMISE_PROTECTION_TRIGGERED',
      actorId,
      JSON.stringify({
        delayMinutes,
        riskLevel,
        affectedBookingId: affectedBooking?.id,
        suggestedAlternativeId: suggestedAlternative?.id,
        slackMinutes
      }),
      new Date().toISOString()
    );

    const disruptionRecord = db.prepare('SELECT * FROM disruptions WHERE id = ?').get(disruptionId) as DisruptionEvent;

    return {
      disruption: disruptionRecord,
      delayedBooking,
      affectedBooking,
      suggestedAlternative,
      bufferMinutes: turnaroundBuffer,
      slackMinutes,
      riskLevel,
      explanation
    };
  })();

  return result;
}

export function resolveDisruption(
  disruptionId: string,
  resolutionAction: 'reroute_alternative' | 'shift_booking' | 'override_buffer',
  actorId: string,
  notes: string = ''
): boolean {
  const db = getDb();

  return db.transaction(() => {
    const disruption = db.prepare('SELECT * FROM disruptions WHERE id = ?').get(disruptionId) as DisruptionEvent | undefined;
    if (!disruption) return false;

    if (resolutionAction === 'reroute_alternative' && disruption.suggested_alternative_resource_id && disruption.affected_booking_id) {
      // Re-route the affected booking to the suggested alternative
      db.prepare(`
        UPDATE bookings 
        SET resource_id = ?, updated_at = ?
        WHERE id = ?
      `).run(disruption.suggested_alternative_resource_id, new Date().toISOString(), disruption.affected_booking_id);

      // Notify affected user
      const affected = db.prepare('SELECT user_id FROM bookings WHERE id = ?').get(disruption.affected_booking_id) as any;
      if (affected) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          `notif-res-${Date.now()}`,
          affected.user_id,
          'Seamless Re-Route Confirmed',
          'Promise Protection has successfully re-routed your reservation to an equivalent available asset with zero delay.',
          'success',
          `/bookings/${disruption.affected_booking_id}`,
          new Date().toISOString()
        );
      }
    }

    db.prepare(`
      UPDATE disruptions 
      SET resolution_action = ?, resolved_at = ?, resolved_by = ?, notes = ?
      WHERE id = ?
    `).run(resolutionAction, new Date().toISOString(), actorId, notes, disruptionId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-res-${Date.now()}`,
      'disruption',
      disruptionId,
      'PROMISE_PROTECTION_RESOLVED',
      actorId,
      JSON.stringify({ resolutionAction, notes }),
      new Date().toISOString()
    );

    return true;
  })();
}

export function getAllDisruptions(): DisruptionEvent[] {
  const db = getDb();
  return db.prepare(`
    SELECT d.*, 
      r.title as delayed_resource_title,
      u.name as affected_user_name,
      alt.title as suggested_alternative_title
    FROM disruptions d
    JOIN bookings b ON d.delayed_booking_id = b.id
    JOIN resources r ON b.resource_id = r.id
    LEFT JOIN bookings ab ON d.affected_booking_id = ab.id
    LEFT JOIN users u ON ab.user_id = u.id
    LEFT JOIN resources alt ON d.suggested_alternative_resource_id = alt.id
    ORDER BY datetime(d.created_at) DESC
  `).all() as DisruptionEvent[];
}
