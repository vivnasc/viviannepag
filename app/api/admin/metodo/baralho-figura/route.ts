import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { getPersonagem } from '@/lib/metodo/personagens';
import { promptCartaFigura } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 120;

// TESTADOR DO BARALHO "Sou Aquela" (como o testador de capas dos romances):
// por personagem, gera FIGURAS candidatas (carta de baralho) e escolhe a DEFINITIVA.
// A figura escolhida fica FIXA dessa personagem (a geração da carta usa-a, em vez de
// gerar nova). As escolhidas guardam-se numa linha 'metodo-baralho' (theme.figuras).
// Personagem fixa + figura fixa (escolhida); só a MENSAGEM varia.

const SLUG = 'metodo-baralho';

type Estado = { figuras: Record<string, string>; candidatas: Record<string, string[]> };
async function lerEstado(): Promise<Estado> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('theme').eq('slug', SLUG).maybeSingle();
  const t = (data?.theme as { figuras?: Record<string, string>; candidatas?: Record<string, string[]> } | null) ?? {};
  return { figuras: t.figuras ?? {}, candidatas: t.candidatas ?? {} };
}
async function gravar(e: Estado) {
  const supabase = getSupabaseAdmin();
  return supabase.from('carousel_collections').upsert({ slug: SLUG, title: 'Baralho · figuras', theme: { figuras: e.figuras, candidatas: e.candidatas, metodo: { conta: 'mae', tipo: 'baralho-figuras' } } }, { onConflict: 'slug' });
}

// GET: figuras escolhidas (definitivas) + candidatas geradas (persistidas, não se perdem).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const e = await lerEstado();
  return NextResponse.json({ ok: true, figuras: e.figuras, candidatas: e.candidatas });
}

// POST { personagemId } -> gera UMA figura candidata e devolve { url } (não fixa).
// POST { personagemId, url, escolher:true } -> fixa essa url como a figura definitiva.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { personagemId?: string; url?: string; escolher?: boolean };
  const p = getPersonagem(body.personagemId ?? '');
  if (!p) return NextResponse.json({ erro: 'personagem-desconhecida' }, { status: 400 });
  const supabase = getSupabaseAdmin();

  // ESCOLHER: copia para o caminho canónico e grava no mapa de figuras.
  if (body.escolher) {
    if (!body.url) return NextResponse.json({ erro: 'sem-url' }, { status: 400 });
    let canon = body.url;
    try { canon = await guardarImagem(body.url, `metodo/baralho/${p.id}/figura.jpg`); } catch { /* fica a url candidata */ }
    const e = await lerEstado();
    e.figuras[p.id] = `${canon}?v=${Date.now()}`;
    const { error } = await gravar(e);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, url: e.figuras[p.id] });
  }

  // GERAR candidata: figura de carta de baralho da personagem (Flux) — e PERSISTE-A
  // (theme.candidatas[id]) para não se perder ao recarregar/deploy.
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });
  const prompt = promptCartaFigura(p.nome);
  let ultimoErro = '';
  for (let t = 0; t < 3; t++) {
    try {
      const raw = await gerarImagemFlux(prompt, token, { raw: true });
      let url = raw;
      try { url = await guardarImagem(raw, `metodo/baralho/${p.id}/cand-${Date.now()}.jpg`); } catch { /* fica raw */ }
      const e = await lerEstado();
      e.candidatas[p.id] = [url, ...(e.candidatas[p.id] ?? [])].slice(0, 8);
      await gravar(e);
      return NextResponse.json({ ok: true, url, prompt, candidatas: e.candidatas[p.id] });
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
      await new Promise((r) => setTimeout(r, /429|throttl/i.test(ultimoErro) ? 12000 : 1500 * (t + 1)));
    }
  }
  return NextResponse.json({ erro: 'flux-falhou', detalhe: ultimoErro }, { status: 502 });
}
