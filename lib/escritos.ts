import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

const ESCRITOS_DIR = path.join(process.cwd(), 'content', 'escritos');
const PLACEHOLDER_CAPA = '/escritos/_placeholder.svg';

async function resolverCapa(capaRel?: string): Promise<string | undefined> {
  if (!capaRel) return PLACEHOLDER_CAPA;
  const fsPath = path.join(process.cwd(), 'public', capaRel.replace(/^\//, ''));
  try {
    await access(fsPath);
    return capaRel;
  } catch {
    return PLACEHOLDER_CAPA;
  }
}

async function listFiles(): Promise<string[]> {
  try {
    return await readdir(ESCRITOS_DIR);
  } catch {
    return [];
  }
}

function parseFileName(file: string): { slug: string; locale: Locale } | null {
  if (!file.endsWith('.mdx')) return null;
  if (file.startsWith('__') || file.startsWith('.')) return null;
  const base = file.replace(/\.mdx$/, '');
  const enMatch = base.match(/^(.+)\.en$/);
  if (enMatch) return { slug: enMatch[1], locale: 'en' };
  return { slug: base, locale: 'pt' };
}

async function readEscritoFile(slug: string, locale: Locale) {
  const fileName = locale === 'en' ? `${slug}.en.mdx` : `${slug}.mdx`;
  const fullPath = path.join(ESCRITOS_DIR, fileName);
  try {
    const raw = await readFile(fullPath, 'utf8');
    return matter(raw);
  } catch {
    return null;
  }
}

export async function listEscritos(locale: Locale): Promise<EscritoMeta[]> {
  const files = await listFiles();
  const slugs = new Set<string>();
  for (const f of files) {
    const parsed = parseFileName(f);
    if (parsed) slugs.add(parsed.slug);
  }

  const metas: EscritoMeta[] = [];
  for (const slug of slugs) {
    const localized = await readEscritoFile(slug, locale);
    let parsed = localized;
    let isFallback = false;
    if (!localized && locale === 'en') {
      parsed = await readEscritoFile(slug, 'pt');
      isFallback = true;
    }
    if (!parsed) continue;
    const fm = parsed.data as Record<string, unknown>;
    if (fm.publicado === false) continue;
    metas.push({
      slug,
      titulo: String(fm.titulo ?? slug),
      resumo: String(fm.resumo ?? ''),
      data: String(fm.data ?? ''),
      tematica: fm.tematica ? String(fm.tematica) : undefined,
      capa: await resolverCapa(fm.capa ? String(fm.capa) : undefined),
      publicado: fm.publicado !== false,
      locale,
      isFallback,
    });
  }

  metas.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  return metas;
}

export async function getEscrito(slug: string, locale: Locale): Promise<Escrito | null> {
  let parsed = await readEscritoFile(slug, locale);
  let isFallback = false;
  if (!parsed && locale === 'en') {
    parsed = await readEscritoFile(slug, 'pt');
    isFallback = true;
  }
  if (!parsed) return null;
  const fm = parsed.data as Record<string, unknown>;
  if (fm.publicado === false) return null;
  const conteudoHtml = await marked.parse(parsed.content, { async: true });
  return {
    slug,
    titulo: String(fm.titulo ?? slug),
    resumo: String(fm.resumo ?? ''),
    data: String(fm.data ?? ''),
    tematica: fm.tematica ? String(fm.tematica) : undefined,
    capa: await resolverCapa(fm.capa ? String(fm.capa) : undefined),
    publicado: true,
    locale,
    isFallback,
    conteudoHtml,
  };
}

export async function listAllSlugs(): Promise<string[]> {
  const files = await listFiles();
  const slugs = new Set<string>();
  for (const f of files) {
    const parsed = parseFileName(f);
    if (parsed) slugs.add(parsed.slug);
  }
  return Array.from(slugs);
}

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
