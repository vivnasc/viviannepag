import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { SEQUENCIA, envelopar } from '@/lib/funil/sequencia';
import { urlSair } from '@/lib/funil/token';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Cron diário do funil do Amparo: envia a cada leitora a carta DEVIDA, pela
// quantidade de dias desde que se inscreveu (created_at) e pelo passo já feito
// (funil_step). Resend faz o envio. É TUDO opt-in e seguro:
//   - FUNIL_SEQUENCIA_ATIVA=1 .... liga o envio (sem isto, não envia nada)
//   - FUNIL_DESDE=2026-06-23 ..... só apanha quem se inscreveu A PARTIR daqui
//     (a tua lista atual NUNCA é tocada — só leitoras novas, do anúncio)
//   - source='romance-amparo' .... só o funil do romance-oferta
//   - funil_unsub=true ........... quem clicou em "sair" deixa de receber
// Precisa das colunas funil_step, funil_last_at, funil_unsub (ver supabase-funil.sql).
const RESEND_KEY = process.env.RESEND_API_KEY;

function autorizado(req: NextRequest): boolean {
  const seg = process.env.CRON_SECRET;
  if (!seg) return true; // sem segredo definido, o Vercel Cron já é a barreira
  const h = req.headers.get('authorization') || '';
  return h === `Bearer ${seg}` || req.nextUrl.searchParams.get('k') === seg;
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  if (process.env.FUNIL_SEQUENCIA_ATIVA !== '1') {
    return NextResponse.json({ ok: true, nota: 'sequência desligada (FUNIL_SEQUENCIA_ATIVA != 1)', enviadas: 0 });
  }
  if (!RESEND_KEY) return NextResponse.json({ erro: 'sem-resend' }, { status: 500 });

  const desde = process.env.FUNIL_DESDE || new Date().toISOString().slice(0, 10);
  const sb = getSupabaseAdmin();

  // candidatas: funil do Amparo, inscritas a partir de FUNIL_DESDE, que não saíram
  const { data, error } = await sb
    .from('subscribers')
    .select('email, source, created_at, funil_step, funil_last_at, funil_unsub, locale')
    .eq('source', 'romance-amparo')
    .or('funil_unsub.is.null,funil_unsub.eq.false')
    .gte('created_at', desde)
    .limit(2000);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const agora = Date.now();
  const DIA = 86400000;
  let enviadas = 0;
  const erros: string[] = [];

  for (const s of (data ?? []) as Array<{ email: string; created_at: string | null; funil_step: number | null; funil_last_at: string | null; funil_unsub: boolean | null; locale: string | null }>) {
    const passo = s.funil_step ?? 0;
    if (passo >= SEQUENCIA.length) continue; // sequência terminada
    const carta = SEQUENCIA[passo];
    const nascida = s.created_at ? new Date(s.created_at).getTime() : agora;
    const diasDesdeInscricao = (agora - nascida) / DIA;
    if (diasDesdeInscricao < carta.dia) continue; // ainda não é dia desta carta
    // nunca duas cartas no mesmo dia (folga de segurança)
    if (s.funil_last_at && (agora - new Date(s.funil_last_at).getTime()) < DIA) continue;

    const lang = s.locale === 'en' ? 'en' : 'pt';
    const txt = lang === 'en' ? carta.en : carta.pt;
    const html = envelopar(txt.corpo, urlSair(s.email), lang);

    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: 'Vivianne dos Santos <noreply@viviannedossantos.com>',
          to: s.email,
          subject: txt.assunto,
          html,
          headers: { 'List-Unsubscribe': `<${urlSair(s.email)}>` },
        }),
      });
      if (!r.ok) { erros.push(`${s.email}: resend ${r.status}`); continue; }
      await sb.from('subscribers').update({ funil_step: passo + 1, funil_last_at: new Date().toISOString() }).eq('email', s.email);
      enviadas++;
    } catch (e) {
      erros.push(`${s.email}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true, desde, candidatas: (data ?? []).length, enviadas, erros: erros.slice(0, 20) });
}
