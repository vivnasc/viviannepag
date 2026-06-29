import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// CRESCER · estilo POR SLIDE (autonomia): tamanho das letras, cor do texto/realce,
// alinhamento e COR DA PÁGINA, de cada slide à parte (ex.: a capa maior sem mexer
// no resto). POST { slug, idx, tipografia }. Só slugs 'crescer-'.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string; idx?: number;
    tipografia?: { fonte?: string; tamanho?: number; cor?: string; corDestaque?: string; alinhV?: string; alinhH?: string; corFundo?: string };
  };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });
  if (typeof body.idx !== 'number' || !body.tipografia) return NextResponse.json({ erro: 'falta idx/tipografia' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });
  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  const slides = (dias[0]?.slides as Array<Record<string, unknown>>) ?? [];
  const s = slides[body.idx];
  if (!s) return NextResponse.json({ erro: 'slide-invalido' }, { status: 400 });

  // funde com a tipografia que já existe nesse slide (não apaga o que não vem)
  const atual = (s.tipografia as Record<string, unknown>) ?? {};
  const limpa = Object.fromEntries(Object.entries(body.tipografia).filter(([, v]) => v !== undefined && v !== ''));
  s.tipografia = { ...atual, ...limpa };
  if (dias[0]) { dias[0].slides = slides; delete (dias[0] as Record<string, unknown>).videoUrl; delete (dias[0] as Record<string, unknown>).imagens; }

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, tipografia: s.tipografia });
}
