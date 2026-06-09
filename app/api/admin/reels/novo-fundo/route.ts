import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fundoAleatorio } from '@/lib/reels/fundos';

export const runtime = 'nodejs';

// POST { slug } — dá um PROMPT de fundo novo e variado a um cinético já criado
// (atualiza o notaVisual do slide). A Vivianne copia, gera no MJ e usa "trocar
// fundo". Evita apagar o post só para mudar o fundo.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error: e1 } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).single();
  if (e1) return NextResponse.json({ erro: 'db', detalhe: e1.message }, { status: 500 });

  type Slide = { tipo?: string; notaVisual?: string };
  type Dia = { slides?: Slide[] };
  const dias = (Array.isArray(row?.dias) ? row!.dias : []) as Dia[];
  const slide = dias?.[0]?.slides?.[0];
  if (!slide) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });

  const novo = fundoAleatorio(slide.notaVisual); // diferente do atual
  slide.notaVisual = novo;

  const { error } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, prompt: novo });
}
