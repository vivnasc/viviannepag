import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ ok: false, stage: 'env', erro: 'sem-replicate-token' }, { status: 500 });

  const tokenFingerprint = crypto.createHash('sha256').update(token).digest('hex').slice(0, 8);
  const t0 = Date.now();
  try {
    const res = await fetch('https://api.replicate.com/v1/account', {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` },
    });
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      return NextResponse.json({ ok: false, stage: 'replicate', status: res.status, latencyMs, tokenFingerprint }, { status: 200 });
    }
    const json = await res.json();
    return NextResponse.json({
      ok: true,
      stage: 'replicate',
      latencyMs,
      tokenFingerprint,
      account: json.username,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: 'fetch', erro: String(e), latencyMs: Date.now() - t0, tokenFingerprint }, { status: 200 });
  }
}
