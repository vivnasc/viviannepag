import { type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/tiktok-media?u=<URL pública do Supabase> — proxy PÚBLICO que serve um
// MP4 (ou imagem) que está no Supabase Storage, mas através do domínio
// viviannedossantos.com. É preciso porque o TikTok (PULL_FROM_URL) só vai buscar
// media a um domínio VERIFICADO nosso — e os nossos ficheiros vivem no Supabase.
//
// Segurança: só deixa passar URLs do NOSSO host do Supabase (não é um proxy
// aberto). Suporta Range para o TikTok poder descarregar por pedaços.

function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname;
  } catch {
    return '';
  }
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u');
  if (!u) return new Response('falta ?u', { status: 400 });

  let alvo: URL;
  try {
    alvo = new URL(u);
  } catch {
    return new Response('URL inválido', { status: 400 });
  }

  const host = supabaseHost();
  if (!host || alvo.hostname !== host || alvo.protocol !== 'https:') {
    return new Response('host não permitido', { status: 403 });
  }

  const range = req.headers.get('range');
  const upstream = await fetch(alvo.toString(), { headers: range ? { range } : {} });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response('upstream ' + upstream.status, { status: 502 });
  }

  const headers = new Headers();
  const copiar = ['content-type', 'content-length', 'accept-ranges', 'content-range', 'last-modified', 'etag'];
  for (const h of copiar) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  // cache leve no CDN (o TikTok pode pedir 2x)
  headers.set('cache-control', 'public, max-age=3600');

  return new Response(upstream.body, { status: upstream.status, headers });
}
