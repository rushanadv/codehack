import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { simulateDelay } from '@/lib/promise-protection';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { bookingId, delayMinutes, reason } = body;

    if (!bookingId || !delayMinutes) {
      return NextResponse.json({ error: 'bookingId and delayMinutes are required' }, { status: 400 });
    }

    const result = simulateDelay(
      bookingId,
      parseInt(delayMinutes, 10),
      user?.id || 'user-dev',
      reason || 'Operational delay simulated during hackathon demonstration'
    );

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

