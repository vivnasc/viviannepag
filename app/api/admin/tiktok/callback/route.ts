import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getCredenciaisApp, upsertConta } from '@/lib/tiktok/config';
import { trocarCodigo } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/callback — o TikTok redireciona para aqui depois da
// autorização, com ?code=...&state=.... Trocamos o code por tokens e gravamos
// a conta no bucket privado. Depois mandamos a Vivianne de volta ao /admin.

function paraAdmin(req: NextRequest, params: Record<string, string>): NextResponse {
  const url = new URL('/admin', req.nextUrl.origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

// Busca o nome visível da conta (só para a Vivianne distinguir as 8). Não é
// crítico: se falhar, segue sem nome.
async function nomeDaConta(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const j = (await res.json().catch(() => ({}))) as { data?: { user?: { display_name?: string } } };
    return j?.data?.user?.display_name;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const erro = sp.get('error');
  if (erro) return paraAdmin(req, { tiktok: 'erro', detalhe: sp.get('error_description') || erro });

  const code = sp.get('code');
  const state = sp.get('state');
  const stateCookie = req.cookies.get('tiktok_oauth_state')?.value;
  if (!code) return paraAdmin(req, { tiktok: 'erro', detalhe: 'sem code' });
  if (!state || !stateCookie || state !== stateCookie) {
    return paraAdmin(req, { tiktok: 'erro', detalhe: 'state inválido (tenta de novo)' });
  }

  const { clientKey, clientSecret } = getCredenciaisApp();
  if (!clientKey || !clientSecret) return paraAdmin(req, { tiktok: 'erro', detalhe: 'falta TIKTOK_CLIENT_KEY/SECRET' });

  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${req.nextUrl.origin}/api/admin/tiktok/callback`;
  const r = await trocarCodigo({ clientKey, clientSecret, code, redirectUri });
  if (!r.ok || !r.tokens) return paraAdmin(req, { tiktok: 'erro', detalhe: r.erro || 'troca de token falhou' });

  const t = r.tokens;
  const agora = Date.now();
  const displayName = await nomeDaConta(t.accessToken);

  await upsertConta({
    openId: t.openId,
    displayName,
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    accessExpiraEm: new Date(agora + t.expiresIn * 1000).toISOString(),
    refreshExpiraEm: new Date(agora + t.refreshExpiresIn * 1000).toISOString(),
    scope: t.scope,
    ligadoEm: new Date(agora).toISOString(),
  });

  const res = paraAdmin(req, { tiktok: 'ligado', conta: displayName || t.openId.slice(0, 8) });
  res.cookies.delete('tiktok_oauth_state');
  return res;
}
