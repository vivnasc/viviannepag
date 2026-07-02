import { reelHTML, slideHTML, segmentar, rotuloTema } from '@/lib/crescer/assinatura-reel';

export const runtime = 'nodejs';

// ASSINATURA DA MAE · devolve o HTML autonomo. Sem ?slide = o REEL 9:16 animado. Com
// ?slide=i = UMA tela de CARROSSEL (estatica, o segmento i). Publico (so ecoa params),
// para o preview no admin e o pipeline Puppeteer. tema define o motivo.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const tema = u.searchParams.get('tema') || 'consciencia';
  const raw = u.searchParams.get('linhas') || u.searchParams.get('capa') || u.searchParams.get('frase') || '';
  const linhas = raw.split('|').map((s) => s.trim()).filter(Boolean);
  const lingua = u.searchParams.get('lingua') || undefined;
  const marca = u.searchParams.get('marca') || undefined;
  const label = u.searchParams.get('label') || rotuloTema(tema, lingua);
  const img = u.searchParams.get('img') || undefined;
  const imgModo = u.searchParams.get('imgmodo') || undefined;
  const slideParam = u.searchParams.get('slide');

  if (slideParam !== null) {
    const segs = linhas.flatMap(segmentar).slice(0, 12);
    const total = Math.max(1, segs.length);
    const idx = Math.max(0, Math.min(total - 1, parseInt(slideParam, 10) || 0));
    const num = (k: string) => { const v = parseFloat(u.searchParams.get(k) || ''); return Number.isFinite(v) ? v : undefined; };
    // a imagem (cena/acento) só na CAPA do carrossel; as telas de texto ficam limpas.
    const html = slideHTML({ tema, label, marca, texto: segs[idx] || linhas.join(' '), idx: idx + 1, total,
      ...(idx === 0 ? { img, imgModo } : {}),
      seed: u.searchParams.get('seed') || raw, av: u.searchParams.get('av') || undefined, ah: u.searchParams.get('ah') || undefined, dist: num('dist'), txtSize: num('txtSize'), geoTop: num('geoTop'), geoW: num('geoW') });
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  const html = reelHTML({ tema, linhas: linhas.length ? linhas : undefined, label, marca });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
