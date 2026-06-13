// Capa DESENHADA do pilar (conceito selo/sistema): emblema do véu + tipografia
// + fundo texturado. Sem IA: tudo SVG/CSS, renderizado por Puppeteer.
// Pensada como MOLDE da coleção: muda-se a cor e o título para cada livro-filho.
// Uso: node capa-selo.js [out.png]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'livro-pilar', 'capa-composta.png');

// >>> identidade da capa (mudar aqui para os filhos) <<<
const T = {
  selo: 'MÉTODO VS · VER E SOLTAR',
  titulo: 'OS SETE VÉUS',
  sub: 'Vê o que te prende.\nSolta o que te faz repetir.',
  autora: 'VIVIANNE DOS SANTOS',
};
// paleta (do véu)
const COR = {
  fundoTopo: '#211733', fundoBaixo: '#130E1F', ouro: '#D8B25A', ouroClaro: '#EBD79A',
  creme: '#F4ECDD', tenue: 'rgba(235,215,154,0.50)',
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
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 400, 'normal', 'outfit-latin-400-normal'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

// EMBLEMA: sete véus (arcos apontados aninhados) a abrir para uma luz no ápice;
// é véu e é limiar (porta de entrada). Desenhado por geometria.
function emblema() {
  const cx = 200, baseY = 440;
  let arcos = '';
  for (let i = 0; i < 7; i++) {
    const hw = 150 - i * 21;
    const apex = 84 + i * 15;
    const op = (0.95 - i * 0.07).toFixed(2);
    const sw = (3.0 - i * 0.28).toFixed(2);
    arcos += `<path d="M ${cx - hw} ${baseY} Q ${cx - hw} ${apex} ${cx} ${apex} Q ${cx + hw} ${apex} ${cx + hw} ${baseY}" fill="none" stroke="${COR.ouro}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
  }
  return `<svg viewBox="0 0 400 480" width="560" height="672" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="50%" cy="14%" r="42%">
        <stop offset="0%" stop-color="${COR.ouroClaro}" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="${COR.ouro}" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="${COR.ouro}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="400" height="480" fill="url(#glow)"/>
    ${arcos}
    <line x1="44" y1="${baseY}" x2="356" y2="${baseY}" stroke="${COR.ouro}" stroke-width="1.4" opacity="0.7"/>
    <circle cx="${cx}" cy="58" r="7" fill="${COR.ouroClaro}"/>
    <circle cx="${cx}" cy="58" r="15" fill="none" stroke="${COR.ouroClaro}" stroke-width="1.1" opacity="0.55"/>
  </svg>`;
}

const subHtml = T.sub.split('\n').join('<br>');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1400px;height:1873px;position:relative;overflow:hidden;
  background:linear-gradient(170deg, ${COR.fundoTopo} 0%, ${COR.fundoBaixo} 100%);}
/* grão/textura subtil */
.grao{position:absolute;inset:0;opacity:0.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");}
/* vinheta */
.vinheta{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 36%, transparent 55%, rgba(8,5,14,0.55) 100%);}
/* moldura de coleção */
.moldura{position:absolute;inset:60px;border:1.5px solid ${COR.tenue};}
.moldura::after{content:'';position:absolute;inset:10px;border:0.8px solid rgba(235,215,154,0.22);}
.selo{position:absolute;top:150px;left:0;right:0;text-align:center;
  font-family:'Outfit',sans-serif;font-weight:500;font-size:23px;letter-spacing:.42em;color:${COR.ouroClaro};opacity:.92;}
.emblema{position:absolute;top:300px;left:0;right:0;display:flex;justify-content:center;}
.titulo{position:absolute;top:1010px;left:0;right:0;text-align:center;color:${COR.creme};
  font-family:'Fraunces',serif;font-weight:300;font-size:108px;line-height:1.0;letter-spacing:.02em;}
.regua{position:absolute;top:1180px;left:50%;transform:translateX(-50%);width:160px;height:1px;background:${COR.ouro};opacity:.7;}
.sub{position:absolute;top:1230px;left:0;right:0;text-align:center;
  font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:38px;line-height:1.5;color:${COR.creme};opacity:.92;}
.autora{position:absolute;bottom:120px;left:0;right:0;text-align:center;
  font-family:'Outfit',sans-serif;font-weight:500;font-size:22px;letter-spacing:.36em;color:${COR.ouroClaro};opacity:.9;}
</style></head><body>
<div class="grao"></div>
<div class="vinheta"></div>
<div class="moldura"></div>
<div class="selo">${T.selo}</div>
<div class="emblema">${emblema()}</div>
<div class="titulo">${T.titulo}</div>
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
  console.log('capa selo:', OUT);
})();
