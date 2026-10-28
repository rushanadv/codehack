import { cookies } from 'next/headers';
import { getDb } from './db';
import { User, UserRole } from './types';

const SESSION_COOKIE_NAME = 'idlex_user_id';
const DEFAULT_USER_ID = 'user-dev'; // Default to Dev Patel for judges if no cookie

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value || DEFAULT_USER_ID;

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  return user || null;
}

export async function setCurrentUser(userId: string): Promise<boolean> {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return false;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  return true;
}

export async function clearCurrentUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getAllDemoUsers(): User[] {
  const db = getDb();
  return db.prepare('SELECT * FROM users ORDER BY role ASC, name ASC').all() as User[];
}

export function getUserById(userId: string): User | null {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  return user || null;
}

