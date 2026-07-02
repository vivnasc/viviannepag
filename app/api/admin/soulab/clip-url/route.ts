import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 120;

const BUCKET = 'viviannepag-assets';

// SOULAB · COLAR URL DO CLIP — resgate/escape manual: quando o movimento foi gerado
// fora (ou a geração demorou mais do que o limite do servidor e não chegou a guardar),
// ela cola aqui o URL do MP4 e nós PERSISTIMOS no storage (os URLs do Replicate
// expiram) e gravamos em theme.soulab.clipUrl. Marca o MP4 para re-render.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug, url } = (await req.json().catch(() => ({}))) as { slug?: string; url?: string };
  if (!slug || !url || !/^https?:\/\//.test(url)) return NextResponse.json({ erro: 'falta slug ou url válido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 404 });

  // descarrega o MP4 e guarda no storage (o URL do playground/Replicate expira).
  let clipUrl = url;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const path = `soulab-motion/${slugSeguro}-${Date.now()}.mp4`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (upErr) throw upErr;
    clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (e) {
    return NextResponse.json({ erro: 'download-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  const dias = (row.dias as Array<{ videoUrl?: string | null }>) ?? [];
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };
  soulab.clipUrl = clipUrl;
  delete soulab.motionPredId; delete soulab.motionStatus; // se estava pendente, está resolvido
  theme.soulab = soulab;
  if (dias[0]) dias[0].videoUrl = null; // clip novo => re-renderizar o reel
  const { error: e2 } = await supabase.from('carousel_collections').update({ theme, dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });

  return NextResponse.json({ ok: true, clipUrl });
}
