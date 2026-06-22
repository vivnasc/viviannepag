import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug, estilo } — guarda o ESTILO (tipografia: tamanho/cor/realce/fonte/itálico)
// de um post em theme.estilo. É o que dá independência à Vivianne: ela muda no estúdio
// e o render lê isto, sem depender de deploys. estilo=null limpa (volta ao padrão).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, estilo } = (await req.json().catch(() => ({}))) as { slug?: string; estilo?: unknown };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('carousel_collections').select('theme').eq('slug', slug).maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });
  const theme = { ...((data.theme as Record<string, unknown>) ?? {}), estilo: estilo ?? null };
  const { error: e2 } = await sb.from('carousel_collections').update({ theme }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, estilo: theme.estilo });
}
