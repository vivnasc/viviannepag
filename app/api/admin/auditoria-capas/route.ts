import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'capas';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: escritos } = await supabase
    .from('escritos')
    .select('id, slug, titulo, capa')
    .eq('locale', 'pt')
    .order('data', { ascending: false });

  const itens = (escritos ?? []).map((e: { id: string; slug: string; titulo: string; capa: string | null }) => {
    const fname = e.capa ? e.capa.split('/').pop() ?? '' : '';
    return { id: e.id, slug: e.slug, titulo: e.titulo, capa: e.capa, ficheiro: fname };
  });

  const contagem: Record<string, number> = {};
  for (const i of itens) {
    if (i.ficheiro) contagem[i.ficheiro] = (contagem[i.ficheiro] ?? 0) + 1;
  }
  const duplicados = Object.entries(contagem)
    .filter(([, n]) => n > 1)
    .map(([f]) => f);

  const slugs = [...new Set(itens.map((i) => i.slug))];
  const ficheirosPorSlug: Record<string, string[]> = {};
  for (const slug of slugs) {
    const { data: lista } = await supabase.storage
      .from(BUCKET)
      .list(slug, { limit: 30, sortBy: { column: 'created_at', order: 'desc' } });
    ficheirosPorSlug[slug] = (lista ?? [])
      .filter((f: { name: string }) => f.name.match(/\.(png|jpg|jpeg|webp)$/i))
      .map((f: { name: string }) => f.name);
  }

  return NextResponse.json({ itens, duplicados, ficheirosPorSlug });
}
