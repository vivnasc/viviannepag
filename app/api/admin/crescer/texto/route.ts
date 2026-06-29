import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';

// CRESCER · editar o TEXTO de cada slide (a capa e cada momento). POST { slug,
// textos: string[] } — substitui o texto de cada slide pela ordem. Mantém imagem,
// tipografia, etc. Anula o vídeo/imagens já renderizados (o texto mudou, é preciso
// re-renderizar). Só slugs 'crescer-'.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; textos?: string[] };
  if (!body.slug || !body.slug.startsWith('crescer-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });
  const textos = Array.isArray(body.textos) ? body.textos.map((t) => limparTravessoes(String(t ?? '').trim())) : [];
  if (!textos.length) return NextResponse.json({ erro: 'sem-textos' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  if (!dias[0]) return NextResponse.json({ erro: 'sem-dia' }, { status: 400 });
  const slides = ((dias[0].slides as Array<Record<string, unknown>>) ?? []);
  if (!slides.length) return NextResponse.json({ erro: 'sem-slides' }, { status: 400 });

  // aplica os textos pela ordem (só aos slides que existem; ignora textos vazios extra)
  for (let i = 0; i < slides.length; i++) {
    if (typeof textos[i] === 'string' && textos[i]) slides[i].texto = textos[i];
  }
  dias[0].slides = slides;
  dias[0].palavra = (slides[0].texto as string ?? '').slice(0, 48);
  // o texto mudou: invalida a media já feita para ela re-renderizar com o novo texto.
  delete (dias[0] as Record<string, unknown>).videoUrl;
  delete (dias[0] as Record<string, unknown>).imagens;

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, textos: slides.map((s) => s.texto) });
}
