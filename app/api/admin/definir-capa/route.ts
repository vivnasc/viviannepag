import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'capas';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { slug, ficheiroOrigem, slugOrigem } = (await req.json()) as {
    slug: string;
    ficheiroOrigem: string;
    slugOrigem: string;
  };
  if (!slug || !ficheiroOrigem || !slugOrigem) {
    return NextResponse.json({ erro: 'parametros' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const caminhoOrigem = `${slugOrigem}/${ficheiroOrigem}`;
  let capaUrl: string;

  if (slug === slugOrigem) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(caminhoOrigem);
    capaUrl = pub.publicUrl;
  } else {
    const { data: blob, error: errDl } = await supabase.storage
      .from(BUCKET)
      .download(caminhoOrigem);
    if (errDl || !blob) {
      return NextResponse.json({ erro: 'download', detalhe: errDl?.message }, { status: 500 });
    }
    const ext = ficheiroOrigem.split('.').pop()?.toLowerCase() ?? 'png';
    const contentType =
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
    const novoNome = `capa-${Date.now()}.${ext}`;
    const caminhoDestino = `${slug}/${novoNome}`;
    const { error: errUp } = await supabase.storage
      .from(BUCKET)
      .upload(caminhoDestino, blob, { contentType, upsert: true });
    if (errUp) return NextResponse.json({ erro: 'upload', detalhe: errUp.message }, { status: 500 });
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(caminhoDestino);
    capaUrl = pub.publicUrl;
  }

  const { data: versoes } = await supabase.from('escritos').select('id').eq('slug', slug);
  for (const v of versoes ?? []) {
    await supabase
      .from('escritos')
      .update({ capa: capaUrl, updated_at: new Date().toISOString() })
      .eq('id', v.id);
  }

  return NextResponse.json({ ok: true, capa: capaUrl, versoes: versoes?.length ?? 0 });
}
