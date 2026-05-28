import { NextResponse } from 'next/server';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparEscrito } from '@/lib/escritos-sanitize';

const ESCRITOS_DIR = path.join(process.cwd(), 'content', 'escritos');

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  let files: string[];
  try {
    files = await readdir(ESCRITOS_DIR);
  } catch {
    return NextResponse.json({ erro: 'sem-content-dir' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existentes } = await supabase
    .from('escritos')
    .select('slug, locale');
  const jaExiste = new Set(
    (existentes ?? []).map((e: { slug: string; locale: string }) => `${e.locale}/${e.slug}`)
  );

  const importados: string[] = [];
  const saltados: string[] = [];
  const ignorados: string[] = [];

  for (const file of files) {
    if (!file.endsWith('.mdx') || file.startsWith('__') || file.startsWith('.')) {
      ignorados.push(file);
      continue;
    }
    const base = file.replace(/\.mdx$/, '');
    const enMatch = base.match(/^(.+)\.en$/);
    const slug = enMatch ? enMatch[1] : base;
    const locale = enMatch ? 'en' : 'pt';

    const chave = `${locale}/${slug}`;
    if (jaExiste.has(chave)) {
      saltados.push(chave);
      continue;
    }

    const raw = await readFile(path.join(ESCRITOS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const fm = data as Record<string, unknown>;

    const dataIso =
      fm.data instanceof Date
        ? fm.data.toISOString().slice(0, 10)
        : String(fm.data ?? new Date().toISOString().slice(0, 10));

    const row = limparEscrito({
      slug,
      locale,
      titulo: String(fm.titulo ?? slug),
      resumo: String(fm.resumo ?? ''),
      conteudo: content,
      tematica: fm.tematica ? String(fm.tematica) : null,
      capa: fm.capa ? String(fm.capa) : null,
      data: dataIso,
      publicado: fm.publicado !== false,
    });

    const { error } = await supabase.from('escritos').insert(row);

    if (error) {
      return NextResponse.json(
        { erro: error.message, ate: importados, atual: slug },
        { status: 500 }
      );
    }
    importados.push(chave);
  }

  return NextResponse.json({ ok: true, importados, saltados, ignorados });
}
