import { type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/tiktok/avatar?u=<url da foto do TikTok> — serve a foto de perfil
// do TikTok através do nosso servidor (o CDN do TikTok bloqueia o carregamento
// direto no browser). Só deixa passar hosts do TikTok.

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return new Response('auth', { status: 401 });
  const u = req.nextUrl.searchParams.get('u');
  if (!u) return new Response('falta u', { status: 400 });

  let alvo: URL;
  try { alvo = new URL(u); } catch { return new Response('url', { status: 400 }); }
  if (alvo.protocol !== 'https:' || !/tiktokcdn|tiktok\.com/.test(alvo.hostname)) {
    return new Response('host', { status: 403 });
  }

  const upstream = await fetch(alvo.toString());
  if (!upstream.ok) return new Response('upstream', { status: 502 });
  const headers = new Headers();
  headers.set('content-type', upstream.headers.get('content-type') ?? 'image/jpeg');
  headers.set('cache-control', 'public, max-age=86400');
  return new Response(upstream.body, { status: 200, headers });
}
