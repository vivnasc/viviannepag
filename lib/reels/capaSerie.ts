// Capa-assinatura FIXA por série de reels (ex.: a lanterna de "O que ninguém te
// explica"): gera-se uma vez (Flux) e reutiliza-se em todas as capas da série.
// Guardado como JSON no Storage, sem tabelas novas.
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
const PATH = 'config/serie-capas.json';

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
