import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { joinWaitlist, getWaitlistForResource } from '@/lib/fairshare';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');
  const user = await getCurrentUser();

  const db = getDb();
  if (resourceId) {
    const waitlist = getWaitlistForResource(resourceId);
    return NextResponse.json({ waitlist });
  }

  // Get user's waitlist entries
  const waitlist = db.prepare(`
    SELECT w.*, r.title as resource_title, r.location as resource_location, r.image_url as resource_image
    FROM waitlist w
    JOIN resources r ON w.resource_id = r.id
    WHERE w.user_id = ?
    ORDER BY datetime(w.created_at) DESC
  `).all(user?.id || 'user-dev');

  return NextResponse.json({ waitlist });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to join waitlist' }, { status: 401 });
    }

    const body = await request.json();
    const { resourceId, requestedStart, requestedEnd, notes } = body;

    if (!resourceId || !requestedStart || !requestedEnd) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const entry = joinWaitlist(
      resourceId,
      user.id,
      requestedStart,
      requestedEnd,
      notes || 'Thesis Research Priority Queue'
    );

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
