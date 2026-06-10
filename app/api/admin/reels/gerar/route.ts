import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { getFormato } from '@/lib/reels/formatos';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { garantirCapaSerie } from '@/lib/reels/capaSerie';
import { fundoAleatorio } from '@/lib/reels/fundos';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

// Gera a imagem de fundo (Flux) a partir do prompt e devolve o URL (ou null).
// Tudo automático: a Vivianne não vai mais ao Midjourney à mão.
async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `reel/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

export const runtime = 'nodejs';
export const maxDuration = 300;

// Séries de reel com CAPA-ASSINATURA (imagem Flux fixa + selo, carvão na capa,
// creme no conteúdo) para reconhecimento imediato no feed.
const SERIE_ASSINATURA = ['ninguem', 'sinais', 'pensador'];

// POST { tema, formato, curso? } — gera UM reel DIDATICO (educativo, sem CTA
// nem produtos). Devolve frames (texto no ecra) + legenda + hashtags; nos
// formatos a falar tambem um roteiro. Grava em carousel_collections
// (formato='reel') para reaproveitar o render -> MP4 com Ancient Ground.
// Gera um prompt MidJourney de FUNDO evocativo da frase (metáfora visual do
// conceito), não genérico. domingo = luminoso/sóbrio; senão = etéreo variado.
async function fundoEvocativo(frase: string, ehDomingo: boolean, apiKey: string): Promise<string> {
  const estilo = ehDomingo
    ? 'luminoso, claro e sereno mas SÓBRIO/elegante (luz natural suave, amanhecer, névoa sobre água), sem dourado, sem pétalas/penas, nada de kitsch'
    : 'etéreo e fine art, paleta profunda (indigo, terra, vinho), evocativo e simbólico';
  const sys = `Escreves UM prompt MidJourney para a IMAGEM DE FUNDO de um post de psicologia/alma. A imagem é uma METÁFORA VISUAL da frase (conversa com o sentido dela), nunca um postal genérico. ${estilo}. VARIA o motivo. SEM pessoas, SEM texto, SEM letras. Devolve SÓ o prompt em inglês, a terminar com "--ar 9:16 --style raw".`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 200, system: sys, messages: [{ role: 'user', content: `Frase: "${frase}". Prompt de fundo evocativo dela.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim();
  if (!t) throw new Error('vazio');
  return limparTravessoes(t);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const body = (await req.json().catch(() => ({}))) as { tema?: string; formato?: string; curso?: string; manual?: boolean; frase?: string; destaque?: string; legenda?: string; fundoPrompt?: string; slug?: string };
  const tema = body.tema?.trim();
  const formato = getFormato(body.formato ?? 'sinais');
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;

  // ── MODO "frase exata" (sem IA): cria um cinetico com o texto aprovado ──
  if (body.manual) {
    const frase = limparTravessoes((body.frase ?? '').trim());
    if (!frase) return NextResponse.json({ erro: 'falta frase' }, { status: 400 });
    const destaque = limparTravessoes((body.destaque ?? '').split(',').map((s) => s.trim()).filter(Boolean));
    const subId = formato.id === 'domingo' ? 'domingo' : 'kinetico'; // respeita o Domingo de Luz
    // fundo: usa o que a Vivianne deu; senão, gera um EVOCATIVO da frase (não
    // genérico); só cai no pool variado se a IA falhar.
    let fundoPrompt = limparTravessoes((body.fundoPrompt ?? '').trim());
    if (!fundoPrompt) {
      if (apiKey) { try { fundoPrompt = await fundoEvocativo(frase, subId === 'domingo', apiKey); } catch {} }
      if (!fundoPrompt) fundoPrompt = fundoAleatorio();
    }
    const slugM = `reel-${subId}-${curso.id}-${Date.now()}`;
    const imgM = await fundoImagem(fundoPrompt, slugM); // imagem gerada automaticamente
    const slides = [{ tipo: 'kinetico', texto: frase, destaque, notaVisual: fundoPrompt, imageUrl: imgM, variante: subId === 'domingo' ? 'domingo' : undefined, capa: true }];
    const numeroFaixaM = (Math.floor(Date.now() / 1000) % 100) + 1;
    const faixaM = { numero: numeroFaixaM, titulo: `Faixa ${String(numeroFaixaM).padStart(2, '0')}`, url: faixaUrl(numeroFaixaM) };
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

  const SYSTEM = `És a Vivianne dos Santos (psicologia transpessoal, constelação familiar; pós-graduada). Crias REELS DIDÁTICOS para Instagram, para ENSINAR e atrair pessoas novas, nunca para vender. Contexto académico: "${curso.nome}" (${curso.descricao}). Linguagem humana, calorosa, com profundidade real (nada de frases motivacionais ocas).

REGRAS:
- PURAMENTE DIDÁTICO: SEM CTA de venda, SEM produtos, SEM links. Só conhecimento.
- O 1.º frame (capa) tem de PARAR O SCROLL nos primeiros 3 segundos.
- Frases CURTAS (cabem grandes no ecrã). Concreto, com exemplos do real.
- Fiel ao conceito académico; honra a profundidade quando o tema o pedir.
- CADA frame tem de PRENDER por si só (não perder retenção): uma ideia forte por frame, sem frames de enchimento.
- ENQUADRAMENTO (crítico): NUNCA soar a ensinar egoísmo nem "põe-te primeiro". O caminho é INTEIREZA, PRESENÇA e RECIPROCIDADE saudável (não autoprioridade egocêntrica).
- NUNCA uses travessões (— nem –). Usa vírgulas, pontos ou parênteses.

${formato.instrucao}

DEVOLVE APENAS JSON válido:
{
  "titulo": "título interno curto (2-5 palavras)",
  "frames": [ { "kicker": "etiqueta curta ou vazio", "texto": "frase do frame", "nota": "linha pequena opcional ou vazio", "titulo": "(opcional) título curto do frame quando ele tem pontos", "pontos": ["(opcional) bullets curtos, só nos frames de explicação que pedem hierarquia"] } ],
  "destaque": ["1 a 3 palavras-chave da frase para realçar (só no formato Frase com motion)"],
  "fundoPrompt": "prompt MidJourney para imagem transcendente de fundo, sem pessoas, sem texto, --ar 9:16 (só no formato Frase com motion)",
  "legenda": "legenda para Instagram em PARÁGRAFOS CURTOS separados por uma LINHA EM BRANCO (usa \\n\\n entre cada parágrafo — NUNCA um bloco de texto corrido). Estrutura: gancho na 1.ª linha; depois 2 a 3 parágrafos curtos (1-2 frases cada) que aprofundam em palavras simples, cada um separado por \\n\\n; fecho num parágrafo à parte com convite a refletir e a guardar/partilhar. NÃO digas 'reel' nem nomeies o formato — diz 'guarda esta publicação' ou 'partilha com quem precisa'. SEM vender.",
  "hashtags": ["10-12 hashtags em português, mistura amplas e de nicho, sem repetir"]
}

${REGRA_ACENTOS}`;

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
  p = await corrigirAcentos(p, apiKey); // rede de segurança: acentuação correta

  const framesIn = Array.isArray(p.frames) ? p.frames.filter((f) => f && (f.texto || (Array.isArray(f.pontos) && f.pontos.length))) : [];
  if (!framesIn.length) return NextResponse.json({ erro: 'sem-frames', amostra: texto.slice(0, 300) }, { status: 502 });

  const ehKinetico = formato.id === 'kinetico' || formato.id === 'domingo';
  // cada frame vira um "slide". Kinetico = 1 slide tipo='kinetico' (frase + fundo).
  const slides = ehKinetico
    ? [{
        tipo: 'kinetico',
        texto: (framesIn[0].texto ?? '').trim(),
        destaque: Array.isArray(p.destaque) ? p.destaque.map(String) : [],
        notaVisual: (p.fundoPrompt ?? '').trim() || fundoAleatorio(), // fundo varia sempre (nunca repete o mesmo)
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

  const slug = body.slug ?? `reel-${formato.id}-${curso.id}-${Date.now()}`; // regenerar = mesmo slug
  // cinético: a imagem de fundo gera-se automaticamente (sem ir ao MJ à mão)
  if (ehKinetico && slides.length) {
    const img = await fundoImagem((slides[0] as { notaVisual?: string }).notaVisual ?? '', slug);
    if (img) (slides[0] as { imageUrl?: string }).imageUrl = img;
  }
  const dias = [{ dia: 1, mundo, palavra: p.titulo ?? tema, slides, faixa, roteiro: formato.video ? [] : (p.roteiro ?? []), legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'reel', subtipo: formato.id, video: formato.video, mundo, curso: curso.id } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
