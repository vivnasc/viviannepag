import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { modo } — apaga TODOS os carrosséis de um modo de sequência (glossario
// ou padroes). Recomeça a sequência pedagógica do início. Não toca em "Sobre"
// nem nos outros carrosséis.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { modo } = (await req.json().catch(() => ({}))) as { modo?: string };
  const alvo = modo === 'padroes' ? 'padroes' : 'glossario';
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('carousel_collections').select('slug, theme');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const slugs = (data ?? [])
    .filter((c) => { const t = c.theme as { formato?: string; modo?: string } | null; return t?.formato === 'carrossel-veu' && t?.modo === alvo; })
    .map((c) => c.slug);
  if (slugs.length) {
    const { error: del } = await sb.from('carousel_collections').delete().in('slug', slugs);
    if (del) return NextResponse.json({ erro: 'db', detalhe: del.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, apagados: slugs.length });
}
