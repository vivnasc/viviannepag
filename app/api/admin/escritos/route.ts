import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('escritos')
    .select('*')
    .order('data', { ascending: false });
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
  return NextResponse.json({ escritos: data });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  const body = (await req.json()) as Partial<{
    slug: string;
    locale: string;
    titulo: string;
    resumo: string;
    conteudo: string;
    tematica: string;
    capa: string;
    data: string;
    publicado: boolean;
  }>;

  if (!body.slug || !body.titulo) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('escritos')
    .insert({
      slug: body.slug,
      locale: body.locale ?? 'pt',
      titulo: body.titulo,
      resumo: body.resumo ?? '',
      conteudo: body.conteudo ?? '',
      tematica: body.tematica || null,
      capa: body.capa || null,
      data: body.data ?? new Date().toISOString().slice(0, 10),
      publicado: !!body.publicado,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ erro: 'slug-duplicado' }, { status: 409 });
    }
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
  return NextResponse.json({ escrito: data });
}
