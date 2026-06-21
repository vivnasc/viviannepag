import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { CONTAS, type VeuNome } from '@/lib/metodo/contas';
import { planoSemanaMae, type DiaSemanaMae } from '@/lib/metodo/semana';
import { personagemDoDia } from '@/lib/metodo/peca';
import { personagensPorVeu } from '@/lib/metodo/personagens';
import { gerarStoryboard } from '@/lib/metodo/storyboard-ia';
import { cartaDoBaralho } from '@/lib/metodo/baralho';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';

export const runtime = 'nodejs';
export const maxDuration = 300;

// MÃE · 2 POSTS POR DIA, nos formatos novos (substitui o duasfaces antigo):
//   meio da MANHÃ (10:30) = CARTA "Sou Aquela"  (descoberta / cartaBaralho)
//   meio da TARDE (16:00) = "Não normalizes"     (profundidade / naoNormalizes)
// NÃO mexe nos 3 geradores maduros da conta (abertura/vc sabia · pico/carrosséis ·
// fecho/hoje em mim). Só texto; a imagem gera-se depois (rota /imagens). Cada post
// é subtipo 'nbeats' -> renderiza pela Sequencia (beats sobre 1 imagem) e segue no
// mesmo pipeline de render-dispatch + agendar + publicar (a leveza da veu.a.veu).
// Salta posts que JÁ existem (por slug) e NUNCA toca em publicados.

const HORA_CARTA = '10:30';
const HORA_NAONORM = '16:00';

type SlideMetodo = { tipo: 'metodo'; texto: string; destaque: string[]; notaVisual: string; imageUrl: null; capa: boolean; conceito: string; contaId: 'mae' };

function montarRow(slug: string, data: string, hora: string, tipo: string, conceito: string, veu: VeuNome, beats: { texto: string; imagem: string }[], envio: string, personagem?: string) {
  const conta = CONTAS.mae;
  const slides: SlideMetodo[] = beats.map((b, i) => ({
    tipo: 'metodo', texto: limparTravessoes(b.texto), destaque: [], notaVisual: b.imagem ?? '',
    imageUrl: null, capa: i === 0, conceito: i === 0 ? conceito : '', contaId: 'mae',
  }));
  const corpo = slides.map((s) => s.texto).join('\n');
  const tags = hashtagsMetodo(veu);
  const legenda = limparTravessoes(`${corpo}${envio ? `\n\n${envio}` : ''}\n\nMétodo VS\n\n${tags.map((t) => `#${t}`).join(' ')}`);
  const dias = [{ dia: 1, mundo: 'autora', palavra: (slides[0]?.texto ?? conceito ?? '').slice(0, 48), slides, legenda, hashtags: tags }];
  return {
    slug,
    title: (slides[0]?.texto ?? conceito ?? '').slice(0, 48),
    brief: slides[0]?.texto ?? conceito ?? '',
    dias,
    theme: {
      formato: 'reel', subtipo: 'nbeats', video: true, mundo: 'autora', marca: conta.marca,
      agendadoEm: data, hora,
      metodo: { conta: 'mae', tipo, veu, ...(personagem ? { personagem } : {}) },
    },
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { semanas?: number; offset?: number; dia?: string };
  const semanas = Math.min(2, Math.max(1, body.semanas ?? 1)); // mais pesado (2 IA/dia); cap a 2 semanas
  const offset = Math.max(-12, Math.min(12, body.offset ?? 0)); // 0 = esta semana

  const supabase = getSupabaseAdmin();

  // memória: anti-repetição (texto da 1.ª linha) + slugs já existentes + publicados.
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
  } catch { /* sem memória prévia */ }

  // dias a gerar: 1 dia (body.dia, regenera) OU a(s) semana(s).
  // NUNCA gerar para o passado.
  const ag = new Date();
  const hojeStr = `${ag.getFullYear()}-${String(ag.getMonth() + 1).padStart(2, '0')}-${String(ag.getDate()).padStart(2, '0')}`;
  let dias: DiaSemanaMae[] = [];
  if (body.dia) { const dm = planoSemanaMae(offset).find((d) => d.data === body.dia); if (dm) dias = [dm]; }
  else { for (let w = 0; w < semanas; w++) dias.push(...planoSemanaMae(offset + w)); dias = dias.filter((d) => d.data >= hojeStr); }
  if (!dias.length) return NextResponse.json({ ok: true, gerados: 0, jaPassou: true });

  // gera o slug se NÃO publicado e (for um dia escolhido OU ainda não existir).
  const fazer = (slug: string) => !publicados.has(slug) && (!!body.dia || !existentes.has(slug));

  const rows: Record<string, unknown>[] = [];
  let ultimoErro = '';
  for (const d of dias) {
    const dt = new Date(d.data + 'T12:00:00');
    const veu = d.veu;
    const personagem = personagemDoDia(veu, dt);
    if (!personagem) continue;

    const slugCarta = `metodo-mae-carta-${d.data}`;
    if (fazer(slugCarta)) {
      // CARTA "Sou Aquela" GERADA (IA) a partir da ALMA da personagem (essência +
      // sombra) e do SABER do véu — INFINITA e funda, não um baralho fixo que repete
      // e sai raso. conceito '' = sem rótulo no cartão. A personagem vai no theme para
      // a imagem gerar a FIGURA (carta de baralho). subtipo 'nbeats'.
      try {
        const sb = await gerarStoryboard('mae', 'descoberta', veu, personagem, apiKey, evitar);
        if (sb.beats.length) { rows.push(montarRow(slugCarta, d.data, HORA_CARTA, 'carta', '', veu, sb.beats, sb.envio, personagem.nome)); evitar.push(sb.beats[0].texto); }
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }

    const slugNN = `metodo-mae-naonorm-${d.data}`;
    if (fazer(slugNN)) {
      try {
        // o "não normalizes" TEM de ter vários beats (faca + volta). Se a IA vier
        // curta (1-2 beats), tenta de novo e fica com a versão mais completa.
        let sb = await gerarStoryboard('mae', 'profundidade', veu, personagem, apiKey, evitar);
        if (sb.beats.length < 4) {
          try { const sb2 = await gerarStoryboard('mae', 'profundidade', veu, personagem, apiKey, evitar); if (sb2.beats.length > sb.beats.length) sb = sb2; } catch { /* fica a 1.ª */ }
        }
        if (sb.beats.length) { rows.push(montarRow(slugNN, d.data, HORA_NAONORM, 'naonormalizes', 'Não normalizes', veu, sb.beats, sb.envio)); evitar.push(sb.beats[0].texto); }
      } catch (e) { ultimoErro = e instanceof Error ? e.message : String(e); }
    }
  }

  if (!rows.length) return NextResponse.json({ ok: true, gerados: 0, jaExistiam: !ultimoErro, detalhe: ultimoErro || undefined });
  const { error } = await supabase.from('carousel_collections').upsert(rows, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gerados: rows.length });
}
