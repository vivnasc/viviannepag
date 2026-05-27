import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const RESEND_KEY = process.env.RESEND_API_KEY;
const VIVIANNE_EMAIL = 'ola@viviannedossantos.com';

async function enviarEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: 'Vivianne dos Santos <ola@viviannedossantos.com>', to, subject, html }),
    });
  } catch {}
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    produto_slug?: string;
    produto_titulo?: string;
    preco?: string;
    paypal_order_id?: string;
  };

  if (!body.email || !body.produto_slug) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const titulo = body.produto_titulo ?? body.produto_slug;
  const preco = body.preco ?? '';
  const orderId = body.paypal_order_id ?? '';

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('compras').insert({
    email,
    produto_slug: body.produto_slug,
    produto_titulo: titulo,
    preco,
    paypal_order_id: orderId || null,
  }).select().single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  // Email ao cliente (recibo)
  await enviarEmail(email, `O teu acesso: "${titulo}"`, `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43;text-align:center">VIVIANNE DOS SANTOS</p>
  <h1 style="font-size:24px;font-weight:normal;text-align:center;margin:20px 0;color:#3D2B1F">Obrigada pela tua compra.</h1>
  <p style="font-size:16px;line-height:1.7;text-align:center;color:#6B5548">Compraste <strong>"${titulo}"</strong></p>
  <p style="font-size:14px;text-align:center;color:#9A5A43;margin:10px 0 30px">Valor: ${preco} | Ref: ${orderId || 'N/A'}</p>
  <div style="text-align:center;margin-bottom:30px">
    <a href="https://viviannedossantos.com/loja/${body.produto_slug}" style="display:inline-block;background:#EBAE4A;color:#2A1C12;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:16px">
      Aceder ao produto
    </a>
  </div>
  <p style="font-size:13px;color:#9A5A43;text-align:center">
    Problema? <a href="https://wa.me/258845243875" style="color:#9A5A43">WhatsApp</a> |
    <a href="https://viviannedossantos.com" style="color:#9A5A43">viviannedossantos.com</a>
  </p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#9A5A43;text-align:center">Este email serve como recibo da tua compra. Guarda-o.</p>
</div>`);

  // Notificacao a Vivianne
  await enviarEmail(VIVIANNE_EMAIL, `Nova compra: "${titulo}"`, `
<div style="font-family:sans-serif;padding:20px;color:#333">
  <h2 style="color:#8C4A36">Nova compra!</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Produto</td><td style="padding:8px;border-bottom:1px solid #eee">${titulo}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${email}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Valor</td><td style="padding:8px;border-bottom:1px solid #eee">${preco}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">PayPal Order</td><td style="padding:8px;border-bottom:1px solid #eee">${orderId || 'N/A'}</td></tr>
    <tr><td style="padding:8px;font-weight:bold">Data</td><td style="padding:8px">${new Date().toISOString()}</td></tr>
  </table>
  <p style="margin-top:20px"><a href="https://viviannedossantos.com/admin/compras">Ver no admin</a></p>
</div>`);

  return NextResponse.json({ ok: true, compra: data });
}
