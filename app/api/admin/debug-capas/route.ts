import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: escritos } = await supabase
    .from('escritos')
    .select('id, slug, locale, titulo, capa')
    .order('slug');

  const { data: ficheiros } = await supabase.storage.from('escritos').list('', { limit: 500 });

  const slugsNaBD = [...new Set((escritos ?? []).map((e: { slug: string }) => e.slug))];
  const semCapa = (escritos ?? []).filter((e: { capa: string | null; locale: string }) => !e.capa && e.locale === 'pt');
  const comCapa = (escritos ?? []).filter((e: { capa: string | null; locale: string }) => e.capa && e.locale === 'pt');

  return NextResponse.json({
    totalEscritos: escritos?.length ?? 0,
    slugsUnicos: slugsNaBD.length,
    slugsNaBD,
    comCapa: comCapa.length,
    semCapa: semCapa.map((e: { slug: string; titulo: string }) => `${e.slug} (${e.titulo})`),
    pastasStorage: ficheiros?.map((f: { name: string }) => f.name) ?? [],
    amostraCapas: comCapa.slice(0, 3).map((e: { slug: string; capa: string }) => ({ slug: e.slug, capa: e.capa })),
  });
}
