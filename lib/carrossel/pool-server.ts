// Pool global de imagens: reaproveita as imagens ja geradas no Estudio
// (viviannepag-assets/estudio/{mundo}/dia-N/slide-*.jpg) para os fundos dos
// carrosseis, em vez de gerar novas. Lista por mundo.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';

export async function listarPoolImagens(mundo: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const urls: string[] = [];
  const { data: dias } = await supabase.storage.from(BUCKET).list(`estudio/${mundo}`, { limit: 200 });
  for (const d of dias ?? []) {
    if (!d.name) continue;
    const { data: files } = await supabase.storage.from(BUCKET).list(`estudio/${mundo}/${d.name}`, { limit: 200 });
    for (const f of files ?? []) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
        urls.push(supabase.storage.from(BUCKET).getPublicUrl(`estudio/${mundo}/${d.name}/${f.name}`).data.publicUrl);
      }
    }
  }
  return urls;
}

// Atribui imagens do pool aos slides capa+cta de cada dia (deterministico).
// Devolve novos dias com slide.imageUrl preenchido onde havia pool.
type Rec = Record<string, unknown>;
export function atribuirPool(dias: Rec[], pool: string[]): Rec[] {
  if (!pool.length) return dias;
  let k = 0;
  return dias.map((d) => {
    const slides = Array.isArray(d.slides) ? (d.slides as Rec[]).map((s) => {
      if (s && (s.tipo === 'capa' || s.tipo === 'cta')) {
        const img = pool[k % pool.length];
        k++;
        return { ...s, imageUrl: img };
      }
      return s;
    }) : d.slides;
    return { ...d, slides };
  });
}
