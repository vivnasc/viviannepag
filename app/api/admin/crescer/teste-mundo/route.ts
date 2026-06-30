import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem, BUCKET } from '@/lib/banda/flux';
import { cenaMundoTeste, cenaAncorada } from '@/lib/crescer/mundo-teste';
import { REFS_MUNDO } from '@/lib/crescer/refs-mundo';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PASTA = 'crescer/_teste';
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cena';
const desslug = (s: string) => s.replace(/\.jpg$/i, '').replace(/-/g, ' ').trim();

// SANDBOX · gera AMOSTRAS do mundo a partir do motor de TESTE (mundo-teste.ts), com
// ÂNCORA nas referências DELA (image_prompt). NÃO cria posts. As amostras ficam em
// crescer/_teste/ (permanente) e o HISTÓRICO lê-se da própria pasta (à prova de tudo).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'sem-replicate' }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { quantos?: number; seed?: number; ancorar?: boolean };
  const quantos = Math.max(1, Math.min(6, body.quantos ?? 4));
  const base = typeof body.seed === 'number' ? body.seed : Math.floor(Date.now() / 1000);
  const ancorar = body.ancorar !== false && REFS_MUNDO.length > 0;

  const amostras: { url: string; categoria: string }[] = [];
  let ultimoErro = '';
  for (let i = 0; i < quantos; i++) {
    const seed = base + i * 7;
    const { briefing, categoria } = ancorar ? cenaAncorada(seed) : cenaMundoTeste(seed);
    const ref = ancorar ? REFS_MUNDO[i % REFS_MUNDO.length] : undefined; // roda pelas 3 referências
    try {
      const url = await gerarImagemFlux(briefing, token, { raw: true, imagePrompt: ref });
      let saved = url;
      try { saved = await guardarImagem(url, `${PASTA}/${Date.now()}-${i}__${slug(categoria)}.jpg`); } catch { /* fica o url cru */ }
      amostras.push({ url: saved, categoria });
    } catch (e) { ultimoErro = String(e instanceof Error ? e.message : e); }
  }
  if (!amostras.length) return NextResponse.json({ erro: 'falhou', detalhe: ultimoErro }, { status: 502 });
  return NextResponse.json({ ok: true, amostras });
}

// HISTÓRICO · lê a pasta real das amostras (não depende do browser) e devolve tudo,
// das mais recentes para as mais antigas, com a categoria lida do nome do ficheiro.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list(PASTA, { limit: 500, sortBy: { column: 'name', order: 'desc' } });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const amostras = (data ?? [])
    .filter((f) => f.name.toLowerCase().endsWith('.jpg'))
    .map((f) => {
      const ts = parseInt(f.name.split('-')[0], 10) || 0;
      const cat = f.name.includes('__') ? desslug(f.name.split('__').slice(1).join('__')) : '';
      return { url: supabase.storage.from(BUCKET).getPublicUrl(`${PASTA}/${f.name}`).data.publicUrl, categoria: cat, ts };
    })
    .sort((a, b) => b.ts - a.ts);
  return NextResponse.json({ ok: true, amostras });
}

// LIMPAR · apaga todas as amostras de teste da pasta.
export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.from(BUCKET).list(PASTA, { limit: 1000 });
  const paths = (data ?? []).map((f) => `${PASTA}/${f.name}`);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  return NextResponse.json({ ok: true, apagadas: paths.length });
}
