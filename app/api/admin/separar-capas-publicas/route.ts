import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET_PRIVADO = 'escritos';
const BUCKET_PUBLICO = 'capas';

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: buckets } = await supabase.storage.listBuckets();
  const existePublico = (buckets ?? []).find((b) => b.name === BUCKET_PUBLICO);

  if (!existePublico) {
    const { error: errCreate } = await supabase.storage.createBucket(BUCKET_PUBLICO, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
    if (errCreate) {
      return NextResponse.json({ erro: 'criar-bucket', detalhe: errCreate.message }, { status: 500 });
    }
  } else if (!existePublico.public) {
    const { error: errUpd } = await supabase.storage.updateBucket(BUCKET_PUBLICO, { public: true });
    if (errUpd) {
      return NextResponse.json({ erro: 'tornar-publico', detalhe: errUpd.message }, { status: 500 });
    }
  }

  const { data: escritos } = await supabase.from('escritos').select('id, slug, locale, capa');
  if (!escritos) return NextResponse.json({ erro: 'sem-escritos' }, { status: 500 });

  const slugs = [...new Set(escritos.map((e: { slug: string }) => e.slug))];
  const detalhes: string[] = [];
  let movidos = 0;
  let ligados = 0;

  for (const slug of slugs) {
    const { data: ficheiros } = await supabase.storage
      .from(BUCKET_PRIVADO)
      .list(slug, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });

    if (!ficheiros || ficheiros.length === 0) {
      detalhes.push(`- ${slug}: sem ficheiros no bucket privado`);
      continue;
    }

    const img = ficheiros.find((f: { name: string }) => f.name.match(/\.(png|jpg|jpeg|webp)$/i));
    if (!img) {
      detalhes.push(`- ${slug}: sem imagens (só ${ficheiros.map((f) => f.name).join(', ')})`);
      continue;
    }

    const caminhoOrigem = `${slug}/${img.name}`;
    const caminhoDestino = `${slug}/${img.name}`;

    const { data: blob, error: errDl } = await supabase.storage
      .from(BUCKET_PRIVADO)
      .download(caminhoOrigem);
    if (errDl || !blob) {
      detalhes.push(`- ${slug}: erro download (${errDl?.message})`);
      continue;
    }

    const ext = img.name.split('.').pop()?.toLowerCase() ?? 'png';
    const contentType =
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

    const { error: errUp } = await supabase.storage
      .from(BUCKET_PUBLICO)
      .upload(caminhoDestino, blob, { contentType, upsert: true });
    if (errUp) {
      detalhes.push(`- ${slug}: erro upload (${errUp.message})`);
      continue;
    }
    movidos++;

    const { data: pub } = supabase.storage.from(BUCKET_PUBLICO).getPublicUrl(caminhoDestino);
    const capaUrl = pub.publicUrl;

    const versoes = escritos.filter((e: { slug: string }) => e.slug === slug);
    for (const v of versoes) {
      await supabase
        .from('escritos')
        .update({ capa: capaUrl, updated_at: new Date().toISOString() })
        .eq('id', v.id);
    }
    ligados += versoes.length;
    detalhes.push(`✓ ${slug} → ${img.name} (${versoes.length} versões)`);
  }

  return NextResponse.json({
    ok: true,
    bucketPublico: BUCKET_PUBLICO,
    movidos,
    ligados,
    totalSlugs: slugs.length,
    detalhes,
  });
}
