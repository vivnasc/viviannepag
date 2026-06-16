import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug }: apaga UM post do método (rascunho). Segurança: só apaga slugs
// 'metodo-*' (nunca toca no resto). Para descartar na revisão.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = (body.slug ?? '').trim();
  if (!slug || !slug.startsWith('metodo-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // PROTEGE os já publicados: não apaga o que já foi para o ar.
  const { data: row } = await supabase.from('carousel_collections').select('theme').eq('slug', slug).maybeSingle();
  const t = (row?.theme ?? {}) as { igPublicado?: boolean; publicado?: boolean };
  if (t.igPublicado || t.publicado) return NextResponse.json({ erro: 'publicado', detalhe: 'este post já foi publicado; não o apago' }, { status: 409 });
  const { error } = await supabase.from('carousel_collections').delete().eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
