import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarClipKling } from '@/lib/metodo/clip';

export const runtime = 'nodejs';
export const maxDuration = 300;

const BUCKET = 'viviannepag-assets';

// POST { slug, face? } — TESTE: anima o fundo de um post (imagem -> vídeo, Kling)
// e guarda o clip. Não toca no render normal; é para a Vivianne VER o movimento
// real e o custo antes de ligar isto ao pipeline em série.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { slug?: string; face?: number };
  const slug = (body.slug ?? '').trim();
  const face = body.face === 1 ? 1 : 0;
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ imageUrl?: string | null }> }>;
  const imageUrl = dias[0]?.slides?.[face]?.imageUrl ?? dias[0]?.slides?.[0]?.imageUrl ?? null;
  if (!imageUrl) return NextResponse.json({ erro: 'sem-imagem', detalhe: 'gera primeiro a imagem deste post' }, { status: 409 });

  let clipRemoto: string;
  try {
    clipRemoto = await gerarClipKling(imageUrl, token);
  } catch (e) {
    return NextResponse.json({ erro: 'kling', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }

  // guarda o MP4 no Storage (cache-busting no nome, para não servir versão antiga)
  let clipUrl: string;
  try {
    const res = await fetch(clipRemoto);
    if (!res.ok) throw new Error(`download clip ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const path = `metodo/${slug}/clip-teste-${face}-${Date.now()}.mp4`;
    const { error: up } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (up) throw new Error(up.message);
    clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (e) {
    // se o upload falhar, devolve pelo menos o URL remoto do Replicate (temporário)
    clipUrl = clipRemoto;
    console.warn('[animar] upload falhou, uso URL remoto:', e instanceof Error ? e.message : e);
  }

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}), clipTeste: clipUrl };
  await supabase.from('carousel_collections').update({ theme }).eq('slug', slug);

  return NextResponse.json({ ok: true, clipUrl });
}
