import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET — lista os reels (carousel_collections com formato='reel').
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('id, slug, title, brief, dias, theme, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const reels = (data ?? []).filter((c) => (c.theme as { formato?: string } | null)?.formato === 'reel');
  return NextResponse.json({ reels });
}
