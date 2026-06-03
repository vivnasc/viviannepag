import { NextResponse } from 'next/server';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Vivianne dos Santos <noreply@viviannedossantos.com>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    slug?: string;
    titulo?: string;
    lang?: string;
  };

  if (!body.email || !body.slug) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  if (!RESEND_KEY) {
    return NextResponse.json({ erro: 'email-nao-configurado' }, { status: 500 });
  }

  const isEn = body.lang === 'en';

  // /api/download-directo gere a cascata Supabase -> disco e marca licenca
  // no rodape com o email do comprador. Em EN entrega o PDF ingles.
  const downloadUrl = `${SITE}/api/download-directo?slug=${encodeURIComponent(body.slug)}&email=${encodeURIComponent(body.email)}${isEn ? '&lang=en' : ''}`;

  const titulo = body.titulo || body.slug;
  const t = isEn
    ? { obrigada: 'Thank you for your purchase.', acesso: 'Here is your access to', botao: 'Download PDF', guarda: 'Keep this email — you can reuse the link whenever you need.', subject: `Your access: "${titulo}" — Vivianne dos Santos`, rodape: 'You received this email because you bought a product at viviannedossantos.com.' }
    : { obrigada: 'Obrigada pela tua compra.', acesso: 'Aqui está o teu acesso a', botao: 'Descarregar PDF', guarda: 'Guarda este email — podes voltar a usar o link sempre que precisares.', subject: `O teu acesso: "${titulo}" — Vivianne dos Santos`, rodape: 'Este email foi enviado porque compraste um produto em viviannedossantos.com.' };

  const html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <div style="text-align:center;margin-bottom:30px">
    <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43">VIVIANNE DOS SANTOS</p>
  </div>
  <h1 style="font-size:24px;font-weight:normal;text-align:center;margin-bottom:20px;color:#3D2B1F">
    ${t.obrigada}
  </h1>
  <p style="font-size:16px;line-height:1.7;text-align:center;color:#6B5548;margin-bottom:30px">
    ${t.acesso} <strong>"${titulo}"</strong>.
  </p>
  <div style="text-align:center;margin-bottom:30px">
    <a href="${downloadUrl}" style="display:inline-block;background:#EBAE4A;color:#2A1C12;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:500">
      ${t.botao}
    </a>
  </div>
  <p style="font-size:13px;color:#9A5A43;text-align:center;margin-bottom:10px">
    ${t.guarda}
  </p>
  <p style="font-size:13px;color:#9A5A43;text-align:center">
    <a href="https://wa.me/258845243875" style="color:#9A5A43">WhatsApp</a> ·
    <a href="https://viviannedossantos.com" style="color:#9A5A43">viviannedossantos.com</a>
  </p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#9A5A43;text-align:center">
    © 2026 Vivianne dos Santos. ${t.rodape}
  </p>
</div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: body.email,
      subject: t.subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ erro: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
