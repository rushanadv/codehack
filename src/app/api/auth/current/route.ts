import { NextResponse } from 'next/server';
import { getCurrentUser, setCurrentUser, clearCurrentUser, getAllDemoUsers } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  const allDemoUsers = getAllDemoUsers();
  return NextResponse.json({ user, allDemoUsers });
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const success = await setCurrentUser(userId);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = await getCurrentUser();
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearCurrentUser();
  return NextResponse.json({ success: true });
}

