import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug, arquivar } — arquiva (ou desarquiva) UMA peca do crescer. Nao apaga
// nada: so mexe em theme.arquivado. Protege as publicadas (nao se arquivam).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; arquivar?: boolean };
  if (!body.slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const arquivar = body.arquivar !== false;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('theme').eq('slug', body.slug).maybeSingle();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const theme = (data?.theme ?? {}) as { igPublicado?: boolean; publicado?: boolean; arquivado?: boolean };
  if (arquivar && (theme.igPublicado || theme.publicado)) return NextResponse.json({ erro: 'publicada-nao-arquiva' }, { status: 400 });
  const novo = { ...theme, arquivado: arquivar };
  const { error: upErr } = await supabase.from('carousel_collections').update({ theme: novo }).eq('slug', body.slug);
  if (upErr) return NextResponse.json({ erro: 'db', detalhe: upErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug: body.slug, arquivado: arquivar });
}
