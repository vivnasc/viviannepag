import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { criarPredicaoClip, PROMPT_MOVIMENTO, NEGATIVE_MOVIMENTO, PROMPT_MOVIMENTO_DRAMA, NEGATIVE_MOVIMENTO_DRAMA } from '@/lib/metodo/clip';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug, face? } — DISPARA a animação do(s) fundo(s) (imagem -> vídeo, Kling)
// e grava JÁ o id da previsão em cada face (slides[i].clipPredId + clipPend). VOLTA
// EM SEGUNDOS: o trabalho corre no Replicate, não na aba. Os clips são COLHIDOS
// depois (/colher) — por isso podes mudar de conta ou fechar que NÃO se perde nada.
// Por defeito anima as faces com imagem que ainda não têm clip; com `face`, só essa.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { slug?: string; face?: number };
  const slug = (body.slug ?? '').trim();
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ imageUrl?: string | null; clipUrl?: string | null; clipPredId?: string | null; clipPend?: boolean; estilo?: string | null }>; videoUrl?: string | null }>;
  const slides = dias[0]?.slides ?? [];
  const comImagem = slides.map((_, i) => i).filter((i) => slides[i]?.imageUrl);
  // quais faces animar: a indicada; senão as que TÊM imagem mas AINDA NÃO têm clip
  // nem estão a animar (preenche o que falta); se já tiverem todas, re-anima todas.
  let alvos: number[];
  if (typeof body.face === 'number') alvos = [body.face];
  else { const semClip = comImagem.filter((i) => !slides[i]?.clipUrl && !slides[i]?.clipPend); alvos = semClip.length ? semClip : comImagem; }
  const validos = alvos.filter((i) => slides[i]?.imageUrl);
  if (!validos.length) return NextResponse.json({ erro: 'sem-imagem', detalhe: 'gera primeiro as imagens deste post' }, { status: 409 });

  let ultimoErro = '';
  let disparados = 0;
  // dispara as previsões EM PARALELO (são chamadas rápidas — só criam o job).
  await Promise.all(validos.map(async (i) => {
    try {
      const drama = slides[i]!.estilo === 'dramatico';
      const predId = await criarPredicaoClip(
        slides[i]!.imageUrl!, token,
        drama ? PROMPT_MOVIMENTO_DRAMA : PROMPT_MOVIMENTO, 5,
        drama ? NEGATIVE_MOVIMENTO_DRAMA : NEGATIVE_MOVIMENTO,
      );
      slides[i]!.clipPredId = predId;
      slides[i]!.clipPend = true; // fica "a animar" até /colher trazer o MP4
      disparados++;
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
    }
  }));

  if (!disparados) return NextResponse.json({ erro: 'kling', detalhe: ultimoErro }, { status: 502 });
  await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  return NextResponse.json({ ok: true, pendentes: disparados });
}
