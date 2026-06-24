import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { tokenValido } from '@/lib/funil/token';

export const runtime = 'nodejs';

// Link de "deixar de receber as cartas" (no rodapé de cada carta do funil).
// Marca funil_unsub=true; o cron deixa de a apanhar. Sem login, com token.
function pagina(msg: string): string {
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Véspera</title></head>
<body style="font-family:Georgia,serif;background:#1c1714;color:#e8ddcf;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="max-width:420px;text-align:center;padding:30px">
<p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c89; margin-bottom:18px">VIVIANNE DOS SANTOS</p>
<p style="font-size:17px;line-height:1.7">${msg}</p>
</div></body></html>`;
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('e') || '').trim().toLowerCase();
  const token = req.nextUrl.searchParams.get('t') || '';
  if (!email || !tokenValido(email, token)) {
    return new NextResponse(pagina('Ligação inválida. Se quiseres deixar de receber as cartas, responde a um dos emails e eu trato disso.'), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  try {
    await getSupabaseAdmin().from('subscribers').update({ funil_unsub: true }).eq('email', email);
  } catch { /* à prova de falhas */ }
  return new NextResponse(pagina('Pronto. Não te escrevo mais com estas cartas. A biblioteca fica aqui, de porta aberta, quando quiseres voltar.'), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
