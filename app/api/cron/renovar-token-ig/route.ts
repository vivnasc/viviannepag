import { NextResponse, type NextRequest } from 'next/server';
import { renovarToken } from '@/lib/instagram/publish';
import { getIgConfig, setIgConfig } from '@/lib/instagram/config';

export const runtime = 'nodejs';
export const maxDuration = 60;

// CRON: renova o token de longa duração do Instagram ANTES de expirar (vale
// ~60 dias). Corre 1x por semana (.github/workflows/renovar-token-ig.yml), por
// isso o token é trocado MUITO antes dos 60 dias — a Vivianne nunca tem de
// mexer em chaves à mão.
// Segurança: ?secret=CRON_SECRET.
// Precisa em env: META_APP_ID, META_APP_SECRET (App ID/Secret da app Meta).
// O token atual vem da config privada (já renovado) ou da env INSTAGRAM_TOKEN.

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.json({ erro: 'sem-app', detalhe: 'falta META_APP_ID / META_APP_SECRET' }, { status: 500 });
  }

  const cfg = await getIgConfig();
  const tokenAtual = cfg.token || process.env.INSTAGRAM_TOKEN;
  if (!tokenAtual) {
    return NextResponse.json({ erro: 'sem-token', detalhe: 'falta INSTAGRAM_TOKEN (arranque) ou config privada' }, { status: 500 });
  }

  const novo = await renovarToken(tokenAtual, appId, appSecret);
  if (!novo) {
    return NextResponse.json({ erro: 'renovacao-falhou', detalhe: 'a Meta não devolveu novo token (token expirado? app errada?)' }, { status: 502 });
  }

  await setIgConfig({
    token: novo,
    appId,
    appSecret,
    igUserId: cfg.igUserId || process.env.INSTAGRAM_IG_ID,
    renovadoEm: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, renovadoEm: new Date().toISOString() });
}
