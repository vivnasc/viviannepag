import { reelHTML, slideHTML, segmentar } from '@/lib/crescer/assinatura-reel';

export const runtime = 'nodejs';

// ASSINATURA DA MAE · devolve o HTML autonomo. Sem ?slide = o REEL 9:16 animado. Com
// ?slide=i = UMA tela de CARROSSEL (estatica, o segmento i). Publico (so ecoa params),
// para o preview no admin e o pipeline Puppeteer. tema define o motivo.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const tema = u.searchParams.get('tema') || 'consciencia';
  const raw = u.searchParams.get('linhas') || u.searchParams.get('capa') || u.searchParams.get('frase') || '';
  const linhas = raw.split('|').map((s) => s.trim()).filter(Boolean);
  const label = u.searchParams.get('label') || undefined;
  const slideParam = u.searchParams.get('slide');

  if (slideParam !== null) {
    const segs = linhas.flatMap(segmentar).slice(0, 12);
    const total = Math.max(1, segs.length);
    const idx = Math.max(0, Math.min(total - 1, parseInt(slideParam, 10) || 0));
    const html = slideHTML({ tema, label, texto: segs[idx] || linhas.join(' '), idx: idx + 1, total });
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  const html = reelHTML({ tema, linhas: linhas.length ? linhas : undefined, label });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
