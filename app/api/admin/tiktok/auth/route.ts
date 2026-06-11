import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { isAdmin } from '@/lib/admin-auth';
import { getCredenciaisApp } from '@/lib/tiktok/config';
import { urlAutorizacao } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/auth — arranca o login OAuth de UMA conta TikTok.
// A Vivianne abre isto (uma vez por conta), autoriza no TikTok, e o callback
// guarda os tokens. Repete-se para cada uma das 8 contas.
//
// O redirect_uri TEM de bater certo com o registado no portal do TikTok. Por
// defeito usamos a origem do pedido; pode-se fixar com TIKTOK_REDIRECT_URI.

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { clientKey } = getCredenciaisApp();
  if (!clientKey) return NextResponse.json({ erro: 'sem-app', detalhe: 'falta TIKTOK_CLIENT_KEY no Vercel' }, { status: 500 });

  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${req.nextUrl.origin}/api/admin/tiktok/callback`;
  const state = randomUUID();
  const url = urlAutorizacao({ clientKey, redirectUri, state });

  const res = NextResponse.redirect(url);
  // guarda o state para validar no callback (proteção CSRF). Curto: 10 min.
  res.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
