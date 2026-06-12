import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_KEY = process.env.RESEND_API_KEY;
// O padrão da casa (app/api/compra): cada evento da loja avisa a Vivianne.
const VIVIANNE_EMAILS = ['ola@viviannedossantos.com'];

// POST { email, locale?, website? }: o gate do romance-oferta (funil do Insta).
// Regista a leitora na lista (source: romance-amparo) e devolve os links de
// download pt e en. A amostra (capítulo 1) é pública na página ANTES deste gate.
export async function POST(req: Request) {
  let body: { email?: string; locale?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'invalido' }, { status: 400 });
  }

  // honeypot
  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ erro: 'email-invalido' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('subscribers')
    .insert({ email, source: 'romance-amparo' });
  const jaExistia = error?.code === '23505';
  if (error && !jaExistia) {
    return NextResponse.json({ erro: 'servidor' }, { status: 500 });
  }

  const pt = 'https://viviannedossantos.com/api/romance-download?lang=pt';
  const en = 'https://viviannedossantos.com/api/romance-download?lang=en';

  const isEn = body.locale === 'en';
  if (RESEND_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: 'Vivianne dos Santos <noreply@viviannedossantos.com>',
          to: email,
          subject: isEn ? "Amparo's Hands: your book" : 'As Mãos de Amparo: o teu livro',
          html: `
<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43;text-align:center;margin-bottom:30px">VIVIANNE DOS SANTOS</p>
  <h1 style="font-size:22px;font-weight:normal;text-align:center;margin-bottom:20px">${isEn ? "Amparo's Hands" : 'As Mãos de Amparo'}</h1>
  <p style="font-size:15px;line-height:1.8;color:#6B5548;text-align:center">
    ${isEn ? 'Here is the whole novel, with my thanks for wanting to read on. Both editions are yours:' : 'Aqui tens o romance inteiro, com o meu obrigada por quereres continuar a ler. As duas edições são tuas:'}
  </p>
  <p style="text-align:center;margin:26px 0">
    <a href="${pt}" style="color:#8C4A36;font-size:16px">${isEn ? 'Download (Portuguese)' : 'Descarregar (português)'}</a><br><br>
    <a href="${en}" style="color:#8C4A36;font-size:16px">${isEn ? 'Download (English)' : 'Descarregar (inglês)'}</a>
  </p>
  <p style="font-size:15px;line-height:1.8;color:#6B5548;text-align:center">
    ${isEn ? 'Every now and then, when there is something true to say, I will write to you. No rush. No noise.' : 'De vez em quando, quando houver algo verdadeiro para dizer, escrevo-te. Sem pressa. Sem barulho.'}
  </p>
  <p style="font-size:14px;color:#9A5A43;text-align:center;margin-top:30px;font-style:italic">${isEn ? 'With warmth,<br>Vivianne' : 'Com carinho,<br>Vivianne'}</p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#9A5A43;text-align:center">viviannedossantos.com</p>
</div>`,
        }),
      });
      if (!resendRes.ok) console.error('romance-gratis resend', resendRes.status, await resendRes.text());
    } catch (e) {
      console.error('romance-gratis resend:', e);
    }

    // aviso para a Vivianne (padrão de app/api/compra)
    for (const dest of VIVIANNE_EMAILS) {
      try {
        const avisoRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: 'Vivianne dos Santos <noreply@viviannedossantos.com>',
            to: dest,
            subject: `Nova leitora no funil: ${email}`,
            html: `
<div style="font-family:sans-serif;padding:20px;color:#333">
  <p><strong>As Mãos de Amparo</strong> · funil do romance</p>
  <p>Email: <strong>${email}</strong></p>
  <p>Locale: ${isEn ? 'en' : 'pt'} · ${jaExistia ? 'já estava na lista (reenvio dos links)' : 'novo na lista'}</p>
  <p>Origem: romance-amparo · vê tudo em /admin/lista</p>
</div>`,
          }),
        });
        if (!avisoRes.ok) console.error('romance-gratis aviso-admin', avisoRes.status, await avisoRes.text());
      } catch (e) {
        console.error('romance-gratis aviso-admin:', e);
      }
    }
  }

  return NextResponse.json({ ok: true, pt, en });
}
