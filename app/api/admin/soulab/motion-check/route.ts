import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verificarMotion } from '@/lib/soulab/motion';

export const runtime = 'nodejs';
export const maxDuration = 120;

const BUCKET = 'viviannepag-assets';

// SOULAB · VERIFICA um movimento iniciado (theme.soulab.motionPredId). Sem bloquear:
// se já está pronto, descarrega, persiste no storage e grava clipUrl; se ainda
// processa, devolve 'processing'; se falhou, limpa. A página chama isto sozinha
// enquanto houver peças com movimento pendente.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 404 });

  const theme = { ...((row.theme as Record<string, unknown>) ?? {}) };
  const soulab = { ...((theme.soulab as Record<string, unknown>) ?? {}) };
  const predId = soulab.motionPredId as string | undefined;
  if (!predId) return NextResponse.json({ ok: true, status: soulab.clipUrl ? 'pronto' : 'nenhum' });

  let v: { status: string; output: string | null; error?: string };
  try {
    v = await verificarMotion(predId, token);
  } catch (e) {
    return NextResponse.json({ erro: 'check-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  if (v.status === 'succeeded' && v.output) {
    let clipUrl = v.output;
    try {
      const buf = Buffer.from(await (await fetch(v.output)).arrayBuffer());
      const slugSeguro = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const path = `soulab-motion/${slugSeguro}-${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
      if (!upErr) clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch { /* fica o URL temporário */ }
    soulab.clipUrl = clipUrl;
    delete soulab.motionPredId; delete soulab.motionStatus;
    theme.soulab = soulab;
    const dias = (row.dias as Array<{ videoUrl?: string | null }>) ?? [];
    if (dias[0]) dias[0].videoUrl = null; // clip novo => re-render
    await supabase.from('carousel_collections').update({ theme, dias }).eq('slug', slug);
    return NextResponse.json({ ok: true, status: 'pronto', clipUrl });
  }

  if (v.status === 'failed' || v.status === 'canceled') {
    delete soulab.motionPredId; soulab.motionStatus = 'falhou';
    theme.soulab = soulab;
    await supabase.from('carousel_collections').update({ theme }).eq('slug', slug);
    return NextResponse.json({ ok: true, status: 'falhou', detalhe: v.error });
  }

  return NextResponse.json({ ok: true, status: 'processing' });
}
