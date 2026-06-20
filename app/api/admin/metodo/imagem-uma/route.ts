import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, indiceElementoAtual, ContaId, type VeuNome } from '@/lib/metodo/contas';
import { gerarFundoIA, assuntoCurto } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Gera/regenera as imagens (Flux) de UM post — TODAS as faces (a mãe tem 2: a dor
// e a revelação), cada imagem em PAR com o texto da sua face. Não toca no texto.
// Escolhe variações diferentes (evita assuntos já usados na conta), para não sair
// igual nem desperdiçar crédito.

type Slide = { imageUrl?: string | null; notaVisual?: string; texto?: string; estilo?: string | null; clipUrl?: string | null; clipPredId?: string | null; clipPend?: boolean };
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
  const body = (await req.json().catch(() => ({}))) as { slug?: string; estilo?: 'contemplativo' | 'dramatico' };
  const slug = (body.slug ?? '').trim();
  const estilo: 'contemplativo' | 'dramatico' = body.estilo === 'dramatico' ? 'dramatico' : 'contemplativo';
  if (!slug) return NextResponse.json({ erro: 'sem-slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').eq('slug', slug).maybeSingle();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const row = data as Row | null;
  const contaId = (row?.theme?.metodo?.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  const veu = ((row?.theme?.metodo as { veu?: string } | undefined)?.veu ?? undefined) as VeuNome | undefined; // a cor é a do véu do post
  if (!row || !conta) return NextResponse.json({ erro: 'post-desconhecido' }, { status: 404 });
  const slides = row.dias?.[0]?.slides ?? [];
  if (!slides.length) return NextResponse.json({ erro: 'sem-slide' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // evita os assuntos JÁ usados nos OUTROS posts desta conta (não só o deste) —
  // senão dois posts caem na mesma cena. Acumula também os desta geração para a
  // face 1 e a face 2 NÃO saírem iguais.
  const evitar: string[] = [];
  const { data: irmaos } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  for (const r of (irmaos ?? []) as Row[]) {
    if (r.slug === slug || r.theme?.metodo?.conta !== contaId) continue;
    for (const s of r.dias?.[0]?.slides ?? []) if (s.notaVisual) evitar.push(assuntoCurto(s.notaVisual));
  }

  // assuntos JÁ neste post (para a face nova diferir da que já existe, ex.: a vela).
  for (const s of slides) if (s.imageUrl && s.notaVisual) evitar.push(assuntoCurto(s.notaVisual));

  const els = conta.atmosfera.elementos;
  const imageUrls: (string | null)[] = slides.map((s) => s.imageUrl ?? null);
  let ultimoErro = '';
  // se FALTAM faces, preenche SÓ as que faltam (mantém as que já tens); se já
  // estiverem todas, regenera todas (o caso "outra imagem", variação).
  // No estilo DRAMÁTICO (teste de tarde) regenera TODAS — converte o post inteiro.
  const faltam = slides.filter((s) => !s.imageUrl);
  const alvo = estilo === 'dramatico' ? slides : (faltam.length ? faltam : slides);
  // gera a imagem de cada face-alvo, em par com o texto da face (a dor / a revelação).
  for (const slide of alvo) {
    const i = slides.indexOf(slide);
    // fallback: salta para outro elemento (variação), evitando o atual.
    const atual = indiceElementoAtual(conta, slide.notaVisual);
    let elIdx = Math.floor(Math.random() * els.length);
    if (els.length > 1 && elIdx === atual) elIdx = (elIdx + 1) % els.length;
    let prompt = fundoDaConta(conta, elIdx, Math.floor(Math.random() * 6));
    if (slide.notaVisual) evitar.push(assuntoCurto(slide.notaVisual));
    // PREFERIDO: o Claude escreve um fundo que ENCARNA o texto desta face, diferente dos já usados.
    if (apiKey) {
      try { prompt = await gerarFundoIA(conta, evitar, apiKey, slide.texto, estilo, veu); }
      catch { /* fica o fallback */ }
    }
    const { url: img, erro } = await fundoImagem(prompt, slug);
    if (img) {
      slide.imageUrl = img;
      slide.notaVisual = prompt;
      slide.estilo = estilo; // marca a face (o animar usa a motion certa)
      // a imagem mudou: o clip antigo deixa de servir, limpa-o (re-anima depois).
      slide.clipUrl = null; slide.clipPredId = null; slide.clipPend = false;
      evitar.push(assuntoCurto(prompt)); // a face seguinte evita esta cena
      imageUrls[i] = img;
    } else {
      ultimoErro = erro ?? 'falhou';
    }
  }

  if (!imageUrls.some(Boolean)) return NextResponse.json({ erro: 'flux-falhou', detalhe: ultimoErro }, { status: 502 });
  // o MP4 já renderizado (se houver) fica desatualizado: invalida-o para re-render.
  if (row.dias?.[0]) row.dias[0].videoUrl = null;
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: imageUrls[0] ?? null, imageUrls });
}
