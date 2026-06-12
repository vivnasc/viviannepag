import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getIgCredenciais } from '@/lib/instagram/config';
import { CONTAS, type ContaId } from '@/lib/instagram/contas';
import { getContaAnalytics } from '@/lib/instagram/insights';

export const runtime = 'nodejs';
export const maxDuration = 60;

// GET /api/admin/instagram/insights?conta=<id> — analytics de UMA conta IG.
// Sem ?conta, devolve a lista de contas (para o seletor).

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const conta = req.nextUrl.searchParams.get('conta') as ContaId | null;
  if (!conta) {
    return NextResponse.json({ contas: CONTAS });
  }
  if (!CONTAS.some((c) => c.id === conta)) {
    return NextResponse.json({ erro: 'conta-invalida' }, { status: 400 });
  }

  const { token, igUserId } = await getIgCredenciais(conta);
  if (!token || !igUserId) {
    return NextResponse.json({ ok: false, erro: 'sem-credenciais', detalhe: `a conta "${conta}" ainda não tem token ligado (liga em /admin/instagram)` });
  }

  const data = await getContaAnalytics(token, igUserId);
  return NextResponse.json(data);
}
