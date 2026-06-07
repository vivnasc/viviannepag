import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { getFormato } from '@/lib/reels/formatos';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, formato, curso? } — gera UM reel DIDATICO (educativo, sem CTA
// nem produtos). Devolve frames (texto no ecra) + legenda + hashtags; nos
// formatos a falar tambem um roteiro. Grava em carousel_collections
// (formato='reel') para reaproveitar o render -> MP4 com Ancient Ground.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; formato?: string; curso?: string };
  const tema = body.tema?.trim();
  const formato = getFormato(body.formato ?? 'sinais');
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar; pos-graduada). Crias REELS DIDATICOS para Instagram — para ENSINAR e atrair pessoas novas, nunca para vender. Contexto academico: "${curso.nome}" (${curso.descricao}). Portugues europeu COM acentos. Linguagem humana, calorosa, com profundidade real (nada de frases motivacionais ocas).

REGRAS:
- PURAMENTE DIDATICO: SEM CTA de venda, SEM produtos, SEM links. So conhecimento.
- O 1.o frame (capa) tem de PARAR O SCROLL nos primeiros 3 segundos.
- Frases CURTAS (cabem grandes no ecra). Concreto, com exemplos do real.
- Fiel ao conceito academico; honra a profundidade quando o tema o pedir.
- ENQUADRAMENTO (critico): NUNCA soar a ensinar egoismo nem "poe-te primeiro". O caminho e INTEIREZA, PRESENCA e RECIPROCIDADE saudavel (nao auto-prioridade egocentrica).
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.

${formato.instrucao}

DEVOLVE APENAS JSON valido:
{
  "titulo": "titulo interno curto (2-5 palavras)",
  "frames": [ { "kicker": "etiqueta curta ou vazio", "texto": "frase do frame", "nota": "linha pequena opcional (ex.: comenta em baixo) ou vazio" } ],
  "destaque": ["1 a 3 palavras-chave da frase para realcar (so no formato Frase com motion)"],
  "fundoPrompt": "prompt MidJourney para imagem transcendente de fundo, sem pessoas, sem texto, --ar 9:16 (so no formato Frase com motion)",
  "legenda": "legenda para Instagram: 1.a linha gancho, depois 2-4 linhas que aprofundam em palavras simples, fecha com convite a refletir + 'guarda este reel' ou 'partilha com quem precisa'. SEM vender. Portugues europeu com acentos.",
  "hashtags": ["10-12 hashtags em portugues, mistura amplas e de nicho, sem repetir"]
}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: `Tema do reel (formato ${formato.nome}, curso ${curso.nome}): "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  type Frame = { kicker?: string; texto?: string; nota?: string };
  let p: { titulo?: string; frames?: Frame[]; roteiro?: string[]; destaque?: string[]; fundoPrompt?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p); // a Vivianne nao usa travessoes

  const framesIn = Array.isArray(p.frames) ? p.frames.filter((f) => f && f.texto) : [];
  if (!framesIn.length) return NextResponse.json({ erro: 'sem-frames', amostra: texto.slice(0, 300) }, { status: 502 });

  const ehKinetico = formato.id === 'kinetico';
  // cada frame vira um "slide". Kinetico = 1 slide tipo='kinetico' (frase + fundo).
  const slides = ehKinetico
    ? [{
        tipo: 'kinetico',
        texto: (framesIn[0].texto ?? '').trim(),
        destaque: Array.isArray(p.destaque) ? p.destaque.map(String) : [],
        notaVisual: (p.fundoPrompt ?? '').trim(), // prompt MJ para o fundo (copia -> gera -> arrasta)
        capa: true,
      }]
    : framesIn.map((f, i) => ({
        tipo: 'reel',
        kicker: (f.kicker ?? '').trim() || (i === 0 ? formato.nome : ''),
        texto: (f.texto ?? '').trim(),
        nota: (f.nota ?? '').trim(),
        capa: i === 0,
      }));

  // musica: uma faixa variada (deterministica por agora)
  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };

  const slug = `reel-${formato.id}-${curso.id}-${Date.now()}`;
  const dias = [{ dia: 1, mundo, palavra: p.titulo ?? tema, slides, faixa, roteiro: formato.video ? [] : (p.roteiro ?? []), legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'reel', subtipo: formato.id, video: formato.video, mundo, curso: curso.id } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
