import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarMotionSoulab } from '@/lib/soulab/motion';
import { lerManifesto, definirCena } from '@/lib/anuncio/manifest';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 300; // o Kling demora ~1-3 min num clip

const BUCKET = 'viviannepag-assets';

type Cena = { id: string; cenaPrompt?: string; klingPrompt?: string };

// PASSO 2 (por PLANO): põe UMA cena a MEXER (Kling, image -> video). Movimento real e
// subtil do que está na cena (fumo, a janela a respirar, uma página a virar, água),
// com uma câmara a aproximar-se em parallax — NÃO o zoom chapado de antes. Ela vê o
// clip a mexer ANTES de montar. Guarda o MP4 no Storage e no plano respetivo do
// manifesto, para o render usar EXATAMENTE este.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  let variante = 'A', idx = 0;
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; if (Number.isInteger(b?.idx)) idx = b.idx; } catch {}
  const g = (GUIOES as Record<string, { cenas?: Cena[] }>)[variante];
  const cenaGuiao = g?.cenas?.[idx];

  const sb = getSupabaseAdmin();
  const man = await lerManifesto(sb, variante);
  const cenaUrl = man.cenas?.[idx]?.cenaUrl;
  if (!cenaUrl) return NextResponse.json({ erro: 'sem-cena', detalhe: 'Gera a imagem desta cena primeiro.' }, { status: 400 });

  try {
    const replicateUrl = await gerarMotionSoulab(cenaUrl, token, {
      camara: 'suave',
      livre: cenaGuiao?.klingPrompt ?? '',
      cena: cenaGuiao?.cenaPrompt ?? '',
    }, 10);
    // persiste no Storage (o URL do Replicate expira em ~1h)
    let motionUrl = replicateUrl;
    try {
      const buf = Buffer.from(await (await fetch(replicateUrl)).arrayBuffer());
      const path = `anuncios/motion-${variante.toLowerCase()}-${idx}-${Date.now()}.mp4`;
      const { error } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
      if (!error) motionUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch { /* fica o URL temporário se a persistência falhar */ }
    await definirCena(sb, variante, idx, { motionUrl });
    return NextResponse.json({ ok: true, url: motionUrl, idx });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
