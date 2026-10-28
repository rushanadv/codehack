import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const pendingSkills = db.prepare(`
    SELECT us.*, u.name as user_name, u.email as user_email, u.department as user_department, s.name as skill_name, s.category as skill_category
    FROM user_skills us
    JOIN users u ON us.user_id = u.id
    JOIN skills s ON us.skill_id = s.id
    ORDER BY CASE WHEN us.status = 'pending' THEN 0 ELSE 1 END, us.verified_at DESC
  `).all();

  const auditEvents = db.prepare(`
    SELECT a.*, u.name as actor_name
    FROM audit_events a
    LEFT JOIN users u ON a.actor_id = u.id
    ORDER BY datetime(a.created_at) DESC
    LIMIT 50
  `).all();

  return NextResponse.json({ pendingSkills, auditEvents });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { userSkillId, action } = body; // action: 'approve' | 'reject'

    if (!userSkillId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const status = action === 'approve' ? 'verified' : 'rejected';
    const db = getDb();
    const nowIso = new Date().toISOString();

    db.prepare(`
      UPDATE user_skills 
      SET status = ?, verified_at = ?, verified_by = ?
      WHERE id = ?
    `).run(status, nowIso, user.id, userSkillId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, actor_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-skill-${Date.now()}`,
      'user_skill',
      userSkillId,
      `SKILLGATE_CREDENTIAL_${action.toUpperCase()}D`,
      user.id,
      JSON.stringify({ status, verifiedBy: user.name }),
      nowIso
    );

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

