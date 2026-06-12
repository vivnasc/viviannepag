import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ROMANCES } from '@/lib/romances';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';
const BUCKET_PRIVADO = 'escritos';

// GET — lista os romances com as variantes de capa já geradas e a escolhida.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const romances = await Promise.all(
    ROMANCES.map(async (r) => {
      const { data: files } = await supabase.storage.from(BUCKET).list(`romances/${r.slug}`, { limit: 100 });
      const pub = (name: string) =>
        supabase.storage.from(BUCKET).getPublicUrl(`romances/${r.slug}/${name}`).data.publicUrl;
      const variantes = (files ?? [])
        .filter((f) => /^capa-\d+\.jpg$/.test(f.name ?? ''))
        .sort((a, b) => (b.name > a.name ? 1 : -1))
        .map((f) => ({ name: f.name, url: pub(f.name) }));
      const temEscolhida = (files ?? []).some((f) => f.name === 'capa.jpg');
      const { data: privados } = await supabase.storage.from(BUCKET_PRIVADO).list(`romances/${r.slug}`, { limit: 20 });
      const temPdf = (n: string) => (privados ?? []).some((f) => f.name === n);
      return {
        slug: r.slug,
        titulo: r.titulo,
        sub: r.sub,
        estante: r.estante,
        espelho: r.espelho,
        capitulos: r.capitulos,
        palavras: r.palavras,
        variantes,
        // cache-busting: a escolhida vive sempre no mesmo path
        capaEscolhida: temEscolhida ? `${pub('capa.jpg')}?v=${Date.now()}` : null,
        pdfPt: temPdf('livro-pt.pdf') ? '/api/romance-download?lang=pt' : null,
        pdfEn: temPdf('livro-en.pdf') ? '/api/romance-download?lang=en' : null,
      };
    }),
  );

  return NextResponse.json({ romances });
}
