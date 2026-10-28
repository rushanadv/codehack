import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { executeIdleXMatch } from '@/lib/match';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { prompt, maxBudget, category } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Natural language prompt is required' }, { status: 400 });
    }

    const matches = executeIdleXMatch({
      naturalLanguagePrompt: prompt,
      userId: user?.id || 'user-dev',
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      categoryFilter: category
    });

    return NextResponse.json({ matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

