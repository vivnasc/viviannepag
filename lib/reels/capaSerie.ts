// Capa-assinatura FIXA por série de reels (a imagem que dá identidade própria a
// cada coleção): gera-se UMA vez (Flux) e reutiliza-se em todas as capas dessa
// série. Guardado como JSON no Storage, sem tabelas novas.
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';

const BUCKET = 'viviannepag-assets';
const PATH = 'config/serie-capas.json';

// cena (Flux) própria de cada série — a sua IDENTIDADE visual.
export const CENAS_SERIE: Record<string, string> = {
  ninguem: 'a single old brass lantern glowing softly in the dark, warm light revealing soft dust and shadow around it',
  sinais: 'a soft trail of footprints in pale sand fading into the dark, gentle traces leading back towards their origin, quiet and contemplative, dim moody light, generous dark space, fine-art',
};

export async function getCapasSerie(): Promise<Record<string, string>> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(PATH);
    if (error || !data) return {};
    return JSON.parse(await data.text());
  } catch { return {}; }
}

export async function setCapaSerie(serie: string, url: string): Promise<Record<string, string>> {
  const supabase = getSupabaseAdmin();
  const cur = await getCapasSerie();
  cur[serie] = url;
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (!existing) await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  await supabase.storage.from(BUCKET).upload(PATH, Buffer.from(JSON.stringify(cur)), { contentType: 'application/json', upsert: true });
  return cur;
}

// gera a capa da série (Flux) e fixa-a. force=true regenera mesmo que já exista.
export async function gerarCapaSerie(serie: string, token: string): Promise<string> {
  const cena = CENAS_SERIE[serie] ?? CENAS_SERIE.ninguem;
  const url = await gerarImagemFlux(cena, token, { estilo: 'gouache', tema: 'lanterna' });
  let finalUrl = url;
  try { finalUrl = await guardarImagem(url, `serie-capas/${serie}-${Date.now()}.jpg`); } catch { /* fica o URL do Replicate */ }
  await setCapaSerie(serie, finalUrl);
  return finalUrl;
}

// devolve a capa da série, gerando-a se ainda não existir (nunca fica "sem capa").
export async function garantirCapaSerie(serie: string, token: string): Promise<string | null> {
  const capas = await getCapasSerie();
  if (capas[serie]) return capas[serie];
  if (!CENAS_SERIE[serie]) return null;
  try { return await gerarCapaSerie(serie, token); } catch { return null; }
}
