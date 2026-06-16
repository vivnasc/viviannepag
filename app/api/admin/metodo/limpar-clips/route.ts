import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug } — REJEITAR os clips de um post (limpa slides[*].clipUrl). Para
// quando o movimento não presta: limpa, e a seguir "animar" gera de novo (com o
// prompt contido). NÃO toca no texto nem nas imagens (a imagem fica para reanimar).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ clipUrl?: string | null; clipPredId?: string | null; clipPend?: boolean; clipErro?: string | null }>; videoUrl?: string | null }>;
  for (const s of dias[0]?.slides ?? []) { s.clipUrl = null; s.clipPredId = null; s.clipPend = false; s.clipErro = null; }
  if (dias[0]) dias[0].videoUrl = null; // o MP4 fica desatualizado
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}), clipTeste: null };
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
