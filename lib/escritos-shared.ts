export type Locale = 'pt' | 'en';

export type EscritoMeta = {
  slug: string;
  titulo: string;
  resumo: string;
  data: string;
  tematica?: string;
  capa?: string;
  publicado: boolean;
  locale: Locale;
  isFallback: boolean;
};

export type Escrito = EscritoMeta & {
  conteudoHtml: string;
};

export function formatarData(iso: string, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
