import { NextResponse, type NextRequest } from 'next/server';
import { getContas, upsertConta, getCredenciaisApp } from '@/lib/tiktok/config';
import { renovarToken } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';
export const maxDuration = 60;

// CRON: renova o access_token de CADA conta TikTok. O access_token do TikTok
// dura só 24h, por isso isto corre 1x por dia (.github/workflows/renovar-token-tiktok.yml).
// O refresh_token dura 365 dias e também é renovado a cada chamada — guardamos
// sempre o mais recente. Assim a Vivianne nunca tem de voltar a fazer login.
// Segurança: ?secret=CRON_SECRET. Config: TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET.

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const { clientKey, clientSecret } = getCredenciaisApp();
  if (!clientKey || !clientSecret) {
    return NextResponse.json({ erro: 'sem-app', detalhe: 'falta TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET' }, { status: 500 });
  }

  const contas = await getContas();
  const resultados: { conta: string; estado: string }[] = [];

  for (const c of contas) {
    const nome = c.displayName ?? c.openId.slice(0, 8);
    const r = await renovarToken({ clientKey, clientSecret, refreshToken: c.refreshToken });
    if (!r.ok || !r.tokens) { resultados.push({ conta: nome, estado: `falhou: ${r.erro}` }); continue; }

    const t = r.tokens;
    const agora = Date.now();
    await upsertConta({
      ...c,
      accessToken: t.accessToken,
      refreshToken: t.refreshToken,
      accessExpiraEm: new Date(agora + t.expiresIn * 1000).toISOString(),
      refreshExpiraEm: new Date(agora + t.refreshExpiresIn * 1000).toISOString(),
      scope: t.scope || c.scope,
      renovadoEm: new Date(agora).toISOString(),
    });
    resultados.push({ conta: nome, estado: 'renovado' });
  }

  return NextResponse.json({ ok: true, renovadoEm: new Date().toISOString(), total: contas.length, resultados });
}
