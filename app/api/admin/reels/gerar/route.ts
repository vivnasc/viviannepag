import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { getFormato } from '@/lib/reels/formatos';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { garantirCapaSerie } from '@/lib/reels/capaSerie';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Séries de reel com CAPA-ASSINATURA (imagem Flux fixa + selo, carvão na capa,
// creme no conteúdo) para reconhecimento imediato no feed.
const SERIE_ASSINATURA = ['ninguem', 'sinais'];

// POST { tema, formato, curso? } — gera UM reel DIDATICO (educativo, sem CTA
// nem produtos). Devolve frames (texto no ecra) + legenda + hashtags; nos
// formatos a falar tambem um roteiro. Grava em carousel_collections
// (formato='reel') para reaproveitar o render -> MP4 com Ancient Ground.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const body = (await req.json().catch(() => ({}))) as { tema?: string; formato?: string; curso?: string; manual?: boolean; frase?: string; destaque?: string; legenda?: string; fundoPrompt?: string };
  const tema = body.tema?.trim();
  const formato = getFormato(body.formato ?? 'sinais');
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;

  // ── MODO "frase exata" (sem IA): cria um cinetico com o texto aprovado ──
  if (body.manual) {
    const frase = limparTravessoes((body.frase ?? '').trim());
    if (!frase) return NextResponse.json({ erro: 'falta frase' }, { status: 400 });
    const destaque = limparTravessoes((body.destaque ?? '').split(',').map((s) => s.trim()).filter(Boolean));
    const fundoPrompt = limparTravessoes((body.fundoPrompt ?? '').trim()) || 'luminous golden roots and threads of light weaving upward through deep indigo blue, ethereal, sacred, soft glow, fine art, no people, no text, --ar 9:16 --style raw';
    const subId = formato.id === 'domingo' ? 'domingo' : 'kinetico'; // respeita o Domingo de Luz
    const slides = [{ tipo: 'kinetico', texto: frase, destaque, notaVisual: fundoPrompt, variante: subId === 'domingo' ? 'domingo' : undefined, capa: true }];
    const numeroFaixaM = (Math.floor(Date.now() / 1000) % 100) + 1;
    const faixaM = { numero: numeroFaixaM, titulo: `Faixa ${String(numeroFaixaM).padStart(2, '0')}`, url: faixaUrl(numeroFaixaM) };
    const slugM = `reel-${subId}-${curso.id}-${Date.now()}`;
    const diasM = [{ dia: 1, mundo, palavra: frase.slice(0, 48), slides, faixa: faixaM, legenda: limparTravessoes((body.legenda ?? '').trim()), hashtags: [] }];
    const supabaseM = getSupabaseAdmin();
    const { data: dataM, error: errM } = await supabaseM
      .from('carousel_collections')
      .upsert({ slug: slugM, title: frase.slice(0, 48), brief: frase, dias: diasM, theme: { formato: 'reel', subtipo: subId, video: true, mundo, curso: curso.id } }, { onConflict: 'slug' })
      .select().single();
    if (errM) return NextResponse.json({ erro: 'db', detalhe: errM.message }, { status: 500 });
    return NextResponse.json({ ok: true, coleccao: dataM });
  }

  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
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
  "frames": [ { "kicker": "etiqueta curta ou vazio", "texto": "frase do frame", "nota": "linha pequena opcional ou vazio", "titulo": "(opcional) título curto do frame quando ele tem pontos", "pontos": ["(opcional) bullets curtos, só nos frames de explicação que pedem hierarquia"] } ],
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
  type Frame = { kicker?: string; texto?: string; nota?: string; titulo?: string; pontos?: string[] };
  let p: { titulo?: string; frames?: Frame[]; roteiro?: string[]; destaque?: string[]; fundoPrompt?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p); // a Vivianne nao usa travessoes

  const framesIn = Array.isArray(p.frames) ? p.frames.filter((f) => f && (f.texto || (Array.isArray(f.pontos) && f.pontos.length))) : [];
  if (!framesIn.length) return NextResponse.json({ erro: 'sem-frames', amostra: texto.slice(0, 300) }, { status: 502 });

  const ehKinetico = formato.id === 'kinetico' || formato.id === 'domingo';
  // cada frame vira um "slide". Kinetico = 1 slide tipo='kinetico' (frase + fundo).
  const slides = ehKinetico
    ? [{
        tipo: 'kinetico',
        texto: (framesIn[0].texto ?? '').trim(),
        destaque: Array.isArray(p.destaque) ? p.destaque.map(String) : [],
        notaVisual: (p.fundoPrompt ?? '').trim(), // prompt MJ para o fundo (copia -> gera -> arrasta)
        variante: formato.id === 'domingo' ? 'domingo' : undefined, // motion próprio do Domingo de Luz
        capa: true,
      }]
    : framesIn.map((f, i) => ({
        tipo: 'reel',
        kicker: (f.kicker ?? '').trim() || (i === 0 ? formato.nome : ''),
        texto: (f.texto ?? '').trim(),
        nota: (f.nota ?? '').trim(),
        titulo: (f.titulo ?? '').trim(),
        pontos: Array.isArray(f.pontos) ? f.pontos.map((s) => String(s).trim()).filter(Boolean) : [],
        // séries com assinatura: capa com selo (nome) em carvão, conteúdo em creme
        selo: i === 0 && SERIE_ASSINATURA.includes(formato.id) ? formato.nome : '',
        pal: SERIE_ASSINATURA.includes(formato.id) ? (i === 0 ? 'carvao' : 'creme') : undefined,
        capa: i === 0,
      }));

  // capa-assinatura fixa: gera-se SOZINHA na 1.ª vez (nunca fica sem capa), e
  // reutiliza-se depois. Cada série tem a sua imagem (identidade própria).
  if (SERIE_ASSINATURA.includes(formato.id) && slides.length) {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (replicateToken) {
      try { const url = await garantirCapaSerie(formato.id, replicateToken); if (url) (slides[0] as { imageUrl?: string }).imageUrl = url; } catch {}
    }
  }

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
