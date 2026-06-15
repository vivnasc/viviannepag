import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, indiceElementoAtual, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Regenera a imagem (Flux) de UM post, para SUBSTITUIR uma que não se quer.
// Não toca no texto. Escolhe uma variação DIFERENTE da atual (outro elemento +
// outro enquadramento), para não sair igual nem desperdiçar o crédito à toa.

type Slide = { imageUrl?: string | null; notaVisual?: string };
type Dia = { slides?: Slide[]; videoUrl?: string | null };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string } } | null };

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  for (let t = 0; t < 3; t++) {
    try {
      const url = await gerarImagemFlux(prompt, token, { raw: true });
      try { return await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
    } catch { await new Promise((r) => setTimeout(r, 1200 * (t + 1))); }
  }
  return null;
}

// POST { slug }: regenera a imagem desse post e devolve o novo imageUrl.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = (body.slug ?? '').trim();
  if (!slug) return NextResponse.json({ erro: 'sem-slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').eq('slug', slug).maybeSingle();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const row = data as Row | null;
  const contaId = (row?.theme?.metodo?.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!row || !conta) return NextResponse.json({ erro: 'post-desconhecido' }, { status: 404 });
  const slide = row.dias?.[0]?.slides?.[0];
  if (!slide) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });

  // variação NOVA: escolhe um ELEMENTO (assunto) DIFERENTE do atual, para nunca
  // sair "a mesma imagem". Lê o assunto atual do notaVisual e salta para outro.
  const els = conta.atmosfera.elementos;
  const atual = indiceElementoAtual(conta, slide.notaVisual);
  let elIdx = Math.floor(Math.random() * els.length);
  if (els.length > 1 && elIdx === atual) elIdx = (elIdx + 1) % els.length; // garante outro assunto
  const enqIdx = Math.floor(Math.random() * 6); // enquadramento à parte (mais variação)
  const prompt = fundoDaConta(conta, elIdx, enqIdx);
  const img = await fundoImagem(prompt, slug);
  if (!img) return NextResponse.json({ erro: 'flux-falhou' }, { status: 502 });

  slide.imageUrl = img;
  slide.notaVisual = prompt;
  // o MP4 já renderizado (se houver) fica desatualizado: invalida-o para re-render.
  if (row.dias?.[0]) row.dias[0].videoUrl = null;
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: img });
}
