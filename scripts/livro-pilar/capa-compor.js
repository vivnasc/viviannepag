// Compõe a capa final de qualquer um dos 4 livros: imagem escolhida (símbolo,
// sem texto) + tipografia. Layout ancorado em baixo: a imagem é o herói em cima,
// e o bloco de texto (selo + título + subtítulo + autora) agrupa-se na base
// sobre um degradê, para não ficar título a flutuar nem nome órfão. Os textos
// vêm de capas-textos.js (fonte única); o slug escolhe o livro.
// Uso: node capa-compor.js <capa-src.jpg> <out.png> [pt|en] [slug]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const TEXTOS = require('./capas-textos.js');

const SRC = process.argv[2];
const OUT = process.argv[3] || path.join(__dirname, '..', '..', 'livro-pilar', 'capa-composta.png');
const LANG = process.argv[4] === 'en' ? 'en' : 'pt';
const SLUG = process.argv[5] || 'os-7-veus';

const entrada = TEXTOS[SLUG] || TEXTOS['os-7-veus'];
const T = entrada[LANG];
const TITULO_PX = entrada.px || 142;

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face { font-family:'${fam}'; font-weight:${w}; font-style:${st}; src:url('data:font/woff2;base64,${b64}') format('woff2'); }`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal'],
  ['Fraunces', 600, 'normal', 'fraunces-latin-600-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

const imgB64 = fs.readFileSync(SRC).toString('base64');
const subHtml = T.sub.split('\n').join('<br>');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1400px; height:1873px; position:relative; overflow:hidden; background:#16101F; }
.bg { position:absolute; inset:0; background:url('data:image/jpeg;base64,${imgB64}') center/cover; }
/* degradê forte em baixo (assenta o bloco de texto) + véu leve no topo p/ o selo */
.scrim-bot { position:absolute; left:0; right:0; bottom:0; height:62%;
  background:linear-gradient(to top, rgba(12,8,20,0.92) 0%, rgba(12,8,20,0.78) 26%, rgba(12,8,20,0.32) 64%, transparent 100%); }
.scrim-top { position:absolute; left:0; right:0; top:0; height:200px;
  background:linear-gradient(to bottom, rgba(12,8,20,0.5) 0%, transparent 100%); }
/* moldura de coleção */
.moldura { position:absolute; inset:62px; border:1.4px solid rgba(216,178,90,0.42); pointer-events:none; }
.moldura::after { content:''; position:absolute; inset:12px; border:0.8px solid rgba(216,178,90,0.18); }

.selo-topo { position:absolute; top:118px; left:0; right:0; text-align:center;
  font-family:'Outfit',sans-serif; font-weight:500; font-size:22px; letter-spacing:.44em; color:#E6CE8E; opacity:.92; }

/* bloco de texto ancorado em baixo */
.bloco { position:absolute; left:0; right:0; bottom:150px; text-align:center; padding:0 80px; }
.titulo { font-family:'Fraunces',serif; font-weight:400; font-size:${TITULO_PX}px; line-height:0.96; letter-spacing:.012em;
  background:linear-gradient(180deg,#F3E3B0 0%, #E2BE6B 44%, #C79A45 72%, #EBD79A 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 2px 22px rgba(8,5,14,0.6)); }
.regua { width:180px; height:1px; background:#D8B25A; opacity:.75; margin:46px auto; }
.sub { font-family:'Fraunces',serif; font-style:italic; font-weight:300; font-size:42px; line-height:1.48;
  color:#F4ECDD; opacity:.95; text-shadow:0 1px 16px rgba(8,5,14,0.6); margin-bottom:54px; }
.autora { font-family:'Outfit',sans-serif; font-weight:500; font-size:23px; letter-spacing:.4em; color:#E6CE8E;
  text-shadow:0 1px 12px rgba(8,5,14,0.7); }
</style></head><body>
<div class="bg"></div>
<div class="scrim-top"></div>
<div class="scrim-bot"></div>
<div class="moldura"></div>
<div class="selo-topo">${T.selo}</div>
<div class="bloco">
  <div class="titulo">${T.t2 ? `${T.t1}<br>${T.t2}` : T.t1}</div>
  <div class="regua"></div>
  <div class="sub">${subHtml}</div>
  <div class="autora">${T.autora}</div>
</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1873 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('capa composta:', OUT);
})();
