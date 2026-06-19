// Estado de loja dos romances, lido DIRETAMENTE do Storage — a única verdade.
// Um romance fica à venda no instante em que o seu PDF aparece no bucket
// privado 'romances' (ou seja, no instante em que o render acaba). Não há flag
// para ligar, nem seed para correr, nem botão de "publicar" para encontrar:
// renderizaste → está à venda.
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// O miolo PT já existe no Storage? (é o que torna o livro entregável)
export async function romancePdfPronto(slug: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.storage.from('romances').list(`romances/${slug}`, { limit: 100 });
    return !!data?.some((f) => f.name === 'livro-pt.pdf');
  } catch {
    return false;
  }
}

// URL pública da capa composta (a -en quando o site está em inglês). Assume-se
// presente quando o PDF está, porque o render escreve capa e miolo juntos.
export function romanceCapaUrl(slug: string, lang: 'pt' | 'en' = 'pt'): string | null {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  if (!base) return null;
  return `${base}/storage/v1/object/public/viviannepag-assets/romances/${slug}/capa-composta-${lang}.png`;
}
