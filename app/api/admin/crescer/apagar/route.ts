import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// CRESCER · apaga uma peça (só slugs 'crescer-', nunca toca noutros motores).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').delete().eq('slug', body.slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
