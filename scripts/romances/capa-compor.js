// Compõe a capa final do romance: imagem escolhida (Replicate) + tipografia da casa.
// Uso: node capa-compor.js <capa-src.jpg> <pt|en> <out.png>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SRC = process.argv[2];
const LANG = process.argv[3] || 'pt';
const OUT = process.argv[4];

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face { font-family:'${fam}'; font-weight:${w}; font-style:${st}; src:url('data:font/woff2;base64,${b64}') format('woff2'); }`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 600, 'normal', 'fraunces-latin-600-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

const T = LANG === 'pt' ? {
  serie: 'BIBLIOTECA DE VÉSPERA',
  t1: 'As Mãos', t2: 'de Amparo',
  sub: 'um romance de Véspera',
  autora: 'VIVIANNE DOS SANTOS',
} : {
  serie: 'THE VÉSPERA LIBRARY',
  t1: "Amparo's", t2: 'Hands',
  sub: 'a novel of Véspera',
  autora: 'VIVIANNE DOS SANTOS',
};

const imgB64 = fs.readFileSync(SRC).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1400px; height:1873px; position:relative; overflow:hidden; background:#2E3A52; }
.bg { position:absolute; inset:0; background:url('data:image/jpeg;base64,${imgB64}') center/cover; }
.scrim-top { position:absolute; top:0; left:0; right:0; height:480px;
  background:linear-gradient(to bottom, rgba(24,20,34,.62) 0%, rgba(24,20,34,.34) 55%, transparent 100%); }
.scrim-bot { position:absolute; bottom:0; left:0; right:0; height:230px;
  background:linear-gradient(to top, rgba(24,20,34,.66) 0%, transparent 100%); }
.serie { position:absolute; top:58px; left:0; right:0; text-align:center;
  font-family:'Outfit',sans-serif; font-weight:500; font-size:21px; letter-spacing:.34em; color:#D7DCC8; opacity:.95; }
.titulo { position:absolute; top:102px; left:0; right:0; text-align:center; color:#F6EDE0;
  font-family:'Fraunces',serif; font-weight:300; font-size:106px; line-height:1.04; letter-spacing:-.015em;
  text-shadow:0 2px 26px rgba(18,14,26,.55); }
.titulo .l2 { font-weight:600; }
.sub { position:absolute; top:354px; left:0; right:0; text-align:center;
  font-family:'Fraunces',serif; font-style:italic; font-weight:300; font-size:30px; color:#EFE2CF; opacity:.95;
  text-shadow:0 1px 14px rgba(18,14,26,.5); }
.autora { position:absolute; bottom:50px; left:0; right:0; text-align:center;
  font-family:'Outfit',sans-serif; font-weight:500; font-size:25px; letter-spacing:.30em; color:#F6EDE0;
  text-shadow:0 1px 12px rgba(18,14,26,.65); }
</style></head><body>
<div class="bg"></div>
<div class="scrim-top"></div>
<div class="scrim-bot"></div>
<div class="serie">${T.serie}</div>
<div class="titulo">${T.t1}<br><span class="l2">${T.t2}</span></div>
<div class="sub">${T.sub}</div>
<div class="autora">${T.autora}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1873 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('capa composta:', OUT);
})();
