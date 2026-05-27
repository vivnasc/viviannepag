import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_KEY = process.env.RESEND_API_KEY;

export async function POST(req: Request) {
  let body: { email?: string; origem?: string; website?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'invalido' }, { status: 400 });
  }

  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const origem = (body.origem ?? 'site').slice(0, 60);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ erro: 'email-invalido' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('subscribers')
    .insert({ email, source: origem });

  const jaExistia = error?.code === '23505';

  if (error && !jaExistia) {
    return NextResponse.json({ erro: 'servidor' }, { status: 500 });
  }

  const isEn = body.locale === 'en';

  if (!jaExistia && RESEND_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: 'Vivianne dos Santos <noreply@viviannedossantos.com>',
          to: email,
          subject: isEn ? 'Thank you for staying close.' : 'Obrigada por ficares perto.',
          html: `
<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43;text-align:center;margin-bottom:30px">VIVIANNE DOS SANTOS</p>
  <h1 style="font-size:22px;font-weight:normal;text-align:center;color:#3D2B1F;margin-bottom:20px">${isEn ? 'Thank you for staying close.' : 'Obrigada por ficares perto.'}</h1>
  <p style="font-size:15px;line-height:1.8;color:#6B5548;text-align:center">
    ${isEn ? 'Every now and then, when there is something true to say, I will write to you. No rush. No noise. Just what matters.' : 'De vez em quando, quando houver algo verdadeiro para dizer, escrevo-te. Sem pressa. Sem barulho. Só o que importa.'}
  </p>
  <p style="font-size:15px;line-height:1.8;color:#6B5548;text-align:center;margin-top:20px">
    ${isEn ? 'Meanwhile, you can visit my <a href="https://viviannedossantos.com/en/escritos" style="color:#8C4A36">writings</a> or the <a href="https://viviannedossantos.com/en/loja" style="color:#8C4A36">shop</a>.' : 'Entretanto, podes visitar os meus <a href="https://viviannedossantos.com/escritos" style="color:#8C4A36">escritos</a> ou a <a href="https://viviannedossantos.com/loja" style="color:#8C4A36">loja</a>.'}
  </p>
  <p style="font-size:14px;color:#9A5A43;text-align:center;margin-top:30px;font-style:italic">${isEn ? 'With warmth,<br>Vivianne' : 'Com carinho,<br>Vivianne'}</p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#9A5A43;text-align:center">viviannedossantos.com</p>
</div>`,
        }),
      });
      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error('Resend newsletter erro:', err);
      }
    } catch (e) {
      console.error('Resend newsletter catch:', e);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
