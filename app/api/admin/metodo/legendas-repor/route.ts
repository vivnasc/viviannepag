import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, ContaId } from '@/lib/metodo/contas';
import { getPost } from '@/lib/metodo/posts';
import { legendaDoPost } from '@/lib/metodo/legenda';

export const runtime = 'nodejs';

// Repõe a LEGENDA de todos os posts de uma conta a partir do gerador atual
// (FASE 1, sem funil "Comenta X / manual na bio"). Corrige de uma vez os posts
// já gerados com a legenda antiga, SEM regenerar imagem (não gasta créditos).

type Dia = { legenda?: string };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string; postId?: string } } | null };

// POST { conta }: recalcula dias[0].legenda de cada post da conta.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const meus = (data ?? []).filter((r: Row) => r.theme?.metodo?.conta === contaId) as Row[];
  let repostos = 0;
  for (const r of meus) {
    const postId = r.theme?.metodo?.postId ?? r.slug.replace(/^metodo-/, '');
    const post = getPost(postId);
    if (!post || !r.dias?.[0]) continue;
    r.dias[0].legenda = limparTravessoes(legendaDoPost(post));
    const { error: e2 } = await supabase.from('carousel_collections').update({ dias: r.dias }).eq('slug', r.slug);
    if (!e2) repostos += 1;
  }
  return NextResponse.json({ ok: true, repostos });
}
