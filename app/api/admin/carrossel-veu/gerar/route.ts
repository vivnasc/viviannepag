import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, slides?, curso?, modo? } — gera um CARROSSEL didatico (varios
// slides imagem + frase) de uma vez. modo='sobre' cria a apresentacao da conta.
// Grava em carousel_collections (formato='carrossel-veu'); cada slide tipo
// 'kinetico' (mesma estetica). UMA imagem de fundo aplica-se a todos.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; slides?: number; curso?: string; modo?: string };
  const modo = body.modo === 'sobre' ? 'sobre' : 'tema';
  const nSlides = Math.max(3, Math.min(8, Number(body.slides) || (modo === 'sobre' ? 4 : 5)));
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;
  const tema = body.tema?.trim();
  if (modo === 'tema' && !tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar; pos-graduada). Crias CARROSSEIS DIDATICOS para Instagram (varios slides, cada um uma imagem com uma frase). Para ENSINAR e atrair, nunca vender. Portugues europeu COM acentos. Linguagem humana, com profundidade real.

REGRAS:
- ${nSlides} slides no total. BREVIDADE: cada slide UMA frase curta (max ~12 palavras, cabe grande no ecra).
- Slide 1 = CAPA que para o scroll. Slides do meio = a ideia passo a passo. Ultimo = fecho que convida a refletir (e "guarda este post" ou "partilha com quem precisa").
- PURAMENTE DIDATICO: sem CTA de venda, sem produtos, sem links.
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.
- ${modo === 'sobre'
      ? 'MODO APRESENTACAO: este carrossel apresenta a conta "Véu a Véu". Slide 1: o nome + essencia (aprender a alma, camada a camada). Depois: o que e a conta (transpessoal, constelacao familiar, espiritualidade, tornadas simples), para quem e, o que vai encontrar, e quem es (Vivianne, partilha com verdade, sem formulas). Ultimo: convite a ficar.'
      : `Tema do carrossel: "${tema}" (curso ${curso.nome}). Fiel ao conceito, concreto, com exemplos do real.`}

DEVOLVE APENAS JSON valido:
{
  "titulo": "titulo interno curto (2-5 palavras)",
  "fundoPrompt": "UM prompt MidJourney para a imagem de fundo (transcendente, evocativa, sem pessoas, sem texto, --ar 4:5) que servira para TODOS os slides",
  "slides": [ { "texto": "frase do slide", "destaque": ["1 a 2 palavras a realcar a ouro"] } ],
  "legenda": "legenda Instagram: 1.a linha gancho, depois 2-4 linhas que aprofundam, fecha com convite a refletir + guarda/partilha. SEM vender.",
  "hashtags": ["10-12 hashtags em portugues, amplas + de nicho, sem repetir"]
}`;

  const userMsg = modo === 'sobre'
    ? `Cria o carrossel de APRESENTACAO da conta Véu a Véu em ${nSlides} slides.`
    : `Cria um carrossel didatico de ${nSlides} slides sobre: "${tema}".`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: userMsg }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  type SlideIn = { texto?: string; destaque?: string[] };
  let p: { titulo?: string; fundoPrompt?: string; slides?: SlideIn[]; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);

  const slidesIn = (Array.isArray(p.slides) ? p.slides : []).filter((s) => s && s.texto);
  if (!slidesIn.length) return NextResponse.json({ erro: 'sem-slides', amostra: texto.slice(0, 300) }, { status: 502 });

  const slides = slidesIn.map((s, i) => ({
    tipo: 'kinetico',
    texto: (s.texto ?? '').trim(),
    destaque: Array.isArray(s.destaque) ? s.destaque.map(String) : [],
    notaVisual: i === 0 ? (p.fundoPrompt ?? '').trim() : '', // o prompt do fundo fica no 1.o slide
    capa: i === 0,
  }));

  const slug = `carrossel-veu-${modo}-${Date.now()}`;
  const titulo = p.titulo ?? (modo === 'sobre' ? 'Sobre' : (tema ?? 'carrossel'));
  const dias = [{ dia: 1, mundo, palavra: titulo, slides, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [], fundoPrompt: (p.fundoPrompt ?? '').trim() }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: titulo, brief: tema ?? 'apresentação', dias, theme: { formato: 'carrossel-veu', modo, mundo, curso: curso.id } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
