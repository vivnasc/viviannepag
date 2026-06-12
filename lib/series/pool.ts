// Pool de MOTIONS e ÁUDIOS das séries diárias — recicla os assets que a
// Vivianne já tem da escola-veus (MESMO projeto Supabase, bucket course-assets):
//   vc-sabia-motions/ · hoje-em-mim-motions/ · {vc-sabia,hoje-em-mim}-audios/<mood>/
//   tags: vc-sabia-meta/motion-tags.json  { tags: {nome→mood}, categories: {nome→categoria} }
// Regra dela: se houver motions NOVOS (nunca usados) prioriza-os; senão vai
// buscar o MELHOR MATCH por keyword. Só sem pool é que se gera no MJ.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const COURSE_BUCKET = 'course-assets';
export type SerieId = 'vcsabia' | 'hojeemmim';

// A pool vive no projeto Supabase da ESCOLA-VEUS (OUTRO projeto, não o do
// viviannepag). Os ficheiros são públicos, mas LISTAR exige uma chave desse
// projeto: ESCOLA_SUPABASE_KEY (anon ou service role da escola-veus).
const ESCOLA_URL = (process.env.ESCOLA_SUPABASE_URL || 'https://tdytdamtfillqyklgrmb.supabase.co').replace(/\/+$/, '');

