import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'escritos';

export async function POST(req: Request) {
  const body = (await req.json()) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: produto } = await supabase
    .from('produtos')
    .select('ficheiro_path')
    .eq('slug', body.slug)
    .eq('publicado', true)
    .single();

  if (!produto?.ficheiro_path) {
    return NextResponse.json({ erro: 'sem-ficheiro' }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(produto.ficheiro_path, 60 * 60 * 24);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ erro: error?.message ?? 'sem-url' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
