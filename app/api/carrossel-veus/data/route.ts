import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET /api/carrossel-veus/data?slug=...  (publico — usado pelo render no CI)
// Devolve a coleccao (dias + theme) para a pagina /render-veu e para o script.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, title, dias, theme')
    .eq('slug', slug)
    .single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 404 });
  return NextResponse.json(data);
}
