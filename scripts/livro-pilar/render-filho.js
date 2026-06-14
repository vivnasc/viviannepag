// Render genérico de um método-filho (PT ou EN): lê o markdown, monta rosto +
// ficha + sumário + corpo em A5. Deteta o idioma pelo nome (-EN).
// Uso: node render-filho.js <ficheiro.md> <saida.pdf>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');

const SRC = process.argv[2];
const OUT = process.argv[3];
if (!SRC || !OUT) { console.error('uso: node render-filho.js <md> <pdf>'); process.exit(1); }
const LANG = /-EN\.md$/i.test(SRC) ? 'en' : 'pt';

const raw = fs.readFileSync(SRC, 'utf8');
const titulo = (raw.match(/^# (.+)$/m) || [, ''])[1].trim();
const sub = (raw.match(/^### (.+)$/m) || [, ''])[1].trim();
// corpo: tira o bloco de título (# , ### , *linha de assinatura*)
let corpoMd = raw
  .replace(/^# .*\n/m, '')
  .replace(/^### .*\n/m, '')
  .replace(/^\*.*\*\s*\n/m, '')
  .replace(/^---\s*\n/m, '')
  .trim();

const META = LANG === 'en'
  ? { selo: 'Method VS · See and Release', autora: 'Vivianne dos Santos', sumarioLabel: 'Contents', sumarioTit: 'Contents',
      ficha: 'A method-child of Method VS · See and Release, by Vivianne dos Santos. This book understands, but it does not replace care: in the deeper matters, seek support. You deserve the same care you give.' }
  : { selo: 'Método VS · Ver e Soltar', autora: 'Vivianne dos Santos', sumarioLabel: 'Conteúdo', sumarioTit: 'Sumário',
      ficha: 'Um método-filho do Método VS · Ver e Soltar, por Vivianne dos Santos. Este livro compreende, mas não substitui acompanhamento: nos temas mais fundos, procura apoio. Mereces o mesmo cuidado que dás.' };

const C = { violeta: '#3A3357', ouro: '#B98D3E', ouroClaro: '#C9A24B', creme: '#F4ECDD', texto: '#2A2536', textoSuave: '#5A5468', salvia: '#8A8FA3' };

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url('data:font/woff2;base64,${b64}') format('woff2');}`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'], ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal'],
  ['Fraunces', 500, 'normal', 'fraunces-latin-500-normal'], ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Fraunces', 400, 'italic', 'fraunces-latin-400-italic'], ['Outfit', 400, 'normal', 'outfit-latin-400-normal'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

const sumario = [];
corpoMd.replace(/^## (.+)$/gm, (_, t) => { sumario.push(t.trim()); return _; });
const corpoHtml = marked.parse(corpoMd);

const html = `<!DOCTYPE html><html lang="${LANG}"><head><meta charset="UTF-8"><style>
${FONTS}
@page { size: A5; margin: 21mm 18mm 24mm 18mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Fraunces',Georgia,serif; font-weight:300; font-size:11pt; line-height:1.85; color:${C.texto}; }
.rosto { page-break-after:always; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:88vh; text-align:center; }
.rosto .selo { font-family:'Outfit',sans-serif; font-size:7.5pt; letter-spacing:.28em; text-transform:uppercase; color:${C.salvia}; margin-bottom:13mm; }
.rosto h1 { font-weight:300; font-size:32pt; line-height:1.08; color:${C.violeta}; letter-spacing:-.015em; margin-bottom:5mm; }
.rosto .sub { font-style:italic; font-size:12pt; color:${C.textoSuave}; margin-bottom:12mm; max-width:80%; }
.rosto .ponto { color:${C.ouro}; font-size:24pt; margin-bottom:11mm; }
.rosto .autora { font-family:'Outfit',sans-serif; font-size:9pt; letter-spacing:.24em; text-transform:uppercase; color:${C.texto}; }
.ficha-page { page-break-after:always; display:flex; align-items:center; justify-content:center; min-height:80vh; }
.ficha-box { border-top:.5pt solid ${C.salvia}80; border-bottom:.5pt solid ${C.salvia}80; padding:10mm 2mm; }
.ficha-text { font-weight:300; font-style:italic; font-size:9.5pt; line-height:1.75; color:${C.textoSuave}; text-align:center; }
.sumario { page-break-after:always; min-height:80vh; padding-top:6mm; }
.sumario-label { font-family:'Outfit',sans-serif; font-size:8pt; letter-spacing:.32em; text-transform:uppercase; color:${C.salvia}; margin-bottom:4mm; }
.sumario h2 { font-weight:300; font-size:22pt; color:${C.violeta}; margin-bottom:10mm; }
.sumario ol { list-style:none; } .sumario li { padding:2.6mm 0; border-bottom:.3pt solid ${C.ouroClaro}33; font-size:10.5pt; color:${C.texto}; }
.corpo h2 { page-break-before:always; text-align:center; font-weight:300; font-size:21pt; color:${C.violeta}; line-height:1.15; margin:8mm 0 9mm; }
.corpo h3 { text-align:center; font-weight:400; font-style:italic; font-size:15pt; color:${C.violeta}; margin:11mm 0 6mm; page-break-after:avoid; }
.corpo p { margin-bottom:4mm; text-align:justify; hyphens:auto; -webkit-hyphens:auto; orphans:3; widows:3; }
.corpo h2 + p::first-letter, .corpo blockquote + p::first-letter { font-family:'Fraunces',serif; font-weight:300; font-size:46pt; line-height:.86; color:${C.ouro}; float:left; margin:0 3mm -2mm 0; padding-top:1mm; }
.corpo strong { font-weight:500; color:${C.violeta}; } .corpo em { font-style:italic; color:${C.texto}; }
.corpo blockquote { margin:7mm auto 8mm; max-width:86%; text-align:center; font-style:italic; font-size:12pt; line-height:1.5; color:${C.ouro}; }
.corpo blockquote p { text-align:center; margin:0; } .corpo blockquote em { color:${C.ouro}; }
.corpo hr { border:none; text-align:center; margin:9mm auto; height:8mm; line-height:8mm; }
.corpo hr::before { content:'· · ·'; color:${C.salvia}; font-size:13pt; letter-spacing:.4em; opacity:.7; }
.corpo ol, .corpo ul { margin:0 0 4mm 6mm; } .corpo li { margin-bottom:2mm; }
</style></head><body>
<div class="rosto"><div class="selo">${META.selo}</div><h1>${titulo}</h1><p class="sub">${sub}</p><div class="ponto">·</div><p class="autora">${META.autora}</p></div>
<div class="ficha-page"><div class="ficha-box"><p class="ficha-text">${META.ficha}</p></div></div>
<div class="sumario"><div class="sumario-label">${META.sumarioLabel}</div><h2>${META.sumarioTit}</h2><ol>${sumario.map(t => `<li>${t}</li>`).join('')}</ol></div>
<div class="corpo">${corpoHtml}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const buf = await page.pdf({ format: 'A5', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Outfit,sans-serif;font-size:7pt;color:#5A546880;"><span class="pageNumber"></span></div>`,
    margin: { top: '21mm', right: '18mm', bottom: '24mm', left: '18mm' } });
  await browser.close();
  fs.writeFileSync(OUT, buf);
  console.log('filho:', OUT, Math.round(buf.length / 1024) + ' KB');
})();
