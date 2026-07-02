import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { iniciarMotionSoulab } from '@/lib/soulab/motion';

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

  // ARRANCA a geração (não bloqueia até ao limite do servidor). Clips rápidos já
  // vêm prontos; os lentos voltam 'processing' com um id, e terminam-se depois com
  // /motion-check (a página verifica sozinha) — o bug dos motions de ~10 min que
  // expiravam e nunca guardavam o clip deixa de existir.
  let ini: { id: string; status: string; output: string | null };
  try {
    ini = await iniciarMotionSoulab(imageUrl, token, opts);
  } catch (e) {
    return NextResponse.json({ erro: 'kling-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };
  soulab.motion = { ingredientes: opts.ingredientes, camara: opts.camara, livre: opts.livre }; // o que ela escolheu

  // já pronto (clip rápido) -> persiste no storage agora (o URL do Replicate expira).
  if (ini.output) {
    let clipUrl = ini.output;
    try {
      const buf = Buffer.from(await (await fetch(ini.output)).arrayBuffer());
      const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const path = `soulab-motion/${slugSeguro}-${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
      if (!upErr) clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch { /* fica o URL temporário se a persistência falhar */ }
    soulab.clipUrl = clipUrl;
    delete soulab.motionPredId; delete soulab.motionStatus;
    theme.soulab = soulab;
    if (dias[0]) (dias[0] as { videoUrl?: string | null }).videoUrl = null;
    const { error: e2 } = await supabase.from('carousel_collections').update({ theme, dias }).eq('slug', slug);
    if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
    return NextResponse.json({ ok: true, clipUrl });
  }

  // ainda a processar -> guarda o id e devolve já (a página verifica com /motion-check).
  soulab.motionPredId = ini.id;
  soulab.motionStatus = 'processing';
  theme.soulab = soulab;
  const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, preparando: true, detalhe: 'O movimento está a ser gerado (uns minutos). A página verifica sozinha; aparece quando estiver pronto.' });
}
