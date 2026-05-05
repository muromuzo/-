import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminClient } from './supabase';
import type { DashboardUser, UserRole } from './types';

const COOKIE_NAME = 'po_labs_session';

type SessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
};

function getAuthSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-auth-secret-change-me');
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAuthSecret());
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, getAuthSecret());
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<DashboardUser | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('users')
    .select('id, username, display_name, contact_name, role, approval_status, manager_user_id, approved_at, created_at')
    .eq('id', payload.userId)
    .maybeSingle();
  return (data as DashboardUser | null) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.approval_status !== 'approved') {
    await clearSessionCookie();
    redirect('/login');
  }
  return user;
}

export async function requireManager() {
  const user = await requireUser();
  if (user.role !== 'pro' && user.role !== 'master') redirect('/dashboard');
  return user;
}

export async function requireMaster() {
  const user = await requireUser();
  if (user.role !== 'master') redirect('/dashboard');
  return user;
}

export function isWriterRole(role: UserRole) {
  return role === 'master' || role === 'pro';
}
