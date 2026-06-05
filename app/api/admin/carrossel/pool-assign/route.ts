import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listarPoolImagens, atribuirPool, imagensUsadas } from '@/lib/carrossel/pool-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug } — atribui imagens do pool global (estudio/{mundo}) aos slides
// capa+fecho de cada dia e guarda. Reusa imagens existentes (sem gerar novas).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: col, error } = await supabase
    .from('carousel_collections')
    .select('dias, theme')
    .eq('slug', slug)
    .single();
  if (error || !col) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });

  const mundo = (col.theme as { mundo?: string })?.mundo ?? 'freeme';
  const pool = await listarPoolImagens(mundo);
  if (!pool.length) {
    return NextResponse.json({ erro: 'pool-vazio', mundo, detalhe: `Sem imagens em estudio/${mundo}. Gera no Estudio ou usa "gerar imagens".` }, { status: 200 });
  }

  const usadas = await imagensUsadas(slug);
  const novosDias = atribuirPool(Array.isArray(col.dias) ? col.dias : [], pool, usadas);
  const { data, error: upErr } = await supabase
    .from('carousel_collections')
    .update({ dias: novosDias })
    .eq('slug', slug)
    .select()
    .single();
  if (upErr) return NextResponse.json({ erro: 'db', detalhe: upErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data, usadas: pool.length });
}
