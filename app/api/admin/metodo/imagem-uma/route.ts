import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, indiceElementoAtual, ContaId } from '@/lib/metodo/contas';
import { gerarFundoIA, assuntoCurto } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Regenera a imagem (Flux) de UM post, para SUBSTITUIR uma que não se quer.
// Não toca no texto. Escolhe uma variação DIFERENTE da atual (outro elemento +
// outro enquadramento), para não sair igual nem desperdiçar o crédito à toa.

type Slide = { imageUrl?: string | null; notaVisual?: string };
type Dia = { slides?: Slide[]; videoUrl?: string | null };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string } } | null };

async function fundoImagem(prompt: string, slug: string): Promise<{ url: string | null; erro?: string }> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return { url: null, erro: !token ? 'falta REPLICATE_API_TOKEN' : 'prompt vazio' };
  let ultimoErro = '';
  for (let t = 0; t < 4; t++) {
    try {
      const url = await gerarImagemFlux(prompt, token, { raw: true });
      try { return { url: await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`) }; } catch { return { url }; }
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
      await new Promise((r) => setTimeout(r, /429|throttl/i.test(ultimoErro) ? 12000 : 1500 * (t + 1)));
    }
  }
  return { url: null, erro: ultimoErro || 'falhou sem detalhe' };
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

  // fallback (sem API key ou se a IA falhar): salta para outro elemento da lista.
  const els = conta.atmosfera.elementos;
  const atual = indiceElementoAtual(conta, slide.notaVisual);
  let elIdx = Math.floor(Math.random() * els.length);
  if (els.length > 1 && elIdx === atual) elIdx = (elIdx + 1) % els.length; // garante outro assunto
  const enqIdx = Math.floor(Math.random() * 6);
  let prompt = fundoDaConta(conta, elIdx, enqIdx);

  // evita os assuntos JÁ usados nos OUTROS posts desta conta (não só o deste
  // post) — senão dois posts caem na mesma cena (ex.: duas estufas iguais).
  const evitar: string[] = [];
  if (slide.notaVisual) evitar.push(assuntoCurto(slide.notaVisual));
  const { data: irmaos } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  for (const r of (irmaos ?? []) as Row[]) {
    if (r.slug === slug || r.theme?.metodo?.conta !== contaId) continue;
    const nv = r.dias?.[0]?.slides?.[0]?.notaVisual;
    if (nv) evitar.push(assuntoCurto(nv));
  }

  // PREFERIDO: o Claude escreve um fundo DIFERENTE de todos os já usados na conta.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try { prompt = await gerarFundoIA(conta, evitar, apiKey); }
    catch { /* fica o fallback */ }
  }
  const { url: img, erro } = await fundoImagem(prompt, slug);
  if (!img) return NextResponse.json({ erro: 'flux-falhou', detalhe: erro }, { status: 502 });

  slide.imageUrl = img;
  slide.notaVisual = prompt;
  // o MP4 já renderizado (se houver) fica desatualizado: invalida-o para re-render.
  if (row.dias?.[0]) row.dias[0].videoUrl = null;
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: img });
}
