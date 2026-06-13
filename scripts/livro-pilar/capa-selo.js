// Capa do pilar (proposta com lógica de mercado): tipografia-heroína, serif de
// alto contraste, título em dourado-foil, ornamento tipográfico discreto, fundo
// índigo/ameixa profundo com luz e textura, moldura de colecionável. Sem IA,
// sem caras, sem ícones. Molde da coleção (muda cor/título nos filhos).
// Uso: node capa-selo.js [out.png]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'livro-pilar', 'capa-composta.png');

const T = {
  selo: 'MÉTODO VS · VER E SOLTAR',
  l1: 'OS SETE',
  l2: 'VÉUS',
  sub: 'Vê o que te prende.\nSolta o que te faz repetir.',
  autora: 'VIVIANNE DOS SANTOS',
};

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url('data:font/woff2;base64,${b64}') format('woff2');}`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal'],
  ['Fraunces', 500, 'normal', 'fraunces-latin-500-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

const subHtml = T.sub.split('\n').join('<br>');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1400px;height:1873px;position:relative;overflow:hidden;
  background:linear-gradient(168deg,#2C2046 0%, #1A1130 46%, #0C0816 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
/* luz quente alta (profundidade, sem forma) */
.luz{position:absolute;top:-14%;left:50%;transform:translateX(-50%);width:1100px;height:1100px;
  background:radial-gradient(circle, rgba(235,215,154,0.22) 0%, rgba(216,178,90,0.07) 38%, transparent 66%);}
/* grão fino */
.grao{position:absolute;inset:0;opacity:0.06;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");}
.vinheta{position:absolute;inset:0;background:radial-gradient(125% 80% at 50% 40%, transparent 56%, rgba(6,4,12,0.62) 100%);}
.moldura{position:absolute;inset:62px;border:1.4px solid rgba(216,178,90,0.42);}
.moldura::after{content:'';position:absolute;inset:12px;border:0.8px solid rgba(216,178,90,0.18);}

.selo{position:relative;font-family:'Outfit',sans-serif;font-weight:500;font-size:24px;
  letter-spacing:.46em;color:#E6CE8E;opacity:.95;}
.diamante{position:relative;color:#D8B25A;font-size:26px;line-height:1;margin:34px 0 50px;opacity:.9;}
.titulo{position:relative;font-family:'Fraunces',serif;font-weight:400;font-size:150px;line-height:0.96;
  letter-spacing:.015em;
  background:linear-gradient(180deg,#F3E3B0 0%, #E2BE6B 42%, #C79A45 70%, #EBD79A 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 2px 18px rgba(216,178,90,0.18));}
.regua{position:relative;width:180px;height:1px;background:#D8B25A;opacity:.75;margin:56px 0;}
.sub{position:relative;font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:43px;
  line-height:1.5;color:#F4ECDD;opacity:.94;}
.autora{position:absolute;bottom:126px;left:0;right:0;font-family:'Outfit',sans-serif;font-weight:500;
  font-size:23px;letter-spacing:.4em;color:#E6CE8E;opacity:.92;}
</style></head><body>
<div class="luz"></div>
<div class="grao"></div>
<div class="vinheta"></div>
<div class="moldura"></div>
<div class="selo">${T.selo}</div>
<div class="diamante">&#9670;</div>
<div class="titulo">${T.l1}<br>${T.l2}</div>
<div class="regua"></div>
<div class="sub">${subHtml}</div>
<div class="autora">${T.autora}</div>
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
  console.log('capa:', OUT);
})();
