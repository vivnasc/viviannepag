import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { ROTACAO } from '@/lib/series/serie-design';
import { VOZ, PORTA_SALA, REFLEXO_PARTILHA, BREVIDADE, LEGENDA_LONGA, SOM_PROMPT, estacaoPt, type Serie } from '@/lib/series/voz';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { serie, escopo } — REGENERAR FRASES em BULK (o par do "↻ outra frase"
// por dia). escopo: 'todas' (todos os dias da série) ou 'longas' (só os que
// passam o limite de brevidade). Reescreve a frase CURTA + legenda + prompt MJ
// dos dias existentes, mantendo motion/áudio/data; invalida o MP4 (videoUrl=null).
type S0 = { frase?: string; motionUrl?: string | null; videoUrl?: string | null };
type Dia = { palavra?: string; slides?: S0[]; legenda?: string; videoUrl?: string | null };
const LIMITE: Record<Serie, number> = { vcsabia: 18, hojeemmim: 13 };
const conta = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { serie?: Serie; escopo?: 'todas' | 'longas' };
  const serie: Serie = body.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
  const escopo = body.escopo === 'todas' ? 'todas' : 'longas';

  const sb = getSupabaseAdmin();
  const { data: all } = await sb.from('carousel_collections').select('slug, dias, theme').eq('theme->>formato', 'serie-diaria');
  const desta = (all ?? []).filter((c) => ((c.theme as { serie?: string } | null)?.serie ?? null) === serie);

  // dedup: TODAS as frases já usadas na série (para não repetir)
  const proibidas: string[] = [];
  for (const c of desta) for (const d of (Array.isArray(c.dias) ? c.dias : []) as Dia[]) if (typeof d?.palavra === 'string' && d.palavra.trim()) proibidas.push(d.palavra.trim());

  // alvos: por data; 'longas' = acima do limite de brevidade
  const alvos = desta.map((c) => {
    const t = (c.theme ?? {}) as { dia?: string; agendadoEm?: string };
    const frase = ((Array.isArray(c.dias) ? c.dias[0] : undefined) as Dia | undefined)?.palavra ?? '';
    return { slug: c.slug as string, data: t.agendadoEm ?? '', dia: t.dia ?? '', frase };
  }).filter((a) => a.data && (escopo === 'todas' || conta(a.frase) > LIMITE[serie]))
    .sort((a, b) => a.data.localeCompare(b.data));
  if (!alvos.length) return NextResponse.json({ ok: true, atualizados: 0, nota: escopo === 'longas' ? 'Nenhuma frase acima do limite — já estão curtas.' : 'Nenhum dia desta série.' });

  const lista = alvos.map((a) => `- ${a.data} (${a.dia}${serie === 'hojeemmim' && ROTACAO[a.dia] ? `; ritual "${ROTACAO[a.dia].kicker}": ${ROTACAO[a.dia].tema}` : ''})`).join('\n');
  const SYSTEM = `És a voz da Vivianne dos Santos (psicologia transpessoal, constelação familiar; viviannedossantos.com). Reescreves frases diárias para Instagram, didáticas e com alma, NUNCA para vender.
${VOZ[serie]}
CONTEXTO: época do ano: ${estacaoPt(new Date())}. Cada frase encaixa no SEU dia da semana${serie === 'hojeemmim' ? ' e serve o RITUAL desse dia (1.ª pessoa)' : ''}, com subtileza.

${BREVIDADE[serie]}

${PORTA_SALA}

${REFLEXO_PARTILHA}

${LEGENDA_LONGA}

${SOM_PROMPT}

VARIEDADE: cada frase ÚNICA em ideia e imagem. NUNCA repitas nenhuma destas já usadas (nem versões quase iguais):
${proibidas.map((p) => `- ${p}`).join('\n')}

Devolve APENAS JSON: { "dias": [ { "data": "YYYY-MM-DD", "frase": "a CURTA da imagem", "legenda": "a longa (2-4 frases, \\n\\n)", "mjPrompt": "prompt MidJourney EN do fundo em movimento, sem pessoas/texto, --ar 9:16", "somPrompt": "ambiente sonoro da MESMA cena, EN, com seamless loop, no music, no voices" } ] }
Um item por CADA dia da lista.

${REGRA_ACENTOS}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content: `Reescreve as frases (curtas) destes ${alvos.length} dias:\n${lista}` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let pj: { dias?: { data?: string; frase?: string; legenda?: string; mjPrompt?: string; somPrompt?: string }[] };
  try { pj = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  pj = limparTravessoes(pj);
  pj = await corrigirAcentos(pj, apiKey);
  const novas = Array.isArray(pj.dias) ? pj.dias : [];

  let atualizados = 0;
  for (const n of novas) {
    const alvo = alvos.find((a) => a.data === (n.data ?? '').trim());
    const frase = (n.frase ?? '').trim();
    if (!alvo || !frase) continue;
    const { data: row } = await sb.from('carousel_collections').select('dias, theme').eq('slug', alvo.slug).single();
    if (!row) continue;
    const dias = (Array.isArray(row.dias) ? row.dias : []) as Dia[];
    if (!dias[0]) continue;
    dias[0].palavra = frase;
    dias[0].legenda = (n.legenda ?? '').trim() || frase;
    dias[0].videoUrl = null;
    if (dias[0].slides?.[0]) { dias[0].slides[0].frase = frase; dias[0].slides[0].videoUrl = null; }
    const theme = { ...((row.theme as Record<string, unknown>) ?? {}), mjPrompt: (n.mjPrompt ?? '').trim() || (row.theme as { mjPrompt?: string })?.mjPrompt, somPrompt: (n.somPrompt ?? '').trim() || (row.theme as { somPrompt?: string })?.somPrompt };
    const { error } = await sb.from('carousel_collections').update({ title: frase.slice(0, 80), dias, theme }).eq('slug', alvo.slug);
    if (!error) atualizados++;
  }

  return NextResponse.json({ ok: true, escopo, alvos: alvos.length, atualizados });
}
