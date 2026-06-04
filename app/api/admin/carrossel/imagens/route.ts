import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST /api/admin/carrossel/imagens { slug, dias }
// Guarda os dias (com slide.imageUrl ja preenchido pela geracao Flux) de volta
// na coleccao. As imagens sao geradas no cliente pelo motor existente
// (/api/admin/estudio/gerar-imagem) e aqui so persistimos os URLs.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, dias } = (await req.json().catch(() => ({}))) as { slug?: string; dias?: unknown[] };
  if (!slug || !Array.isArray(dias)) return NextResponse.json({ erro: 'slug/dias' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .update({ dias })
    .eq('slug', slug)
    .select()
    .single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