function getEscola(): SupabaseClient {
  const key = process.env.ESCOLA_SUPABASE_KEY || process.env.ESCOLA_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('falta a env ESCOLA_SUPABASE_KEY (chave do projeto Supabase da escola-veus, para listar a pool)');
  return createClient(ESCOLA_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const MOTIONS_DIR: Record<SerieId, string> = { vcsabia: 'vc-sabia-motions', hojeemmim: 'hoje-em-mim-motions' };
const AUDIOS_DIR: Record<SerieId, string> = { vcsabia: 'vc-sabia-audios', hojeemmim: 'hoje-em-mim-audios' };

export type Motion = { nome: string; path: string; url: string; mood?: string; categoria?: string; criadoEm?: string };
export type AudioMood = { mood: string; ficheiros: { nome: string; url: string }[] };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// inclui palavras curtas de imagem (sol, lua, mar, luz, céu…); stopwords não
// fazem mal — só contam se aparecerem também no nome/etiqueta do motion.
const palavrasDe = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3);

function publicUrl(path: string): string {
  return `${ESCOLA_URL}/storage/v1/object/public/${COURSE_BUCKET}/${path}`;
}

export async function listarMotions(serie: SerieId): Promise<Motion[]> {
  const sb = getEscola();
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
  const sb = getEscola();
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

// motions já usados nas coleções serie-diaria: quantas vezes + ÚLTIMA data de
// uso (agendadoEm). Regra da Vivianne: um motion usado entra em QUARENTENA de
// 90 dias — não volta a ser escolhido até descansar. Assim ela sabe exatamente
// quantos motions novos precisa de gerar no MJ.
export const QUARENTENA_DIAS = 90;
export type UsoMotion = { n: number; ultimo: string };

export async function usosDeMotions(): Promise<Record<string, UsoMotion>> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from('carousel_collections').select('theme').eq('theme->>formato', 'serie-diaria');
  const usos: Record<string, UsoMotion> = {};
  const marcar = (path: string | undefined | null, data: string | undefined) => {
    if (!path) return;
    const u = usos[path] ?? { n: 0, ultimo: '' };
    u.n += 1;
    if ((data ?? '') > u.ultimo) u.ultimo = data ?? '';
    usos[path] = u;
  };
  for (const c of data ?? []) {
    const t = (c.theme as { motionPath?: string; agendadoEm?: string; motionQueimado?: string; motionQueimadoEm?: string } | null) ?? {};
    marcar(t.motionPath, t.agendadoEm);                              // motion ativo num dia
    marcar(t.motionQueimado, t.motionQueimadoEm ?? t.agendadoEm);    // motion QUEIMADO (já usado, mantém quarentena)
  }
  return usos;
}

export function emQuarentena(uso: UsoMotion | undefined, dataAlvo: string): boolean {
  if (!uso || !uso.ultimo || !dataAlvo) return false;
  const ms = Math.abs(new Date(`${dataAlvo}T12:00:00`).getTime() - new Date(`${uso.ultimo}T12:00:00`).getTime());
  return ms < QUARENTENA_DIAS * 24 * 3600 * 1000;
}

// pontuação de match frase↔motion: palavras partilhadas com categoria+mood+nome
function score(frase: string, m: Motion): number {
  const alvo = new Set(palavrasDe(`${m.categoria ?? ''} ${m.mood ?? ''} ${m.nome.replace(/[-_]/g, ' ')}`));
  let s = 0;
  for (const w of palavrasDe(frase)) if (alvo.has(w)) s++;
  return s;
}

// regra da Vivianne: os motions NOVOS que ela gera casam sempre (são feitos a
// partir do mjPrompt daquele dia). O risco está na REUTILIZAÇÃO da pool — por
// isso aqui o CONTEÚDO manda: recebe um DESCRITOR (de preferência o mjPrompt em
// inglês — a metáfora visual que o Claude escreveu — junto com a frase PT, para
// casar tenham as etiquetas inglês ou português) e escolhe o motion da pool cujo
// nome/etiqueta/categoria mais partilha com essa imagem. Só devolve se houver
// encaixe REAL (≥1 conceito partilhado); senão devolve null e o dia fica "falta
// motion" — ela gera um novo no MJ a partir do mesmo mjPrompt (esse, por
// construção, casa sempre). QUARENTENA 90d e nunca repetir no lote mantêm-se.
export function escolherMotion(descritor: string, pool: Motion[], usos: Record<string, UsoMotion>, jaNesteLote: Set<string>, dataAlvo = ''): Motion | null {
  if (!pool.length) return null;
  const cands = pool.filter((m) => !jaNesteLote.has(m.path) && !emQuarentena(usos[m.path], dataAlvo));
  if (!cands.length) return null;
  const melhor = [...cands].sort((a, b) => {
    const ds = score(descritor, b) - score(descritor, a);
    if (ds) return ds;                                          // 1.º: melhor encaixe visual
    const du = (usos[a.path]?.n ?? 0) - (usos[b.path]?.n ?? 0);
    if (du) return du;                                          // 2.º: menos usado (entre iguais)
    return (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '');  // 3.º: mais recente
  })[0];
  // o conteúdo MANDA: sem encaixe real não se força um motion da pool numa frase
  // que não tem nada a ver — o dia fica "falta motion" e gera-se o certo no MJ.
  return melhor && score(descritor, melhor) > 0 ? melhor : null;
}

// mood do áudio: keyword da frase → mood; senão fallback do dia da semana
const MOOD_DIA: Record<SerieId, Record<string, string>> = {
  hojeemmim: { segunda: 'grilos', 'terça': 'lareira', quarta: 'brisa', quinta: 'tigela', sexta: 'tambor', 'sábado': 'coruja', domingo: 'sussurro' },
  vcsabia: { segunda: 'birds', 'terça': 'stream', quarta: 'wind', quinta: 'silence', sexta: 'birds', 'sábado': 'rain', domingo: 'silence' },
};

// O ÁUDIO casa com o MOTION (não com a frase):
//  - motion da pool: usa a etiqueta/mood do motion (água→água, coruja→coruja);
//  - motion carregado (novo): não tem etiqueta, mas foi gerado do PROMPT desse
//    dia — passa-se o prompt como `descritor` e casa por keyword (chuva→chuva).
// Fallback: mood do dia da semana.
export function escolherAudio(opts: { descritor: string; moodPreferido?: string | null; dia: string; serie: SerieId; audios: AudioMood[] }): { mood: string; url: string } | null {
  const { descritor, moodPreferido, dia, serie, audios } = opts;
  if (!audios.length) return null;
  let melhor: AudioMood | null = null;
  // 1) match direto à etiqueta do motion (pool)
  if (moodPreferido) {
    const mp = norm(moodPreferido.replace(/[-_]/g, ' '));
    melhor = audios.find((a) => norm(a.mood.replace(/[-_]/g, ' ')) === mp)
      ?? audios.find((a) => norm(a.mood).includes(norm(moodPreferido)) || norm(moodPreferido).includes(norm(a.mood))) ?? null;
  }
  // 2) match por palavras do descritor (prompt do motion / nome+categoria)
  if (!melhor) {
    const dw = palavrasDe(descritor.replace(/[-_]/g, ' '));
    let melhorS = 0;
    for (const a of audios) {
      const aw = palavrasDe(a.mood.replace(/[-_]/g, ' '));
      const s = aw.filter((w) => dw.includes(w)).length;
      if (s > melhorS) { melhor = a; melhorS = s; }
    }
  }
  // 3) fallback: mood do dia da semana
  if (!melhor) {
    const alvo = MOOD_DIA[serie][dia] ?? '';
    melhor = audios.find((a) => norm(a.mood).includes(norm(alvo))) ?? audios[0];
  }
  const f = melhor.ficheiros[Math.floor(Math.random() * melhor.ficheiros.length)];
  return { mood: melhor.mood, url: f.url };
}
