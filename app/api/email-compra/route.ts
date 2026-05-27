import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const RESEND_KEY = process.env.RESEND_API_KEY;
const BUCKET = 'escritos';
const FROM = 'Vivianne dos Santos <loja@viviannedossantos.com>';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    slug?: string;
    titulo?: string;
  };

  if (!body.email || !body.slug) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  if (!RESEND_KEY) {
    return NextResponse.json({ erro: 'email-nao-configurado' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  let downloadUrl = `https://viviannedossantos.com/produtos/${body.slug}.pdf`;

  try {
    const { data: produto } = await supabase
      .from('produtos')
      .select('ficheiro_path')
      .eq('slug', body.slug)
      .single();

    if (produto?.ficheiro_path) {
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(produto.ficheiro_path, 60 * 60 * 72);
      if (data?.signedUrl) downloadUrl = data.signedUrl;
    }
  } catch {}

  const titulo = body.titulo || body.slug;

  const html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D2B1F;padding:40px 20px">
  <div style="text-align:center;margin-bottom:30px">
    <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9A5A43">VIVIANNE DOS SANTOS</p>
  </div>
  <h1 style="font-size:24px;font-weight:normal;text-align:center;margin-bottom:20px;color:#3D2B1F">
    Obrigada pela tua compra.
  </h1>
  <p style="font-size:16px;line-height:1.7;text-align:center;color:#6B5548;margin-bottom:30px">
    Aqui está o teu acesso a <strong>"${titulo}"</strong>.
  </p>
  <div style="text-align:center;margin-bottom:30px">
    <a href="${downloadUrl}" style="display:inline-block;background:#EBAE4A;color:#2A1C12;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:500">
      Descarregar PDF
    </a>
  </div>
  <p style="font-size:13px;color:#9A5A43;text-align:center;margin-bottom:10px">
    Este link expira em 72 horas. Se precisares de um novo, contacta-me.
  </p>
  <p style="font-size:13px;color:#9A5A43;text-align:center">
    <a href="https://wa.me/258845243875" style="color:#9A5A43">WhatsApp</a> ·
    <a href="https://viviannedossantos.com" style="color:#9A5A43">viviannedossantos.com</a>
  </p>
  <hr style="border:none;border-top:1px solid #F3E4D6;margin:30px 0" />
  <p style="font-size:11px;color:#9A5A43;text-align:center">
    © 2026 Vivianne dos Santos. Este email foi enviado porque compraste um produto em viviannedossantos.com.
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
      subject: `O teu acesso: "${titulo}" — Vivianne dos Santos`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ erro: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
