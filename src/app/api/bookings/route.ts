import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createBooking } from '@/lib/bookings';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter'); // 'my_bookings' | 'owner_requests' | 'all'
  const db = getDb();

  let query = `
    SELECT b.*, 
      r.title as resource_title, 
      r.category as resource_category, 
      r.image_url as resource_image, 
      r.passport_id as resource_passport_id,
      r.location as resource_location,
      r.owner_id as owner_id,
      u.name as user_name, 
      u.email as user_email, 
      u.avatar as user_avatar
    FROM bookings b
    JOIN resources r ON b.resource_id = r.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter === 'owner_requests' || user.role === 'owner' && filter !== 'my_bookings') {
    query += ' AND r.owner_id = ?';
    params.push(user.id);
  } else if (filter === 'my_bookings' || user.role === 'user') {
    query += ' AND b.user_id = ?';
    params.push(user.id);
  }

  query += ' ORDER BY datetime(b.created_at) DESC';
  const bookings = db.prepare(query).all(...params);

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to complete your reservation.' }, { status: 401 });
    }

    const body = await request.json();
    const { resourceId, startTime, endTime, purpose } = body;

    if (!resourceId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Resource, start time, and end time are required' }, { status: 400 });
    }

    const result = createBooking({
      resourceId,
      userId: user.id,
      startTime,
      endTime,
      purpose: purpose || 'Academic Research Project'
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        conflict: result.conflict,
        conflictingBookingId: result.conflictingBookingId,
        missingSkills: result.missingSkills
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

