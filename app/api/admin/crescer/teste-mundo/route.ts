import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemGptImage2, guardarImagem, BUCKET } from '@/lib/banda/flux';
import { cenaAncorada, cenaObjeto } from '@/lib/crescer/mundo-teste';
import { REFS_MUNDO } from '@/lib/crescer/refs-mundo';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PASTA = 'crescer/_teste';
const PASTA_ANCHORS = 'crescer/_anchors';
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cena';
const desslug = (s: string) => s.replace(/\.jpg$/i, '').replace(/-/g, ' ').trim();

// ATLAS por cena (m de cenaAncorada): que ASPECTOS do mundo cada cena HERDA como
// referência (roupa + objetos + a atividade). Cada geração puxa uma imagem de cada.
const ATLAS_POR_CENA: string[][] = [
  ['roupa', 'objectos', 'infancia', 'aprendizagem'],  // 0 — crianças a aprender
  ['roupa', 'objectos', 'refeicoes', 'interior'],     // 1 — refeição em família
  ['roupa', 'objectos', 'animais', 'aprendizagem'],   // 2 — estudar organismos
  ['roupa', 'objectos', 'arquitectura', 'interior'],  // 3 — oficina/artesãos
  ['roupa', 'objectos', 'mercado', 'pessoas'],        // 4 — mercado
  ['animais', 'roupa', 'objectos'],                   // 5 — criatura + pessoas
  ['animais', 'natureza', 'objectos'],                // 6 — mundo vivo
  ['animais', 'infancia', 'roupa'],                   // 7 — crianças + criaturas
  ['transportes', 'roupa', 'natureza'],               // 8 — barco no rio
  ['festival', 'roupa', 'pessoas'],                   // 9 — festa
  ['pessoas', 'roupa', 'objectos'],                   // 10 — músicos
  ['animais', 'natureza', 'roupa'],                   // 11 — guardião + criaturas no campo
  ['interior', 'roupa', 'objectos'],                  // 12 — cuidado
  ['animais', 'natureza'],                            // 13 — criatura ao perto
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
// herda VÁRIAS âncoras (uma por aspeto da cena). Se a cena não tiver atlas, qualquer.
function herdarAtlas(anchors: Anchor[], m: number, seed: number): string[] {
  if (!anchors.length) return [];
  const urls: string[] = [];
  for (const cat of (ATLAS_POR_CENA[m] ?? [])) {
    const c = anchors.filter((a) => a.categoria === cat);
    if (c.length) urls.push(c[(((Math.floor(seed) % c.length) + c.length) % c.length)].url);
  }
  if (!urls.length) urls.push(anchors[(((Math.floor(seed) % anchors.length) + anchors.length) % anchors.length)].url);
  return [...new Set(urls)].slice(0, 6);
}

// SANDBOX · gera AMOSTRAS com gpt-image-2 (o modelo do ChatGPT), ancorado nas imagens
// fundadoras DELA (input_images = referência, alta fidelidade) + o ADN do mundo no
// texto. NÃO cria posts. Histórico lê-se da pasta crescer/_teste.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  const openaiKey = process.env.OPENAI_API_KEY;
  const body = (await req.json().catch(() => ({}))) as { quantos?: number; seed?: number; modo?: 'objetos' | 'cenas' };
  const modo = body.modo === 'objetos' ? 'objetos' : 'cenas';
  const quantos = Math.max(1, Math.min(8, body.quantos ?? (modo === 'objetos' ? 6 : 4)));
  const base = typeof body.seed === 'number' ? body.seed : Math.floor(Date.now() / 1000);
  const anchors = await listarAnchors();

  // em PARALELO (gpt-image-2 a alta qualidade é lento; sequencial estouraria o tempo).
  const tarefas = Array.from({ length: quantos }, (_, i) => async (): Promise<{ url: string; categoria: string }> => {
    const seed = base + i * 7;
    // MODO OBJETOS: cultura material sozinha (sem cena, sem arquitetura, sem âncora —
    // o vocabulário do mundo nasce aqui). MODO CENAS: cena humana + herança do atlas.
    let briefing: string, categoria: string, inputImgs: string[];
    if (modo === 'objetos') {
      ({ briefing, categoria } = cenaObjeto(seed));
      inputImgs = []; // os objetos fundadores nascem do prompt, sem referência que os puxe para cena
    } else {
      const cena = cenaAncorada(seed);
      briefing = cena.briefing; categoria = cena.categoria;
      const refs = herdarAtlas(anchors, cena.m, seed);
      inputImgs = refs.length ? refs : [REFS_MUNDO[i % REFS_MUNDO.length]];
    }
    const url = await gerarImagemGptImage2(briefing, inputImgs, token, openaiKey);
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
