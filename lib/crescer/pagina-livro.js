'use strict';
// TIPÓGRAFO DE PÁGINA — compõe uma página de livro (papel creme, serif, JUSTIFICADO) a
// partir do TEXTO REAL da Vivianne. Devolve SVG (→ PNG com sharp). É a página que depois
// se compõe/relight numa cena (IC-Light). O texto é sempre o verdadeiro, legível.

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// quebra um parágrafo em linhas por nº de caracteres (aprox. da largura da coluna).
function quebrar(texto, maxChars) {
  const palavras = String(texto || '').replace(/\s+/g, ' ').trim().split(' ');
  const linhas = []; let cur = '';
  for (const w of palavras) {
    if ((cur + ' ' + w).trim().length > maxChars) { if (cur) linhas.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) linhas.push(cur);
  return linhas;
}

// opts: { kicker, titulo, sub, epigrafe, paras[], numero, W, H, fonte }
function paginaLivroSVG(opts) {
  const o = opts || {};
  const W = o.W || 1240, H = o.H || 1748;
  const fonte = o.fonte || 'Georgia, "Times New Roman", serif';
  const mx = Math.round(W * 0.155), colW = W - mx * 2; // margens laterais
  const tinta = '#241d15', suave = '#6f5a3d', ouro = '#b8894a', papel = '#f4ecd9';
  const F = Math.round(W * 0.0235);            // corpo
  const LH = Math.round(F * 1.62);             // entrelinha
  const maxChars = Math.max(28, Math.round(colW / (F * 0.485)));

  let y = Math.round(H * 0.135);
  const linhas = [];
  const T = (x, yy, s, extra) => `<text x="${x}" y="${yy}" ${extra || ''}>${esc(s)}</text>`;

  // cabeçalho: kicker + título + subtítulo + régua
  if (o.kicker) { linhas.push(T(mx, y, o.kicker.toUpperCase(), `font-family="system-ui,sans-serif" font-size="${Math.round(F * 0.62)}" letter-spacing="${(F * 0.16).toFixed(1)}" fill="${suave}"`)); y += Math.round(F * 1.7); }
  if (o.titulo) { linhas.push(T(mx, y, o.titulo.toUpperCase(), `font-family='${fonte}' font-size="${Math.round(F * 2.1)}" letter-spacing="1.5" fill="${tinta}"`)); y += Math.round(F * 2.1); }
  if (o.sub) { linhas.push(T(mx, y, o.sub, `font-family='${fonte}' font-size="${Math.round(F * 1.05)}" font-style="italic" fill="${suave}"`)); y += Math.round(F * 1.5); }
  linhas.push(`<rect x="${mx}" y="${y}" width="${Math.round(colW * 0.16)}" height="2" fill="${ouro}"/>`); y += Math.round(F * 1.9);

  // epígrafe (itálico, recuada)
  if (o.epigrafe) {
    for (const l of quebrar(o.epigrafe, maxChars - 6)) { linhas.push(T(mx + Math.round(colW * 0.04), y, l, `font-family='${fonte}' font-size="${Math.round(F * 0.98)}" font-style="italic" fill="${suave}"`)); y += Math.round(LH * 0.92); }
    y += Math.round(F * 0.9);
  }

  // corpo justificado
  const paras = Array.isArray(o.paras) ? o.paras : [String(o.corpo || '')];
  const fundo = H - Math.round(H * 0.11);
  for (let pi = 0; pi < paras.length && y < fundo; pi++) {
    const ls = quebrar(paras[pi], maxChars);
    for (let i = 0; i < ls.length && y < fundo; i++) {
      const ultimo = i === ls.length - 1;
      const just = ultimo ? '' : ` textLength="${colW}" lengthAdjust="spacing"`;
      linhas.push(T(mx, y, ls[i], `font-family='${fonte}' font-size="${F}" fill="${tinta}"${just}`));
      y += LH;
    }
    y += Math.round(LH * 0.5); // espaço entre parágrafos
  }

  // número de página
  linhas.push(T(Math.round(W / 2), H - Math.round(H * 0.06), String(o.numero != null ? o.numero : ''), `font-family='${fonte}' font-size="${Math.round(F * 0.85)}" font-style="italic" fill="${suave}" text-anchor="middle"`));

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${papel}"/>
  <rect width="${W}" height="${H}" fill="#000" opacity="0.015"/>
  ${linhas.join('\n  ')}
</svg>`;
}

module.exports = { paginaLivroSVG, quebrar };
