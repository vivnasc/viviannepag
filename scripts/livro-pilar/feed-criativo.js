// Criativos de FEED do pilar (1080x1350): o trabalho deles é parar o scroll.
// Diferente da capa (que é premium/estante). Tipografia forte + gancho + CTA.
// Sem IA. Uso: node feed-criativo.js <preset> <out.png>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PRESET = process.argv[2] || 'escuro-1';
const OUT = process.argv[3] || `/tmp/feed-${PRESET}.png`;

const C = {
  indigo: '#1B1430', indigoBaixo: '#120D1F', ouro: '#D8B25A', ouroClaro: '#EBD79A',
  creme: '#F4ECDD', cremeBg: '#F3E9D6', tinta: '#1B1430',
};

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url('data:font/woff2;base64,${b64}') format('woff2');}`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 500, 'normal', 'fraunces-latin-500-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

function emblema(cor, px) {
  const cx = 200, baseY = 440; let a = '';
  for (let i = 0; i < 7; i++) {
    const hw = 150 - i * 21, apex = 84 + i * 15, op = (0.95 - i * 0.08).toFixed(2), sw = (3 - i * 0.28).toFixed(2);
    a += `<path d="M ${cx - hw} ${baseY} Q ${cx - hw} ${apex} ${cx} ${apex} Q ${cx + hw} ${apex} ${cx + hw} ${baseY}" fill="none" stroke="${cor}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
  }
  return `<svg viewBox="0 0 400 480" width="${px}" height="${px * 1.2}"><circle cx="200" cy="58" r="7" fill="${cor}"/>${a}<line x1="44" y1="440" x2="356" y2="440" stroke="${cor}" stroke-width="1.4" opacity="0.7"/></svg>`;
}

// presets: gancho (palavras dela), sub, e tema claro/escuro
const PRESETS = {
  'escuro-1': { tema: 'escuro', gancho: 'Vês o que te faz mal.<br>E voltas a fazê-lo.', sub: 'Não é fraqueza. É um véu.' },
  'claro-1':  { tema: 'claro',  gancho: 'Vês o que te faz mal.<br>E voltas a fazê-lo.', sub: 'Não é fraqueza. É um véu.' },
  'escuro-2': { tema: 'escuro', gancho: 'Sete véus entre ti<br>e quem realmente és.', sub: 'Vê. Solta. Um véu de cada vez.' },
};
const P = PRESETS[PRESET] || PRESETS['escuro-1'];
const escuro = P.tema === 'escuro';
const bg = escuro ? `linear-gradient(165deg, ${C.indigo}, ${C.indigoBaixo})` : C.cremeBg;
const corTitulo = escuro ? C.creme : C.tinta;
const corMarca = escuro ? C.ouroClaro : C.ouro;
const corEmblema = C.ouro;
const corSub = escuro ? C.ouroClaro : C.ouro;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${bg};
  font-family:'Fraunces',serif;display:flex;flex-direction:column;align-items:center;}
.moldura{position:absolute;inset:40px;border:1.4px solid ${corMarca};opacity:.45;}
.topo{margin-top:96px;display:flex;flex-direction:column;align-items:center;gap:18px;}
.marca{font-family:'Outfit',sans-serif;font-weight:500;font-size:21px;letter-spacing:.4em;color:${corMarca};}
.gancho{margin-top:54px;text-align:center;color:${corTitulo};font-weight:300;font-size:78px;line-height:1.12;letter-spacing:-.01em;padding:0 70px;}
.gancho b{font-weight:500;}
.sub{margin-top:40px;text-align:center;font-style:italic;font-weight:300;font-size:38px;color:${corSub};}
.rodape{position:absolute;bottom:84px;left:0;right:0;text-align:center;}
.cta{font-family:'Outfit',sans-serif;font-weight:500;font-size:24px;letter-spacing:.32em;color:${corTitulo};opacity:.9;}
.cta .liv{color:${corMarca};}
</style></head><body>
<div class="moldura"></div>
<div class="topo">
  ${emblema(corEmblema, 120)}
  <div class="marca">MÉTODO VS · VER E SOLTAR</div>
</div>
<div class="gancho">${P.gancho}</div>
<div class="sub">${P.sub}</div>
<div class="rodape"><div class="cta"><span class="liv">OS SETE VÉUS</span> &nbsp;·&nbsp; LINK NA BIO</div></div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('feed criativo:', OUT);
})();
