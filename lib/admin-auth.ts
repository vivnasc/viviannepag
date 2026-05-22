import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'vds_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 dias

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [ts, mac] = token.split('.');
  if (!ts || !mac) return false;
  try {
    const expected = sign(ts);
    if (mac.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(expected, 'hex'))) {
      return false;
    }
  } catch {
    return false;
  }
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > COOKIE_MAX_AGE * 1000) return false;
  return true;
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  return verifyToken(token);
}

export async function setAdminCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
