import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const status = searchParams.get('status');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'recommended';

  const db = getDb();
  let query = `
    SELECT r.*, u.name as owner_name, u.email as owner_email, u.department as owner_department
    FROM resources r
    JOIN users u ON r.owner_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND r.category = ?';
    params.push(category);
  }

  if (status && status !== 'all') {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (location && location !== 'all') {
    query += ' AND (r.location LIKE ? OR r.building LIKE ?)';
    params.push(`%${location}%`, `%${location}%`);
  }

  if (maxPrice) {
    query += ' AND r.hourly_rate <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (q) {
    query += ' AND (LOWER(r.title) LIKE ? OR LOWER(r.description) LIKE ? OR LOWER(r.subcategory) LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (sort === 'price_asc') {
    query += ' ORDER BY r.hourly_rate ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY r.hourly_rate DESC';
  } else {
    query += ' ORDER BY r.created_at DESC';
  }

  const rows = db.prepare(query).all(...params) as any[];

  // Batch-fetch all required skills in 1 query to prevent N+1 query overhead
  const allSkills = db.prepare(`
    SELECT rs.resource_id, s.id, s.name, s.category, rs.is_mandatory
    FROM resource_skills rs
    JOIN skills s ON rs.skill_id = s.id
  `).all() as any[];

  const skillsByResource = new Map<string, any[]>();
  for (const sk of allSkills) {
    const list = skillsByResource.get(sk.resource_id);
    if (list) {
      list.push(sk);
    } else {
      skillsByResource.set(sk.resource_id, [sk]);
    }
  }

  // Attach required skills with O(1) hash map lookup
  const resources = rows.map(r => {
    let specs = {};
    try {
      specs = JSON.parse(r.specifications);
    } catch {
      specs = {};
    }

    return {
      ...r,
      specifications: specs,
      required_skills: skillsByResource.get(r.id) || []
    };
  });

  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Only Resource Owners can list assets' }, { status: 403 });
    }

    const body = await request.json();
    const db = getDb();

    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(-4);
    const passportId = `IXP-${body.category.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO resources (
        id, title, slug, category, subcategory, description, specifications,
        location, building, room, hourly_rate, deposit, turnaround_buffer_mins,
        owner_id, status, condition_rating, serial_number, passport_id, image_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.title,
      slug,
      body.category,
      body.subcategory || 'General Equipment',
      body.description,
      JSON.stringify(body.specifications || {}),
      body.location || 'Central Campus',
      body.building || 'Innovation Wing',
      body.room || 'Bay 1',
      body.hourly_rate || 0,
      body.deposit || 0,
      body.turnaround_buffer_mins || 30,
      user.id,
      'available',
      'pristine',
      body.serial_number || `SN-${Date.now().toString().slice(-6)}`,
      passportId,
      body.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      nowIso
    );

    return NextResponse.json({ success: true, resourceId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

