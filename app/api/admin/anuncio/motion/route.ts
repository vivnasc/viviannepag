import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarMotionSoulab } from '@/lib/soulab/motion';
import { lerManifesto, escreverManifesto } from '@/lib/anuncio/manifest';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 300; // o Kling demora ~1-3 min num clip

const BUCKET = 'viviannepag-assets';

// PASSO 2 da prévia: põe a CENA a MEXER (Kling, image -> video). Movimento real e
// subtil do que está na cena (fumo a subir, a janela a respirar, andorinhas, água),
// com uma câmara a aproximar-se em parallax — NÃO é o zoom chapado de antes. Ela vê
// o clip a mexer ANTES de montar. Guarda o MP4 no Storage (o URL do Replicate expira)
// e no manifesto, para o render usar EXATAMENTE este.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  let variante = 'A';
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; } catch {}
  const g = (GUIOES as Record<string, { cenaPrompt?: string; klingPrompt?: string }>)[variante];

  const sb = getSupabaseAdmin();
  const man = await lerManifesto(sb, variante);
  if (!man.cenaUrl) return NextResponse.json({ erro: 'sem-cena', detalhe: 'Gera a cena (imagem) primeiro.' }, { status: 400 });

  try {
    const replicateUrl = await gerarMotionSoulab(man.cenaUrl, token, {
      camara: 'suave',
      livre: g?.klingPrompt ?? '',
      cena: g?.cenaPrompt ?? '',
    }, 10);
    // persiste no Storage (o URL do Replicate expira em ~1h)
    let motionUrl = replicateUrl;
    try {
      const buf = Buffer.from(await (await fetch(replicateUrl)).arrayBuffer());
      const path = `anuncios/motion-${variante.toLowerCase()}-${Date.now()}.mp4`;
      const { error } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
      if (!error) motionUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch { /* fica o URL temporário se a persistência falhar */ }
    await escreverManifesto(sb, variante, { motionUrl });
    return NextResponse.json({ ok: true, url: motionUrl });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
