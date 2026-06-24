// SOULAB · MÚSICA AMBIENTE — gera uma faixa instrumental contemplativa (flauta,
// piano, cordas…) via ElevenLabs Music, e guarda-a no storage. NÃO é a
// "Ancient Ground" (essa é a música da loja); é música ambiente de verdade, à
// escolha dela, para o reel do laboratório. Mesma env do som da cena
// (ELEVENLABS_API_KEY) — antes era o MusicGen do Replicate, que falhava.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
export const MUSICA_DURACAO_S = 12; // o render faz loop; chega para o reel
const MUSICA_MIN_MS = 10000; // mínimo da API de música do ElevenLabs

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

// Gera a música no ElevenLabs (/v1/music) e guarda no storage; devolve o URL
// público. Devolve o MP3 nos bytes da resposta, como o sound-generation.
export async function gerarMusica(estilo: string, slug: string): Promise<string> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('falta a env ELEVENLABS_API_KEY (a mesma do som da cena)');
  const prompt = promptDaMusica(estilo);
  const lengthMs = Math.max(MUSICA_MIN_MS, MUSICA_DURACAO_S * 1000);

  const res = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, music_length_ms: lengthMs, model_id: 'music_v1' }),
  });
  if (!res.ok) throw new Error(`elevenlabs-music ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const audio = Buffer.from(await res.arrayBuffer());

  const sb = getSupabaseAdmin();
  const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `soulab-musica/${slugSeguro}-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload música: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
