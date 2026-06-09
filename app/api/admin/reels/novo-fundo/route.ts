import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fundoAleatorio } from '@/lib/reels/fundos';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { slug } — gera AUTOMATICAMENTE um novo fundo (Flux) para um cinético já
// criado (novo prompt on-concept + nova imagem). Sem ir ao Midjourney à mão.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error: e1 } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).single();
  if (e1) return NextResponse.json({ erro: 'db', detalhe: e1.message }, { status: 500 });

  type Slide = { tipo?: string; notaVisual?: string; imageUrl?: string };
  type Dia = { slides?: Slide[] };
  const dias = (Array.isArray(row?.dias) ? row!.dias : []) as Dia[];
  const slide = dias?.[0]?.slides?.[0];
  if (!slide) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });

  const novoPrompt = fundoAleatorio(slide.notaVisual); // on-concept, diferente do atual
  let imageUrl: string;
  try {
    const url = await gerarImagemFlux(novoPrompt, token, { raw: true });
    try { imageUrl = await guardarImagem(url, `reel/${slug}/fundo-${Date.now()}.jpg`); } catch { imageUrl = url; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
  slide.notaVisual = novoPrompt;
  slide.imageUrl = imageUrl;

  const { error } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl });
}
