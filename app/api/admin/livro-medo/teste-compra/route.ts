import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { email, lang? } — compra de TESTE (só admin) de As Sete Faces do Medo.
// Reproduz o pós-pagamento SEM PayPal, disparando EXATAMENTE o que uma compra
// real dispara em BotaoCompra.onApprove:
//   1. /api/compra      -> recibo + licença ao cliente E notificação à Vivianne
//   2. /api/email-compra -> email com o link de descarga (PDF, PT ou EN)
// Devolve também o URL de descarga direto, para testar a entrega ponta a ponta.
const SLUG = 'as-sete-faces-do-medo';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { email, lang } = (await req.json().catch(() => ({}))) as { email?: string; lang?: string };
  const to = (email || '').trim();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ erro: 'email-invalido' }, { status: 400 });
  }
  const isEn = lang === 'en';
  const titulo = isEn ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo';
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com').replace(/\/+$/, '');
  const downloadUrl = `${site}/api/download-directo?slug=${SLUG}&email=${encodeURIComponent(to)}${isEn ? '&lang=en' : ''}`;

  // 1. recibo + licença ao cliente + notificação à Vivianne (o mesmo que registarCompra)
  let compraOk = false;
  try {
    const r = await fetch(`${site}/api/compra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: to,
        produto_slug: SLUG,
        produto_titulo: titulo,
        preco: '$17',
        paypal_order_id: 'TESTE-ADMIN',
      }),
    });
    compraOk = r.ok;
  } catch {
    /* segue mesmo assim */
  }

  // 2. email com o link de descarga (o mesmo que enviarEmail)
  let emailOk = false;
  try {
    const r = await fetch(`${site}/api/email-compra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: to, slug: SLUG, titulo, lang: isEn ? 'en' : 'pt' }),
    });
    emailOk = r.ok;
  } catch {
    /* segue mesmo assim */
  }

  return NextResponse.json({ ok: true, compraOk, emailOk, downloadUrl });
}
