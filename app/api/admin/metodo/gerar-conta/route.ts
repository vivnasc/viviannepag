import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { planoSemanaMae } from '@/lib/metodo/semana';
import { personagemDoDia } from '@/lib/metodo/peca';
import { gerarStoryboard } from '@/lib/metodo/storyboard-ia';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';
import { gerarFundoIA, assuntoCurto } from '@/lib/metodo/ia';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// FILHAS (ver/vir/viver) · 2 POSTS POR DIA, cada conta no SEU formato.
// DNA do Método VS: o VÉU do dia é PARTILHADO por todas as contas (a sequência dos
// 7, 1/dia) — vem de planoSemanaMae (NÃO do pool antigo de posts, que foi abolido).
// Cada conta exprime o véu do dia à sua maneira:
//   manhã (11:00) = a CENA (descoberta)            -> subtipo 'nbeats'
//   tarde (17:00) = a peça funda (profundidade): ver O Espelho · viver Repara (nbeats);
//                   vir a Carta de renomear (subtipo 'carta' -> CartaSlide)
// NUNCA gera para datas passadas. Salta posts que já existem; nunca toca em publicados.

const NOME_TARDE: Record<string, string> = { ver: 'O Espelho', vir: 'Carta de renomear', viver: 'Repara' };
const TIPO_TARDE: Record<string, string> = { ver: 'espelho', vir: 'cartaRenomear', viver: 'repara' };

type SlideMetodo = { tipo: 'metodo'; texto: string; destaque: string[]; notaVisual: string; imageUrl: string | null; capa: boolean; conceito: string; contaId: ContaId };

// A peça da filha NASCE COM IMAGEM (como no laboratório): gera o fundo (Flux) com um
// prompt criativo e variado (gerarFundoIA, o mesmo que dá as imagens lindas), e aplica-o.
// nbeats (ver/viver) = a mesma cena em todos os momentos; cartaRenomear (vir) = só a capa.
// Best-effort: se a imagem falhar, a peça fica com o prompt e o passo "imagens" preenche depois.
async function aplicarImagem(row: { slug: string; dias: { slides: SlideMetodo[] }[]; theme: { metodo?: { tipo?: string } } }, conta: typeof CONTAS[ContaId], veu: VeuNome, apiKey: string, token: string | undefined, evitarImg: string[]): Promise<void> {
  if (!token) return;
  const slides = row.dias[0]?.slides ?? [];
  if (!slides.length) return;
  const ehCarta = (row.theme.metodo?.tipo) === 'cartaRenomear';
  try {
    const prompt = await gerarFundoIA(conta, evitarImg, apiKey, slides[0]?.texto, 'contemplativo', veu);
    const raw = await gerarImagemFlux(prompt, token, { raw: true });
    let url = raw;
    try { url = await guardarImagem(raw, `metodo/${row.slug}/fundo-${Date.now()}.jpg`); } catch { /* fica o url do Replicate */ }
    if (ehCarta) { if (slides[0]) { slides[0].imageUrl = url; slides[0].notaVisual = prompt; } }
    else for (const s of slides) { s.imageUrl = url; s.notaVisual = prompt; }
    evitarImg.push(assuntoCurto(prompt));
  } catch { /* best-effort: sem imagem agora; o passo "imagens" preenche depois */ }
}

