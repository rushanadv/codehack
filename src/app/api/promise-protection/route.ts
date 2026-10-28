import { NextResponse } from 'next/server';
import { getAllDisruptions } from '@/lib/promise-protection';

export async function GET() {
  const disruptions = getAllDisruptions();
  return NextResponse.json({ disruptions });
}
