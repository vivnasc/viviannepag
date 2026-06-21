import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, ContaId, type VeuNome } from '@/lib/metodo/contas';
import { PERSONAGENS } from '@/lib/metodo/personagens';
import { gerarFundoIA, assuntoCurto, promptCartaFigura } from '@/lib/metodo/ia';

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

  // CARTA "Sou Aquela": é uma carta de baralho, NÃO um fundo. Gera UMA figura da
  // personagem (ilustração de carta de oráculo) e usa-a em TODAS as faces (as linhas
  // da confissão revelam-se por cima da mesma figura). Determinístico, sem cena genérica.
  const meta = (row.theme?.metodo ?? {}) as { tipo?: string; personagem?: string };
  // A "Carta de renomear" é TIPOGRÁFICA (papel, CartaSlide), não leva imagem Flux.
  if (meta.tipo === 'cartaRenomear') return NextResponse.json({ erro: 'carta-renomear-sem-flux', detalhe: 'A Carta de renomear é tipográfica (não tem imagem Flux).' }, { status: 400 });
  if (meta.tipo === 'carta') {
    // se a personagem já tem FIGURA DEFINITIVA escolhida no baralho, usa-a (não gera nova).
    const { data: br } = await supabase.from('carousel_collections').select('theme').eq('slug', 'metodo-baralho').maybeSingle();
    const figuras = ((br?.theme as { figuras?: Record<string, string> } | null)?.figuras) ?? {};
    const pid = PERSONAGENS.find((p) => p.nome === meta.personagem)?.id;
    const escolhida = pid ? figuras[pid] : undefined;
    let prompt = promptCartaFigura(meta.personagem, PERSONAGENS.find((p) => p.nome === meta.personagem)?.essencia);
    let url: string | null;
    if (escolhida) { url = escolhida; prompt = 'figura definitiva do baralho'; }
    else { const r = await fundoImagem(prompt, slug); url = r.url; if (!url) return NextResponse.json({ erro: 'flux-falhou', detalhe: r.erro }, { status: 502 }); }
    for (const s of slides) { s.imageUrl = url; s.notaVisual = prompt; s.estilo = 'carta'; s.clipUrl = null; s.clipPredId = null; s.clipPend = false; }
    if (row.dias?.[0]) row.dias[0].videoUrl = null;
    const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
    if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
    return NextResponse.json({ ok: true, imageUrl: url, imageUrls: slides.map(() => url) });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // UM reel = UMA cena. Gera UMA imagem (a partir do texto da CAPA) e usa-a em TODOS
  // os momentos do reel. NUNCA uma imagem por slide (isso pagava várias imagens para
  // o mesmo reel). Evita os assuntos já usados nos outros posts da conta.
  const evitar: string[] = [];
  const { data: irmaos } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  for (const r of (irmaos ?? []) as Row[]) {
    if (r.slug === slug || r.theme?.metodo?.conta !== contaId) continue;
    for (const s of r.dias?.[0]?.slides ?? []) if (s.notaVisual) evitar.push(assuntoCurto(s.notaVisual));
  }
  const capa = slides[0];
  let prompt = fundoDaConta(conta, Math.floor(Math.random() * Math.max(1, conta.atmosfera.elementos.length)), Math.floor(Math.random() * 6));
  if (apiKey) { try { prompt = await gerarFundoIA(conta, evitar, apiKey, capa?.texto, estilo, veu); } catch { /* fica o fallback */ } }
  const { url, erro } = await fundoImagem(prompt, slug);
  if (!url) return NextResponse.json({ erro: 'flux-falhou', detalhe: erro ?? 'falhou' }, { status: 502 });
  for (const s of slides) { s.imageUrl = url; s.notaVisual = prompt; s.estilo = estilo; s.clipUrl = null; s.clipPredId = null; s.clipPend = false; }
  if (row.dias?.[0]) row.dias[0].videoUrl = null;
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: url, imageUrls: slides.map(() => url), uma: true });
}
