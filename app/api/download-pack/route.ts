import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { packBySlug, packIncluiProduto } from '@/lib/packs';

export const runtime = 'nodejs';

const BUCKET = 'escritos';

// POST { slug: 'pack-xxx' } -> lista de { slug, titulo, url } com URLs assinados
// (24h) de todos os PDFs do pack. Conteudo derivado dinamicamente do universo.
export async function POST(req: Request) {
  const body = (await req.json()) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const pack = packBySlug(body.slug);
  if (!pack) {
    return NextResponse.json({ erro: 'pack-desconhecido' }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('slug, titulo, ficheiro_path')
    .eq('publicado', true);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const incluidos = (produtos ?? []).filter((p) => packIncluiProduto(pack, p.slug));

  const ficheiros: { slug: string; titulo: string; url: string | null }[] = [];
  for (const p of incluidos) {
    const ficheiroPath = p.ficheiro_path || `produtos/${p.slug}.pdf`;
    let url: string | null = null;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(ficheiroPath, 60 * 60 * 24);
    if (data?.signedUrl) {
      url = data.signedUrl;
    } else {
      // Fallback: download-directo resolve outros buckets/disco por slug.
      url = `/api/download-directo?slug=${encodeURIComponent(p.slug)}`;
    }
    ficheiros.push({ slug: p.slug, titulo: p.titulo, url });
  }

  return NextResponse.json({ ok: true, slug: pack.slug, total: ficheiros.length, ficheiros });
}
