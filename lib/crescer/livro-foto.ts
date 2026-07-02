// FOTO EDITORIAL DO LIVRO — compositor que GARANTE o texto real: a IA (ou uma foto MJ)
// dá a CENA vazia; a PÁGINA/CAPA real é composta por cima (os pixels verdadeiros, nunca
// repintados) com sombra suave e relight. Assim a tipografia/paginação é sempre a do PDF.
// v1 = flatlay (cena vista de cima): escala + rotação leve + sombra + luz. Ângulos fortes
// ficam para uma passagem Kontext (Replicate) depois. Só sharp — zero API, zero token.
import 'server-only';
import sharp from 'sharp';

export interface Colocacao {
  cx?: number; cy?: number;   // centro da página na cena (0-1). def: 0.5, 0.52
  larg?: number;              // largura da página em fração da cena (0-1). def: 0.6
  rot?: number;               // rotação em graus. def: -4
  sombra?: number;            // força da sombra 0-1. def: 0.55
  luz?: number;               // relight quente 0-1 (0 = nenhum). def: 0.35
}
export interface FotoOpts { larguraFinal?: number; colocacao?: Colocacao }

const A4 = 4 / 5; // 4:5 para Instagram

// compõe a PÁGINA real (buffer) sobre a CENA (buffer) e devolve um JPEG 4:5.
export async function comporFotoLivro(paginaBuf: Buffer, cenaBuf: Buffer, opts: FotoOpts = {}): Promise<Buffer> {
  const W = Math.round(opts.larguraFinal ?? 1080);
  const H = Math.round(W / A4);
  const c = { cx: 0.5, cy: 0.52, larg: 0.6, rot: -4, sombra: 0.55, luz: 0.35, ...(opts.colocacao ?? {}) };

  // 1) CENA: cobre 4:5.
  const cena = await sharp(cenaBuf).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();

  // 2) PÁGINA: escala para a largura pedida, roda com fundo transparente.
  const pLarg = Math.max(40, Math.round(W * c.larg));
  let pagina = sharp(paginaBuf).resize(pLarg, null, { fit: 'inside', withoutEnlargement: false });
  if (c.rot) pagina = pagina.rotate(c.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const pagPng = await pagina.png().toBuffer();
  const pm = await sharp(pagPng).metadata();
  const pw = pm.width ?? pLarg, ph = pm.height ?? pLarg;
  const left = Math.round(W * c.cx - pw / 2);
  const top = Math.round(H * c.cy - ph / 2);

  // 3) SOMBRA: silhueta (alpha) da página, desfocada e atenuada, como canal alfa de um
  // retângulo escuro; deslocada para baixo/direita.
  const camadas: sharp.OverlayOptions[] = [];
  if (c.sombra > 0) {
    const desf = Math.max(6, Math.round(pw * 0.03));
    const maskAlpha = await sharp(pagPng).extractChannel('alpha').blur(desf).linear(Math.min(0.9, c.sombra), 0).toBuffer();
    const sombraPng = await sharp({ create: { width: pw, height: ph, channels: 3, background: { r: 8, g: 6, b: 4 } } })
      .joinChannel(maskAlpha).png().toBuffer();
    camadas.push({ input: sombraPng, left: left + Math.round(pw * 0.02), top: top + Math.round(ph * 0.035) });
  }
  // 4) a PÁGINA real por cima.
  camadas.push({ input: pagPng, left, top });

  let out = sharp(cena).composite(camadas);

  // 5) RELIGHT: brilho quente por cima do conjunto, em soft-light (funde a página na luz da cena).
  if (c.luz > 0) {
    const grad = `<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="rgb(255,236,200)" stop-opacity="${(0.5 * c.luz).toFixed(3)}"/>
      <stop offset="60%" stop-color="rgb(255,236,200)" stop-opacity="0"/>
      <stop offset="100%" stop-color="rgb(10,7,4)" stop-opacity="${(0.5 * c.luz).toFixed(3)}"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/></svg>`;
    out = sharp(await out.toBuffer()).composite([{ input: Buffer.from(grad), blend: 'soft-light' }]);
  }
  return out.jpeg({ quality: 92 }).toBuffer();
}
