import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PACKS, packIncluiProduto } from '@/lib/packs';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// GET — verifica a entrega de cada pack SEM pagar. Em vez de uma chamada por
// ficheiro (lento, estoura o timeout), lista a pasta 'produtos' de cada bucket
// UMA vez e verifica em memoria se cada <slug>.pdf e <slug>-en.pdf existe.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Conjunto de todos os PDFs existentes em produtos/ (nos dois buckets).
  const pdfs = new Set<string>();
  for (const bucket of ['escritos', 'viviannepag-assets']) {
    const { data } = await supabase.storage.from(bucket).list('produtos', { limit: 5000 });
    for (const f of data ?? []) {
      if (f.name?.toLowerCase().endsWith('.pdf')) pdfs.add(f.name);
    }
  }

  const { data: produtos } = await supabase
    .from('produtos')
    .select('slug, titulo')
    .eq('publicado', true);
  const lista = (produtos ?? []) as { slug: string; titulo: string }[];

  const resultado = PACKS.map((pack) => {
    const incluidos = lista.filter((p) => packIncluiProduto(pack, p.slug));
    const faltamPt = incluidos.filter((p) => !pdfs.has(`${p.slug}.pdf`)).map((p) => p.slug);
    const faltamEn = incluidos.filter((p) => !pdfs.has(`${p.slug}-en.pdf`)).map((p) => p.slug);
    return {
      slug: pack.slug,
      titulo: pack.titulo,
      total: incluidos.length,
      ptOk: incluidos.length - faltamPt.length,
      enOk: incluidos.length - faltamEn.length,
      faltamPt,
      faltamEn,
    };
  });

  return NextResponse.json({ ok: true, totalPdfs: pdfs.size, packs: resultado });
}
