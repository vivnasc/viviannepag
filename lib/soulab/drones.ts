// BIBLIOTECA DE DRONES · o som por baixo da voz da mãe. Cada TIPO de post (tema) tem
// o seu drone. Gera-se UMA vez por drone (caminho fixo em storage) e reutiliza-se
// sempre (é uma biblioteca, não um som por post). ElevenLabs Music, a mesma env do som
// da cena. Sem travessões nos comentários.
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

// os drones (id = ficheiro na biblioteca; en = o prompt real). Sempre sem batida/melodia.
export const DRONES = [
  { id: 'profundo', label: 'grave e profundo', en: 'deep dark evolving drone, low sustained bass hum, cinematic and vast, subtle slow movement, meditative' },
  { id: 'quente', label: 'quente e envolvente', en: 'warm analog synth drone, soft enveloping pad, gentle swelling, intimate and calm' },
  { id: 'etereo', label: 'etéreo e luminoso', en: 'airy shimmering high drone, ethereal light pad, glassy and celestial, slowly evolving' },
  { id: 'tacas', label: 'taças e ressonância', en: 'tibetan singing bowls sustained drone, deep resonant overtones, healing and meditative, slow' },
  { id: 'cosmico', label: 'cósmico e amplo', en: 'vast cosmic space drone, deep evolving pad with subtle movement, awe and openness, cinematic' },
  { id: 'tenso', label: 'tenso e sombrio', en: 'dark tense low drone, quiet unsettling hum, shadowy and introspective, slow' },
] as const;
export type DroneId = (typeof DRONES)[number]['id'];

// TEMA (matéria da mãe) → drone. Cada tipo de post ganha o seu som por baixo.
const MAPA: Record<string, DroneId> = {
  sombra: 'tenso', desencaixe: 'tenso',
  consciencia: 'etereo', eumaior: 'etereo',
  emergencia: 'cosmico', sentido: 'cosmico',
  transformacao: 'quente', raizes: 'quente', vinculos: 'quente', campo: 'quente',
  corpo: 'tacas', ciclos: 'tacas',
};
export const droneDoTema = (tema?: string | null): DroneId => (tema && MAPA[tema]) || 'profundo';
export const droneLabel = (id: string): string => DRONES.find((d) => d.id === id)?.label ?? id;

// URL do drone da biblioteca. Gera-o só se ainda não existir (caminho fixo por id),
// senão devolve o que já lá está. Assim é uma biblioteca, reutilizada por todos os posts.
export async function droneUrl(droneId: DroneId): Promise<string> {
  const sb = getSupabaseAdmin();
  const nome = `${droneId}.mp3`;
  const path = `soulab-drones/${nome}`;
  const { data: lista } = await sb.storage.from(BUCKET).list('soulab-drones', { search: nome });
  const existe = (lista ?? []).some((f) => f.name === nome);
  if (!existe) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('falta ELEVENLABS_API_KEY');
    const d = DRONES.find((x) => x.id === droneId) ?? DRONES[0];
    const prompt = `${d.en}, ambient drone, instrumental only, no vocals, no drums, no beat, no melody, seamless loop, high quality`;
    const res = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, music_length_ms: 22000, model_id: 'music_v1' }),
    });
    if (!res.ok) throw new Error(`elevenlabs-music ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const audio = Buffer.from(await res.arrayBuffer());
    const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
    if (error) throw new Error(`upload drone: ${error.message}`);
  }
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
