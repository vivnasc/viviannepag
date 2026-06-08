import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem, ESTILO_DEFAULT, representacaoAleatoria } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { tema, estilo? } — gera UM "Cá em Casa" (formato alto-conversor):
//   capa = UMA ILUSTRAÇÃO forte (Flux, estilo = assinatura visual da série) com
//   a frase-gancho por cima, + slides de ENSINO em texto (sem pessoas) + lição.
// Uma só imagem => sem problema de consistência. Grava em carousel_collections.
const MUNDO = 'synchim'; // paleta relacional (constelação familiar)

const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Crias "Cá em Casa": um carrossel DIDATICO sobre LIMITES no dia a dia. Ensinar, nunca vender. Portugues europeu COM acentos.

OBJETIVO: parar o scroll, converter seguidores, crescer. A CAPA tem de prender em 1 segundo (imagem emocional forte + frase-gancho que faz "isto sou eu"). Os slides de ensino dao valor (sao para guardar).

ENQUADRAMENTO (CRITICO, nao falhar): NUNCA dês a entender que se deve desvalorizar a familia, cortar lacos, afastar-se de quem se ama ou "pôr-se em primeiro". O limite com amor HONRA o vinculo: e reciprocidade, presenca e inteireza (estar inteiro com o outro, nao a meio). O gancho e a licao tem de soar a AMOR e PERTENCA, nunca a ressentimento ou a egoismo. Mostrar que cuidar de si faz parte de amar bem a familia.

FORMATO (carrossel):
- CAPA: uma frase-gancho curta (PT, max ~10 palavras) + um "imagePrompt" EM INGLES (~40-60 palavras) para gerar UMA ILUSTRACAO intima e quente que CONVERSA com o gancho (cena de casa; mãos, gesto, costas voltadas ou silhueta; rosto nunca colado a camara; SEM texto na imagem). NAO descrevas o estilo de desenho (isso e fixo a parte); descreve so a cena/momento/emocao.
- ENSINO: 3 a 4 frases curtas (PT), cada uma um slide, que explicam o padrao em palavras simples e humanas. Reconhecivel.
- LICAO: a virada/ensinamento final, em tom de amor e pertenca.
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.

DEVOLVE APENAS JSON valido:
{
  "titulo": "titulo curto (2-5 palavras)",
  "capa": { "gancho": "...", "imagePrompt": "..." },
  "ensino": ["frase 1", "frase 2", "frase 3"],
  "licao": "frase de fecho que ensina/abre reflexao (amor e pertenca)",
  "legenda": "legenda Instagram: 1.a linha gancho, depois 2-4 linhas que explicam o padrao em palavras simples, fecha com convite a refletir + 'guarda este post' ou 'partilha com quem precisa'. SEM vender. Deixa claro que limite com amor honra a familia. Portugues europeu com acentos.",
  "hashtags": ["10-12 hashtags PT, amplas + de nicho, sem repetir"]
}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  if (!replicateToken) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; estilo?: string };
  const tema = body.tema?.trim();
  const estilo = body.estilo || ESTILO_DEFAULT;
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  // 1) Claude escreve o carrossel (gancho + prompt de imagem + ensino + licao)
  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: `Carrossel "Cá em Casa" sobre: "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) {
    return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 });
  }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { titulo?: string; capa?: { gancho?: string; imagePrompt?: string }; ensino?: string[]; licao?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);

  const gancho = p.capa?.gancho?.trim();
  const imagePrompt = p.capa?.imagePrompt?.trim();
  const ensino = (Array.isArray(p.ensino) ? p.ensino : []).map((s) => (s ?? '').trim()).filter(Boolean).slice(0, 4);
  if (!gancho || !imagePrompt) return NextResponse.json({ erro: 'sem-capa', amostra: texto.slice(0, 300) }, { status: 502 });

  const slug = `banda-${Date.now()}`;

  // 2) Flux gera UMA ilustração (a capa), no estilo escolhido.
  let imageUrl: string | null = null;
  try {
    const replicateUrl = await gerarImagemFlux(imagePrompt, replicateToken, estilo, representacaoAleatoria());
    try { imageUrl = await guardarImagem(replicateUrl, `banda/${slug}/capa-${Date.now()}.jpg`); } catch { imageUrl = replicateUrl; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e), prompt: imagePrompt }, { status: 502 });
  }

  const slides = [
    { tipo: 'banda', imageUrl, gancho, imagePrompt, capa: true },
    ...ensino.map((t) => ({ tipo: 'banda', texto: t, capa: false })),
    { tipo: 'banda', licao: (p.licao ?? '').trim(), capa: false },
  ];

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const dias = [{ dia: 1, mundo: MUNDO, palavra: p.titulo ?? tema, slides, faixa, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'banda', mundo: MUNDO, estilo } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
