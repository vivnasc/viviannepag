import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// CRESCER · "outra imagem": regera a imagem da peça a partir do prompt guardado
// (notaVisual). Mesma cena, outra interpretação (Flux é estocástico). Atualiza
// todos os slides (a imagem é partilhada) e anula o vídeo para forçar re-render.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; prompt?: string };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  const slides = (dias[0]?.slides as Array<Record<string, unknown>>) ?? [];
  const prompt = body.prompt?.trim() || (slides[0]?.notaVisual as string) || '';
  if (!prompt) return NextResponse.json({ erro: 'sem-prompt' }, { status: 400 });

  let imageUrl: string;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { imageUrl = await guardarImagem(url, `crescer/${body.slug}/fundo-${Date.now()}.jpg`); } catch { imageUrl = url; }
  } catch (e) { return NextResponse.json({ erro: 'flux', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 }); }

  for (const s of slides) { s.imageUrl = imageUrl; s.notaVisual = prompt; }
  if (dias[0]) { dias[0].slides = slides; delete (dias[0] as Record<string, unknown>).videoUrl; }
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl });
}
