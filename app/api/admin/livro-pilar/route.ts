import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { LIVRO_PILAR } from '@/lib/livro-pilar';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';
const BUCKET_PRIVADO = 'escritos';

// GET — estado do livro-pilar: variantes de capa geradas, a escolhida e se o
// PDF final já existe (depois do render).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const r = LIVRO_PILAR;
  const base = `livro-pilar/${r.slug}`;

  const { data: files } = await supabase.storage.from(BUCKET).list(base, { limit: 100 });
  const pub = (name: string) => supabase.storage.from(BUCKET).getPublicUrl(`${base}/${name}`).data.publicUrl;
  const variantes = (files ?? [])
    .filter((f) => /^capa-\d+\.jpg$/.test(f.name ?? ''))
    .sort((a, b) => (b.name > a.name ? 1 : -1))
    .map((f) => ({ name: f.name, url: pub(f.name) }));
  const temEscolhida = (files ?? []).some((f) => f.name === 'capa.jpg');

  const { data: privados } = await supabase.storage.from(BUCKET_PRIVADO).list(base, { limit: 20 });
  const temPdf = (privados ?? []).some((f) => f.name === 'livro-pt.pdf');

  return NextResponse.json({
    slug: r.slug,
    titulo: r.titulo,
    sub: r.sub,
    selo: r.selo,
    palavras: r.palavras,
    variantes,
    capaEscolhida: temEscolhida ? `${pub('capa.jpg')}?v=${Date.now()}` : null,
    capaComposta: temEscolhida ? `${pub('capa-composta.png')}?v=${Date.now()}` : null,
    pdf: temPdf ? '/api/livro-pilar-download' : null,
  });
}