function montarRow(conta: ContaId, slug: string, data: string, hora: string, subtipo: string, tipo: string, conceito: string, veu: VeuNome, beats: { texto: string; imagem: string }[], envio: string) {
  const c = CONTAS[conta];
  const slides: SlideMetodo[] = beats.map((b, i) => ({ tipo: 'metodo', texto: limparTravessoes(b.texto), destaque: [], notaVisual: b.imagem ?? '', imageUrl: null, capa: i === 0, conceito: i === 0 ? conceito : '', contaId: conta }));
  const corpo = slides.map((s) => s.texto).join('\n');
  const tags = hashtagsMetodo(veu);
  const legenda = limparTravessoes(`${corpo}${envio ? `\n\n${envio}` : ''}\n\nMétodo VS · @${c.handle}\n\n${tags.map((t) => `#${t}`).join(' ')}`);
  const dias = [{ dia: 1, mundo: 'autora', palavra: (slides[0]?.texto ?? conceito).slice(0, 48), slides, legenda, hashtags: tags }];
  return {
    slug, title: (slides[0]?.texto ?? conceito).slice(0, 48), brief: slides[0]?.texto ?? conceito, dias,
    theme: { formato: 'reel', subtipo, video: true, mundo: 'autora', marca: c.marca, agendadoEm: data, hora, metodo: { conta, tipo, veu } },
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  const token = process.env.REPLICATE_API_TOKEN; // para a imagem nascer com a peça

  const body = (await req.json().catch(() => ({}))) as { conta?: string; semanas?: number; offset?: number; dia?: string };
  const conta = (body.conta ?? '') as ContaId;
  if (conta !== 'ver' && conta !== 'vir' && conta !== 'viver') return NextResponse.json({ erro: 'conta-invalida', detalhe: 'só ver/vir/viver (a mãe usa gerar-mae)' }, { status: 400 });
  const semanas = Math.min(2, Math.max(1, body.semanas ?? 1));
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0));
  const c = CONTAS[conta];
  const supabase = getSupabaseAdmin();

  // NUNCA gerar para o passado: hoje (hora local), formato YYYY-MM-DD.
  const ag = new Date();
  const hojeStr = `${ag.getFullYear()}-${String(ag.getMonth() + 1).padStart(2, '0')}-${String(ag.getDate()).padStart(2, '0')}`;

  const evitar: string[] = [];
  const evitarImg: string[] = []; // assuntos de imagem já usados (não repetir cenas)
  const existentes = new Set<string>();
  const publicados = new Set<string>();
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', `metodo-${conta}-%`);
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string; notaVisual?: string }> }>; theme?: { igPublicado?: boolean; publicado?: boolean } }[]) {
      existentes.add(r.slug);
      if (r.theme?.igPublicado || r.theme?.publicado) publicados.add(r.slug);
      const slides = r.dias?.[0]?.slides ?? [];
      // anti-repetição sobre a PEÇA INTEIRA (não só a capa) — o corpo deixa de repetir.
      const corpo = slides.map((s) => s.texto ?? '').filter(Boolean).join(' · '); if (corpo) evitar.push(corpo);
      for (const s of slides) if (s.notaVisual) evitarImg.push(assuntoCurto(s.notaVisual));
    }
  } catch { /* sem memória */ }

  // o véu do dia (DNA, partilhado) vem de planoSemanaMae — a sequência dos 7 véus.
  let dias = body.dia
    ? planoSemanaMae(offset).filter((d) => d.data === body.dia)
    : Array.from({ length: semanas }).flatMap((_, w) => planoSemanaMae(offset + w));
  if (!body.dia) dias = dias.filter((d) => d.data >= hojeStr); // só futuro
  if (!dias.length) return NextResponse.json({ ok: true, gerados: 0, jaPassou: true });

  const fazer = (slug: string) => !publicados.has(slug) && (!!body.dia || !existentes.has(slug));

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (const d of dias) {
    // O VÉU é DNA PARTILHADO (os 7, 1/dia, iguais para todas as contas — vem de
    // planoSemanaMae). O que distingue a conta NÃO é o véu (isso foi abolido): é o
    // FORMATO + a VOZ (fraseMae) + o ÂNGULO. Cada conta refrata o mesmo véu do dia.
    const veu = d.veu;
    const personagem = personagemDoDia(veu, new Date(d.data + 'T12:00:00'));
    if (!personagem) continue;

    // o subtipo do formato-assinatura desta conta (vir = carta tipográfica; resto = nbeats).
    const subtipo = conta === 'vir' ? 'carta' : 'nbeats';

    // FILHAS = SÓ 1 post por dia: o FORMATO-ASSINATURA, às 14h. Não há post da manhã
    // (decisão da Vivianne) enquanto não houver um formato digno para a manhã.
    const slugTarde = `metodo-${conta}-tarde-${d.data}`;
    if (fazer(slugTarde)) {
      try {
        const sb = await gerarStoryboard(conta, 'profundidade', veu, personagem, apiKey, evitar);
        if (sb.beats.length) {
          const row = montarRow(conta, slugTarde, d.data, '14:00', subtipo, TIPO_TARDE[conta], NOME_TARDE[conta], veu, sb.beats, sb.envio);
          await aplicarImagem(row, c, veu, apiKey, token, evitarImg); // a peça nasce com a imagem
          rows.push(row);
          evitar.push(sb.beats.map((b) => b.texto).join(' · ')); // anti-repetição da peça toda
        }
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }
  }

  // Não engolir o erro: se nada saiu E houve falha, mostrar o motivo real (não "0 mudo").
  if (!rows.length) {
    if (ultimoErro) return NextResponse.json({ erro: 'geracao-falhou', detalhe: ultimoErro }, { status: 502 });
    return NextResponse.json({ ok: true, gerados: 0, jaExistiam: true });
  }
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
