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

const LIMITE = 10;

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

type Slide = { imageUrl?: string | null; notaVisual?: string };
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

  const semImagem = (data ?? []).filter((r: Row) => {
    if (r.theme?.metodo?.conta !== contaId) return false;
    return !r.dias?.[0]?.slides?.[0]?.imageUrl;
  }) as Row[];
  const total = semImagem.length;
  const lote = semImagem.slice(0, LIMITE);

  // O PROMPT de cada fundo é ESCRITO pelo Claude (criativo e variado: assunto,
  // composição e luz diferentes a cada vez), evitando os assuntos JÁ usados nesta
  // conta. É isto que mata a monotonia. Sem API key, cai na lista fixa.
  const conta = CONTAS[contaId];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // assuntos já usados (posts desta conta que já têm imagem) -> não repetir.
  const evitar: string[] = [];
  for (const r of (data ?? []) as Row[]) {
    if (r.theme?.metodo?.conta !== contaId) continue;
    const nv = r.dias?.[0]?.slides?.[0]?.notaVisual;
    if (nv) evitar.push(assuntoCurto(nv));
  }
  async function promptDe(i: number): Promise<string> {
    if (apiKey) {
      try { const p = await gerarFundoIA(conta, evitar, apiKey); evitar.push(assuntoCurto(p)); return p; }
      catch { /* cai no fallback abaixo */ }
    }
    return fundoDaConta(conta, evitar.length + i);
  }

  let feitas = 0;
  for (let c = 0; c < lote.length; c += 3) {
    const bloco = lote.slice(c, c + 3);
    // prompts SEQUENCIAIS (para a lista "evitar" crescer e diversificar); imagens em paralelo.
    const comPrompt: { r: Row; prompt: string }[] = [];
    for (let k = 0; k < bloco.length; k++) comPrompt.push({ r: bloco[k], prompt: await promptDe(c + k) });
    await Promise.all(comPrompt.map(async ({ r, prompt }) => {
      const slide = r.dias![0].slides![0];
      const img = await fundoImagem(prompt, r.slug);
      if (!img) return;
      slide.imageUrl = img;
      slide.notaVisual = prompt; // grava o prompt usado
      const { error: e2 } = await supabase.from('carousel_collections').update({ dias: r.dias }).eq('slug', r.slug);
      if (!e2) feitas += 1;
    }));
  }
  return NextResponse.json({ ok: true, feitas, restantes: Math.max(0, total - feitas) });
}
