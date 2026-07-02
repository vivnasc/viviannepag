// Motor de imagem partilhado (Flux/Replicate, o mesmo serviço do Estúdio).
// Separa ESTILO (assinatura de desenho) de TEMA (cena+paleta por série), para
// servir o "Cá em Casa" (vinho, quotidiano) e o "I am a Hero" (dourado,
// ancestral) com o mesmo motor.
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import sharp from 'sharp';

export const BUCKET = 'viviannepag-assets';

// GRADE EDITORIAL (todas as contas) — o Flux entrega muitas fotos subexpostas, com
// as sombras esmagadas; o detalhe que se paga fica escondido no escuro. Isto NÃO
// mexe no conteúdo: só "revela" o ficheiro final como um laboratório editorial —
// linear(ganho, offset) levanta o chão do preto (recupera detalhe nas sombras, fim
// das silhuetas) e brightness sobe o geral, sem lavar nem saturar. Determinístico e
// afinável aqui num número. Ligado por defeito em guardarImagem (editorial !== false).
async function gradeEditorial(buffer: Buffer): Promise<Buffer> {
  try {
    // clarear (linear lift das sombras + brightness) E AFIAR (unsharp mask = nitidez,
    // contraste local, detalhe fino). Clarear não é nitidez: o sharpen é o que dá a
    // sensação de foto editorial nítida. Tudo afinável aqui (sigma do sharpen).
    return await sharp(buffer)
      .linear(1.06, 20)
      .modulate({ brightness: 1.14 })
      .sharpen({ sigma: 1.3 })
      .jpeg({ quality: 94 })
      .toBuffer();
  } catch { return buffer; }
}

// Segurança comum a todas as séries (dignidade + sem texto/logos).
const SAFETY = `people portrayed with warmth and dignity, NEVER associating any ethnicity with a negative, blaming or villain role; faces never glued to camera; NO text, NO words, NO letters, NO logos, NO watermarks, NO speech bubbles, NO captions, NO clickbait, NO exaggerated acting`;

// Tema visual por série (cena + paleta/mood).
export const TEMAS: Record<string, string> = {
  caemcasa: 'intimate everyday domestic scene about family, belonging and tenderness, warm caring mood, bordeaux / terracotta / rose warm palette (deep wine)',
  heroi: 'evocative scene about lineage, ancestry and healing across generations, hopeful and luminous, soft light breaking through, dignified and quietly epic, warm golden amber and honey palette',
  lanterna: 'a single old lantern glowing softly in deep charcoal darkness, its gentle light revealing the surrounding shadow, intimate, mysterious and contemplative, mostly dark with generous empty space, fine-art; NO people',
};
export const TEMA_DEFAULT = 'caemcasa';

// Estilos de ilustração (assinatura visual) — só o estilo, sem tema/paleta.
export const ESTILOS: Record<string, { nome: string; prompt: string }> = {
  gouache: { nome: 'Gouache / storybook', prompt: 'distinctive editorial illustration, soft gouache painting with visible brush texture and paper grain, hand-painted organic shapes, storybook-for-adults feel' },
  aguarela: { nome: 'Tinta + aguarela', prompt: 'elegant editorial illustration, confident ink line-and-wash with loose watercolour washes, generous soft negative space, calm and tender' },
  riso: { nome: 'Risograph 2 cores', prompt: 'risograph print illustration, grainy two-tone, bold simple shapes, slight misregistration texture, modern and ownable' },
  flat: { nome: 'Flat editorial', prompt: 'modern flat editorial illustration with subtle paper grain, simple confident shapes, sophisticated magazine feel' },
};
export const ESTILO_DEFAULT = 'gouache';

// Representação: VARIA ao longo da série (universal/inclusivo) em vez de fixar
// uma raça. Cada post sorteia uma. Com a regra de SAFETY, evita polémica.
export const REPRESENTACOES = [
  'any person shown has warm brown mixed-race skin',
  'any person shown is Black with warm deep brown skin',
  'any person shown has warm olive Mediterranean skin',
  'any person shown has warm light skin',
];
export const representacaoAleatoria = () => REPRESENTACOES[Math.floor(Math.random() * REPRESENTACOES.length)];

