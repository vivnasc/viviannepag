import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getIgCredenciais } from '@/lib/instagram/config';

export const runtime = 'nodejs';

const GRAPH = 'https://graph.facebook.com/v21.0';

// GET — testa se o token guardado funciona mesmo (pergunta o username ao
// Instagram). Diz claramente se está ligado e a que conta.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { token, igUserId } = await getIgCredenciais();
  if (!token) return NextResponse.json({ ligado: false, erro: 'Ainda não há token guardado. Cola um token em baixo.' });
  if (!igUserId) return NextResponse.json({ ligado: false, erro: 'Falta o IG_USER_ID (INSTAGRAM_IG_ID no Vercel).' });

  try {
    const res = await fetch(`${GRAPH}/${igUserId}?fields=username,name&access_token=${encodeURIComponent(token)}`);
    const j = (await res.json().catch(() => ({}))) as { username?: string; name?: string; error?: { message?: string; code?: number } };
    if (j.error) {
      const expirado = j.error.code === 190;
      return NextResponse.json({ ligado: false, erro: expirado ? 'O token expirou ou é inválido. Cola um token novo em baixo.' : (j.error.message ?? 'token inválido') });
    }
    return NextResponse.json({ ligado: true, username: j.username ?? j.name ?? '(conta)' });
  } catch (e) {
    return NextResponse.json({ ligado: false, erro: String(e) });
  }
}
