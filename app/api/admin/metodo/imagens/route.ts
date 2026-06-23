import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, fundoDaConta, ContaId, type VeuNome } from '@/lib/metodo/contas';
import { gerarFundoIA, assuntoCurto, promptCartaFigura } from '@/lib/metodo/ia';
import { gerarFundoAutoridade } from '@/lib/metodo/autoridade-ia';
import { PERSONAGENS } from '@/lib/metodo/personagens';
import { figuraDescricao } from '@/lib/metodo/baralho';

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

  // unidade = REEL (POST): cada reel tem UMA cena/imagem, usada em todos os momentos.
  // NUNCA uma imagem por slide (pagava várias imagens iguais para o mesmo reel).
  // A "Carta de renomear" (vir): o corpo é tipográfico, mas a CAPA leva imagem — por
  // isso ENTRA, mas só conta como pendente se a CAPA (slide 0) não tiver imagem.
  const ehCartaRen = (r: Row) => (r.theme?.metodo as { tipo?: string } | undefined)?.tipo === 'cartaRenomear';
  const pendentes: Row[] = [];
  for (const r of (data ?? []) as Row[]) {
    if (r.theme?.metodo?.conta !== contaId) continue;
    const sl = r.dias?.[0]?.slides ?? [];
    if (!sl.length) continue;
    if (ehCartaRen(r)) { if (!sl[0]?.imageUrl) pendentes.push(r); }
    else if (sl.some((s) => !s.imageUrl)) pendentes.push(r);
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
  async function promptDe(i: number, frase?: string, veu?: VeuNome): Promise<string> {
    if (apiKey) {
      // A MÃE usa o gerador LIMPO (à Soulab, sem velas/sagrado); as filhas o seu.
      try { const p = contaId === 'mae' ? await gerarFundoAutoridade(frase ?? '', apiKey, evitar) : await gerarFundoIA(conta, evitar, apiKey, frase, 'contemplativo', veu); evitar.push(assuntoCurto(p)); return p; }
      catch { /* cai no fallback abaixo */ }
    }
    return fundoDaConta(conta, evitar.length + i);
  }

  // figuras DEFINITIVAS escolhidas no baralho (por personagem) — a carta usa-as.
  const { data: br } = await supabase.from('carousel_collections').select('theme').eq('slug', 'metodo-baralho').maybeSingle();
  const figuras = ((br?.theme as { figuras?: Record<string, string> } | null)?.figuras) ?? {};

  let feitas = 0;
  let ultimoErro = '';
  // UMA imagem por REEL (post), aplicada a todos os momentos. Sequencial (rate limit).
  for (let i = 0; i < lote.length; i++) {
    const row = lote[i];
    const meta = (row.theme?.metodo ?? {}) as { veu?: string; tipo?: string; personagem?: string };
    const sl = row.dias?.[0]?.slides ?? [];
    const capa = sl[0];
    // carta "Sou Aquela": figura DEFINITIVA do baralho se existir; senão gera a figura.
    let url: string | null; let prompt: string;
    if (meta.tipo === 'carta') {
      const pid = PERSONAGENS.find((p) => p.nome === meta.personagem)?.id;
      const escolhida = pid ? figuras[pid] : undefined;
      if (escolhida) { url = escolhida; prompt = 'figura definitiva do baralho'; }
      else { const pc = PERSONAGENS.find((pp) => pp.nome === meta.personagem); prompt = promptCartaFigura(meta.personagem, pc?.essencia, pc ? figuraDescricao(pc.id) : undefined); const r = await fundoImagem(prompt, row.slug); url = r.url; if (!url && r.erro) ultimoErro = r.erro; }
    } else {
      prompt = await promptDe(i, capa?.texto, (meta.veu ?? undefined) as VeuNome | undefined);
      const r = await fundoImagem(prompt, row.slug); url = r.url; if (!url && r.erro) ultimoErro = r.erro;
    }
    if (!url) continue;
    // carta de renomear: a imagem é SÓ da capa (slide 0); o corpo fica papel.
    if (meta.tipo === 'cartaRenomear') { if (sl[0]) { sl[0].imageUrl = url; sl[0].notaVisual = prompt; } }
    else for (const s of sl) { s.imageUrl = url; s.notaVisual = prompt; }
    const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', row.slug);
    if (!e2) feitas += 1;
  }
  // se NADA foi gerado e houve erro do Flux, devolve o MOTIVO real (não um "0" mudo).
  if (lote.length > 0 && feitas === 0 && ultimoErro) {
    return NextResponse.json({ erro: 'flux-falhou', detalhe: ultimoErro, feitas: 0, restantes: total }, { status: 502 });
  }
  return NextResponse.json({ ok: true, feitas, restantes: Math.max(0, total - feitas) });
}
