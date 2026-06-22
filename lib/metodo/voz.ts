// Método VS · VOZ (ElevenLabs text-to-speech) a partir do TEXTO de um post.
// Usa a voz clonada (ELEVEN_VOICE_ID) em eleven_v3, voz PURA: SEM voice_settings
// e SEM language_code (isso corrompe o sotaque PT-PT).
// Endpoint COM TIMESTAMPS: devolve o tempo de cada caráter → derivamos o tempo de
// cada PALAVRA, para o render fazer KARAOKÊ (acender a palavra no momento exato),
// como um vídeo-lyrics. A Vivianne tinha razão: o texto já é conhecido, o que falta
// é o timing — e o ElevenLabs dá-o.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

export interface PalavraVoz { w: string; t0: number; t1: number }
export interface VozResultado { url: string; palavras: PalavraVoz[]; dur: number }

type Alinhamento = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };

// agrupa os carateres (com tempos) em PALAVRAS com início/fim.
function palavrasDeAlinhamento(a?: Alinhamento): PalavraVoz[] {
  if (!a?.characters?.length) return [];
  const out: PalavraVoz[] = [];
  let buf = ''; let t0 = 0; let aberto = false;
  const fechar = (tEnd: number) => { const w = buf.trim(); if (w) out.push({ w, t0, t1: tEnd }); buf = ''; aberto = false; };
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    const cs = a.character_start_times_seconds[i] ?? 0;
    const ce = a.character_end_times_seconds[i] ?? cs;
    if (/\s/.test(ch)) { if (aberto) fechar(ce); continue; }
    if (!aberto) { t0 = cs; aberto = true; }
    buf += ch;
  }
  if (aberto) fechar(a.character_end_times_seconds[a.character_end_times_seconds.length - 1] ?? t0);
  return out;
}

export async function gerarVoz(texto: string, slug: string): Promise<VozResultado> {
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID;
  if (!key) throw new Error('falta ELEVENLABS_API_KEY');
  if (!voiceId) throw new Error('falta ELEVENLABS_VOICE_ID (a tua voz clonada)');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_v3' }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = (await res.json()) as { audio_base64?: string; alignment?: Alinhamento; normalized_alignment?: Alinhamento };
  if (!j.audio_base64) throw new Error('elevenlabs: sem áudio');

  const palavras = palavrasDeAlinhamento(j.alignment ?? j.normalized_alignment);
  const dur = palavras.length ? palavras[palavras.length - 1].t1 : 0;

  const audio = Buffer.from(j.audio_base64, 'base64');
  const sb = getSupabaseAdmin();
  const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `metodo/${slugSeguro}/voz-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload voz: ${error.message}`);
  const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return { url, palavras, dur };
}
