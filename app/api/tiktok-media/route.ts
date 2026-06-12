import { type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET/HEAD /api/tiktok-media?u=<URL pública do Supabase> — proxy PÚBLICO que serve
// um MP4 do Supabase Storage através do domínio verificado viviannedossantos.com.
// É preciso porque o TikTok (PULL_FROM_URL) só vai buscar media a um domínio
// VERIFICADO nosso — e os nossos ficheiros vivem no Supabase.
//
// O downloader do TikTok costuma: 1) fazer HEAD para saber o tamanho/tipo,
// 2) pedir o vídeo em PEDAÇOS (Range). Tratamos os dois explicitamente, para o
// pull não falhar com "internal".
//
// Segurança: só deixa passar URLs do NOSSO host do Supabase (não é proxy aberto).

function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname;
  } catch {
    return '';
  }
}

function alvoDe(req: NextRequest): URL | null {
  const u = req.nextUrl.searchParams.get('u');
  if (!u) return null;
  let alvo: URL;
  try {
    alvo = new URL(u);
  } catch {
    return null;
  }
  const host = supabaseHost();
  if (!host || alvo.hostname !== host || alvo.protocol !== 'https:') return null;
  return alvo;
}

function headersDe(upstream: Response): Headers {
  const headers = new Headers();
  for (const h of ['content-type', 'content-length', 'accept-ranges', 'content-range', 'last-modified', 'etag']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes');
  if (!headers.has('content-type')) headers.set('content-type', 'video/mp4');
  headers.set('cache-control', 'public, max-age=3600');
  return headers;
}

// HEAD: o TikTok usa-o para descobrir tamanho/tipo antes de descarregar.
export async function HEAD(req: NextRequest): Promise<Response> {
  const alvo = alvoDe(req);
  if (!alvo) return new Response(null, { status: 403 });
  const upstream = await fetch(alvo.toString(), { method: 'HEAD' });
  return new Response(null, { status: upstream.ok ? 200 : upstream.status, headers: headersDe(upstream) });
}

// GET: serve o vídeo, respeitando Range (download por pedaços do TikTok).
export async function GET(req: NextRequest): Promise<Response> {
  const alvo = alvoDe(req);
  if (!alvo) return new Response('host não permitido', { status: 403 });

  const range = req.headers.get('range');
  const upstream = await fetch(alvo.toString(), { headers: range ? { range } : {} });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response('upstream ' + upstream.status, { status: 502 });
  }
  return new Response(upstream.body, { status: upstream.status, headers: headersDe(upstream) });
}
