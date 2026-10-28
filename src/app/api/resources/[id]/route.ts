import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const currentUser = await getCurrentUser();

    // 1. Fetch resource
    const res = db.prepare(`
      SELECT r.*, u.name as owner_name, u.email as owner_email, u.department as owner_department, u.institution as owner_institution
      FROM resources r
      JOIN users u ON r.owner_id = u.id
      WHERE r.id = ? OR r.slug = ?
    `).get(id, id) as any;

    if (!res) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    let specs = {};
    try {
      specs = JSON.parse(res.specifications);
    } catch {
      specs = {};
    }

    // 2. Required skills & User eligibility
    const requiredSkills = db.prepare(`
      SELECT s.id, s.name, s.category, s.description, rs.is_mandatory
      FROM resource_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.resource_id = ?
    `).all(res.id) as any[];

    let isEligible = true;
    const missingSkills: string[] = [];

    if (currentUser) {
      const userSkills = db.prepare(`
        SELECT skill_id FROM user_skills WHERE user_id = ? AND status = 'verified'
      `).all(currentUser.id) as any[];
      const verified = new Set(userSkills.map(s => s.skill_id));

      for (const req of requiredSkills) {
        if (req.is_mandatory && !verified.has(req.id)) {
          isEligible = false;
          missingSkills.push(req.name);
        }
      }
    }

    // 3. Generate QR code for Resource Passport
    const qrTargetUrl = `/resources/${res.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      margin: 1,
      color: {
        dark: '#D4FF00', // Acid-lime QR
        light: '#0C0E12'  // Ink dark bg
      },
      width: 256
    });

    // 4. Condition Reports (Passport History)
    const conditionReports = db.prepare(`
      SELECT cr.*, u.name as reporter_name
      FROM condition_reports cr
      JOIN users u ON cr.reported_by = u.id
      WHERE cr.resource_id = ?
      ORDER BY datetime(cr.timestamp) DESC
    `).all(res.id);

    // 5. Maintenance Records
    const maintenanceRecords = db.prepare(`
      SELECT * FROM maintenance_records
      WHERE resource_id = ?
      ORDER BY datetime(timestamp) DESC
    `).all(res.id);

    // 6. Active and upcoming bookings for calendar slots
    const bookings = db.prepare(`
      SELECT id, start_time, end_time, status, user_id
      FROM bookings
      WHERE resource_id = ?
        AND status IN ('confirmed', 'in_progress', 'delayed')
        AND datetime(end_time) >= datetime('now', '-1 day')
      ORDER BY datetime(start_time) ASC
    `).all(res.id);

    // 7. Alternatives in the same category
    const alternatives = db.prepare(`
      SELECT r.id, r.title, r.subcategory, r.hourly_rate, r.location, r.image_url, r.status
      FROM resources r
      WHERE r.category = ? AND r.id != ? AND r.status != 'maintenance'
      LIMIT 3
    `).all(res.category, res.id);

    return NextResponse.json({
      resource: {
        ...res,
        specifications: specs,
        required_skills: requiredSkills
      },
      userEligibility: {
        isEligible,
        missingSkills,
        isAuthenticated: !!currentUser
      },
      passport: {
        passportId: res.passport_id,
        serialNumber: res.serial_number,
        conditionRating: res.condition_rating,
        qrCodeDataUrl,
        conditionReports,
        maintenanceRecords
      },
      bookings,
      alternatives
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