function construirPrompt(scene: string, estilo?: string, tema?: string, extra?: string): string {
  const est = ESTILOS[estilo ?? '']?.prompt ?? ESTILOS[ESTILO_DEFAULT].prompt;
  const tem = TEMAS[tema ?? ''] ?? TEMAS[TEMA_DEFAULT];
  return `${scene}\n\n${est}\n\n${tem}\n\n${SAFETY}${extra ? `\n\n${extra}` : ''}`;
}

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
};

export type GerarOpts = { estilo?: string; tema?: string; extra?: string; raw?: boolean; imagePrompt?: string; ultra?: boolean; imagePromptStrength?: number };

export async function gerarImagemFlux(scene: string, token: string, opts: GerarOpts = {}): Promise<string> {
  // raw = usa o prompt tal e qual (já é um prompt completo, ex.: fundo do cinético),
  // só com as regras de segurança; sem estilo/tema da banda por cima.
  const fullPrompt = opts.raw ? `${scene}\n\n${SAFETY}` : construirPrompt(scene, opts.estilo, opts.tema, opts.extra);
  // ultra = flux-1.1-pro-ultra: tem image_prompt_strength (peso da referência, 0-1),
  // que adere MUITO mais à imagem de referência. Usado pelo sandbox para chegar ao
  // mundo dela. O image_prompt é a imagem de REFERÊNCIA (estilo/mundo/figura).
  const modelo = opts.ultra ? 'flux-1.1-pro-ultra' : 'flux-1.1-pro';
  const input: Record<string, unknown> = opts.ultra
    ? { prompt: fullPrompt, aspect_ratio: '9:16', output_format: 'jpg', raw: true, safety_tolerance: opts.imagePrompt ? 2 : 6 }
    : { prompt: fullPrompt, aspect_ratio: '9:16', output_format: 'jpg', output_quality: 90, safety_tolerance: 5 };
  if (opts.imagePrompt) {
    input.image_prompt = opts.imagePrompt;
    if (opts.ultra && typeof opts.imagePromptStrength === 'number') input.image_prompt_strength = opts.imagePromptStrength;
  }
  const createRes = await fetch(`https://api.replicate.com/v1/models/black-forest-labs/${modelo}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input }),
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

// gpt-image-2 (OpenAI via Replicate) — o modelo do ChatGPT. Aceita input_images como
// REFERÊNCIAS (alta fidelidade automática) e a chave OpenAI dela. É o que faz o mundo
// dela. Devolve o URL da imagem. Só o sandbox o usa.
export async function gerarImagemGptImage2(prompt: string, inputImages: string[], replicateToken: string, openaiKey?: string, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
  const input: Record<string, unknown> = { prompt, aspect_ratio: '2:3', number_of_images: 1, quality, output_format: 'jpeg' };
  if (inputImages.length) input.input_images = inputImages.slice(0, 8);
  if (openaiKey) input.openai_api_key = openaiKey;
  const createRes = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-2/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${replicateToken}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input }),
  });
  if (!createRes.ok) throw new Error(`Replicate ${createRes.status}: ${(await createRes.text()).slice(0, 220)}`);
  let pred = (await createRes.json()) as ReplicatePrediction;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 90) {
    await new Promise((r) => setTimeout(r, 2000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${replicateToken}` } });
    if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
    pred = (await pr.json()) as ReplicatePrediction;
    polls++;
  }
  if (pred.status !== 'succeeded') throw new Error(`gpt-image-2: ${pred.error ?? pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) throw new Error('gpt-image-2: sem output');
  return out;
}

// Guarda a imagem no Storage e devolve o URL público. `path` é a chave no bucket.
export async function guardarImagem(imageUrl: string, path: string, opts?: { editorial?: boolean }): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists|duplicate/.test(error.message)) throw new Error(`createBucket: ${error.message}`);
  }
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`download img ${imgRes.status}`);
  let buffer: Buffer = Buffer.from(await (await imgRes.blob()).arrayBuffer());
  // grade editorial por defeito (todas as contas); passar { editorial: false } para sair cru.
  if (opts?.editorial !== false) buffer = await gradeEditorial(buffer);
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(`upload: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
