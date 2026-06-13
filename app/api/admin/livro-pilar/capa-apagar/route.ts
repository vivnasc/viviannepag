import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { LIVRO_PILAR } from '@/lib/livro-pilar';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';

// POST { name } — apaga UMA variante de capa (livro-pilar/os-7-veus/capa-<ts>.jpg).
// A capa escolhida (capa.jpg) e o PDF nunca se apagam por aqui.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  if (!body.name || !/^capa-\d+\.jpg$/.test(body.name)) {
    return NextResponse.json({ erro: 'nome-invalido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([`livro-pilar/${LIVRO_PILAR.slug}/${body.name}`]);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
