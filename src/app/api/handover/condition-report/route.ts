import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitConditionReport } from '@/lib/bookings';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, resourceId, reportType, conditionRating, checklist, discrepancies, photoUrl } = body;

    if (!bookingId || !resourceId || !reportType || !conditionRating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = submitConditionReport({
      bookingId,
      resourceId,
      reportType,
      conditionRating,
      checklist: checklist || {},
      discrepancies,
      photoUrl,
      reportedBy: user.id
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to record condition report' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
