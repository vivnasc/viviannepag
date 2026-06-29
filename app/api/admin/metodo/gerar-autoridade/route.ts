import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type VeuNome } from '@/lib/metodo/contas';
import { planoSemanaAutoridade, diasAutoridadeDaData, FORMATOS_AUTORIDADE, type DiaAutoridade, type FormatoAutoridadeId } from '@/lib/metodo/formatos-autoridade';
import { gerarAutoridade, gerarFundoAutoridade } from '@/lib/metodo/autoridade-ia';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';
import { assuntoCurto } from '@/lib/metodo/ia';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÃE · SEMANA DE AUTORIDADE — 1 véu por semana, dissecado pelos 8 formatos (1/dia,
// quarta a dobrar). Cada peça é subtipo 'nbeats' (renderiza pela Sequencia, como os
// outros formatos da mãe) e segue o mesmo pipeline (render-dispatch + agendar +
// publicar). Salta o que já existe; nunca toca em publicados; nunca gera para o
// passado. NÃO mexe em gerar-mae (carta/naonorm).

type SlideMetodo = { tipo: 'metodo'; texto: string; destaque: string[]; notaVisual: string; imageUrl: string | null; capa: boolean; conceito: string; contaId: 'mae' };

// A peça NASCE COM IMAGEM (como no laboratório/filhas): fundo Flux com gerarFundoIA
// (o mesmo das imagens lindas), a MESMA cena em todos os momentos. Best-effort: se
// falhar, fica o prompt e o passo "imagens" preenche depois.
async function aplicarImagem(row: { slug: string; dias: { slides: SlideMetodo[] }[] }, apiKey: string, token: string | undefined, evitarImg: string[]): Promise<void> {
  if (!token) return;
  const slides = row.dias[0]?.slides ?? [];
  if (!slides.length) return;
  try {
    const prompt = await gerarFundoAutoridade(slides[0]?.texto ?? '', apiKey, evitarImg);
    const raw = await gerarImagemFlux(prompt, token, { raw: true });
    let url = raw;
    try { url = await guardarImagem(raw, `metodo/${row.slug}/fundo-${Date.now()}.jpg`); } catch { /* fica o url do Replicate */ }
    for (const s of slides) { s.imageUrl = url; s.notaVisual = prompt; }
    evitarImg.push(assuntoCurto(prompt));
  } catch { /* best-effort: a imagem fica para o passo "imagens" */ }
}

function montarRow(slug: string, data: string, hora: string, formato: FormatoAutoridadeId, veu: VeuNome, beats: { texto: string; imagem: string }[], envio: string, porque: string) {
  const conta = CONTAS.mae;
  const slides: SlideMetodo[] = beats.map((b, i) => ({ tipo: 'metodo', texto: limparTravessoes(b.texto), destaque: [], notaVisual: b.imagem ?? '', imageUrl: null, capa: i === 0, conceito: '', contaId: 'mae' }));
  const corpo = slides.map((s) => s.texto).join('\n');
  const tags = hashtagsMetodo(veu);
  // a legenda traz MAIS que o reel: o corpo + o PORQUÊ (o mecanismo + o padrão, ligado
  // ao método) + o CTA + a promessa da conta. O "porque" sai do gerador (do SABER), não
  // é escrito aqui.
  const legenda = limparTravessoes(
    `${corpo}` +
    `${porque ? `\n\n${porque}` : ''}` +
    `${envio ? `\n\n${envio}` : ''}` +
    `\n\nMétodo VS · ${conta.depois}` +
    `\n\n${tags.map((t) => `#${t}`).join(' ')}`,
  );
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

  // A peça NASCE COM IMAGEM (1 passo só), também na semana toda — não é 2 passos.
  // Guarda CADA peça assim que está pronta (texto + imagem): se o pedido estourar o
  // tempo, o que já foi feito fica salvo e re-clicar continua (salta os existentes).
  const token = process.env.REPLICATE_API_TOKEN;
  const evitarImg: string[] = [];

  let gerados = 0;
  let ultimoErro = '';
  for (const d of dias) {
    const slug = `metodo-mae-${d.formato}-${d.data}`;
    if (!fazer(slug)) continue;
    try {
      const sb = await gerarAutoridade(d.formato, d.veu, apiKey, evitar);
      if (!sb.beats.length) continue;
      const row = montarRow(slug, d.data, d.hora, d.formato, d.veu, sb.beats, sb.envio, sb.porque);
      await aplicarImagem(row as unknown as { slug: string; dias: { slides: SlideMetodo[] }[] }, apiKey, token, evitarImg);
      const { error } = await supabase.from('carousel_collections').upsert(row, { onConflict: 'slug' });
      if (error) { ultimoErro = error.message; continue; }
      existentes.add(slug); evitar.push(sb.beats[0].texto); gerados++;
    } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
  }

  if (!gerados) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: !ultimoErro, detalhe: ultimoErro || undefined });
  return NextResponse.json({ ok: true, gerados });
}
