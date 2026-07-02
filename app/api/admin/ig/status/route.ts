import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getIgCredenciais } from '@/lib/instagram/config';
import type { ContaId } from '@/lib/instagram/contas';

export const runtime = 'nodejs';

const GRAPH = 'https://graph.facebook.com/v21.0';

// GET ?conta= — testa se o token guardado DA CONTA funciona (pergunta o username
// ao Instagram). Diz claramente se está ligado e a que conta.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const conta = (req.nextUrl.searchParams.get('conta') as ContaId) || 'veuaveu';
  const { token, igUserId } = await getIgCredenciais(conta);
  if (!token) return NextResponse.json({ ligado: false, igUserId, erro: 'Ainda não há token guardado. Cola um token em baixo.' });
  if (!igUserId) return NextResponse.json({ ligado: false, erro: 'Falta o IG_USER_ID (INSTAGRAM_IG_ID no Vercel).' });

  try {
    const res = await fetch(`${GRAPH}/${igUserId}?fields=username,name&access_token=${encodeURIComponent(token)}`);
    const j = (await res.json().catch(() => ({}))) as { username?: string; name?: string; error?: { message?: string; code?: number } };
    if (j.error) {
      const expirado = j.error.code === 190;
      return NextResponse.json({ ligado: false, igUserId, erro: expirado ? 'O token expirou ou é inválido. Cola um token novo em baixo.' : (j.error.message ?? 'token inválido') });
    }

    // DIAGNÓSTICO (best-effort, não quebra o "ligado"): o erro nº100 ao publicar
    // ("does not support this operation") acontece quando o ID guardado é o de uma
    // PÁGINA do Facebook (ou uma conta não-Business), não o ID da conta de Instagram.
    // 1) Se este ID for uma Página, o IG certo vem em instagram_business_account.
    let igCorreto: string | undefined; let igCorretoUser: string | undefined; let aviso: string | undefined;
    try {
      const r2 = await fetch(`${GRAPH}/${igUserId}?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`);
      const j2 = (await r2.json().catch(() => ({}))) as { instagram_business_account?: { id?: string; username?: string } };
      const iba = j2.instagram_business_account;
      if (iba?.id && iba.id !== igUserId) {
        igCorreto = iba.id; igCorretoUser = iba.username;
        aviso = `Este ID (${igUserId}) é de uma Página do Facebook, não da conta de Instagram. Para publicar, o ID certo é ${iba.id}${iba.username ? ` (@${iba.username})` : ''}. Carrega em "usar este ID" e liga outra vez.`;
      }
    } catch { /* pode não ser Página; segue */ }
    // 2) Se for mesmo uma conta IG, confirma que é Profissional (Business) — só essas
    //    publicam por API. Personal/Creator dá o mesmo erro ao publicar.
    if (!aviso) {
      try {
        const r3 = await fetch(`${GRAPH}/${igUserId}?fields=account_type&access_token=${encodeURIComponent(token)}`);
        const j3 = (await r3.json().catch(() => ({}))) as { account_type?: string };
        if (j3.account_type && j3.account_type !== 'BUSINESS') {
          aviso = `A conta é do tipo ${j3.account_type}. A publicação por API exige uma conta Profissional/Empresarial (Business) ligada a uma Página do Facebook. Muda o tipo da conta no Instagram e liga outra vez.`;
        }
      } catch { /* sem info de tipo; segue */ }
    }

    return NextResponse.json({ ligado: true, igUserId, username: j.username ?? j.name ?? '(conta)', ...(igCorreto ? { igCorreto, igCorretoUser } : {}), ...(aviso ? { aviso } : {}) });
  } catch (e) {
    return NextResponse.json({ ligado: false, igUserId, erro: String(e) });
  }
}
