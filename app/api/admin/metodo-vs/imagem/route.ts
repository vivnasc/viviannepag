import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 120;

// MÉTODO VS · TROCAR A IMAGEM de UMA peça (autonomia): re-corre o Flux com o prompt
// guardado (notaVisual) e dá uma variação nova, usada em todos os momentos do reel.
// Limpa o vídeo (tem de se renderizar de novo). NÃO mexe no texto.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ texto?: string; notaVisual?: string; imageUrl?: string | null; videoUrl?: string | null; clipUrl?: string | null }>; videoUrl?: string | null }>;
  const slides = dias[0]?.slides ?? [];
  const prompt = slides.find((s) => s.notaVisual)?.notaVisual;
  if (!prompt) return NextResponse.json({ erro: 'sem-prompt', detalhe: 'esta peça não tem prompt de imagem guardado' }, { status: 409 });

  let url: string;
  try {
    const raw = await gerarImagemFlux(prompt, token, { raw: true });
    try { url = await guardarImagem(raw, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { url = raw; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  for (const s of slides) { s.imageUrl = url; s.clipUrl = null; s.videoUrl = null; }
  if (dias[0]) dias[0].videoUrl = null; // a imagem mudou: tem de renderizar de novo
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: url });
}
