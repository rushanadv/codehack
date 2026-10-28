import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const db = getDb();
  const notifications = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY datetime(created_at) DESC
  `).all(user.id);

  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  const body = await request.json();
  const db = getDb();

  if (body.all) {
    db.prepare('UPDATE notifications SET read_status = 1 WHERE user_id = ?').run(user.id);
  } else if (body.id) {
    db.prepare('UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?').run(body.id, user.id);
  }

  return NextResponse.json({ success: true });
}
