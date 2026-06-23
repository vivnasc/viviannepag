import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';

// MÉTODO VS · EDITAR O TEXTO dos momentos de UMA peça (autonomia). O texto dos
// momentos vive nos slides (dias[0].slides[]) — o mesmo que o render e a pré-visualização
// leem. Aqui ela reescreve cada momento à mão. Reaproveita a imagem/cena de cada slide
// (uma imagem por reel) e mantém a capa no 1.º; limpa o vídeo (tem de re-renderizar).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; momentos?: string[] };
  const slug = body.slug?.trim();
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const momentos = (body.momentos ?? []).map((m) => limparTravessoes(String(m)).trim()).filter(Boolean);
  if (!momentos.length) return NextResponse.json({ erro: 'sem-texto' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado', detalhe: error?.message }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<Record<string, unknown>>;
  if (!dias[0]) dias[0] = { dia: 1 };
  const antigos = ((dias[0].slides as Array<Record<string, unknown>>) ?? []);
  const base = antigos[0] ?? {};
  // a imagem/cena é UMA por reel: reaproveita-a em todos os momentos.
  const imageUrl = (base.imageUrl as string | null) ?? null;
  const notaVisual = (base.notaVisual as string | null) ?? null;

  const slides = momentos.map((texto, idx) => {
    const old = antigos[idx] ?? {};
    return {
      ...old,
      texto,
      imageUrl,
      notaVisual,
      capa: idx === 0,
      destaque: idx === 0 ? (base.destaque ?? []) : [],
      conceito: idx === 0 ? (base.conceito ?? undefined) : undefined,
    };
  });
  dias[0].slides = slides;
  dias[0].palavra = momentos[0].slice(0, 48);
  dias[0].videoUrl = null; // o texto mudou: tem de re-renderizar

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, momentos });
}
