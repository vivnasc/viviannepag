import { NextResponse, type NextRequest } from 'next/server';
import { renovarToken } from '@/lib/instagram/publish';
import { getIgConfig, getIgCredenciais, setContaCredenciais } from '@/lib/instagram/config';
import { CONTAS } from '@/lib/instagram/contas';

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

  await getIgConfig(); // garante bucket/config existentes
  // renova o token de CADA conta que já tenha um
  const resultados: { conta: string; estado: string }[] = [];
  for (const c of CONTAS) {
    const { token, igUserId } = await getIgCredenciais(c.id);
    if (!token) { resultados.push({ conta: c.id, estado: 'sem token' }); continue; }
    const novo = await renovarToken(token, appId, appSecret);
    if (!novo) { resultados.push({ conta: c.id, estado: 'falhou' }); continue; }
    await setContaCredenciais(c.id, { token: novo, igUserId, renovadoEm: new Date().toISOString() });
    resultados.push({ conta: c.id, estado: 'renovado' });
  }

  return NextResponse.json({ ok: true, renovadoEm: new Date().toISOString(), resultados });
}
