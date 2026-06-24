import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { metodoVSConta } from '@/lib/metodo-vs/marca';
import { contaDe } from '@/lib/instagram/contas';
import { getIgCredenciais } from '@/lib/instagram/config';

export const runtime = 'nodejs';

// MÉTODO VS · ESTADO DE PUBLICAÇÃO de uma conta: o Instagram está ligado? É o elo que
// decide se o agendado publica mesmo. Sem token, o cron salta a conta EM SILÊNCIO — por
// isso mostramos isto no estúdio, para a Vivianne nunca ficar às cegas.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const cfg = metodoVSConta(new URL(req.url).searchParams.get('conta'));
  // a conta de IG é a marca (mãe → 'loja'; filhas → versoltar/…). contaDe resolve isso.
  const igConta = contaDe({ marca: cfg.marca }, '');
  let ligado = false;
  try { const { token, igUserId } = await getIgCredenciais(igConta); ligado = !!(token && igUserId); } catch { ligado = false; }
  return NextResponse.json({ ok: true, conta: cfg.id, igConta, ligado });
}
