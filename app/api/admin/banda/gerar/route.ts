import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { tema } — gera UM "Cá em Casa" no formato B (alto-conversor):
//   capa = UMA imagem realista forte (Flux/Replicate, o motor do Estúdio) com a
//   frase-gancho por cima, + slides de ENSINO em texto (sem pessoas) + lição.
// Uma só imagem => sem problema de consistência de personagens. Sem CTA de venda.
// Grava em carousel_collections (formato='banda').
const MUNDO = 'synchim'; // paleta relacional (constelação familiar)

// Estética da imagem (mesma linguagem do Estúdio): foto editorial quente,
// íntima, rosto NUNCA colado à câmara (mãos, costas, silhueta, gesto servem).
const STYLE_BASE = `warm intimate editorial photography, cinematic domestic scene, soft natural window light, golden-hour or evening warmth, painterly film-like colour grading, shallow depth of field, bordeaux and rose and warm earth tones (deep wine palette); candid emotional storytelling; NO text overlay, NO logos, NO watermarks, NO captions, NO clickbait close-ups, NO faces glued to camera, NO exaggerated acting`;

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
};

async function gerarImagemFlux(prompt: string, token: string): Promise<string> {
  const fullPrompt = `${prompt}\n\n${STYLE_BASE}`;
  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({
      input: { prompt: fullPrompt, aspect_ratio: '9:16', output_format: 'jpg', output_quality: 90, safety_tolerance: 5 },
    }),
  });
  if (!createRes.ok) throw new Error(`Replicate ${createRes.status}: ${(await createRes.text()).slice(0, 160)}`);
  let pred = (await createRes.json()) as ReplicatePrediction;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 60) {
    await new Promise((r) => setTimeout(r, 2000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
    pred = (await pr.json()) as ReplicatePrediction;
    polls++;
  }
  if (pred.status !== 'succeeded') throw new Error(`Replicate: ${pred.error ?? pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) throw new Error('Replicate: sem output');
  return out;
}

async function guardarImagem(imageUrl: string, slug: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const bucket = 'viviannepag-assets';
  const { data: existing } = await supabase.storage.getBucket(bucket);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !/already exists|duplicate/.test(error.message)) throw new Error(`createBucket: ${error.message}`);
  }
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`download img ${imgRes.status}`);
  const buffer = Buffer.from(await (await imgRes.blob()).arrayBuffer());
  const path = `banda/${slug}/capa-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(`upload: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Crias "Cá em Casa": um carrossel DIDATICO sobre LIMITES no dia a dia. Ensinar, nunca vender. Portugues europeu COM acentos.

OBJETIVO: parar o scroll, converter seguidores, crescer. A CAPA tem de prender em 1 segundo (imagem emocional forte + frase-gancho que faz "isto sou eu"). Os slides de ensino dao valor (sao para guardar).

FORMATO (carrossel):
- CAPA: uma frase-gancho curta (PT, max ~10 palavras) + um "imagePrompt" EM INGLES (~40-60 palavras) para gerar UMA foto realista, intima e quente que CONVERSA com o gancho (mãos, gesto, costas voltadas, silhueta ou um momento de casa; rosto nunca colado a camara; SEM texto na imagem).
- ENSINO: 3 a 4 frases curtas (PT), cada uma um slide, que explicam o padrao em palavras simples e humanas (o que se passa por dentro, porque custa, o que muda). Reconhecivel.
- LICAO: a virada/ensinamento final.
- ENQUADRAMENTO (critico): o limite com amor NAO e egoismo nem "poe-te primeiro"; e INTEIREZA, PRESENCA e RECIPROCIDADE. Abre reflexao.
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.

DEVOLVE APENAS JSON valido:
{
  "titulo": "titulo curto (2-5 palavras)",
  "capa": { "gancho": "...", "imagePrompt": "..." },
  "ensino": ["frase 1", "frase 2", "frase 3"],
  "licao": "frase de fecho que ensina/abre reflexao",
  "legenda": "legenda Instagram: 1.a linha gancho, depois 2-4 linhas que explicam o padrao em palavras simples, fecha com convite a refletir + 'guarda este post' ou 'partilha com quem precisa'. SEM vender. Portugues europeu com acentos.",
  "hashtags": ["10-12 hashtags PT, amplas + de nicho, sem repetir"]
}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  if (!replicateToken) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string };
  const tema = body.tema?.trim();
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

  // 2) Flux gera UMA imagem (a capa). Se falhar, devolve erro claro.
  let imageUrl: string | null = null;
  try {
    const replicateUrl = await gerarImagemFlux(imagePrompt, replicateToken);
    try { imageUrl = await guardarImagem(replicateUrl, slug); } catch { imageUrl = replicateUrl; }
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
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'banda', mundo: MUNDO, realista: true } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
