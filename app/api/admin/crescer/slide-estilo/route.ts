import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// CRESCER · estilo POR SLIDE (autonomia): tamanho das letras, cor do texto/realce,
// alinhamento e COR DA PÁGINA. POST { slug, idx?, tipografia }:
//  - idx número  => só esse slide (ex.: a capa maior sem mexer no resto)
//  - SEM idx     => aplica a TODOS os slides de uma vez (ex.: mesma cor/tamanho).
// Só slugs 'crescer-'.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string; idx?: number; excetoCapa?: boolean;
    tipografia?: { fonte?: string; tamanho?: number; cor?: string; corDestaque?: string; alinhV?: string; alinhH?: string; corFundo?: string };
  };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });
  if (!body.tipografia) return NextResponse.json({ erro: 'falta tipografia' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });
  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  const slides = (dias[0]?.slides as Array<Record<string, unknown>>) ?? [];
  if (!slides.length) return NextResponse.json({ erro: 'sem-slides' }, { status: 400 });

  // os slides-alvo: o idx pedido · TODOS menos a capa (excetoCapa) · TODOS.
  const alvos = typeof body.idx === 'number' ? (slides[body.idx] ? [body.idx] : [])
    : body.excetoCapa ? slides.map((_, i) => i).filter((i) => i > 0)
    : slides.map((_, i) => i);
  if (!alvos.length) return NextResponse.json({ erro: 'slide-invalido' }, { status: 400 });

  // funde com a tipografia que já existe em cada slide (não apaga o que não vem)
  const limpa = Object.fromEntries(Object.entries(body.tipografia).filter(([, v]) => v !== undefined && v !== ''));
  for (const i of alvos) {
    const atual = (slides[i].tipografia as Record<string, unknown>) ?? {};
    slides[i].tipografia = { ...atual, ...limpa };
  }
  if (dias[0]) { dias[0].slides = slides; delete (dias[0] as Record<string, unknown>).videoUrl; delete (dias[0] as Record<string, unknown>).imagens; }

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, aplicados: alvos.length });
}
