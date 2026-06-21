// Compõe a capa final do romance: imagem escolhida (Replicate) + tipografia da casa.
// Uso: node capa-compor.js <capa-src.jpg> <pt|en> <out.png> [livro]
//   livro: amparo (predefinido) | irma
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SRC = process.argv[2];
const LANG = process.argv[3] || 'pt';
const OUT = process.argv[4];
const LIVRO = process.argv[5] || 'amparo';

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

const TEXTOS = {
  amparo: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · I', t1: 'As Mãos', t2: 'de Amparo', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · I', t1: "Amparo's", t2: 'Hands', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  irma: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · II', t1: 'O Nome', t2: 'da Irmã', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · II', t1: "The Sister's", t2: 'Name', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  caderno: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · III', t1: 'O Caderno', t2: 'das Dívidas', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · III', t1: 'The Ledger', t2: 'of Debts', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  cheias: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · IV', t1: 'O Homem', t2: 'das Cheias', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · IV', t1: 'The Man the', t2: 'Floods Brought', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  incomodo: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · V', t1: 'Nenhum', t2: 'Incómodo', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · V', t1: 'No Trouble', t2: 'at All', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  frio: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VI', t1: 'A Mulher Que', t2: 'Nunca Teve Frio', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VI', t1: 'The Woman Who', t2: 'Never Felt the Cold', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  fabrica: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VII', t1: 'Enquanto a', t2: 'Fábrica Dorme', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VII', t1: 'While the', t2: 'Mill Sleeps', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  tradutora: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · I', t1: 'A', t2: 'Tradutora', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · I', t1: 'The', t2: 'Translator', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  sentinela: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · I', t1: 'A', t2: 'Sentinela', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · I', t1: 'The', t2: 'Sentinel', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  ferrolho: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · I', t1: 'O', t2: 'Ferrolho', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · I', t1: 'The', t2: 'Bolt', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  estrada: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · II', t1: 'A Estrada', t2: 'Nova', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · II', t1: 'The New', t2: 'Road', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  portas: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · II', t1: 'As Portas', t2: 'Baixas', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · II', t1: 'The Low', t2: 'Doors', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  despensa: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · III', t1: 'A Despensa', t2: 'Cheia', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · III', t1: 'The Full', t2: 'Pantry', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  presente: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · III', t1: 'O Presente', t2: 'por Abrir', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · III', t1: 'The Unopened', t2: 'Gift', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  casa: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · IV', t1: 'A Casa', t2: 'por Acabar', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · IV', t1: 'The Unfinished', t2: 'House', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  trovoada: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · IV', t1: 'A', t2: 'Trovoada', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · IV', t1: 'The', t2: 'Thunderstorm', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  trave: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · V', t1: 'A', t2: 'Trave-Mestra', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · V', t1: 'The Master', t2: 'Beam', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  estrangeira: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · V', t1: 'A Estrangeira', t2: 'de Cá', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · V', t1: 'The Foreigner', t2: 'from Here', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  cisterna: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VI', t1: 'A', t2: 'Cisterna', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VI', t1: 'The', t2: 'Cistern', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  travessas: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VI', t1: 'As Travessas', t2: 'Devolvidas', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VI', t1: 'The Returned', t2: 'Dishes', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  chave: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VII', t1: 'A Chave', t2: 'da Fábrica', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VII', t1: 'The Key', t2: 'to the Mill', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
  manta: {
    pt: { serie: 'BIBLIOTECA DE VÉSPERA · VII', t1: 'A Manta', t2: 'Sem Nome', sub: 'romance', autora: 'VIVIANNE DOS SANTOS' },
    en: { serie: 'THE VÉSPERA LIBRARY · VII', t1: 'The Unsigned', t2: 'Blanket', sub: 'a novel', autora: 'VIVIANNE DOS SANTOS' },
  },
};
const entry = TEXTOS[LIVRO];
if (!entry) {
  console.error(`capa-compor: não há TEXTOS para o livro '${LIVRO}'. Adiciona-o ao mapa (senão a capa sairia com o título do Amparo).`);
  process.exit(1);
}
const T = entry[LANG === 'en' ? 'en' : 'pt'];

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
  font-family:'Outfit',sans-serif; font-weight:500; font-size:19px; letter-spacing:.34em; color:#F6EDE0;
  text-shadow:0 1px 12px rgba(18,14,26,.65); }
</style></head><body>
<div class="bg"></div>
<div class="scrim-top"></div>
<div class="scrim-bot"></div>
<div class="serie">${T.autora}</div>
<div class="titulo">${T.t1}<br><span class="l2">${T.t2}</span></div>
<div class="sub">${T.sub}</div>
<div class="autora">${T.serie}</div>
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
