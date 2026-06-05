import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug } — restaura a versao anterior (ultima do historico) de uma
// coleccao. A actual passa a topo do historico (para nao se perder tambem).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: col, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (error || !col) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });

  const theme = (col.theme ?? {}) as { historico?: Array<{ dias: unknown; em: string }> };
  const hist = theme.historico ?? [];
  if (!hist.length) return NextResponse.json({ erro: 'sem-historico', detalhe: 'Esta semana ainda nao tem versao anterior guardada.' }, { status: 200 });

  const [anterior, ...resto] = hist;
  // a versao actual vai para o topo do historico (troca)
  const novoHistorico = [{ dias: col.dias, em: new Date().toISOString() }, ...resto].slice(0, 3);
  const novoTheme = { ...theme, historico: novoHistorico };

  const { data, error: upd } = await supabase
    .from('carousel_collections')
    .update({ dias: anterior.dias, theme: novoTheme })
    .eq('slug', slug)
    .select()
    .single();
  if (upd) return NextResponse.json({ erro: 'db', detalhe: upd.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data, restaurada: anterior.em });
}
