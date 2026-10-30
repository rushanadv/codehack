import { getDb } from './db';
import { createInitialDemoData } from './demo-data';

export function seedDatabase() {
  const db = getDb();
  const data = createInitialDemoData();

  // Clear existing data cleanly in foreign key sequence
  db.exec(`
    DELETE FROM audit_events;
    DELETE FROM notifications;
    DELETE FROM disruptions;
    DELETE FROM condition_reports;
    DELETE FROM maintenance_records;
    DELETE FROM waitlist;
    DELETE FROM bookings;
    DELETE FROM resource_skills;
    DELETE FROM user_skills;
    DELETE FROM skills;
    DELETE FROM resources;
    DELETE FROM users;
  `);

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, department, institution, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of data.users) {
    insertUser.run(u.id, u.email, u.name, u.role, u.department, u.institution, u.avatar, u.created_at);
  }

  // 2. Skills
  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category, description)
    VALUES (?, ?, ?, ?)
  `);
  for (const s of data.skills) {
    insertSkill.run(s.id, s.name, s.category, s.description);
  }

  // 3. User Skills
  const insertUserSkill = db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_id, status, certificate_ref, verified_at, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const us of data.userSkills) {
    insertUserSkill.run(us.id, us.user_id, us.skill_id, us.status, us.certificate_ref, us.verified_at, us.verified_by);
  }

  // 4. Resources
  const insertResource = db.prepare(`
    INSERT INTO resources (
      id, title, slug, category, subcategory, description, specifications,
      location, building, room, hourly_rate, deposit, turnaround_buffer_mins,
      owner_id, status, condition_rating, serial_number, passport_id, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of data.resources) {
    insertResource.run(
      r.id, r.title, r.slug, r.category, r.subcategory, r.description,
      typeof r.specifications === 'object' ? JSON.stringify(r.specifications) : r.specifications,
      r.location, r.building, r.room, r.hourly_rate, r.deposit, r.turnaround_buffer_mins,
      r.owner_id, r.status, r.condition_rating, r.serial_number, r.passport_id, r.image_url, r.created_at
    );
  }

  // 5. Resource Skills
  const insertResourceSkill = db.prepare(`
    INSERT INTO resource_skills (id, resource_id, skill_id, is_mandatory)
    VALUES (?, ?, ?, ?)
  `);
  for (const rs of data.resourceSkills) {
    insertResourceSkill.run(rs.id, rs.resource_id, rs.skill_id, rs.is_mandatory);
  }

  // 6. Bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, resource_id, user_id, start_time, end_time, scheduled_return_time,
      actual_return_time, status, purpose, total_cost, delay_minutes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of data.bookings) {
    insertBooking.run(
      b.id, b.resource_id, b.user_id, b.start_time, b.end_time, b.scheduled_return_time,
      b.actual_return_time, b.status, b.purpose, b.total_cost, b.delay_minutes, b.created_at, b.updated_at
    );
  }

  // 7. FairShare Waitlist
  const insertWaitlist = db.prepare(`
    INSERT INTO waitlist (
      id, resource_id, user_id, requested_start, requested_end, priority_score, queue_position, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const w of data.waitlist) {
    insertWaitlist.run(
      w.id, w.resource_id, w.user_id, w.requested_start, w.requested_end,
      w.priority_score, w.queue_position, w.status, w.notes, w.created_at
    );
  }

  // 8. Condition Reports
  const insertConditionReport = db.prepare(`
    INSERT INTO condition_reports (
      id, booking_id, resource_id, report_type, condition_rating, checklist, discrepancies, photo_url, reported_by, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cr of data.conditionReports) {
    insertConditionReport.run(
      cr.id, cr.booking_id, cr.resource_id, cr.report_type, cr.condition_rating,
      typeof cr.checklist === 'object' ? JSON.stringify(cr.checklist) : cr.checklist,
      cr.discrepancies, cr.photo_url, cr.reported_by, cr.timestamp
    );
  }

  // 9. Maintenance Records
  const insertMaintenance = db.prepare(`
    INSERT INTO maintenance_records (
      id, resource_id, technician_id, maintenance_type, description, parts_replaced, cost, timestamp, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of data.maintenanceRecords) {
    insertMaintenance.run(
      m.id, m.resource_id, m.technician_id, m.maintenance_type, m.description,
      m.parts_replaced, m.cost, m.timestamp, m.status
    );
  }

  // 10. Disruptions
  const insertDisruption = db.prepare(`
    INSERT INTO disruptions (
      id, delayed_booking_id, affected_booking_id, buffer_minutes, delay_duration_minutes,
      risk_level, suggested_alternative_resource_id, resolution_action, resolved_at, resolved_by, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const d of data.disruptions) {
    insertDisruption.run(
      d.id, d.delayed_booking_id, d.affected_booking_id, d.buffer_minutes, d.delay_duration_minutes,
      d.risk_level, d.suggested_alternative_resource_id, d.resolution_action, d.resolved_at, d.resolved_by, d.notes, d.created_at
    );
  }

  // 11. Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, read_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const n of data.notifications) {
    insertNotification.run(n.id, n.user_id, n.title, n.message, n.type, n.link, n.read_status, n.created_at);
  }

  // 12. Audit Events
  const insertAudit = db.prepare(`
    INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of data.auditEvents) {
    insertAudit.run(
      a.id, a.entity_type, a.entity_id, a.action, a.actor_id,
      typeof a.payload === 'object' && a.payload !== null ? JSON.stringify(a.payload) : (a.payload || null),
      a.created_at
    );
  }

  console.log(`✅ Seed completed: ${data.users.length} users, ${data.skills.length} skills, ${data.resources.length} resources, ${data.bookings.length} bookings, ${data.waitlist.length} waitlist, ${data.conditionReports.length} condition reports, ${data.maintenanceRecords.length} maintenance records, ${data.notifications.length} notifications, ${data.auditEvents.length} audit events.`);
}

// If run directly
if (require.main === module) {
  seedDatabase();
}
