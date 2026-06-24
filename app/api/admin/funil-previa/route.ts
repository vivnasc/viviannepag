import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { SEQUENCIA, envelopar } from '@/lib/funil/sequencia';
import { urlSair } from '@/lib/funil/token';

export const runtime = 'nodejs';

// Prévia das cartas do funil: envia AS 4 cartas, já, para um email (o teu), para
// as leres como leitora antes de ligar a sequência a sério. Só admin.
// Uso (com sessão de admin aberta): /api/admin/funil-previa?email=viv.saraiva@gmail.com&lang=pt
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return NextResponse.json({ erro: 'sem-resend' }, { status: 500 });

  const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'pt';
  if (!email.includes('@')) return NextResponse.json({ erro: 'falta ?email=' }, { status: 400 });

  const enviadas: string[] = [];
  for (const carta of SEQUENCIA) {
    const txt = lang === 'en' ? carta.en : carta.pt;
    // o assunto é o REAL (o que a leitora vê); a etiqueta de prévia fica discreta no topo do corpo
    const nota = `<p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9B7A8;text-align:center;margin:0 0 18px">prévia · dia ${carta.dia}</p>`;
    const html = envelopar(nota + txt.corpo, urlSair(email), lang);
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Vivianne dos Santos <noreply@viviannedossantos.com>',
        to: email,
        subject: txt.assunto,
        html,
      }),
    });
    enviadas.push(`dia ${carta.dia}: ${r.ok ? 'ok' : 'falhou ' + r.status}`);
  }

  return NextResponse.json({ ok: true, email, lang, cartas: enviadas });
}
