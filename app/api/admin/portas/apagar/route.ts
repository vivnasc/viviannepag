import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PORTAS } from '@/lib/portas/marca';

export const runtime = 'nodejs';

// PORTAS · descarta UMA peca (so das portas; nunca toca noutras marcas).
const PREFIXOS = Object.keys(PORTAS).map((id) => `${id}-`);

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = body.slug?.trim();
  if (!slug || !PREFIXOS.some((p) => slug.startsWith(p))) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('carousel_collections').delete().eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
