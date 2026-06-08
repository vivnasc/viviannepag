// Motor de imagem do "Cá em Casa": gera ILUSTRAÇÕES (a assinatura visual da
// série) via Flux/Replicate, o mesmo serviço do Estúdio. A foto realista saía
// genérica ("toda a gente tem"); um estilo ilustrado fixo é único e
// identificável. O estilo escolhe-se na UI (amostras + lock).
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

// Linguagem comum a todos os estilos (tom + paleta + regras de segurança).
// Família e pertença, quente; rosto nunca colado à câmara; SEM texto na imagem.
const COMMON = `intimate domestic scene about family, belonging and tenderness, warm caring mood, bordeaux / terracotta / rose warm palette (deep wine); a person, or hands, or a quiet everyday gesture; faces never glued to camera; NO text, NO words, NO letters, NO logos, NO watermarks, NO speech bubbles, NO captions, NO clickbait, NO exaggerated acting`;

export const ESTILOS: Record<string, { nome: string; prompt: string }> = {
  gouache: { nome: 'Gouache / storybook', prompt: `distinctive editorial illustration, soft gouache painting with visible brush texture and paper grain, hand-painted organic shapes, storybook-for-adults feel; ${COMMON}` },
  aguarela: { nome: 'Tinta + aguarela', prompt: `elegant editorial illustration, confident ink line-and-wash with loose watercolour washes, generous soft negative space, calm and tender; ${COMMON}` },
  riso: { nome: 'Risograph 2 cores', prompt: `risograph print illustration, grainy two-tone (deep bordeaux and warm ochre), bold simple shapes, slight misregistration texture, modern and ownable; ${COMMON}` },
  flat: { nome: 'Flat editorial', prompt: `modern flat editorial illustration with subtle paper grain, simple confident shapes, sophisticated magazine feel; ${COMMON}` },
};
export const ESTILO_DEFAULT = 'gouache';
export const estiloPrompt = (e?: string) => (ESTILOS[e ?? '']?.prompt) ?? ESTILOS[ESTILO_DEFAULT].prompt;

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
};

export async function gerarImagemFlux(prompt: string, token: string, estilo?: string): Promise<string> {
  const fullPrompt = `${prompt}\n\n${estiloPrompt(estilo)}`;
  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input: { prompt: fullPrompt, aspect_ratio: '9:16', output_format: 'jpg', output_quality: 90, safety_tolerance: 5 } }),
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

// Guarda a imagem no Storage e devolve o URL público. `path` é a chave dentro
// do bucket (ex.: "banda/slug/capa-123.jpg").
export async function guardarImagem(imageUrl: string, path: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists|duplicate/.test(error.message)) throw new Error(`createBucket: ${error.message}`);
  }
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`download img ${imgRes.status}`);
  const buffer = Buffer.from(await (await imgRes.blob()).arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(`upload: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
