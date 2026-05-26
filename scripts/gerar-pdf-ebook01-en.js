const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');
const { marked } = require('marked');

const EBOOK_PATH = path.join(__dirname, '..', 'content', 'produtos', 'ebook-01-culpa', 'ebook-01-culpa-en.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'produtos', 'ebook-01-culpa-en.pdf');

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
  let bodyStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!titulo && line.startsWith('# ')) {
      titulo = line.replace('# ', '').trim();
    } else if (titulo && !subtitulo && line.startsWith('**') && line.endsWith('**')) {
      subtitulo = line.replace(/\*\*/g, '').trim();
    } else if (titulo && line.startsWith('## ')) {
      bodyStartIdx = i;
      break;
    }
  }

  const bodyMd = lines.slice(bodyStartIdx).join('\n');
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
  @page:first {
    margin: 0;
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
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-align: left;
    background: ${COLORS.barro};
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .capa-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 70% 20%, ${COLORS.barroClaro}40 0%, transparent 60%),
      radial-gradient(ellipse at 20% 80%, ${COLORS.salvia}20 0%, transparent 50%),
      linear-gradient(170deg, #5A3D2E 0%, ${COLORS.barro} 40%, #1D130B 100%);
  }
  .capa-espiral-grande {
    position: absolute;
    top: 8%;
    right: -5%;
    opacity: 0.08;
  }
  .capa-conteudo {
    position: relative;
    z-index: 1;
    padding: 12mm 10mm 14mm 10mm;
    background: linear-gradient(to top, rgba(29,19,11,0.85) 0%, transparent 100%);
  }
  .capa-espiral { margin-bottom: 6mm; opacity: 0.7; }
  .capa-titulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 30pt;
    line-height: 1.1;
    color: ${COLORS.areia};
    letter-spacing: -0.015em;
    margin-bottom: 4mm;
  }
  .capa-subtitulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 10.5pt;
    line-height: 1.45;
    color: ${COLORS.areia}cc;
    max-width: 90%;
    margin-bottom: 10mm;
  }
  .capa-linha {
    width: 30mm;
    height: 0.5pt;
    background: ${COLORS.salvia};
    margin-bottom: 5mm;
    opacity: 0.6;
  }
  .capa-autora {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
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
    margin-bottom: 5mm;
    page-break-before: always;
    page-break-after: avoid;
    letter-spacing: -0.005em;
    padding-top: 8mm;
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
  <div class="capa-bg"></div>
  <div class="capa-espiral-grande">
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="280" height="280">
      <path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke="${COLORS.areia}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <div class="capa-conteudo">
    <div class="capa-espiral">${spiralSvg}</div>
    <h1 class="capa-titulo">${titulo}</h1>
    <p class="capa-subtitulo">${subtitulo}</p>
    <div class="capa-linha"></div>
    <p class="capa-autora">Vivianne dos Santos</p>
  </div>
</div>

<!-- DISCLAIMER -->
<div class="disclaimer-page">
  <div class="disclaimer-box">
    <p>This ebook is a self-knowledge and understanding resource. It does not replace therapeutic support. If you feel that your guilt is persistently paralysing you, if you experience symptoms of depression, intense anxiety, or if you are going through a crisis, please seek professional help. There is no shame in that. There is courage.</p>
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
