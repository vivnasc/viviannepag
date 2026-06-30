import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemGptImage2, guardarImagem, BUCKET } from '@/lib/banda/flux';
import { cenaAncorada } from '@/lib/crescer/mundo-teste';
import { REFS_MUNDO } from '@/lib/crescer/refs-mundo';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PASTA = 'crescer/_teste';
const PASTA_ANCHORS = 'crescer/_anchors';
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cena';
const desslug = (s: string) => s.replace(/\.jpg$/i, '').replace(/-/g, ' ').trim();

// categorias preferidas por cada cena fundadora (m de cenaAncorada) — escala humana.
const PREF_ANCHOR: string[][] = [
  ['biblioteca', 'pessoas', 'interior'],   // 0 — crianças a aprender
  ['interior', 'pessoas', 'festival'],     // 1 — refeição em família
  ['biblioteca', 'pessoas', 'interior'],   // 2 — estudar organismos
  ['profissao', 'interior', 'pessoas'],    // 3 — oficina/artesãos
  ['mercado', 'festival', 'pessoas'],      // 4 — mercado
];

type Anchor = { url: string; categoria: string };
async function listarAnchors(): Promise<Anchor[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.storage.from(BUCKET).list(PASTA_ANCHORS, { limit: 500 });
    return (data ?? []).filter((f) => f.name.toLowerCase().endsWith('.jpg')).map((f) => ({
      url: supabase.storage.from(BUCKET).getPublicUrl(`${PASTA_ANCHORS}/${f.name}`).data.publicUrl,
      categoria: f.name.split('__')[0] || '',
    }));
  } catch { return []; }
}
function escolherAnchor(anchors: Anchor[], m: number, seed: number): string | null {
  if (!anchors.length) return null;
  for (const cat of (PREF_ANCHOR[m] ?? [])) {
    const c = anchors.filter((a) => a.categoria === cat);
    if (c.length) return c[(((Math.floor(seed) % c.length) + c.length) % c.length)].url;
  }
  return anchors[(((Math.floor(seed) % anchors.length) + anchors.length) % anchors.length)].url;
}

// SANDBOX · gera AMOSTRAS com gpt-image-2 (o modelo do ChatGPT), ancorado nas imagens
// fundadoras DELA (input_images = referência, alta fidelidade) + o ADN do mundo no
// texto. NÃO cria posts. Histórico lê-se da pasta crescer/_teste.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  const openaiKey = process.env.OPENAI_API_KEY;
  const body = (await req.json().catch(() => ({}))) as { quantos?: number; seed?: number };
  const quantos = Math.max(1, Math.min(6, body.quantos ?? 4));
  const base = typeof body.seed === 'number' ? body.seed : Math.floor(Date.now() / 1000);
  const anchors = await listarAnchors();

  // em PARALELO (gpt-image-2 a alta qualidade é lento; sequencial estouraria o tempo).
  const tarefas = Array.from({ length: quantos }, (_, i) => async (): Promise<{ url: string; categoria: string }> => {
    const seed = base + i * 7;
    const { briefing, categoria, m } = cenaAncorada(seed);
    const ref = escolherAnchor(anchors, m, seed) ?? REFS_MUNDO[i % REFS_MUNDO.length];
    const url = await gerarImagemGptImage2(briefing, ref ? [ref] : [], token, openaiKey);
    let saved = url;
    try { saved = await guardarImagem(url, `${PASTA}/${Date.now()}-${i}__${slug(categoria)}.jpg`, { editorial: false }); } catch { /* fica o url cru */ }
    return { url: saved, categoria };
  });
  const settled = await Promise.allSettled(tarefas.map((t) => t()));
  const amostras = settled.filter((s): s is PromiseFulfilledResult<{ url: string; categoria: string }> => s.status === 'fulfilled').map((s) => s.value);
  const rej = settled.find((s) => s.status === 'rejected') as PromiseRejectedResult | undefined;
  if (!amostras.length) return NextResponse.json({ erro: 'falhou', detalhe: rej ? String(rej.reason) : 'sem amostras' }, { status: 502 });
  return NextResponse.json({ ok: true, amostras });
}

// HISTÓRICO · lê a pasta real das amostras (não depende do browser).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list(PASTA, { limit: 500, sortBy: { column: 'name', order: 'desc' } });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const amostras = (data ?? [])
    .filter((f) => f.name.toLowerCase().endsWith('.jpg'))
    .map((f) => ({
      url: supabase.storage.from(BUCKET).getPublicUrl(`${PASTA}/${f.name}`).data.publicUrl,
      categoria: f.name.includes('__') ? desslug(f.name.split('__').slice(1).join('__')) : '',
      ts: parseInt(f.name.split('-')[0], 10) || 0,
    }))
    .sort((a, b) => b.ts - a.ts);
  return NextResponse.json({ ok: true, amostras });
}

// LIMPAR · apaga todas as amostras de teste.
export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.from(BUCKET).list(PASTA, { limit: 1000 });
  const paths = (data ?? []).map((f) => `${PASTA}/${f.name}`);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  return NextResponse.json({ ok: true, apagadas: paths.length });
}
