import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { resolveDisruption } from '@/lib/promise-protection';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { disruptionId, resolutionAction, notes } = body;

    if (!disruptionId || !resolutionAction) {
      return NextResponse.json({ error: 'disruptionId and resolutionAction are required' }, { status: 400 });
    }

    const success = resolveDisruption(
      disruptionId,
      resolutionAction,
      user?.id || 'user-owner-aris',
      notes || 'Resolved via Promise Protection console'
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to resolve disruption' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

