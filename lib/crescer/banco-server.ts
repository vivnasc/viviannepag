// BANCO DE IMAGENS DA MÃE (lado servidor): lista o que está em cada cesto (família) no
// Supabase Storage. Usado pela API do banco e pelo gerador (para escolher a imagem da peça).
import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { FAMILIAS } from './imagens-mae';

const BUCKET = 'viviannepag-assets';
export const bancoDir = (familia: string) => `crescer/banco/${familia}`;

// devolve { familiaId: [urls] } para todas as famílias (cache-busting nas urls).
export async function listarBanco(): Promise<Record<string, string[]>> {
  const supabase = getSupabaseAdmin();
  const out: Record<string, string[]> = {};
  await Promise.all(FAMILIAS.map(async (f) => {
    try {
      const { data } = await supabase.storage.from(BUCKET).list(bancoDir(f.id), { limit: 300, sortBy: { column: 'created_at', order: 'desc' } });
      out[f.id] = (data ?? [])
        .filter((x) => x.name && !x.name.startsWith('.'))
        .map((x) => supabase.storage.from(BUCKET).getPublicUrl(`${bancoDir(f.id)}/${x.name}`).data.publicUrl);
    } catch { out[f.id] = []; }
  }));
  return out;
}
