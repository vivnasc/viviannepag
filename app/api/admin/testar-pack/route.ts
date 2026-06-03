import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PACKS, packIncluiProduto } from '@/lib/packs';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// GET — verifica a entrega de cada pack SEM pagar: lista os produtos incluidos
// e confirma se o PDF PT e o PDF EN existem mesmo no storage. Devolve, por pack,
// quantos estao prontos e quais faltam.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Existe se algum dos buckets devolver URL assinado para o caminho.
  async function existe(path: string): Promise<boolean> {
    for (const bucket of ['escritos', 'viviannepag-assets']) {
      const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
      if (data?.signedUrl) return true;
    }
    return false;
  }

  const { data: produtos } = await supabase
    .from('produtos')
    .select('slug, titulo, ficheiro_path')
    .eq('publicado', true);
  const lista = (produtos ?? []) as { slug: string; titulo: string; ficheiro_path: string | null }[];

  const resultado = [];
  for (const pack of PACKS) {
    const incluidos = lista.filter((p) => packIncluiProduto(pack, p.slug));
    const faltamPt: string[] = [];
    const faltamEn: string[] = [];
    for (const p of incluidos) {
      const ptOk = await existe(p.ficheiro_path || `produtos/${p.slug}.pdf`) || await existe(`produtos/${p.slug}.pdf`);
      if (!ptOk) faltamPt.push(p.slug);
      const enOk = await existe(`produtos/${p.slug}-en.pdf`);
      if (!enOk) faltamEn.push(p.slug);
    }
    resultado.push({
      slug: pack.slug,
      titulo: pack.titulo,
      total: incluidos.length,
      ptOk: incluidos.length - faltamPt.length,
      enOk: incluidos.length - faltamEn.length,
      faltamPt,
      faltamEn,
    });
  }

  return NextResponse.json({ ok: true, packs: resultado });
}
