// Gera cartões de frase (posts) na arte da marca: o gancho da dor em Fraunces
// sobre o índigo+ouro, com o handle da conta. Formato 4:5 (1080x1350), feed.
// Reutilizável para as pautas seguintes. Uso: node scripts/conteudo/post-frase.js [pasta-saida]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = process.argv[2] || '/tmp/posts';

// A dor na 1.ª pessoa (a voz interior), por conta. Espelha o glossário.
const CARTOES = [
  { slug: 'ver-soltar', handle: '@ver.soltar', frase: 'Não consigo desligar a cabeça.', topo: '#241F44', baixo: '#0E0B1A' },
  { slug: 'vir-soltar', handle: '@vir.soltar', frase: 'Faço tudo por toda a gente, e sinto culpa quando penso em mim.', topo: '#33233C', baixo: '#160E1A' },
  { slug: 'viver-soltar', handle: '@viver.soltar', frase: 'Estou sempre à espera que a minha vida comece.', topo: '#2A2342', baixo: '#100C1C' },
];

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
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map((a) => fontFace(...a)).join('\n');

function html(c) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1080px;height:1350px;position:relative;overflow:hidden;
  background:linear-gradient(168deg, ${c.topo} 0%, ${c.baixo} 100%);
  font-family:'Fraunces',serif;}
.moldura{position:absolute;inset:48px;border:1.2px solid rgba(216,178,90,0.38);}
.moldura::after{content:'';position:absolute;inset:11px;border:0.7px solid rgba(216,178,90,0.16);}
.selo{position:absolute;top:104px;left:0;right:0;text-align:center;
  font-family:'Outfit',sans-serif;font-weight:500;font-size:20px;letter-spacing:.4em;color:#E6CE8E;opacity:.9;}
.frase{position:absolute;left:110px;right:110px;top:50%;transform:translateY(-50%);text-align:center;
  font-weight:300;font-size:74px;line-height:1.22;letter-spacing:.005em;color:#F4ECDD;}
.regua{position:absolute;left:50%;transform:translateX(-50%);bottom:210px;width:120px;height:1px;background:#D8B25A;opacity:.7;}
.handle{position:absolute;bottom:150px;left:0;right:0;text-align:center;
  font-family:'Outfit',sans-serif;font-weight:500;font-size:24px;letter-spacing:.18em;color:#E6CE8E;}
.metodo{position:absolute;bottom:108px;left:0;right:0;text-align:center;
  font-family:'Outfit',sans-serif;font-weight:500;font-size:16px;letter-spacing:.34em;color:#F4ECDD;opacity:.55;}
</style></head><body>
<div class="moldura"></div>
<div class="selo">MÉTODO VS · VER E SOLTAR</div>
<div class="frase">${c.frase}</div>
<div class="regua"></div>
<div class="handle">${c.handle}</div>
<div class="metodo">O PRIMEIRO PASSO NA BIO ↓</div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  for (const c of CARTOES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350 });
    await page.setContent(html(c), { waitUntil: 'load' });
    await page.evaluateHandle('document.fonts.ready');
    const f = path.join(OUT, `post-${c.slug}.png`);
    await page.screenshot({ path: f });
    await page.close();
    console.log('cartão:', f);
  }
  await browser.close();
})();
