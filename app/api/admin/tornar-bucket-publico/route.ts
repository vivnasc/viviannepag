import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: buckets } = await supabase.storage.listBuckets();
  const existe = (buckets ?? []).find((b) => b.name === BUCKET);

  if (!existe) {
    const { error: errCreate } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
    if (errCreate) {
      return NextResponse.json({ erro: 'criar', detalhe: errCreate.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, accao: 'criado-publico' });
  }

  if (existe.public) {
    return NextResponse.json({ ok: true, accao: 'ja-era-publico' });
  }

  const { error: errUpdate } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });
  if (errUpdate) {
    return NextResponse.json({ erro: 'update', detalhe: errUpdate.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accao: 'tornado-publico' });
}
