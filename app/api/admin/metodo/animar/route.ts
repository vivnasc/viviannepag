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
  // quais faces animar: a indicada, OU todas as que têm imagem.
  const alvos = typeof body.face === 'number' ? [body.face] : slides.map((_, i) => i).filter((i) => slides[i]?.imageUrl);
  const comImagem = alvos.filter((i) => slides[i]?.imageUrl);
  if (!comImagem.length) return NextResponse.json({ erro: 'sem-imagem', detalhe: 'gera primeiro as imagens deste post' }, { status: 409 });

  let ultimoErro = '';
  const clipsFeitos: string[] = [];
  for (const i of comImagem) {
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
      clipsFeitos.push(clipUrl);
    } catch (e) {
      ultimoErro = e instanceof Error ? e.message : String(e);
    }
  }

  if (!clipsFeitos.length) return NextResponse.json({ erro: 'kling', detalhe: ultimoErro }, { status: 502 });
  // o MP4 já renderizado fica desatualizado: invalida-o para re-render com o clip.
  if (dias[0]) dias[0].videoUrl = null;
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}), clipTeste: clipsFeitos[0] };
  await supabase.from('carousel_collections').update({ dias, theme }).eq('slug', slug);

  return NextResponse.json({ ok: true, clipUrl: clipsFeitos[0], clips: clipsFeitos.length });
}
