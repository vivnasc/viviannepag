import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { getPersonagem } from '@/lib/metodo/personagens';
import { promptCartaFigura } from '@/lib/metodo/ia';
import { figuraDescricao, cartaEspecial } from '@/lib/metodo/baralho';

// Resolve um id para um ALVO de figura: ou uma personagem do baralho diário, ou uma
// das CARTAS ESPECIAIS de fecho (Leal, Já Pode Viver). A figura vem da ASSINATURA
// visual (gesto+objeto+olhar+energia), não do nome — é o que faz a personagem.
type Alvo = { id: string; nome: string; essencia?: string; pose?: string };
function resolverAlvo(id: string): Alvo | undefined {
  const p = getPersonagem(id);
  if (p) return { id: p.id, nome: p.nome, essencia: p.essencia, pose: figuraDescricao(p.id) };
  const ce = cartaEspecial(id);
  if (ce) return { id: ce.id, nome: ce.nome, pose: figuraDescricao(ce.id) ?? ce.pose };
  return undefined;
}

export const runtime = 'nodejs';
export const maxDuration = 120;

// TESTADOR DO BARALHO "Sou Aquela" (como o testador de capas dos romances):
// por personagem, gera FIGURAS candidatas (carta de baralho) e escolhe a DEFINITIVA.
// A figura escolhida fica FIXA dessa personagem (a geração da carta usa-a, em vez de
// gerar nova). As escolhidas guardam-se numa linha 'metodo-baralho' (theme.figuras).
// Personagem fixa + figura fixa (escolhida); só a MENSAGEM varia.

const SLUG = 'metodo-baralho';

type Estado = { figuras: Record<string, string>; candidatas: Record<string, string[]>; referencia?: string };
async function lerEstado(): Promise<Estado> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('theme').eq('slug', SLUG).maybeSingle();
  const t = (data?.theme as { figuras?: Record<string, string>; candidatas?: Record<string, string[]>; referencia?: string } | null) ?? {};
  return { figuras: t.figuras ?? {}, candidatas: t.candidatas ?? {}, referencia: t.referencia };
}
async function gravar(e: Estado) {
  const supabase = getSupabaseAdmin();
  return supabase.from('carousel_collections').upsert({ slug: SLUG, title: 'Baralho · figuras', theme: { figuras: e.figuras, candidatas: e.candidatas, referencia: e.referencia, metodo: { conta: 'mae', tipo: 'baralho-figuras' } } }, { onConflict: 'slug' });
}

// GET: figuras escolhidas (definitivas) + candidatas geradas + a REFERÊNCIA de estilo do deck.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const e = await lerEstado();
  return NextResponse.json({ ok: true, figuras: e.figuras, candidatas: e.candidatas, referencia: e.referencia ?? null });
}

// POST { personagemId } -> gera UMA figura candidata e devolve { url } (não fixa).
// POST { personagemId, url, escolher:true } -> fixa essa url como a figura definitiva.
// POST { url, referencia:true } -> fixa essa imagem como a REFERÊNCIA de estilo do deck
//   (todas as gerações seguintes copiam-lhe o look via image_prompt do Flux).
// POST { referencia:true, limpar:true } -> tira a referência.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { personagemId?: string; url?: string; escolher?: boolean; referencia?: boolean; limpar?: boolean };

  // REFERÊNCIA de estilo do deck (não precisa de personagem).
  if (body.referencia) {
    const e = await lerEstado();
    if (body.limpar) { e.referencia = undefined; }
    else {
      if (!body.url) return NextResponse.json({ erro: 'sem-url' }, { status: 400 });
      let canon = body.url;
      try { canon = await guardarImagem(body.url, `metodo/baralho/_referencia.jpg`); } catch { /* fica a url */ }
      e.referencia = `${canon}?v=${Date.now()}`;
    }
    const { error } = await gravar(e);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, referencia: e.referencia ?? null });
  }

  const p = resolverAlvo(body.personagemId ?? '');
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
  // (theme.candidatas[id]) para não se perder ao recarregar/deploy. Se houver REFERÊNCIA
  // de estilo, passa-a como image_prompt (todas saem no mesmo look; só muda a pose).
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });
  const refEstado = await lerEstado();
  const prompt = promptCartaFigura(p.nome, p.essencia, p.pose);
  let ultimoErro = '';
  for (let t = 0; t < 3; t++) {
    try {
      const raw = await gerarImagemFlux(prompt, token, { raw: true, imagePrompt: refEstado.referencia });
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
