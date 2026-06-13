// Edição final do livro-pilar Os Sete Véus: capa composta + miolo A5.
// Lê OS-7-VEUS-v2.md (raiz), monta o miolo (rosto, ficha, sumário, corpo,
// fecho) e sobrepõe a capa composta como primeira página.
// Uso: node render-livro.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const { PDFDocument } = require('pdf-lib');

const RAIZ = path.join(__dirname, '..', '..');
const FONTE = path.join(RAIZ, 'OS-7-VEUS-v2.md');
const CAPA = path.join(RAIZ, 'livro-pilar', 'capa-composta.png');
const OUT = path.join(RAIZ, 'livro-pilar', 'OS-SETE-VEUS-pt.pdf');

// textos da casa (espelham a capa)
const META = {
  selo: 'Método VS · Ver e Soltar',
  titulo: 'Os Sete Véus',
  sub: 'Vê o que te prende. Solta o que te faz repetir.',
  autora: 'Vivianne dos Santos',
  edicao: 'Segunda edição',
  ficha: 'Os Sete Véus, segunda edição. Reescrita e ampliada na voz do Método VS · Ver e Soltar. Este livro compreende, mas não substitui acompanhamento: nos temas mais fundos, procura apoio. Mereces o mesmo cuidado que dás.',
  finalTit: 'Para ti, que leste',
  finalTxt: 'Se algum véu se ergueu um pouco enquanto lias, partilha este livro, não como prova, mas como semente. Encontras o resto do caminho em viviannedossantos.com.',
  copy: '© 2026 Vivianne dos Santos · viviannedossantos.com',
};

// paleta do véu
const C = {
  noite: '#1E1B2E', violeta: '#3A3357', ouro: '#B98D3E', ouroClaro: '#C9A24B',
  creme: '#F4ECDD', texto: '#2A2536', textoSuave: '#5A5468', salvia: '#8A8FA3',
};

