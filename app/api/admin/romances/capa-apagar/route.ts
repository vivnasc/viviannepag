import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getRomance } from '@/lib/romances';

export const runtime = 'nodejs';

const BUCKET = 'viviannepag-assets';

// POST { slug, name } — apaga UMA variante de capa (romances/<slug>/capa-<ts>.jpg).
// A capa escolhida (capa.jpg) e os PDFs nunca se apagam por aqui.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; name?: string };
  const romance = getRomance(body.slug ?? '');
  if (!romance) return NextResponse.json({ erro: 'romance-desconhecido' }, { status: 400 });
  if (!body.name || !/^capa-\d+\.jpg$/.test(body.name)) {
    return NextResponse.json({ erro: 'nome-invalido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([`romances/${romance.slug}/${body.name}`]);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
