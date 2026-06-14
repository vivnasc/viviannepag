import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { email } — compra de TESTE (só admin): reproduz o pós-pagamento sem
// PayPal. Dispara o email de compra (com link de download) e devolve o URL de
// download direto, para testar a entrega ponta a ponta sem mudar para sandbox.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const to = (email || '').trim();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ erro: 'email-invalido' }, { status: 400 });
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com').replace(/\/+$/, '');
  const downloadUrl = `${site}/api/download-directo?slug=os-7-veus&email=${encodeURIComponent(to)}`;

  // dispara o mesmo email de compra que um comprador recebe
  let emailOk = false;
  try {
    const r = await fetch(`${site}/api/email-compra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: to, slug: 'os-7-veus', titulo: 'Os Sete Véus' }),
    });
    emailOk = r.ok;
  } catch {
    /* segue mesmo sem email */
  }

  return NextResponse.json({ ok: true, emailOk, downloadUrl });
}
