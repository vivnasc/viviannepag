import { marked } from 'marked';
import { getSupabase } from '@/lib/supabase';
import type { Escrito, EscritoMeta, Locale } from '@/lib/escritos';

const PLACEHOLDER_CAPA = '/escritos/_placeholder.svg';

type Row = {
  id: string;
  slug: string;
  locale: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  tematica: string | null;
  capa: string | null;
  data: string;
  publicado: boolean;
};

function rowToMeta(row: Row, requestedLocale: Locale, isFallback: boolean): EscritoMeta {
  return {
    slug: row.slug,
    titulo: row.titulo,
    resumo: row.resumo,
    data: row.data,
    tematica: row.tematica ?? undefined,
    capa: row.capa || PLACEHOLDER_CAPA,
    publicado: row.publicado,
    locale: requestedLocale,
    isFallback,
  };
}

export async function dbListEscritos(locale: Locale): Promise<EscritoMeta[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('escritos')
      .select('*')
      .eq('publicado', true)
      .order('data', { ascending: false });
    if (error || !data) return null;
    if (data.length === 0) return [];

    const bySlug = new Map<string, Row[]>();
    for (const r of data as Row[]) {
      const arr = bySlug.get(r.slug) ?? [];
      arr.push(r);
      bySlug.set(r.slug, arr);
    }

    const out: EscritoMeta[] = [];
    for (const versoes of bySlug.values()) {
      const wanted = versoes.find((v) => v.locale === locale);
      if (wanted) {
        out.push(rowToMeta(wanted, locale, false));
        continue;
      }
      if (locale === 'en') {
        const pt = versoes.find((v) => v.locale === 'pt');
        if (pt) out.push(rowToMeta(pt, locale, true));
      }
    }
    out.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
    return out;
  } catch {
    return null;
  }
}

export async function dbGetEscrito(slug: string, locale: Locale): Promise<Escrito | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('escritos')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true);
    if (error || !data || data.length === 0) return null;

    const rows = data as Row[];
    let row = rows.find((r) => r.locale === locale);
    let isFallback = false;
    if (!row && locale === 'en') {
      row = rows.find((r) => r.locale === 'pt');
      isFallback = true;
    }
    if (!row) return null;

    const conteudoHtml = await marked.parse(row.conteudo || '', { async: true });
    return {
      ...rowToMeta(row, locale, isFallback),
      conteudoHtml,
    };
  } catch {
    return null;
  }
}

export async function dbListAllSlugs(): Promise<string[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('escritos')
      .select('slug')
      .eq('publicado', true);
    if (error || !data) return null;
    const slugs = new Set<string>();
    for (const row of data as { slug: string }[]) slugs.add(row.slug);
    return Array.from(slugs);
  } catch {
    return null;
  }
}
