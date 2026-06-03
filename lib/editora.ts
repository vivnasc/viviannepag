import fs from 'node:fs';
import path from 'node:path';
import { auditar, type Auditoria } from '@/lib/auditoria';

// Lê os livros escritos (markdown) em content/produtos para a aba Editora do
// admin. Só de leitura: serve para a Vivianne rever o que foi escrito.

const DIR = path.join(process.cwd(), 'content', 'produtos');

export type Capitulo = { titulo: string; html: string; palavras: number };
export type Livro = {
  slug: string;
  mundo: 'freeme' | 'infonte' | 'prosperidade' | 'synchim' | 'pertenca' | 'forca' | 'trabalho';
  colecao: string;
  titulo: string;
  subtitulo: string;
  autoria: string;
  bio: string;
  disclaimer: string;
  capitulos: Capitulo[];
  palavras: number;
  auditoria: Auditoria;
};

const COLECOES: Record<string, { mundo: Livro['mundo']; colecao: string; ordem: number }> = {
  mae: { mundo: 'freeme', colecao: 'I · FreeMe Mãe', ordem: 1 },
  inf: { mundo: 'infonte', colecao: 'II · Infonte', ordem: 2 },
  pros: { mundo: 'prosperidade', colecao: 'III · Prosperidade', ordem: 3 },
  syn: { mundo: 'synchim', colecao: 'IV · SyncHim', ordem: 4 },
  per: { mundo: 'pertenca', colecao: 'V · Pertença', ordem: 5 },
  for: { mundo: 'forca', colecao: 'VI · Força', ordem: 6 },
  tra: { mundo: 'trabalho', colecao: 'VII · Trabalho', ordem: 7 },
  guia: { mundo: 'freeme', colecao: 'Guias Práticos', ordem: 8 },
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function mdToHtml(md: string): string {
  return md
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean)
    .map(b => {
      if (/^[-*]{3,}$/.test(b)) return '<hr/>';
      if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
      return `<p>${inline(b)}</p>`;
    })
    .join('\n');
}

function contarPalavras(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function parse(raw: string, slug: string): Livro {
  const prefixo = slug.split('-')[0];
  const meta = COLECOES[prefixo] ?? { mundo: 'freeme' as const, colecao: 'Outros', ordem: 9 };
  const lines = raw.split('\n');

  let titulo = '', subtitulo = '', autoria = '', bio = '', disclaimer = '';
  let bodyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!titulo && line.startsWith('# ')) titulo = line.replace('# ', '').trim();
    else if (titulo && !subtitulo && line.startsWith('**') && line.endsWith('**')) subtitulo = line.replace(/\*\*/g, '').trim();
    else if (titulo && !autoria && line.startsWith('*Por ')) autoria = line.replace(/[*]/g, '').replace('Por ', '').trim();
    else if (autoria && !bio && line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) bio = line.replace(/^\*|\*$/g, '').trim();
    else if (lines[i].startsWith('## ')) { bodyStart = i; break; }
    else if (line.startsWith('*Este ebook')) disclaimer = line.replace(/^\*|\*$/g, '').trim();
  }

  const body = bodyStart >= 0 ? lines.slice(bodyStart) : [];
  const capitulos: Capitulo[] = [];
  let atual: { titulo: string; md: string } | null = null;
  for (const line of body) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (atual) capitulos.push({ titulo: atual.titulo, html: mdToHtml(atual.md.replace(/\n+---\s*\n*$/, '\n').trim()), palavras: contarPalavras(atual.md) });
      atual = { titulo: m[1].trim(), md: '' };
    } else if (atual) {
      atual.md += line + '\n';
    }
  }
  if (atual) capitulos.push({ titulo: atual.titulo, html: mdToHtml(atual.md.replace(/\n+---\s*\n*$/, '\n').trim()), palavras: contarPalavras(atual.md) });

  return {
    slug,
    mundo: meta.mundo,
    colecao: meta.colecao,
    titulo,
    subtitulo,
    autoria,
    bio,
    disclaimer,
    capitulos,
    palavras: contarPalavras(raw),
    auditoria: auditar(raw),
  };
}

/** Lista resumida de todos os livros escritos (mae-* e inf-*), por coleção. */
export function listarLivros(): Livro[] {
  let nomes: string[] = [];
  try {
    nomes = fs.readdirSync(DIR);
  } catch {
    return [];
  }
  const livros = nomes
    .filter(n => /^(mae|inf|pros|syn|per|for|tra|guia)-\d+/.test(n) && !n.endsWith('-en'))
    .filter(n => fs.existsSync(path.join(DIR, n, `${n}.md`)))
    .map(slug => parse(fs.readFileSync(path.join(DIR, slug, `${slug}.md`), 'utf8'), slug))
    .sort((a, b) => {
      const oa = COLECOES[a.slug.split('-')[0]]?.ordem ?? 9;
      const ob = COLECOES[b.slug.split('-')[0]]?.ordem ?? 9;
      return oa - ob || a.slug.localeCompare(b.slug);
    });
  return livros;
}

/** Um livro pelo slug, ou null se não existir. */
export function lerLivro(slug: string): Livro | null {
  const f = path.join(DIR, slug, `${slug}.md`);
  if (!/^(mae|inf|pros|syn|per|for|tra|guia)-\d+/.test(slug) || !fs.existsSync(f)) return null;
  return parse(fs.readFileSync(f, 'utf8'), slug);
}
