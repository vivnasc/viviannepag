import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();

  const bucketInfo = (buckets ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    public: b.public,
    created_at: b.created_at,
  }));

  const escritoBucket = (buckets ?? []).find((b) => b.name === BUCKET);

  const { data: rootList } = await supabase.storage.from(BUCKET).list('', { limit: 100 });

  const { data: amostra } = await supabase
    .from('escritos')
    .select('slug, capa')
    .not('capa', 'is', null)
    .limit(3);

  let testePublicFetch: { url: string; status: number; body: string } | null = null;
  if (amostra && amostra.length > 0 && amostra[0].capa) {
    try {
      const r = await fetch(amostra[0].capa);
      const body = await r.text();
      testePublicFetch = {
        url: amostra[0].capa,
        status: r.status,
        body: body.slice(0, 200),
      };
    } catch (e) {
      testePublicFetch = { url: amostra[0].capa, status: 0, body: String(e) };
    }
  }

  return NextResponse.json({
    projectUrl,
    bucketsTotal: buckets?.length ?? 0,
    buckets: bucketInfo,
    bucketsErr: bucketsErr?.message ?? null,
    bucketEscritos: escritoBucket
      ? { existe: true, publico: escritoBucket.public }
      : { existe: false, publico: false },
    pastasRoot: (rootList ?? []).map((f) => f.name),
    amostraDB: amostra,
    testePublicFetch,
  });
}
