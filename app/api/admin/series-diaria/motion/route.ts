import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
const BUCKET = 'viviannepag-assets';

// POST — carregar o motion de um dia (upload assinado, browser->Supabase direto,
// para não tropeçar no limite de corpo da Vercel com vídeos grandes):
//   { action:'sign', slug, ext } -> { bucket, path, token }  (browser faz uploadToSignedUrl)
//   { action:'set',  slug, path } -> grava o URL publico do motion na coleção
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; slug?: string; ext?: string; path?: string };
  const slug = (body.slug || '').trim();
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const sb = getSupabaseAdmin();

  if (body.action === 'sign') {
    const ext = ((body.ext || 'mp4').replace(/[^a-z0-9]/gi, '').toLowerCase()) || 'mp4';
    const path = `series-motions/${slug}-${Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ erro: 'sign', detalhe: error?.message }, { status: 500 });
    return NextResponse.json({ ok: true, bucket: BUCKET, path: data.path, token: data.token });
  }

  if (body.action === 'set') {
    const path = (body.path || '').trim();
    if (!path) return NextResponse.json({ erro: 'falta path' }, { status: 400 });
    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
    if (e1 || !row) return NextResponse.json({ erro: 'colecao-nao-encontrada' }, { status: 404 });
    const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ motionUrl?: string }> }>;
    if (dias[0]?.slides?.[0]) dias[0].slides[0].motionUrl = url;
    const theme = { ...((row.theme as Record<string, unknown>) ?? {}), motionPath: path, motionFonte: 'upload' };
    const { error } = await sb.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, url });
  }

  return NextResponse.json({ erro: 'action inválida' }, { status: 400 });
}
