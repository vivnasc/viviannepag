import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { PORTAS } from '@/lib/portas/marca';

export const runtime = 'nodejs';
export const maxDuration = 300;

// PORTAS · (re)gera a imagem (Flux) de UMA peca, do prompt guardado (notaVisual)
// ou de um novo enviado. Nao reescreve o texto. Limpa o video (render por refazer).
const PREFIXOS = Object.keys(PORTAS).map((id) => `${id}-`);

async function fundoImagem(prompt: string, slug: string): Promise<{ url: string | null; erro?: string }> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { url: null, erro: 'falta REPLICATE_API_TOKEN' };
  if (!prompt) return { url: null, erro: 'sem prompt de imagem' };
  let ultimoErro = '';
  for (let t = 0; t < 4; t++) {
    try {
      const url = await gerarImagemFlux(prompt, token, { raw: true });
      try { return { url: await guardarImagem(url, `portas/${slug}/fundo-${Date.now()}.jpg`) }; } catch { return { url }; }
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
      const espera = /429|throttl/i.test(ultimoErro) ? 12000 : 1500 * (t + 1);
      await new Promise((r) => setTimeout(r, espera));
    }
  }
  return { url: null, erro: ultimoErro || 'falhou sem detalhe' };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; prompt?: string };
  const slug = body.slug?.trim();
  if (!slug || !PREFIXOS.some((p) => slug.startsWith(p))) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (data.dias ?? []) as Array<{ videoUrl?: string | null; slides?: Array<{ notaVisual?: string; imageUrl?: string | null }> }>;
  const slide = dias[0]?.slides?.[0];
  if (!slide) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });
  const prompt = (body.prompt?.trim()) || slide.notaVisual || '';

  const { url, erro } = await fundoImagem(prompt, slug);
  if (!url) return NextResponse.json({ erro: 'flux-falhou', detalhe: erro }, { status: 502 });

  // aplica a imagem nova a TODOS os slides (mesma cena) e marca o render por refazer.
  for (const s of dias[0]?.slides ?? []) { s.imageUrl = url; s.notaVisual = prompt; }
  if (dias[0]) dias[0].videoUrl = null;
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: url });
}
