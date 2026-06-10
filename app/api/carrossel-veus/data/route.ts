import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCapasSerie } from '@/lib/reels/capaSerie';

export const runtime = 'nodejs';

// séries de reels que têm capa-assinatura fixa (a imagem dá identidade à capa)
const SERIE_ASSINATURA = ['ninguem', 'sinais', 'pensador'];

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

  // cola a imagem-assinatura da série na CAPA (1.º slide do 1.º dia), tal como o
  // admin faz ao mostrar — senão o render publica a capa escura/sem imagem.
  const sub = (data?.theme as { subtipo?: string } | undefined)?.subtipo ?? '';
  if (SERIE_ASSINATURA.includes(sub)) {
    const capas = await getCapasSerie();
    const capa = capas[sub];
    const slide0 = (data?.dias as { slides?: { imageUrl?: string }[] }[] | undefined)?.[0]?.slides?.[0];
    if (capa && slide0 && !slide0.imageUrl) slide0.imageUrl = capa;
  }

  return NextResponse.json(data);
}
