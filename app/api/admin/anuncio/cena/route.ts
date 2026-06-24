import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { escreverManifesto } from '@/lib/anuncio/manifest';
import GUIOES from '@/lib/anuncio/guiao.json';

export const runtime = 'nodejs';
export const maxDuration = 300;

// PASSO 1 da prévia: gera a CENA do anúncio (imagem 9:16) com a IA da casa (Flux).
// NÃO é a capa do livro chapada — é uma cena cinematográfica do mundo de Véspera
// (as mãos em concha a segurar a casinha iluminada, a aldeia ao crepúsculo). A e B
// têm cenas DIFERENTES (ver cenaPrompt no guião), por isso os anúncios não saem
// iguais. Ela vê a imagem ANTES de a pôr a mexer.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  let variante = 'A';
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; } catch {}
  const g = (GUIOES as Record<string, { cenaPrompt?: string }>)[variante];
  if (!g?.cenaPrompt) return NextResponse.json({ erro: 'sem-cena-no-guiao' }, { status: 400 });

  try {
    // raw = o prompt é a cena completa; só as regras de segurança por cima (sem o
    // estilo/tema da banda). A cena já traz a paleta e o mood de Véspera.
    const replicateUrl = await gerarImagemFlux(g.cenaPrompt, token, { raw: true });
    const cenaUrl = await guardarImagem(replicateUrl, `anuncios/cena-${variante.toLowerCase()}-${Date.now()}.jpg`);
    const sb = getSupabaseAdmin();
    // a cena MUDOU → o motion antigo deixa de servir; limpa-o para ela regerar.
    await escreverManifesto(sb, variante, { cenaUrl, motionUrl: undefined });
    return NextResponse.json({ ok: true, url: cenaUrl });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
