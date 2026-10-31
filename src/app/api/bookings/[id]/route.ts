import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { updateBookingStatus } from '@/lib/bookings';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const currentUser = await getCurrentUser();

    const booking = db.prepare(`
      SELECT b.*, 
        r.title as resource_title, 
        r.category as resource_category, 
        r.subcategory as resource_subcategory,
        r.image_url as resource_image, 
        r.passport_id as resource_passport_id,
        r.location as resource_location,
        r.building as resource_building,
        r.room as resource_room,
        r.turnaround_buffer_mins,
        r.owner_id,
        u.name as user_name, 
        u.email as user_email, 
        u.department as user_department,
        u.avatar as user_avatar,
        o.name as owner_name,
        o.email as owner_email
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      JOIN users u ON b.user_id = u.id
      JOIN users o ON r.owner_id = o.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Condition reports
    const conditionReports = db.prepare(`
      SELECT cr.*, u.name as reporter_name
      FROM condition_reports cr
      JOIN users u ON cr.reported_by = u.id
      WHERE cr.booking_id = ?
      ORDER BY datetime(cr.timestamp) ASC
    `).all(id);

    // Lifecycle audit events
    const auditEvents = db.prepare(`
      SELECT a.*, u.name as actor_name
      FROM audit_events a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE a.entity_id = ? OR a.payload LIKE ?
      ORDER BY datetime(a.created_at) ASC
    `).all(id, `%"${id}"%`);

    // Next scheduled reservation if any
    const nextReservation = db.prepare(`
      SELECT b.*, u.name as user_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.resource_id = ? 
        AND b.id != ? 
        AND b.status IN ('confirmed', 'pending')
        AND datetime(b.start_time) >= datetime(?)
      ORDER BY datetime(b.start_time) ASC
      LIMIT 1
    `).get(booking.resource_id, id, booking.start_time);

    return NextResponse.json({
      booking,
      conditionReports,
      auditEvents,
      nextReservation,
      isOwner: currentUser?.id === booking.owner_id,
      isBooker: currentUser?.id === booking.user_id,
      isAdmin: currentUser?.role === 'admin'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const existing = db.prepare(`
      SELECT b.user_id, r.owner_id 
      FROM bookings b 
      JOIN resources r ON b.resource_id = r.id 
      WHERE b.id = ?
    `).get(id) as any;

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isBooker = user.id === existing.user_id;
    const isOwner = user.id === existing.owner_id;
    const isAdmin = user.role === 'admin';

    if (!isBooker && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges to alter this reservation.' }, { status: 403 });
    }

    const { status, notes } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const success = updateBookingStatus(id, status, user.id, notes);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

