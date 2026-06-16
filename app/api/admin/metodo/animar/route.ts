import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarClipKling } from '@/lib/metodo/clip';

export const runtime = 'nodejs';
export const maxDuration = 600;

const BUCKET = 'viviannepag-assets';

// POST { slug, face? } — anima o(s) fundo(s) de um post (imagem -> vídeo, Kling) e
// guarda o clip EM CADA FACE (slides[i].clipUrl). Por defeito anima TODAS as faces
// que já têm imagem (a mãe e as portas têm 2). Com `face`, anima só essa.
// O clip passa a ser o fundo do reel (o render busca o frame por prog); o texto e
// a música entram por cima. Não toca no texto.
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

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ imageUrl?: string | null; clipUrl?: string | null }>; videoUrl?: string | null }>;
  const slides = dias[0]?.slides ?? [];
  const comImagem = slides.map((_, i) => i).filter((i) => slides[i]?.imageUrl);
  // quais faces animar: a indicada; senão as que TÊM imagem mas AINDA NÃO têm clip
  // (preenche o que falta, não re-anima o que já fizeste); se já tiverem todas,
  // re-anima todas (variação).
  let alvos: number[];
  if (typeof body.face === 'number') alvos = [body.face];
  else { const semClip = comImagem.filter((i) => !slides[i]?.clipUrl); alvos = semClip.length ? semClip : comImagem; }
  const validos = alvos.filter((i) => slides[i]?.imageUrl);
  if (!validos.length) return NextResponse.json({ erro: 'sem-imagem', detalhe: 'gera primeiro as imagens deste post' }, { status: 409 });

  let ultimoErro = '';
  let feitos = 0;
  // as faces correm EM PARALELO (corta a espera para ~metade num post de 2 faces).
  await Promise.all(validos.map(async (i) => {
    const imageUrl = slides[i]!.imageUrl!;
    try {
      const clipRemoto = await gerarClipKling(imageUrl, token);
      let clipUrl = clipRemoto;
      try {
        const res = await fetch(clipRemoto);
        if (!res.ok) throw new Error(`download clip ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const path = `metodo/${slug}/clip-${i}-${Date.now()}.mp4`;
        const { error: up } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
        if (up) throw new Error(up.message);
        clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      } catch (e) {
        console.warn('[animar] upload falhou, uso URL remoto:', e instanceof Error ? e.message : e);
      }
      slides[i]!.clipUrl = clipUrl; // o clip vira o fundo desta face
      feitos++;
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
    }
  }));

  if (!feitos) return NextResponse.json({ erro: 'kling', detalhe: ultimoErro }, { status: 502 });
  // o MP4 já renderizado fica desatualizado: invalida-o para re-render com o clip.
  if (dias[0]) dias[0].videoUrl = null;
  const clipsPorFace = slides.map((s) => s.clipUrl ?? null);
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}), clipTeste: clipsPorFace.find(Boolean) ?? null };
  await supabase.from('carousel_collections').update({ dias, theme }).eq('slug', slug);

  return NextResponse.json({ ok: true, clips: feitos, clipsPorFace });
}
