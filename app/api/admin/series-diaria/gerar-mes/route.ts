import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { ROTACAO, paletaDoDia } from '@/lib/series/serie-design';
import { VOZ, PORTA_SALA, REFLEXO_PARTILHA, BREVIDADE, LEGENDA_LONGA, estacaoPt, type Serie } from '@/lib/series/voz';
import { listarMotions, listarAudios, usosDeMotions, escolherMotion, escolherAudio } from '@/lib/series/pool';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { serie, inicio?, dias? } — gera UM MÊS (ou N dias) da série em bulk:
// 1 chamada ao Claude para as frases todas (únicas, dia+estação+ritual), e para
// cada dia recicla um motion da POOL (novos primeiro; senão melhor match por
// keyword) + um áudio por mood. Grava 1 coleção POR DIA (formato 'serie-diaria',
// conta vivianne.dos.santos), agendada (rascunho — nada publica sem aprovares).
// Só os dias SEM motion na pool ficam com o prompt MJ para gerares um novo.

const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { serie?: Serie; inicio?: string; dias?: number };
  const serie: Serie = body.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
  const nDias = Math.min(Math.max(body.dias ?? 30, 1), 31);
  const inicio = body.inicio ? new Date(`${body.inicio}T12:00:00`) : (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
  if (isNaN(inicio.getTime())) return NextResponse.json({ erro: 'inicio inválido' }, { status: 400 });

  // lista de dias do lote
  const dias = Array.from({ length: nDias }).map((_, i) => {
    const d = new Date(inicio); d.setDate(inicio.getDate() + i);
    return { data: isoLocal(d), dia: DIAS_PT[d.getDay()] };
  });

  const supabase = getSupabaseAdmin();

  // não esmagar dias que já existem (preserva edições)
  const slugDe = (data: string) => `serie-${serie}-${data}`;
  const { data: jaExistem } = await supabase.from('carousel_collections').select('slug').in('slug', dias.map((d) => slugDe(d.data)));
  const ocupados = new Set((jaExistem ?? []).map((r) => r.slug as string));
  const aFazer = dias.filter((d) => !ocupados.has(slugDe(d.data)));
  if (!aFazer.length) return NextResponse.json({ erro: 'todos os dias deste período já existem (apaga/limpa primeiro se quiseres regerar)' }, { status: 400 });

  // frases já usadas (nunca repetir)
  const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').eq('theme->>formato', 'serie-diaria');
  const proibidas: string[] = [];
  for (const c of existentes ?? []) {
    const t = (c.theme as { serie?: string } | null) ?? {};
    if (t.serie && t.serie !== serie) continue;
    for (const d of (Array.isArray(c.dias) ? c.dias : []) as Array<{ palavra?: unknown }>) {
      if (typeof d?.palavra === 'string' && d.palavra.trim()) proibidas.push(d.palavra.trim());
    }
  }

  // ── 1 chamada ao Claude para o lote inteiro ──
  const listaDias = aFazer.map((d) => {
    const r = serie === 'hojeemmim' ? ROTACAO[d.dia] : undefined;
    return `- ${d.data} (${d.dia}${r ? `; ritual "${r.kicker}": ${r.tema}` : ''})`;
  }).join('\n');

  const SYSTEM = `És a voz da Vivianne dos Santos (psicologia transpessoal, constelação familiar; viviannedossantos.com). Escreves frases diárias para Instagram, didáticas e com alma, NUNCA para vender.
${VOZ[serie]}

CONTEXTO: época do ano: ${estacaoPt(inicio)}. Cada frase encaixa no SEU dia da semana${serie === 'hojeemmim' ? ' e serve o RITUAL desse dia (na 1.ª pessoa)' : ''}, com subtileza, nunca nomeando a data.

${BREVIDADE[serie]}

${PORTA_SALA}

${REFLEXO_PARTILHA}

${LEGENDA_LONGA}

VARIEDADE NO LOTE: cada frase é ÚNICA em ideia E em imagem (não repetir motivos: se uma usa planta, outra não usa planta; varia natureza, casa, corpo, luz, água…). NUNCA repitas nenhuma destas já usadas, nem versões quase iguais:
${proibidas.length ? proibidas.map((p) => `- ${p}`).join('\n') : '(nenhuma ainda)'}

Devolve APENAS JSON válido:
{ "dias": [ { "data": "YYYY-MM-DD", "frase": "a frase CURTA da imagem", "legenda": "a versão longa (2-4 frases, parágrafos com \\n\\n, fecho digno)", "mjPrompt": "prompt MidJourney em INGLÊS para o FUNDO em MOVIMENTO (metáfora visual da frase; contemplativo, fine-art, cinematográfico, luz natural suave/noturna; SEM pessoas, SEM texto). Termina com --ar 9:16" } ] }
Um item por CADA dia da lista, pela ordem.

${REGRA_ACENTOS}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content: `Gera as frases para estes ${aFazer.length} dias:\n${listaDias}` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { dias?: { data?: string; frase?: string; legenda?: string; mjPrompt?: string }[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);
  p = await corrigirAcentos(p, apiKey);
  const geradas = Array.isArray(p.dias) ? p.dias : [];
  if (!geradas.length) return NextResponse.json({ erro: 'sem-frases', amostra: texto.slice(0, 300) }, { status: 502 });

  // ── pool: motions + áudios reciclados da escola-veus ──
  let pool: Awaited<ReturnType<typeof listarMotions>> = [];
  let audios: Awaited<ReturnType<typeof listarAudios>> = [];
  let usos: Awaited<ReturnType<typeof usosDeMotions>> = {};
  let poolErro: string | null = null;
  try { [pool, audios, usos] = await Promise.all([listarMotions(serie), listarAudios(serie), usosDeMotions()]); }
  catch (e) { poolErro = e instanceof Error ? e.message : String(e); }

  const hora = serie === 'vcsabia' ? '07:00' : '21:00';
  const jaNesteLote = new Set<string>();
  const resumo: { data: string; dia: string; frase: string; motion: string | null; audio: string | null; mj: boolean; mjPrompt?: string }[] = [];

  for (const g of geradas) {
    const data = (g.data ?? '').trim();
    const frase = (g.frase ?? '').trim();
    const alvo = aFazer.find((d) => d.data === data);
    if (!alvo || !frase) continue;
    const motion = pool.length ? escolherMotion(frase, pool, usos, jaNesteLote, data) : null;
    if (motion) jaNesteLote.add(motion.path);
    const mjPrompt = (g.mjPrompt ?? '').trim();
    // O SOM casa com o MOTION: se da pool, pela etiqueta/mood + nome+categoria;
    // se ainda não há motion (vai ser carregado), pelo PROMPT que o vai gerar.
    const audio = audios.length
      ? escolherAudio({
          descritor: motion ? `${motion.categoria ?? ''} ${motion.mood ?? ''} ${motion.nome}` : mjPrompt,
          moodPreferido: motion?.mood ?? null,
          dia: alvo.dia, serie, audios,
        })
      : null;
    const paleta = serie === 'hojeemmim' ? paletaDoDia(alvo.dia) : 'dourado';

    const legenda = (g.legenda ?? '').trim() || frase; // a versão LONGA vive na legenda
    const slides = [{ tipo: 'serie-diaria', serie, frase, dia: alvo.dia, paleta, motionUrl: motion?.url ?? null, capa: true }];
    const diasCol = [{ dia: 1, mundo: 'escola', palavra: frase, slides, faixa: audio ? { titulo: audio.mood, url: audio.url } : undefined, legenda, hashtags: [] }];
    const theme = {
      formato: 'serie-diaria', serie, marca: 'loja', dia: alvo.dia, paleta,
      agendadoEm: data, hora, aprovado: false,
      motionPath: motion?.path ?? null, motionNome: motion?.nome ?? null, mjPrompt,
    };
    const { error } = await supabase.from('carousel_collections').insert({ slug: slugDe(data), title: frase.slice(0, 80), brief: `${serie} · ${alvo.dia} · ${data}`, dias: diasCol, theme });
    if (error) { resumo.push({ data, dia: alvo.dia, frase, motion: null, audio: null, mj: false }); continue; }
    if (motion) { const u = usos[motion.path] ?? { n: 0, ultimo: '' }; usos[motion.path] = { n: u.n + 1, ultimo: data > u.ultimo ? data : u.ultimo }; }
    resumo.push({ data, dia: alvo.dia, frase, motion: motion?.nome ?? null, audio: audio?.mood ?? null, mj: !motion, mjPrompt: !motion ? mjPrompt : undefined });
  }

  return NextResponse.json({
    ok: true, serie, criados: resumo.length, saltados: ocupados.size,
    poolMotions: pool.length, poolErro,
    semMotion: resumo.filter((r) => r.mj).length,
    resumo,
  });
}
