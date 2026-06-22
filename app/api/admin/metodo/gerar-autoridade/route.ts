import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type VeuNome } from '@/lib/metodo/contas';
import { planoSemanaAutoridade, diasAutoridadeDaData, FORMATOS_AUTORIDADE, type DiaAutoridade, type FormatoAutoridadeId } from '@/lib/metodo/formatos-autoridade';
import { gerarAutoridade } from '@/lib/metodo/autoridade-ia';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÃE · SEMANA DE AUTORIDADE — 1 véu por semana, dissecado pelos 8 formatos (1/dia,
// quarta a dobrar). Cada peça é subtipo 'nbeats' (renderiza pela Sequencia, como os
// outros formatos da mãe) e segue o mesmo pipeline (render-dispatch + agendar +
// publicar). SÓ texto; a imagem gera-se depois. Salta o que já existe; nunca toca em
// publicados; nunca gera para o passado. NÃO mexe em gerar-mae (carta/naonorm).

type SlideMetodo = { tipo: 'metodo'; texto: string; destaque: string[]; notaVisual: string; imageUrl: null; capa: boolean; conceito: string; contaId: 'mae' };

function montarRow(slug: string, data: string, hora: string, formato: FormatoAutoridadeId, veu: VeuNome, beats: { texto: string; imagem: string }[], envio: string) {
  const conta = CONTAS.mae;
  const slides: SlideMetodo[] = beats.map((b, i) => ({ tipo: 'metodo', texto: limparTravessoes(b.texto), destaque: [], notaVisual: b.imagem ?? '', imageUrl: null, capa: i === 0, conceito: '', contaId: 'mae' }));
  const corpo = slides.map((s) => s.texto).join('\n');
  const tags = hashtagsMetodo(veu);
  const legenda = limparTravessoes(`${corpo}${envio ? `\n\n${envio}` : ''}\n\nMétodo VS\n\n${tags.map((t) => `#${t}`).join(' ')}`);
  const dias = [{ dia: 1, mundo: 'autora', palavra: (slides[0]?.texto ?? '').slice(0, 48), slides, legenda, hashtags: tags }];
  return {
    slug, title: (slides[0]?.texto ?? FORMATOS_AUTORIDADE[formato].nome).slice(0, 48), brief: slides[0]?.texto ?? '',
    dias,
    theme: { formato: 'reel', subtipo: 'nbeats', video: true, mundo: 'autora', marca: conta.marca, agendadoEm: data, hora, metodo: { conta: 'mae', tipo: formato, veu } },
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { semanas?: number; offset?: number; dia?: string; formato?: FormatoAutoridadeId; veu?: VeuNome };
  const semanas = Math.min(2, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0));
  const supabase = getSupabaseAdmin();

  const ag = new Date();
  const hojeStr = `${ag.getFullYear()}-${String(ag.getMonth() + 1).padStart(2, '0')}-${String(ag.getDate()).padStart(2, '0')}`;

  // memória: anti-repetição (1.ª linha) + slugs existentes + publicados.
  const evitar: string[] = [];
  const existentes = new Set<string>();
  const publicados = new Set<string>();
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-mae-%');
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { igPublicado?: boolean; publicado?: boolean } }[]) {
      existentes.add(r.slug);
      if (r.theme?.igPublicado || r.theme?.publicado) publicados.add(r.slug);
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
    }
  } catch { /* sem memória */ }

  // dias a gerar: 1 dia (regenera) OU a(s) semana(s). Nunca o passado.
  let dias: DiaAutoridade[] = [];
  if (body.dia) dias = diasAutoridadeDaData(body.dia);
  else { for (let w = 0; w < semanas; w++) dias.push(...planoSemanaAutoridade(offset + w)); dias = dias.filter((d) => d.data >= hojeStr); }
  if (body.formato) dias = dias.filter((d) => d.formato === body.formato);
  // teste: força um véu (ex. Turbilhão, que já tem SABER completo) sem mudar o plano.
  if (body.veu) dias = dias.map((d) => ({ ...d, veu: body.veu as VeuNome }));
  if (!dias.length) return NextResponse.json({ ok: true, gerados: 0, jaPassou: true });

  const fazer = (slug: string) => !publicados.has(slug) && (!!body.dia || !existentes.has(slug));

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (const d of dias) {
    const slug = `metodo-mae-${d.formato}-${d.data}`;
    if (!fazer(slug)) continue;
    try {
      const sb = await gerarAutoridade(d.formato, d.veu, apiKey, evitar);
      if (sb.beats.length) { rows.push(montarRow(slug, d.data, d.hora, d.formato, d.veu, sb.beats, sb.envio)); evitar.push(sb.beats[0].texto); }
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!rows.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: !ultimoErro, detalhe: ultimoErro || undefined });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
