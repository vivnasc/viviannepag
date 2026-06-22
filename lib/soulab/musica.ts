// SOULAB · MÚSICA AMBIENTE — gera uma faixa instrumental contemplativa (flauta,
// piano, cordas…) via MusicGen no Replicate, e guarda-a no storage. NÃO é a
// "Ancient Ground" (essa é a música da loja); é música ambiente de verdade, à
// escolha dela, para o reel do laboratório. Mesmo token do motion (REPLICATE_API_TOKEN).

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
const MODEL = 'meta/musicgen';
export const MUSICA_DURACAO_S = 12; // o render faz loop; chega para o reel

// os ESTILOS à escolha dela (multi-instrumento). label = o que vê; en = o prompt real.
export const MUSICA_ESTILOS = [
  { id: 'flauta', label: '🪈 flauta', en: 'solo bamboo flute, slow and meditative, airy and breathy, contemplative ambient, gentle natural reverb, no drums, no beat' },
  { id: 'piano', label: '🎹 piano', en: 'solo grand piano, slow minimalist neoclassical, tender and intimate, spacious reverb, contemplative, no drums, no beat' },
  { id: 'cordas', label: '🎻 cordas', en: 'soft ambient string pad, warm and cinematic, slow swelling, emotional and contemplative, no drums, no beat' },
  { id: 'harpa', label: '🪕 harpa', en: 'solo harp, gentle flowing arpeggios, delicate and dreamlike, contemplative ambient, soft reverb, no drums, no beat' },
  { id: 'tacas', label: '🔔 taças', en: 'tibetan singing bowls and soft drones, deep and resonant, meditative and healing, ambient, no drums, no beat' },
  { id: 'violao', label: '🎸 violão', en: 'solo fingerstyle nylon guitar, slow and warm, intimate folk, contemplative, soft room reverb, no drums, no beat' },
] as const;
export type MusicaEstiloId = (typeof MUSICA_ESTILOS)[number]['id'];

export function promptDaMusica(estilo: string): string {
  const e = MUSICA_ESTILOS.find((x) => x.id === estilo);
  const base = e?.en ?? MUSICA_ESTILOS[0].en;
  return `${base}, instrumental only, no vocals, calm and emotional, seamless loop, high quality`;
}

type Pred = { id: string; status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'; output?: string | string[]; error?: string };

// Gera a música no Replicate (MusicGen) e guarda no storage; devolve o URL público.
export async function gerarMusica(estilo: string, slug: string, token: string): Promise<string> {
  const prompt = promptDaMusica(estilo);

  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input: { prompt, duration: MUSICA_DURACAO_S, output_format: 'mp3', normalization_strategy: 'loudness' } }),
  });
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`);

  let pred = (await res.json()) as Pred;
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 95) {
    await new Promise((r) => setTimeout(r, 3000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
    pred = (await pr.json()) as Pred;
    polls++;
  }
  if (pred.status !== 'succeeded') throw new Error(`Replicate: ${pred.error ?? pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) throw new Error('Replicate: sem output');

  // baixa o MP3 e guarda no nosso storage (URL estável, com cache-busting no export)
  const audioRes = await fetch(out);
  if (!audioRes.ok) throw new Error(`download música ${audioRes.status}`);
  const audio = Buffer.from(await audioRes.arrayBuffer());
  const sb = getSupabaseAdmin();
  const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `soulab-musica/${slugSeguro}-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload música: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
