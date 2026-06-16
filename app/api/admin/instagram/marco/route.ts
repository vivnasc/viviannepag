import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { setContaCredenciais } from '@/lib/instagram/config';
import { CONTAS, type ContaId } from '@/lib/instagram/contas';

export const runtime = 'nodejs';

// POST { conta, consistenteDesde } — marca desde quando a conta começou a ser
// publicada de forma consistente (a Vivianne sabe; a API do IG não dá a data de
// criação). Serve para o analytics dar contexto justo (conta nova ≠ conta antiga).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { conta, consistenteDesde } = (await req.json().catch(() => ({}))) as { conta?: ContaId; consistenteDesde?: string };
  if (!conta || !CONTAS.some((c) => c.id === conta)) return NextResponse.json({ erro: 'conta' }, { status: 400 });
  await setContaCredenciais(conta, { consistenteDesde: consistenteDesde || undefined });
  return NextResponse.json({ ok: true });
}
