import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { getVisual } from '@/lib/crescer/marca';

export const runtime = 'nodejs';
export const maxDuration = 300;

// CRESCER · imagem com TOTAL autonomia. POST { slug, idx?, prompt?, remover? }:
// - remover:true  => tira a imagem (do slide idx, ou de todos se idx não vier)
// - idx número    => gera/põe a imagem SÓ nesse slide (capa = 0)
// - sem idx       => gera e aplica a TODOS os slides (a imagem partilhada de sempre)
// O prompt vem do body ou do notaVisual guardado. Anula o vídeo (re-render).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; idx?: number; prompt?: string; remover?: boolean };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });
  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  const slides = (dias[0]?.slides as Array<Record<string, unknown>>) ?? [];
  if (!slides.length) return NextResponse.json({ erro: 'sem-slides' }, { status: 400 });
  const idx = typeof body.idx === 'number' ? body.idx : null;
  const alvos = idx !== null ? (slides[idx] ? [idx] : []) : slides.map((_, i) => i);
  if (!alvos.length) return NextResponse.json({ erro: 'slide-invalido' }, { status: 400 });

  // TIRAR a imagem (não chama o Flux): limpa o imageUrl dos slides-alvo.
  if (body.remover) {
    for (const i of alvos) slides[i].imageUrl = null;
    if (dias[0]) { dias[0].slides = slides; delete (dias[0] as Record<string, unknown>).videoUrl; }
    const { error: e0 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
    if (e0) return NextResponse.json({ erro: 'db', detalhe: e0.message }, { status: 500 });
    return NextResponse.json({ ok: true, removido: true });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  // PROMPT da imagem, com fallback robusto para nunca dar "sem-prompt":
  // body.prompt > (pessoas: o prompt NOVO, figura visível) > o guardado > o prompt
  // do visual da peça > conceptual. As peças antigas (silhueta) corrigem-se assim.
  const visual = (row.theme as { crescer?: { visual?: string } } | null)?.crescer?.visual;
  const baseNova = visual === 'pessoas' ? getVisual('pessoas')?.promptBase : undefined;
  const baseVisual = getVisual(visual ?? '')?.promptBase || getVisual('conceptual')!.promptBase;
  const prompt = body.prompt?.trim() || baseNova || (slides[idx ?? 0]?.notaVisual as string) || (slides[0]?.notaVisual as string) || baseVisual;
  if (!prompt) return NextResponse.json({ erro: 'sem-prompt' }, { status: 400 });

  let imageUrl: string;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { imageUrl = await guardarImagem(url, `crescer/${body.slug}/fundo-${Date.now()}.jpg`); } catch { imageUrl = url; }
  } catch (e) { return NextResponse.json({ erro: 'flux', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 }); }

  for (const i of alvos) { slides[i].imageUrl = imageUrl; slides[i].notaVisual = prompt; }
  if (dias[0]) { dias[0].slides = slides; delete (dias[0] as Record<string, unknown>).videoUrl; }
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl, idx });
}
