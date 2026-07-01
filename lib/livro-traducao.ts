// Tradução EN do livro "A Grande Transição", guardada no bucket público como
// livro-transicao/livro_en.json. O render (Typst, lang=en) baixa-a para
// livro/livro_en.json. A tradução corre pela Claude API (rota traduzir), em
// lotes resumíveis: cada unidade traduzida ganha `_en: true`.
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'viviannepag-assets';
const CAMINHO = 'livro-transicao/livro_en.json';

export type LivroEn = {
  titulo: string;
  subtitulo: string;
  selo: string;
  autora: string;
  unidades: Array<Record<string, unknown>>;
};

export async function readLivroEn(): Promise<LivroEn | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage.from(BUCKET).download(CAMINHO);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as LivroEn;
  } catch {
    return null;
  }
}

export async function writeLivroEn(l: LivroEn): Promise<void> {
  const sb = getSupabaseAdmin();
  const body = Buffer.from(JSON.stringify(l, null, 2));
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(CAMINHO, body, { contentType: 'application/json', upsert: true });
  if (error) throw new Error(error.message);
}

// kicker traduzido de forma DETERMINÍSTICA (nunca pela IA, para ser consistente)
export function kickerEn(kicker: string): string {
  const k = kicker.trim();
  if (/^pról/i.test(k)) return 'Prologue';
  if (/^introdu/i.test(k)) return 'Introduction';
  if (/^epíl/i.test(k)) return 'Epilogue';
  const parte = k.match(/^PARTE\s+([IVX]+)/i);
  if (parte) return `PART ${parte[1].toUpperCase()}`;
  const cap = k.match(/^CAP[IÍ]TULO\s+(\d+)/i);
  if (cap) return `CHAPTER ${cap[1]}`;
  const inter = k.match(/^INTERL[UÚ]DIO\s+([IVX]+)/i);
  if (inter) return `INTERLUDE ${inter[1].toUpperCase()}`;
  return k;
}
