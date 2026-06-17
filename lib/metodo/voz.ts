// Método VS · VOZ (ElevenLabs text-to-speech) a partir do TEXTO de um post.
// Usa a voz clonada (ELEVEN_VOICE_ID) em eleven_v3, voz PURA: SEM voice_settings
// e SEM language_code (isso corrompe o sotaque PT-PT). É a mesma config dos motions
// (ver scripts/render-reels.js). Serve para TESTAR a fidelidade antes de usar.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

// gera a voz a ler `texto` e devolve o URL público do MP3.
export async function gerarVoz(texto: string, slug: string): Promise<string> {
  // a env real chama-se ELEVENLABS_VOICE_ID (há quem use ELEVEN_VOICE_ID) — lê os dois.
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID;
  if (!key) throw new Error('falta ELEVENLABS_API_KEY');
  if (!voiceId) throw new Error('falta ELEVENLABS_VOICE_ID (a tua voz clonada)');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    // v3, voz PURA: nada de voice_settings/language_code (mantém o sotaque fiel).
    body: JSON.stringify({ text: texto, model_id: 'eleven_v3' }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const audio = Buffer.from(await res.arrayBuffer());
  const sb = getSupabaseAdmin();
  // o storage NÃO aceita acentos/ç na chave (ex.: "turbilhão") → tira-os do caminho.
  const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `metodo/${slugSeguro}/voz-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload voz: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
