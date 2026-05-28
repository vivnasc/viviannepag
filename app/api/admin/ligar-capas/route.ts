import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'capas';

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: escritos } = await supabase.from('escritos').select('id, slug, locale, capa');
  if (!escritos) return NextResponse.json({ erro: 'sem-escritos' }, { status: 500 });

  const slugs = [...new Set(escritos.map((e: { slug: string }) => e.slug))];
  let ligados = 0;
  const detalhes: string[] = [];

  for (const slug of slugs) {
    const { data: ficheiros } = await supabase.storage.from(BUCKET).list(slug, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

    if (!ficheiros || ficheiros.length === 0) {
      detalhes.push(`- ${slug}: sem ficheiros no Storage`);
      continue;
    }

    const img = ficheiros.find((f: { name: string }) => f.name.match(/\.(png|jpg|jpeg|webp)$/i));
    if (!img) {
      detalhes.push(`- ${slug}: sem imagens no Storage`);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(`${slug}/${img.name}`);
    const capaUrl = pub.publicUrl;

    const versoes = escritos.filter((e: { slug: string }) => e.slug === slug);
    for (const v of versoes) {
      await supabase.from('escritos').update({ capa: capaUrl, updated_at: new Date().toISOString() }).eq('id', v.id);
    }

    ligados++;
    detalhes.push(`✓ ${slug} → ${img.name} (${versoes.length} versões)`);
  }

  return NextResponse.json({ ok: true, ligados, total: slugs.length, detalhes });
}
