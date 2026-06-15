import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getIgCredenciais, getIgConfig } from '@/lib/instagram/config';

const GRAPH = 'https://graph.facebook.com/v21.0';
export const runtime = 'nodejs';

// GET ?conta= — devolve as permissões (scopes) concedidas ao token dessa conta.
// Responde de vez à pergunta "o que é que eu já tenho?".
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const conta = new URL(req.url).searchParams.get('conta') ?? 'veuaveu';
  const { token } = await getIgCredenciais(conta);
  if (!token) return NextResponse.json({ erro: 'sem-token', conta }, { status: 400 });

  const cfg = await getIgConfig();
  const appId = process.env.META_APP_ID ?? cfg.appId;
  const secret = process.env.META_APP_SECRET ?? cfg.appSecret;

  try {
    if (appId && secret) {
      const r = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${appId}|${secret}`);
      const j = await r.json();
      if (!r.ok) return NextResponse.json({ erro: 'graph', detalhe: j?.error?.message ?? `status ${r.status}` }, { status: 502 });
      return NextResponse.json({ ok: true, scopes: j?.data?.scopes ?? [] });
    }
    // fallback: /me/permissions (sem app id/secret)
    const r = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(token)}`);
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ erro: 'graph', detalhe: j?.error?.message ?? `status ${r.status}` }, { status: 502 });
    const scopes = (j?.data ?? []).filter((p: { status?: string }) => p.status === 'granted').map((p: { permission: string }) => p.permission);
    return NextResponse.json({ ok: true, scopes });
  } catch (e) {
    return NextResponse.json({ erro: String(e) }, { status: 502 });
  }
}
