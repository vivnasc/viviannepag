const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');
const { marked } = require('marked');

const EBOOK_PATH = path.join(__dirname, '..', 'content', 'produtos', 'ebook-01-culpa', 'ebook-01-culpa.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'produtos', 'ebook-01-culpa.pdf');

const COLORS = {
  barro: '#8C4A36',
  barroClaro: '#9A5A43',
  areia: '#F3E4D6',
  creme: '#F1E8DD',
  salvia: '#7D8A6A',
  texto: '#3D2B1F',
  textoSuave: '#6B5548',
};

async function main() {
  const raw = fs.readFileSync(EBOOK_PATH, 'utf8');
  const { content } = matter(raw);

  const lines = content.split('\n');
  let titulo = '';
  let subtitulo = '';
  let bodyLines = [];
  let foundTitle = false;

  for (const line of lines) {
    if (!foundTitle && line.startsWith('# ')) {
      titulo = line.replace('# ', '').trim();
      foundTitle = true;
    } else if (foundTitle && !subtitulo && line.startsWith('**') && line.endsWith('**')) {
      subtitulo = line.replace(/\*\*/g, '').trim();
    } else if (foundTitle) {
      bodyLines.push(line);
    }
  }

  const bodyMd = bodyLines.join('\n');
  const bodyHtml = await marked.parse(bodyMd);

  const spiralSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
    <path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke="${COLORS.barroClaro}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500&display=swap');

  @page {
    size: A5;
    margin: 22mm 18mm 25mm 18mm;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 300;
    font-size: 11pt;
    line-height: 1.85;
    color: ${COLORS.texto};
    background: ${COLORS.creme};
  }

  /* CAPA */
  .capa {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(170deg, ${COLORS.areia} 0%, ${COLORS.creme} 40%, ${COLORS.areia} 100%);
    padding: 30mm 15mm;
    position: relative;
  }
  .capa::before {
    content: '';
    position: absolute;
    top: 12mm;
    left: 12mm;
    right: 12mm;
    bottom: 12mm;
    border: 1.5pt solid ${COLORS.barroClaro}40;
    border-radius: 4mm;
  }
  .capa-espiral { margin-bottom: 8mm; opacity: 0.85; }
  .capa-titulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 28pt;
    line-height: 1.15;
    color: ${COLORS.barro};
    letter-spacing: -0.01em;
    margin-bottom: 5mm;
    max-width: 85%;
  }
  .capa-subtitulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 11pt;
    line-height: 1.5;
    color: ${COLORS.textoSuave};
    max-width: 80%;
    margin-bottom: 12mm;
  }
  .capa-autora {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 9pt;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
  }
  .capa-formacao {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 8pt;
    color: ${COLORS.textoSuave};
    margin-top: 3mm;
    max-width: 75%;
  }

  /* DISCLAIMER */
  .disclaimer-page {
    page-break-after: always;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 20mm;
  }
  .disclaimer-box {
    border: 1pt solid ${COLORS.salvia}50;
    border-radius: 3mm;
    padding: 8mm 10mm;
    max-width: 100%;
  }
  .disclaimer-box p {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 9.5pt;
    line-height: 1.7;
    color: ${COLORS.textoSuave};
    text-align: center;
  }

  /* CORPO */
  .corpo { }
  .corpo h2 {
    font-family: 'Fraunces', serif;
    font-weight: 400;
    font-size: 18pt;
    line-height: 1.2;
    color: ${COLORS.barro};
    margin-top: 14mm;
    margin-bottom: 5mm;
    page-break-after: avoid;
    letter-spacing: -0.005em;
  }
  .corpo h3 {
    font-family: 'Fraunces', serif;
    font-weight: 400;
    font-size: 13pt;
    line-height: 1.3;
    color: ${COLORS.barroClaro};
    margin-top: 8mm;
    margin-bottom: 3mm;
    page-break-after: avoid;
  }
  .corpo p {
    margin-bottom: 4mm;
    text-align: justify;
    hyphens: auto;
    orphans: 3;
    widows: 3;
  }
  .corpo strong {
    font-weight: 400;
    color: ${COLORS.barro};
  }
  .corpo em {
    font-style: italic;
    color: ${COLORS.texto};
  }
  .corpo blockquote {
    border-left: 2.5pt solid ${COLORS.salvia}60;
    padding-left: 5mm;
    margin: 5mm 0;
    font-style: italic;
    color: ${COLORS.textoSuave};
  }
  .corpo hr {
    border: none;
    height: 0.5pt;
    background: linear-gradient(90deg, transparent, ${COLORS.barroClaro}50, transparent);
    margin: 10mm auto;
    max-width: 40mm;
  }
  .corpo ul, .corpo ol {
    padding-left: 6mm;
    margin-bottom: 4mm;
  }
  .corpo li { margin-bottom: 2mm; }

  /* PAGINA FINAL */
  .final {
    page-break-before: always;
    text-align: center;
    padding-top: 25mm;
  }
  .final-espiral { margin-bottom: 6mm; opacity: 0.7; }
  .final p {
    font-size: 9pt;
    color: ${COLORS.textoSuave};
    line-height: 1.6;
    margin-bottom: 3mm;
  }
  .final a {
    color: ${COLORS.barro};
    text-decoration: none;
  }
</style>
</head>
<body>

<!-- CAPA -->
<div class="capa">
  <div class="capa-espiral">${spiralSvg}</div>
  <h1 class="capa-titulo">${titulo}</h1>
  <p class="capa-subtitulo">${subtitulo}</p>
  <p class="capa-autora">Vivianne dos Santos</p>
  <p class="capa-formacao">Escritora, mãe de três, em formação avançada em Psicologia Transpessoal, Psicologia e Espiritualidade, e Terapia da Constelação Familiar Sistémica</p>
</div>

<!-- DISCLAIMER -->
<div class="disclaimer-page">
  <div class="disclaimer-box">
    <p>Este ebook é um material de autoconhecimento e compreensão. Não substitui acompanhamento terapêutico. Se sentes que a tua culpa te paralisa de forma persistente, se sentes sintomas de depressão, ansiedade intensa, ou se passas por uma crise, procura apoio profissional. Não há vergonha nenhuma nisso. Há coragem.</p>
  </div>
</div>

<!-- CORPO -->
<div class="corpo">
${bodyHtml}
</div>

<!-- PAGINA FINAL -->
<div class="final">
  <div class="final-espiral">${spiralSvg}</div>
  <p>© 2025 Vivianne dos Santos</p>
  <p><a href="https://viviannedossantos.com">viviannedossantos.com</a></p>
  <p><a href="https://freeme.viviannedossantos.com">freeme.viviannedossantos.com</a></p>
</div>

</body>
</html>`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.pdf({
    path: OUTPUT_PATH,
    format: 'A5',
    printBackground: true,
    margin: { top: '22mm', right: '18mm', bottom: '25mm', left: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Outfit,sans-serif;font-size:7pt;color:${COLORS.textoSuave}80;"><span class="pageNumber"></span></div>`,
  });
  await browser.close();

  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`PDF gerado: ${OUTPUT_PATH} (${(stats.size / 1024).toFixed(0)} KB)`);
}

main().catch(console.error);
