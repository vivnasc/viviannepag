import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { SEQUENCIA_GLOSSARIO } from '@/lib/glossario';
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

  const body = (await req.json().catch(() => ({}))) as { tema?: string; slides?: number; curso?: string; modo?: string; termos?: string[] };
  const modo = body.modo === 'sobre' ? 'sobre' : body.modo === 'glossario' ? 'glossario' : 'tema';
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;
  const tema = body.tema?.trim();
  if (modo === 'tema' && !tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  // Glossário: termos do TEU universo (conceitos dos cursos), automáticos,
  // sem repetir os já usados. Sem teres de escolher.
  let termos = (Array.isArray(body.termos) ? body.termos.map(String).map((s) => s.trim()).filter(Boolean) : []).slice(0, 7);
  if (modo === 'glossario' && !termos.length) {
    const N = Math.max(3, Math.min(7, Number(body.slides) ? Number(body.slides) - 1 : 5));
    // sequência pedagógica fixa: avança pelos termos ainda não usados, NA ORDEM
    const pool = SEQUENCIA_GLOSSARIO;
    try {
      const sb = getSupabaseAdmin();
      const { data: prev } = await sb.from('carousel_collections').select('theme').eq('theme->>formato', 'carrossel-veu').eq('theme->>modo', 'glossario');
      const usados = new Set((prev ?? []).flatMap((r) => ((r.theme as { termos?: string[] } | null)?.termos ?? [])));
      let disp = pool.filter((t) => !usados.has(t)); // mantém a ordem pedagógica
      if (disp.length < N) disp = pool; // já deu a volta, recomeça do início
      termos = disp.slice(0, N); // os próximos N por ordem, sem baralhar
    } catch { termos = pool.slice(0, N); }
  }

  const nSlides = modo === 'sobre' ? 4
    : modo === 'glossario' ? termos.length + 1
    : Math.max(3, Math.min(8, Number(body.slides) || 5));

  // termo "limpo" (só o nome: sem descrição após ":" nem parênteses) para o glossário
  const termosPrompt = termos.map((t) => t.split(':')[0].replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim());

  const instrucaoModo = modo === 'sobre'
    ? 'MODO APRESENTACAO: este carrossel apresenta a conta "Véu a Véu". Slide 1: o nome + essencia (aprender a alma, camada a camada). Depois: o que e a conta (transpessoal, constelacao familiar, espiritualidade, tornadas simples), para quem e, o que vai encontrar, e quem es (Vivianne, partilha com verdade, sem formulas). Ultimo: convite a ficar.'
    : modo === 'glossario'
    ? (termos.length
      ? `MODO GLOSSARIO: define EXATAMENTE estes termos, por esta ordem, um por slide (slide 1 = CAPA com "Glossário da Alma"): ${termosPrompt.join('; ')}. NAO acrescentes outros, NAO troques, NAO repitas. Cada slide de termo: comeca pelo TERMO escrito com a acentuacao CORRETA (ex.: "Inclusão", "Parentificação", "Pertença"), realcado a ouro, seguido de uma definicao simples e clara numa frase (ex.: "Sombra. A parte de ti que aprendeste a esconder para seres aceite."). Em "destaque" poe o proprio termo.`
      : 'MODO GLOSSARIO: cada slide (menos a capa) define UM termo da psicologia da alma. Slide 1 = CAPA com "Glossario da Alma". Cada um dos outros slides: comeca pelo TERMO (sera realcado a ouro), seguido de uma definicao simples e clara numa frase. Em "destaque" poe o proprio termo. Usa termos do ambito (sombra, ego, self, individuacao, ordens do amor, lealdade invisivel, parentificacao, campo morfogenetico). NAO repitas termos.')
    : `Tema do carrossel: "${tema}" (curso ${curso.nome}). Fiel ao conceito, concreto, com exemplos do real.`;

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar; pos-graduada). Crias CARROSSEIS DIDATICOS para Instagram (varios slides, cada um uma imagem com uma frase). Para ENSINAR e atrair, nunca vender. Portugues europeu COM acentos. Linguagem humana, com profundidade real.

REGRAS:
- ${nSlides} slides no total. BREVIDADE: cada slide UMA frase curta (max ~14 palavras, cabe grande no ecra).
- Slide 1 = CAPA que para o scroll. Slides do meio = a ideia passo a passo. Ultimo = fecho que convida a refletir (e "guarda este post" ou "partilha com quem precisa").
- PURAMENTE DIDATICO: sem CTA de venda, sem produtos, sem links.
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.
- ACENTUAÇÃO OBRIGATÓRIA: escreve sempre com a acentuação correta do português europeu (ã, õ, ç, á, é, í, ó, ú, â, ê, ô). Ex.: "Inclusão" e nunca "Inclusao"; "Pertença", "Parentificação", "Lealdade". Nunca escrevas uma palavra sem o acento que ela tem.
- ${instrucaoModo}

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
    : modo === 'glossario'
    ? (termos.length
      ? `Cria "Glossário da Alma": capa + a definicao destes termos, um por slide, por esta ordem: ${termosPrompt.join('; ')}.`
      : `Cria um carrossel "Glossario da Alma" com ${nSlides} slides (capa + ${nSlides - 1} termos distintos).`)
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

  // glossário: fundo fixo, coeso e escuro (uma imagem para TODOS os slides, com o texto a ler bem)
  if (modo === 'glossario') {
    p.fundoPrompt = 'abstract deep indigo and midnight blue background with soft floating golden particles and gentle luminous mist, calm cosmic texture, dark and minimal with empty centre so text reads clearly, ethereal sacred, fine art, no people, no text, no logo, --ar 4:5 --style raw';
  }

  const slidesIn = (Array.isArray(p.slides) ? p.slides : []).filter((s) => s && s.texto);
  if (!slidesIn.length) return NextResponse.json({ erro: 'sem-slides', amostra: texto.slice(0, 300) }, { status: 502 });

  const semAcc = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slides = slidesIn.map((s, i) => {
    let texto = (s.texto ?? '').trim();
    let destaque = Array.isArray(s.destaque) ? s.destaque.map(String) : [];
    // glossário: o TERMO a dourar é o que está ANTES do primeiro ponto (o que está mesmo no slide).
    // Assim o realce bate sempre certo. Corrige o acento se corresponder a um termo do universo.
    if (modo === 'glossario' && i > 0) {
      const dot = texto.indexOf('.');
      let termoTxt = (dot > 0 ? texto.slice(0, dot) : texto).trim();
      const canon = termosPrompt.find((t) => semAcc(t) === semAcc(termoTxt));
      if (canon && canon !== termoTxt) { texto = canon + texto.slice(termoTxt.length); termoTxt = canon; }
      destaque = termoTxt ? [termoTxt] : destaque;
    }
    return { tipo: 'kinetico', texto, destaque, notaVisual: i === 0 ? (p.fundoPrompt ?? '').trim() : '', capa: i === 0 };
  });

  const slug = `carrossel-veu-${modo}-${Date.now()}`;
  const titulo = p.titulo ?? (modo === 'sobre' ? 'Sobre' : modo === 'glossario' ? 'Glossário da Alma' : (tema ?? 'carrossel'));
  const dias = [{ dia: 1, mundo, palavra: titulo, slides, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [], fundoPrompt: (p.fundoPrompt ?? '').trim() }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: titulo, brief: tema ?? modo, dias, theme: { formato: 'carrossel-veu', modo, mundo, curso: curso.id, ...(modo === 'glossario' ? { termos } : {}) } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
