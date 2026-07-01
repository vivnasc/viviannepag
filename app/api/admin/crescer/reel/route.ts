import { reelHTML } from '@/lib/crescer/assinatura-reel';

export const runtime = 'nodejs';

// REEL DA MAE (assinatura VDS) · devolve o HTML autonomo de um reel 9:16 animado, a
// partir do tema + as linhas da frase real. Publico (so ecoa params, sem dados), para
// o preview no admin e para o pipeline Puppeteer gravar em MP4. tema define o motivo.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const tema = u.searchParams.get('tema') || 'consciencia';
  const raw = u.searchParams.get('linhas') || u.searchParams.get('capa') || u.searchParams.get('frase') || '';
  const linhas = raw.split('|').map((s) => s.trim()).filter(Boolean);
  const label = u.searchParams.get('label') || undefined;
  const html = reelHTML({ tema, linhas: linhas.length ? linhas : undefined, label });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
