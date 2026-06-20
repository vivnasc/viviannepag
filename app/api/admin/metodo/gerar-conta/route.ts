import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { planoSemanaMae } from '@/lib/metodo/semana';
import { personagemDoDia } from '@/lib/metodo/peca';
import { gerarStoryboard } from '@/lib/metodo/storyboard-ia';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';

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

type SlideMetodo = { tipo: 'metodo'; texto: string; destaque: string[]; notaVisual: string; imageUrl: null; capa: boolean; conceito: string; contaId: ContaId };

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
  const existentes = new Set<string>();
  const publicados = new Set<string>();
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', `metodo-${conta}-%`);
    for (const r of (data ?? []) as { slug: string; dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { igPublicado?: boolean; publicado?: boolean } }[]) {
      existentes.add(r.slug);
      if (r.theme?.igPublicado || r.theme?.publicado) publicados.add(r.slug);
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
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

    const slugCena = `metodo-${conta}-cena-${d.data}`;
    if (fazer(slugCena)) {
      try {
        const sb = await gerarStoryboard(conta, 'descoberta', veu, personagem, apiKey, evitar);
        if (sb.beats.length) { rows.push(montarRow(conta, slugCena, d.data, '11:00', 'nbeats', 'cena', 'A cena', veu, sb.beats, sb.envio)); evitar.push(sb.beats[0].texto); }
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }

    const slugTarde = `metodo-${conta}-tarde-${d.data}`;
    if (fazer(slugTarde)) {
      try {
        const sb = await gerarStoryboard(conta, 'profundidade', veu, personagem, apiKey, evitar);
        const subtipo = conta === 'vir' ? 'carta' : 'nbeats';
        if (sb.beats.length) { rows.push(montarRow(conta, slugTarde, d.data, '17:00', subtipo, TIPO_TARDE[conta], NOME_TARDE[conta], veu, sb.beats, sb.envio)); evitar.push(sb.beats[0].texto); }
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }
  }

  if (!rows.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: !ultimoErro, detalhe: ultimoErro || undefined });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
