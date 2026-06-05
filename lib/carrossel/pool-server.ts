// Pool global de imagens: reaproveita as imagens ja geradas no Estudio
// (viviannepag-assets/estudio/{mundo}/dia-N/slide-*.jpg) E imagens contemplativas
// do projecto escola-veus (course-assets/carrossel-veus/fundos + hoje-em-mim),
// para os fundos dos carrosseis, em vez de gerar novas. Estrategia A (referencia
// directa): le os URLs publicos do bucket antigo em runtime.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'viviannepag-assets';

// Cliente do projecto escola-veus (imagens antigas). Configurar no deploy:
//   ESCOLA_VEUS_SUPABASE_URL, ESCOLA_VEUS_SUPABASE_SERVICE_KEY
const ESCOLA_BUCKET = 'course-assets';
const ESCOLA_FOLDERS = ['carrossel-veus/fundos', 'hoje-em-mim-images'];

function escolaClient() {
  const url = process.env.ESCOLA_VEUS_SUPABASE_URL || 'https://tdytdamtfillqyklgrmb.supabase.co';
  const key = process.env.ESCOLA_VEUS_SUPABASE_SERVICE_KEY || process.env.ESCOLA_VEUS_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Imagens contemplativas reaproveitadas do escola-veus (sem pessoas: fundos MJ).
// Se nao houver creds separadas, tenta o cliente principal (caso seja o MESMO
// projecto Supabase — entao course-assets ja e acessivel sem env extra).
export async function listarPoolEscolaVeus(): Promise<string[]> {
  const client = escolaClient() ?? getSupabaseAdmin();
  const urls: string[] = [];
  for (const folder of ESCOLA_FOLDERS) {
    try {
      const { data } = await client.storage.from(ESCOLA_BUCKET).list(folder, { limit: 1000 });
      for (const f of data ?? []) {
        if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
          urls.push(client.storage.from(ESCOLA_BUCKET).getPublicUrl(`${folder}/${f.name}`).data.publicUrl);
        }
      }
    } catch { /* folder indisponivel, segue */ }
  }
  return urls;
}

export async function listarPoolImagens(mundo: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const estudio: string[] = [];
  const { data: dias } = await supabase.storage.from(BUCKET).list(`estudio/${mundo}`, { limit: 200 });
  for (const d of dias ?? []) {
    if (!d.name) continue;
    const { data: files } = await supabase.storage.from(BUCKET).list(`estudio/${mundo}/${d.name}`, { limit: 200 });
    for (const f of files ?? []) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
        estudio.push(supabase.storage.from(BUCKET).getPublicUrl(`estudio/${mundo}/${d.name}/${f.name}`).data.publicUrl);
      }
    }
  }
  // fundos limpos (sem pessoas) do escola-veus primeiro, depois o pool do Estudio
  const escola = await listarPoolEscolaVeus();
  return Array.from(new Set([...escola, ...estudio]));
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
