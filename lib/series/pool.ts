// Pool de MOTIONS e ÁUDIOS das séries diárias — recicla os assets que a
// Vivianne já tem da escola-veus (MESMO projeto Supabase, bucket course-assets):
//   vc-sabia-motions/ · hoje-em-mim-motions/ · {vc-sabia,hoje-em-mim}-audios/<mood>/
//   tags: vc-sabia-meta/motion-tags.json  { tags: {nome→mood}, categories: {nome→categoria} }
// Regra dela: se houver motions NOVOS (nunca usados) prioriza-os; senão vai
// buscar o MELHOR MATCH por keyword. Só sem pool é que se gera no MJ.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const COURSE_BUCKET = 'course-assets';
export type SerieId = 'vcsabia' | 'hojeemmim';

const MOTIONS_DIR: Record<SerieId, string> = { vcsabia: 'vc-sabia-motions', hojeemmim: 'hoje-em-mim-motions' };
const AUDIOS_DIR: Record<SerieId, string> = { vcsabia: 'vc-sabia-audios', hojeemmim: 'hoje-em-mim-audios' };

export type Motion = { nome: string; path: string; url: string; mood?: string; categoria?: string; criadoEm?: string };
export type AudioMood = { mood: string; ficheiros: { nome: string; url: string }[] };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const palavrasDe = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 3);

function publicUrl(path: string): string {
  return getSupabaseAdmin().storage.from(COURSE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function listarMotions(serie: SerieId): Promise<Motion[]> {
  const sb = getSupabaseAdmin();
  const dir = MOTIONS_DIR[serie];
  const { data, error } = await sb.storage.from(COURSE_BUCKET).list(dir, { limit: 1000 });
  if (error) throw new Error(`pool motions: ${error.message}`);
  // tags/categorias (um só ficheiro serve as duas séries no escola-veus)
  let tags: Record<string, string> = {}, cats: Record<string, string> = {};
  try {
    const { data: t } = await sb.storage.from(COURSE_BUCKET).download('vc-sabia-meta/motion-tags.json');
    if (t) { const j = JSON.parse(await t.text()) as { tags?: Record<string, string>; categories?: Record<string, string> }; tags = j.tags ?? {}; cats = j.categories ?? {}; }
  } catch { /* sem tags: match só pelo nome */ }
  return (data ?? [])
    .filter((f) => f.name.toLowerCase().endsWith('.mp4'))
    .map((f) => {
      const nome = f.name.replace(/\.mp4$/i, '');
      return {
        nome,
        path: `${dir}/${f.name}`,
        url: publicUrl(`${dir}/${f.name}`),
        mood: tags[f.name] ?? tags[nome],
        categoria: cats[f.name] ?? cats[nome],
        criadoEm: (f as { created_at?: string }).created_at,
      };
    });
}

export async function listarAudios(serie: SerieId): Promise<AudioMood[]> {
  const sb = getSupabaseAdmin();
  const dir = AUDIOS_DIR[serie];
  const { data, error } = await sb.storage.from(COURSE_BUCKET).list(dir, { limit: 200 });
  if (error) throw new Error(`pool audios: ${error.message}`);
  const moods = (data ?? []).filter((f) => !f.name.includes('.')); // pastas = moods
  const out: AudioMood[] = [];
  for (const m of moods) {
    const { data: fs } = await sb.storage.from(COURSE_BUCKET).list(`${dir}/${m.name}`, { limit: 100 });
    const ficheiros = (fs ?? []).filter((f) => /\.(mp3|m4a|wav)$/i.test(f.name)).map((f) => ({ nome: f.name, url: publicUrl(`${dir}/${m.name}/${f.name}`) }));
    if (ficheiros.length) out.push({ mood: m.name, ficheiros });
  }
  return out;
}

// motions já usados (e quantas vezes) nas coleções serie-diaria existentes
export async function usosDeMotions(): Promise<Record<string, number>> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from('carousel_collections').select('theme').eq('theme->>formato', 'serie-diaria');
  const usos: Record<string, number> = {};
  for (const c of data ?? []) {
    const p = (c.theme as { motionPath?: string } | null)?.motionPath;
    if (p) usos[p] = (usos[p] ?? 0) + 1;
  }
  return usos;
}

// pontuação de match frase↔motion: palavras partilhadas com categoria+mood+nome
function score(frase: string, m: Motion): number {
  const alvo = new Set(palavrasDe(`${m.categoria ?? ''} ${m.mood ?? ''} ${m.nome.replace(/[-_]/g, ' ')}`));
  let s = 0;
  for (const w of palavrasDe(frase)) if (alvo.has(w)) s++;
  return s;
}

// regra da Vivianne: NOVOS primeiro (nunca usados, mais recentes à frente);
// entre novos com match, o melhor match ganha; senão o novo mais recente.
// Se não há novos: melhor match entre todos (menos usado desempata).
export function escolherMotion(frase: string, pool: Motion[], usos: Record<string, number>, jaNesteLote: Set<string>): Motion | null {
  if (!pool.length) return null;
  const livres = pool.filter((m) => !jaNesteLote.has(m.path));
  const cands = livres.length ? livres : pool; // lote maior que a pool: reusa
  const novos = cands.filter((m) => !(usos[m.path] > 0));
  const ordenar = (xs: Motion[]) =>
    [...xs].sort((a, b) => {
      const ds = score(frase, b) - score(frase, a);
      if (ds) return ds;
      const du = (usos[a.path] ?? 0) - (usos[b.path] ?? 0);
      if (du) return du;
      return (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '');
    });
  return ordenar(novos.length ? novos : cands)[0] ?? null;
}

// mood do áudio: keyword da frase → mood; senão fallback do dia da semana
const MOOD_DIA: Record<SerieId, Record<string, string>> = {
  hojeemmim: { segunda: 'grilos', 'terça': 'lareira', quarta: 'brisa', quinta: 'tigela', sexta: 'tambor', 'sábado': 'coruja', domingo: 'sussurro' },
  vcsabia: { segunda: 'birds', 'terça': 'stream', quarta: 'wind', quinta: 'silence', sexta: 'birds', 'sábado': 'rain', domingo: 'silence' },
};

export function escolherAudio(frase: string, dia: string, serie: SerieId, audios: AudioMood[]): { mood: string; url: string } | null {
  if (!audios.length) return null;
  const fw = palavrasDe(frase);
  let melhor: AudioMood | null = null, melhorS = 0;
  for (const a of audios) {
    const aw = palavrasDe(a.mood.replace(/[-_]/g, ' '));
    const s = aw.filter((w) => fw.includes(w)).length;
    if (s > melhorS) { melhor = a; melhorS = s; }
  }
  if (!melhor) {
    const alvo = MOOD_DIA[serie][dia] ?? '';
    melhor = audios.find((a) => norm(a.mood).includes(norm(alvo))) ?? audios[0];
  }
  const f = melhor.ficheiros[Math.floor(Math.random() * melhor.ficheiros.length)];
  return { mood: melhor.mood, url: f.url };
}
