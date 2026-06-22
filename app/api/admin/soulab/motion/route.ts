import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarMotionSoulab } from '@/lib/soulab/motion';

export const runtime = 'nodejs';
export const maxDuration = 300; // o Kling demora ~1-3 min num clip de 5s

const BUCKET = 'viviannepag-assets';

// SOULAB · DAR MOVIMENTO — anima a imagem de uma peça (push-in cinematográfico,
// via Kling) e guarda o clip em theme.soulab.clipUrl. É só o MOTION (sem texto);
// o reel final compõe o texto por cima no render. Persiste no storage porque o
// URL do Replicate é temporário.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; ingredientes?: string[]; camara?: 'nenhuma' | 'suave' | 'forte'; livre?: string };
  const { slug } = body;
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const dias = (row.dias as Array<{ slides?: Array<{ imageUrl?: string | null; texto?: string; conceito?: string }> }>) ?? [];
  const slide = dias?.[0]?.slides?.[0];
  const imageUrl = slide?.imageUrl;
  if (!imageUrl) return NextResponse.json({ erro: 'sem-imagem', detalhe: 'A peça ainda não tem imagem. Gera a imagem primeiro.' }, { status: 400 });

  const cena = [slide?.conceito, slide?.texto].filter(Boolean).join('. ');
  const opts = {
    ingredientes: Array.isArray(body.ingredientes) ? body.ingredientes : [],
    camara: body.camara ?? 'suave',
    livre: typeof body.livre === 'string' ? body.livre : '',
    cena,
  };

  let replicateUrl: string;
  try {
    replicateUrl = await gerarMotionSoulab(imageUrl, token, opts);
  } catch (e) {
    return NextResponse.json({ erro: 'kling-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  // PERSISTE no storage (o URL do Replicate expira).
  let clipUrl = replicateUrl;
  try {
    const buf = Buffer.from(await (await fetch(replicateUrl)).arrayBuffer());
    const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const path = `soulab-motion/${slugSeguro}-${Date.now()}.mp4`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (!upErr) clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch { /* se a persistência falhar, fica o URL temporário do Replicate */ }

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };
  soulab.clipUrl = clipUrl;
  soulab.motion = { ingredientes: opts.ingredientes, camara: opts.camara, livre: opts.livre }; // o que ela escolheu
  theme.soulab = soulab;
  const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });

  return NextResponse.json({ ok: true, clipUrl });
}
