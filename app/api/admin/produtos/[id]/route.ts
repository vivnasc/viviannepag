import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const key of ['slug', 'titulo', 'subtitulo', 'descricao', 'preco', 'preco_original', 'capa', 'checkout_url', 'ficheiro_path', 'badge', 'destaque', 'publicado', 'ordem']) {
    if (key in body) allowed[key] = body[key];
  }
  allowed.updated_at = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('produtos').update(allowed).eq('id', id).select().single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produto: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
