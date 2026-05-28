import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: 'auth' }, { status: 401 });
  const t0 = Date.now();
  try {
    const supabase = getSupabaseAdmin();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    const latencyMs = Date.now() - t0;
    if (error) return NextResponse.json({ ok: false, stage: 'supabase', erro: error.message, latencyMs }, { status: 200 });
    const target = buckets?.find(b => b.name === 'viviannepag-assets');
    return NextResponse.json({
      ok: true,
      stage: 'supabase',
      latencyMs,
      bucketExists: !!target,
      bucketPublic: target?.public ?? null,
      bucketsTotal: buckets?.length ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: 'fetch', erro: String(e), latencyMs: Date.now() - t0 }, { status: 200 });
  }
}
