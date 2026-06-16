import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, ContaId } from '@/lib/metodo/contas';
import { gerarFundoIA, assuntoCurto } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Preenche a IMAGEM (Flux) dos posts do método sem imagem. Para os de
// reconhecimento, escolhe uma cena VARIADA do véu (não repete imagens, não
// desperdiça créditos). Concorrência baixa + retry. Processa um lote por pedido
// e devolve quantos faltam (o cliente repete até acabar).

const LIMITE = 4; // poucas por pedido: geração sequencial + respeito ao rate limit; o cliente repete

async function fundoImagem(prompt: string, slug: string): Promise<{ url: string | null; erro?: string }> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { url: null, erro: 'falta REPLICATE_API_TOKEN' };
  if (!prompt) return { url: null, erro: 'prompt vazio' };
  let ultimoErro = '';
  for (let t = 0; t < 4; t++) {
    try {
      const url = await gerarImagemFlux(prompt, token, { raw: true });
      try { return { url: await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`) }; } catch { return { url }; }
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
      // 429 (rate limit da Replicate: ~6/min, burst 1) → espera mais (~12s) antes de repetir.
      const espera = /429|throttl/i.test(ultimoErro) ? 12000 : 1500 * (t + 1);
      await new Promise((r) => setTimeout(r, espera));
    }
  }
  return { url: null, erro: ultimoErro || 'falhou sem detalhe' };
}

type Slide = { imageUrl?: string | null; notaVisual?: string; texto?: string };
type Dia = { slides?: Slide[] };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string } } | null };

// POST { conta }: gera a imagem de até LIMITE posts sem imagem; devolve restantes.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  // unidade = SLIDE (um post de 2 faces tem 2 slides; ambos precisam de imagem).
  const pendentes: { row: Row; slide: Slide }[] = [];
  for (const r of (data ?? []) as Row[]) {
    if (r.theme?.metodo?.conta !== contaId) continue;
    for (const s of r.dias?.[0]?.slides ?? []) if (!s.imageUrl) pendentes.push({ row: r, slide: s });
  }
  const total = pendentes.length;
  const lote = pendentes.slice(0, LIMITE);

  // O PROMPT de cada fundo é ESCRITO pelo Claude (criativo e variado: assunto,
  // composição e luz diferentes a cada vez), evitando os assuntos JÁ usados nesta
  // conta. É isto que mata a monotonia. Sem API key, cai na lista fixa.
  const conta = CONTAS[contaId];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // assuntos já usados (posts desta conta que já têm imagem) -> não repetir.
  const evitar: string[] = [];
  for (const r of (data ?? []) as Row[]) {
    if (r.theme?.metodo?.conta !== contaId) continue;
    for (const s of r.dias?.[0]?.slides ?? []) if (s.notaVisual) evitar.push(assuntoCurto(s.notaVisual));
  }
  async function promptDe(i: number, frase?: string): Promise<string> {
    if (apiKey) {
      try { const p = await gerarFundoIA(conta, evitar, apiKey, frase); evitar.push(assuntoCurto(p)); return p; }
      catch { /* cai no fallback abaixo */ }
    }
    return fundoDaConta(conta, evitar.length + i);
  }

  let feitas = 0;
  let ultimoErro = '';
  // UMA de cada vez (NÃO em paralelo): a Replicate limita a ~6/min com burst 1;
  // pedir várias ao mesmo tempo dava 429 em todas. Sequencial respeita o limite.
  for (let i = 0; i < lote.length; i++) {
    const { row, slide } = lote[i];
    const prompt = await promptDe(i, slide.texto); // a imagem encarna a FRASE deste slide
    const { url, erro } = await fundoImagem(prompt, row.slug);
    if (!url) { if (erro) ultimoErro = erro; continue; }
    slide.imageUrl = url;
    slide.notaVisual = prompt;
    const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', row.slug);
    if (!e2) feitas += 1;
  }
  // se NADA foi gerado e houve erro do Flux, devolve o MOTIVO real (não um "0" mudo).
  if (lote.length > 0 && feitas === 0 && ultimoErro) {
    return NextResponse.json({ erro: 'flux-falhou', detalhe: ultimoErro, feitas: 0, restantes: total }, { status: 502 });
  }
  return NextResponse.json({ ok: true, feitas, restantes: Math.max(0, total - feitas) });
}
