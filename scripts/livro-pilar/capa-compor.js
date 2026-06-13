// Compõe a capa final do pilar: imagem escolhida (Replicate, sem texto) +
// tipografia da casa. Uso: node capa-compor.js <capa-src.jpg> <out.png>
// Os textos vivem aqui (editáveis): título, subtítulo, selo, autora.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SRC = process.argv[2];
const OUT = process.argv[3] || path.join(__dirname, '..', '..', 'livro-pilar', 'capa-composta.png');

// >>> textos da capa (mudar aqui se o título evoluir) <<<
const T = {
  selo: 'MÉTODO VS · VER E SOLTAR',
  t1: 'Os Sete',
  t2: 'Véus',
  sub: 'Vê o que te prende.\nSolta o que te faz repetir.',
  autora: 'VIVIANNE DOS SANTOS',
};

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

const imgB64 = fs.readFileSync(SRC).toString('base64');
const subHtml = T.sub.split('\n').join('<br>');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1400px; height:1873px; position:relative; overflow:hidden; background:#1E1B2E; }
.bg { position:absolute; inset:0; background:url('data:image/jpeg;base64,${imgB64}') center/cover; }
.scrim-top { position:absolute; top:0; left:0; right:0; height:620px;
  background:linear-gradient(to bottom, rgba(20,16,32,.66) 0%, rgba(20,16,32,.36) 55%, transparent 100%); }
.scrim-bot { position:absolute; bottom:0; left:0; right:0; height:260px;
  background:linear-gradient(to top, rgba(20,16,32,.72) 0%, transparent 100%); }
.selo { position:absolute; top:70px; left:0; right:0; text-align:center;
  font-family:'Outfit',sans-serif; font-weight:500; font-size:21px; letter-spacing:.34em; color:#E3C77E; opacity:.95; }
.titulo { position:absolute; top:120px; left:0; right:0; text-align:center; color:#F4ECDD;
  font-family:'Fraunces',serif; font-weight:300; font-size:124px; line-height:1.0; letter-spacing:-.015em;
  text-shadow:0 2px 30px rgba(14,10,22,.6); }
.titulo .l2 { font-weight:600; color:#E9D49A; }
.sub { position:absolute; top:418px; left:0; right:0; text-align:center;
  font-family:'Fraunces',serif; font-style:italic; font-weight:300; font-size:33px; line-height:1.5; color:#EFE6D4; opacity:.96;
  text-shadow:0 1px 16px rgba(14,10,22,.55); }
.autora { position:absolute; bottom:64px; left:0; right:0; text-align:center;
  font-family:'Outfit',sans-serif; font-weight:500; font-size:20px; letter-spacing:.34em; color:#F4ECDD;
  text-shadow:0 1px 14px rgba(14,10,22,.7); }
</style></head><body>
<div class="bg"></div>
<div class="scrim-top"></div>
<div class="scrim-bot"></div>
<div class="selo">${T.selo}</div>
<div class="titulo">${T.t1}<br><span class="l2">${T.t2}</span></div>
<div class="sub">${subHtml}</div>
<div class="autora">${T.autora}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1873 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('capa composta:', OUT);
})();
