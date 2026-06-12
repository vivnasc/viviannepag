import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getContas } from '@/lib/tiktok/config';
import { consultarCreatorInfo } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/creator-info?account=<openId> — devolve a info do criador
// (apelido, avatar, opções de privacidade permitidas, interações desativadas).
// A UX da auditoria EXIGE mostrar isto antes de uma publicação direta.

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const contas = await getContas();
  if (!contas.length) return NextResponse.json({ erro: 'sem-conta' }, { status: 409 });

  const openId = req.nextUrl.searchParams.get('account');
  const conta = openId ? contas.find((c) => c.openId === openId) : contas[0];
  if (!conta) return NextResponse.json({ erro: 'conta-nao-encontrada' }, { status: 404 });

  const r = await consultarCreatorInfo(conta.accessToken);
  if (!r.ok) return NextResponse.json({ erro: 'creator-info', detalhe: r.erro }, { status: 502 });
  return NextResponse.json({ ok: true, openId: conta.openId, data: r.data });
}