function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face { font-family:'${fam}'; font-weight:${w}; font-style:${st}; src:url('data:font/woff2;base64,${b64}') format('woff2'); }`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal'],
  ['Fraunces', 500, 'normal', 'fraunces-latin-500-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Fraunces', 400, 'italic', 'fraunces-latin-400-italic'],
  ['Outfit', 400, 'normal', 'outfit-latin-400-normal'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map(a => fontFace(...a)).join('\n');

// símbolo: véu (arco simples a erguer-se)
function veu(px, cor = C.ouro) {
  return `<svg viewBox="0 0 512 512" width="${px}" height="${px}">
    <path d="M120 380 C120 220 180 120 256 120 C332 120 392 220 392 380" fill="none" stroke="${cor}" stroke-width="11" stroke-linecap="round"/>
    <path d="M168 392 C168 268 206 196 256 196 C306 196 344 268 344 392" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
    <circle cx="256" cy="92" r="9" fill="${cor}"/>
  </svg>`;
}

// --- ler e separar o markdown ---
const raw = fs.readFileSync(FONTE, 'utf8');
// corta o bloco de título (tudo até ao primeiro separador ---)
const sep = raw.indexOf('\n---\n');
const corpoMd = (sep >= 0 ? raw.slice(sep + 5) : raw).trim();

// sumário: todos os títulos de nível 2 (## ...)
const sumarioItens = [];
corpoMd.replace(/^## (.+)$/gm, (_, t) => { sumarioItens.push(t.trim()); return _; });
const sumarioHtml = sumarioItens.map((t) => `<li>${t}</li>`).join('');

const corpoHtml = marked.parse(corpoMd);

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  ${FONTS}
  @page { size: A5; margin: 21mm 18mm 24mm 18mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Fraunces', Georgia, serif; font-weight: 300; font-size: 11pt;
    line-height: 1.85; color: ${C.texto}; background: #FFFFFF;
  }

  /* rosto */
  .rosto {
    page-break-after: always; display: flex; flex-direction: column;
    align-items: center; justify-content: center; min-height: 88vh; text-align: center;
  }
  .rosto .selo {
    font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 7.5pt;
    letter-spacing: 0.28em; text-transform: uppercase; color: ${C.salvia}; margin-bottom: 13mm;
  }
  .rosto h1 { font-weight: 300; font-size: 34pt; line-height: 1.08; color: ${C.violeta}; letter-spacing: -0.015em; margin-bottom: 5mm; }
  .rosto .sub { font-style: italic; font-size: 11.5pt; color: ${C.textoSuave}; margin-bottom: 12mm; max-width: 78%; }
  .rosto .orn { margin-bottom: 11mm; }
  .rosto .autora { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 9pt; letter-spacing: 0.24em; text-transform: uppercase; color: ${C.texto}; }
  .rosto .edicao { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 7pt; letter-spacing: 0.3em; text-transform: uppercase; color: ${C.salvia}; margin-top: 5mm; }

  /* ficha */
  .ficha-page { page-break-after: always; display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 6mm 0; }
  .ficha-box { border-top: 0.5pt solid ${C.salvia}80; border-bottom: 0.5pt solid ${C.salvia}80; padding: 10mm 2mm; }
  .ficha-text { font-weight: 300; font-style: italic; font-size: 9.5pt; line-height: 1.75; color: ${C.textoSuave}; text-align: center; }

  /* sumário */
  .sumario { page-break-after: always; min-height: 80vh; padding-top: 6mm; }
  .sumario-label { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 8pt; letter-spacing: 0.32em; text-transform: uppercase; color: ${C.salvia}; margin-bottom: 4mm; }
  .sumario h2 { font-weight: 300; font-size: 22pt; color: ${C.violeta}; margin-bottom: 10mm; letter-spacing: -0.015em; }
  .sumario ol { list-style: none; }
  .sumario li { padding: 2.6mm 0; border-bottom: 0.3pt solid ${C.ouroClaro}33; font-weight: 400; font-size: 10.5pt; color: ${C.texto}; }

  /* corpo */
  .corpo h2 {
    page-break-before: always; text-align: center; font-weight: 300; font-size: 21pt;
    color: ${C.violeta}; line-height: 1.15; letter-spacing: -0.01em; margin: 8mm 0 9mm;
  }
  .corpo h3 {
    text-align: center; font-weight: 400; font-style: italic; font-size: 15pt;
    color: ${C.violeta}; margin: 11mm 0 6mm; page-break-after: avoid;
  }
  .corpo p { margin-bottom: 4mm; text-align: justify; hyphens: auto; -webkit-hyphens: auto; orphans: 3; widows: 3; }
  .corpo h2 + p::first-letter, .corpo blockquote + p::first-letter {
    font-family: 'Fraunces', serif; font-weight: 300; font-size: 46pt; line-height: 0.86;
    color: ${C.ouro}; float: left; margin: 0 3mm -2mm 0; padding-top: 1mm;
  }
  .corpo strong { font-weight: 500; color: ${C.violeta}; }
  .corpo em { font-style: italic; color: ${C.texto}; }
  .corpo blockquote {
    margin: 7mm auto 8mm; max-width: 86%; text-align: center;
    font-style: italic; font-size: 12pt; line-height: 1.5; color: ${C.ouro};
  }
  .corpo blockquote p { text-align: center; margin: 0; }
  .corpo blockquote em { color: ${C.ouro}; }
  .corpo hr { border: none; text-align: center; margin: 9mm auto; height: 8mm; line-height: 8mm; }
  .corpo hr::before { content: '· · ·'; color: ${C.salvia}; font-size: 13pt; letter-spacing: 0.4em; opacity: 0.7; }

  /* fecho */
  .final { page-break-before: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 85vh; text-align: center; }
  .final .orn { margin-bottom: 11mm; }
  .ponto { color: ${C.ouro}; font-size: 24pt; line-height: 1; }
  .rosto .orn { margin-bottom: 11mm; }
  .final h3 { font-style: italic; font-weight: 300; font-size: 18pt; color: ${C.violeta}; margin-bottom: 9mm; }
  .final p { font-weight: 300; font-size: 10pt; line-height: 1.7; color: ${C.textoSuave}; margin-bottom: 4mm; max-width: 80%; }
  .final-credits { margin-top: 14mm; font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 7.5pt; letter-spacing: 0.3em; text-transform: uppercase; color: ${C.salvia}; }
</style>
</head>
<body>

<div class="rosto">
  <div class="selo">${META.selo}</div>
  <h1>${META.titulo}</h1>
  <p class="sub">${META.sub}</p>
  <div class="orn"><span class="ponto">·</span></div>
  <p class="autora">${META.autora}</p>
  <p class="edicao">${META.edicao}</p>
</div>

<div class="ficha-page">
  <div class="ficha-box"><p class="ficha-text">${META.ficha}</p></div>
</div>

<div class="sumario">
  <div class="sumario-label">Conteúdo</div>
  <h2>Sumário</h2>
  <ol>${sumarioHtml}</ol>
</div>

<div class="corpo">
${corpoHtml}
</div>

<div class="final">
  <div class="orn"><span class="ponto">·</span></div>
  <h3>${META.finalTit}</h3>
  <p>${META.finalTxt}</p>
  <div class="final-credits">${META.copy}</div>
</div>

</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
  await page.evaluateHandle('document.fonts.ready');
  const mioloBuf = await page.pdf({
    format: 'A5', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Outfit,sans-serif;font-size:7pt;color:${C.textoSuave}80;"><span class="pageNumber"></span></div>`,
    margin: { top: '21mm', right: '18mm', bottom: '24mm', left: '18mm' },
  });
  await browser.close();

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const livro = await PDFDocument.create();
  const A5 = [419.53, 595.28];
  if (fs.existsSync(CAPA)) {
    const capaImg = await livro.embedPng(fs.readFileSync(CAPA));
    const capaPage = livro.addPage(A5);
    capaPage.drawImage(capaImg, { x: 0, y: 0, width: A5[0], height: A5[1] });
  }
  const miolo = await PDFDocument.load(mioloBuf);
  (await livro.copyPages(miolo, miolo.getPageIndices())).forEach((p) => livro.addPage(p));
  fs.writeFileSync(OUT, await livro.save());
  console.log('livro-pilar final:', OUT, Math.round(fs.statSync(OUT).size / 1024) + ' KB,', livro.getPageCount(), 'páginas');
})();
