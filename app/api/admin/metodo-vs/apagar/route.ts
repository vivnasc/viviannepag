import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// MÉTODO VS · apaga UMA peça (só as do Método VS novo, slug 'metodovs-*').
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug || !slug.startsWith('metodovs-')) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').delete().eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
