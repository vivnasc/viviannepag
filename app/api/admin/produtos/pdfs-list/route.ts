import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

// GET — lista todos os PDFs em viviannepag-assets/produtos/*.pdf
// Devolve { pdfs: { [slug]: { url, updatedAt, size } } }

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const BUCKET = 'viviannepag-assets';

  try {
    const { data } = await supabase.storage.from(BUCKET).list('produtos', { limit: 200 });
    const pdfs: Record<string, { url: string; updatedAt?: string; size?: number }> = {};
    for (const f of data ?? []) {
      if (!f.name?.endsWith('.pdf')) continue;
      const slug = f.name.replace(/\.pdf$/, '');
      const url = supabase.storage.from(BUCKET).getPublicUrl(`produtos/${f.name}`).data.publicUrl;
      pdfs[slug] = {
        url,
        updatedAt: f.updated_at ?? undefined,
        size: f.metadata?.size as number | undefined,
      };
    }
    return NextResponse.json({ pdfs }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (e) {
    return NextResponse.json({ erro: String(e) }, { status: 500 });
  }
}
