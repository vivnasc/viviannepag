import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';

// POST { conta }: apaga TODOS os posts do método dessa conta (recomeçar do zero).
// Só toca em slugs 'metodo-*' da conta indicada (nunca no resto).
type Row = { slug: string; theme?: { metodo?: { conta?: string } } | null };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const slugs = (data ?? []).filter((r: Row) => r.theme?.metodo?.conta === contaId).map((r: Row) => r.slug);
  if (!slugs.length) return NextResponse.json({ ok: true, apagados: 0 });

  const { error: e2 } = await supabase.from('carousel_collections').delete().in('slug', slugs);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, apagados: slugs.length });
}
