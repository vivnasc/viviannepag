// SOM gerado na app via ElevenLabs (sound generation), a partir de um prompt
// que NASCE DA MESMA CENA do motion — match real, não por keywords (a regra da
// Vivianne: num formato contemplativo, som que não bate parte o momento).
//   - dia com prompt MJ (motion novo): o somPrompt vem do Claude, par do mjPrompt
//   - dia com motion da POOL: o somPrompt deriva da descrição do próprio motion
// env: ELEVENLABS_API_KEY (a mesma da escola-veus).

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
export const SOM_DURACAO_S = 11; // ~duração dos motions; o render faz loop

// limpa o nome do motion (ex.: "1778849444538-u2529368441-garden-path-lined-
// with-low-warm-lanterns-at-night-69d0") para a cena em inglês
export function cenaDoMotion(nome: string): string {
  return nome
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[0-9a-f]{4,}/gi, ' ') // ids/hashes
    .replace(/^u\d+/i, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function somPromptDeCena(cena: string): string {
  return `Gentle ambient soundscape of ${cena}. Soft, calm, contemplative, natural atmosphere, seamless loop, no music, no voices.`;
}

// gera o som na ElevenLabs e guarda no storage; devolve o URL público
export async function gerarSom(prompt: string, slug: string): Promise<string> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('falta a env ELEVENLABS_API_KEY (copia da escola-veus)');
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: prompt, duration_seconds: SOM_DURACAO_S, prompt_influence: 0.4 }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const audio = Buffer.from(await res.arrayBuffer());
  const sb = getSupabaseAdmin();
  const path = `series-audios/${slug}-${Date.now()}.mp3`;
  const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload som: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// o somPrompt certo para um dia: o do motion da pool (a cena REAL) vence; senão
// o somPrompt gerado em par com o mjPrompt; senão deriva do próprio mjPrompt.
export function somPromptDoDia(t: { somPrompt?: string; mjPrompt?: string; motionNome?: string | null; motionFonte?: string | null }): string {
  if (t.motionNome && t.motionFonte === 'pool') return somPromptDeCena(cenaDoMotion(t.motionNome));
  if (t.somPrompt?.trim()) return t.somPrompt.trim();
  if (t.mjPrompt?.trim()) return somPromptDeCena(t.mjPrompt.replace(/--ar.*$/, '').trim());
  return '';
}
