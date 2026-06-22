import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// SOULAB · apaga UMA peça (protege as já publicadas, como no Método).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = body.slug?.trim();
  if (!slug || !slug.startsWith('soulab-')) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('theme').eq('slug', slug).maybeSingle();
  const t = (data?.theme ?? {}) as { igPublicado?: boolean; publicado?: boolean };
  if (t.igPublicado || t.publicado) return NextResponse.json({ erro: 'publicado', detalhe: 'peça já publicada (protegida)' }, { status: 409 });

  const { error } = await supabase.from('carousel_collections').delete().eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
