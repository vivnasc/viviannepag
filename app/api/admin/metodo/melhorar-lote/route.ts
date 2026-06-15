import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { melhorarFrase } from '@/lib/metodo/ia';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Reescreve em LOTE só os posts de reconhecimento com pronomes ambíguos (ela,
// ele, isso, dela...), tirando a ambiguidade SEM mexer na imagem. Processa um
// lote por pedido e devolve quantos faltam (o cliente repete até acabar).

const AMBIG = /\b(ela|ele|elas|eles|dela|dele|delas|deles|isso|isto|aquilo|aquela|aquele|disso|nisso)\b/i;
const LIMITE = 8;

type Slide = { texto?: string };
type Dia = { slides?: Slide[]; legenda?: string };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string; tipo?: string } } | null };

async function reescrever(texto: string, apiKey: string): Promise<string | null> {
  for (let t = 0; t < 2; t++) {
    try { return limparTravessoes(await melhorarFrase(texto, apiKey)); } catch { await new Promise((r) => setTimeout(r, 1000 * (t + 1))); }
  }
  return null;
}

// POST { conta }: melhora até LIMITE frases ambíguas; devolve restantes.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const candidatos = (data ?? []).filter((r: Row) => {
    if (r.theme?.metodo?.conta !== contaId) return false;
    if (r.theme?.metodo?.tipo !== 'reconhecimento') return false;
    const t = r.dias?.[0]?.slides?.[0]?.texto ?? '';
    return AMBIG.test(t);
  }) as Row[];
  const total = candidatos.length;
  const lote = candidatos.slice(0, LIMITE);

  let feitas = 0;
  for (let c = 0; c < lote.length; c += 3) {
    const bloco = lote.slice(c, c + 3);
    await Promise.all(bloco.map(async (r) => {
      const slide = r.dias![0].slides![0];
      const novo = await reescrever(slide.texto ?? '', apiKey);
      if (!novo) return;
      slide.texto = novo;
      const leg = r.dias![0].legenda;
      if (leg) { const i = leg.indexOf('\n\n'); r.dias![0].legenda = novo + (i >= 0 ? leg.slice(i) : ''); }
      const { error: e2 } = await supabase.from('carousel_collections').update({ dias: r.dias, title: novo.slice(0, 48), brief: novo }).eq('slug', r.slug);
      if (!e2) feitas += 1;
    }));
  }
  return NextResponse.json({ ok: true, feitas, restantes: Math.max(0, total - feitas) });
}
