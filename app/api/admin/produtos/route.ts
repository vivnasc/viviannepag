import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('produtos').select('*').order('ordem');
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produtos: data });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = await req.json();
  if (!body.slug || !body.titulo) return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('produtos').insert({
    slug: body.slug,
    titulo: body.titulo,
    subtitulo: body.subtitulo ?? '',
    descricao: body.descricao ?? '',
    preco: body.preco ?? '',
    preco_original: body.preco_original || null,
    capa: body.capa || null,
    checkout_url: body.checkout_url || null,
    badge: body.badge || null,
    destaque: !!body.destaque,
    publicado: !!body.publicado,
    ordem: body.ordem ?? 0,
  }).select().single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produto: data });
}
