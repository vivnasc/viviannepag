import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, stage: 'env', erro: 'sem-anthropic-key' }, { status: 500 });

  const keyFingerprint = crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 8);
  const t0 = Date.now();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'reply: ok' }],
      }),
    });
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      return NextResponse.json({ ok: false, stage: 'claude', status: res.status, latencyMs, keyFingerprint }, { status: 200 });
    }
    const json = await res.json();
    return NextResponse.json({
      ok: true,
      stage: 'claude',
      model: 'claude-sonnet-4-6',
      latencyMs,
      keyFingerprint,
      usage: json.usage,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: 'fetch', erro: String(e), latencyMs: Date.now() - t0, keyFingerprint }, { status: 200 });
  }
}
