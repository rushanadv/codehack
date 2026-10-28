import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { computeOwnerInsights } from '@/lib/insights';

export async function GET() {
  const user = await getCurrentUser();
  const ownerId = (user?.role === 'owner') ? user.id : undefined;
  const insights = computeOwnerInsights(ownerId);
  return NextResponse.json({ insights });
}
