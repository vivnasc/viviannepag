import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { LIVROS_CAPA } from '@/lib/livros-capa';

export const runtime = 'nodejs';
const BUCKET = 'viviannepag-assets';

// GET — estado das capas dos 4 livros: variantes geradas + a escolhida.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const livros = await Promise.all(LIVROS_CAPA.map(async (l) => {
    const base = `livro-pilar/${l.slug}`;
    const { data: files } = await sb.storage.from(BUCKET).list(base, { limit: 100 });
    const pub = (name: string) => sb.storage.from(BUCKET).getPublicUrl(`${base}/${name}`).data.publicUrl;
    const variantes = (files ?? [])
      .filter((f) => /^capa-\d+\.jpg$/.test(f.name ?? ''))
      .sort((a, b) => (b.name > a.name ? 1 : -1))
      .map((f) => ({ name: f.name, url: pub(f.name) }));
    const temEscolhida = (files ?? []).some((f) => f.name === 'capa.jpg');
    const temComposta = (files ?? []).some((f) => f.name === 'capa-composta.png');
    return {
      slug: l.slug, marca: l.marca, sub: l.sub,
      variantes,
      capaEscolhida: temEscolhida ? `${pub('capa.jpg')}?v=${Date.now()}` : null,
      capaComposta: temComposta ? `${pub('capa-composta.png')}?v=${Date.now()}` : null,
    };
  }));
  return NextResponse.json({ livros });
}
