import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

// GET — lista PDFs do bucket 'escritos' (privado, entregavel ao cliente).
// Devolve { pdfs: { [slug]: { url, updatedAt } } } com URLs ASSINADOS 24h.
// Tambem inclui preview publico (viviannepag-assets/produtos/*.pdf) como fallback.

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const pdfs: Record<string, { url: string; updatedAt?: string }> = {};

  // 1. Escritos (privado) — o PDF real que o cliente recebe
  try {
    const { data } = await supabase.storage.from('escritos').list('produtos', { limit: 200 });
    for (const f of data ?? []) {
      if (!f.name?.endsWith('.pdf')) continue;
      const slug = f.name.replace(/\.pdf$/, '');
      const { data: signed } = await supabase.storage
        .from('escritos')
        .createSignedUrl(`produtos/${f.name}`, 60 * 60 * 24);
      if (signed?.signedUrl) {
        pdfs[slug] = { url: signed.signedUrl, updatedAt: f.updated_at ?? undefined };
      }
    }
  } catch {}

  // 2. Preview publico (viviannepag-assets) — completa o que faltar
  try {
    const { data } = await supabase.storage.from('viviannepag-assets').list('produtos', { limit: 200 });
    for (const f of data ?? []) {
      if (!f.name?.endsWith('.pdf')) continue;
      const slug = f.name.replace(/\.pdf$/, '');
      if (pdfs[slug]) continue;
      const url = supabase.storage.from('viviannepag-assets').getPublicUrl(`produtos/${f.name}`).data.publicUrl;
      pdfs[slug] = { url, updatedAt: f.updated_at ?? undefined };
    }
  } catch {}

  return NextResponse.json({ pdfs }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
