import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { renovarToken } from '@/lib/instagram/publish';
import { setIgConfig, setContaCredenciais } from '@/lib/instagram/config';
import type { ContaId } from '@/lib/instagram/contas';

export const runtime = 'nodejs';

// POST { token, conta?, igUserId? } — recebe um token (mesmo de curta duração, do
// Graph API Explorer), troca-o por um de LONGA duração (~60 dias) e guarda-o na
// config privada DA CONTA escolhida. A renovação semanal mantém-no vivo.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { token, igUserId, conta = 'veuaveu' } = (await req.json().catch(() => ({}))) as { token?: string; igUserId?: string; conta?: ContaId };
  if (!token || token.length < 20) return NextResponse.json({ erro: 'token-invalido', detalhe: 'cola o token completo' }, { status: 400 });
  if (conta !== 'veuaveu' && !igUserId?.trim()) return NextResponse.json({ erro: 'falta-igid', detalhe: 'indica também o IG_USER_ID dessa conta.' }, { status: 400 });

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return NextResponse.json({ erro: 'sem-app', detalhe: 'falta META_APP_ID / META_APP_SECRET no Vercel' }, { status: 500 });

  // troca por longa duração (60 dias)
  const longo = await renovarToken(token.trim(), appId, appSecret);
  if (!longo) {
    return NextResponse.json({ erro: 'troca-falhou', detalhe: 'A Meta não aceitou o token (expirado, ou da app errada). Gera um token novo e tenta outra vez.' }, { status: 502 });
  }

  // guarda o app id/secret (partilhados) + as credenciais DA conta
  await setIgConfig({ appId, appSecret });
  await setContaCredenciais(conta, {
    token: longo,
    igUserId: igUserId?.trim() || (conta === 'veuaveu' ? process.env.INSTAGRAM_IG_ID : undefined),
    renovadoEm: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, msg: 'Token tornado permanente (~60 dias) e guardado. A renovação semanal mantém-no vivo.' });
}
