import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug, agendadoEm?: string|null, publicado?: boolean } — guarda o estado
// de agendamento de um conteúdo no theme (agendadoEm = 'YYYY-MM-DD', publicado).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; agendadoEm?: string | null; publicado?: boolean };
  if (!body.slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error: e1 } = await supabase.from('carousel_collections').select('theme').eq('slug', body.slug).single();
  if (e1) return NextResponse.json({ erro: 'db', detalhe: e1.message }, { status: 500 });

  const theme = { ...((row?.theme as Record<string, unknown>) ?? {}) };
  if ('agendadoEm' in body) theme.agendadoEm = body.agendadoEm || null;
  if ('publicado' in body) theme.publicado = !!body.publicado;

  const { error } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, theme });
}
