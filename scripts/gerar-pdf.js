const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');
const { marked } = require('marked');

const PALETAS = {
  freeme: {
    barro: '#8C4A36',
    barroClaro: '#9A5A43',
    areia: '#F3E4D6',
    creme: '#F1E8DD',
    salvia: '#7D8A6A',
    texto: '#3D2B1F',
    textoSuave: '#6B5548',
  },
  synchim: {
    barro: '#5A1A2A',
    barroClaro: '#7A2E40',
    areia: '#F3E4D6',
    creme: '#F5EDE6',
    salvia: '#8B6B75',
    texto: '#2E1118',
    textoSuave: '#6B4A55',
  },
  infonte: {
    barro: '#B8843D',
    barroClaro: '#EBAE4A',
    areia: '#F5ECD4',
    creme: '#F8F2E6',
    salvia: '#8A7B5A',
    texto: '#3A2D1A',
    textoSuave: '#6B5D3D',
  },
  escola: {
    barro: '#1A1A2E',
    barroClaro: '#5A4A6A',
    areia: '#E8DFD0',
    creme: '#F0E8DC',
    salvia: '#7A6A50',
    texto: '#1A1A2E',
    textoSuave: '#4A3A5A',
  },
  autora: {
    barro: '#2A1C12',
    barroClaro: '#B8843D',
    areia: '#F2E8DC',
    creme: '#F5F0E8',
    salvia: '#8A7B5A',
    texto: '#2A1C12',
    textoSuave: '#6B5D3D',
  },
};

const PRODUTOS = {
  'ebook-01-culpa': {
    paleta: 'freeme',
    badge: 'EBOOK · FREEME',
    tipo: 'ebook',
    disclaimer: 'Este ebook é um material de autoconhecimento e compreensão. Não substitui acompanhamento terapêutico. Se sentes que a tua culpa te paralisa de forma persistente, se sentes sintomas de depressão, ansiedade intensa, ou se passas por uma crise, procura apoio profissional. Não há vergonha nenhuma nisso. Há coragem.',
  },
  'guia-01-meu': {
    paleta: 'freeme',
    badge: 'GUIA · FREEME',
    tipo: 'guia',
    disclaimer: 'Este guia é um material de autoconhecimento. Não substitui acompanhamento terapêutico. Se sentes que carregas peso emocional que te paralisa, procura apoio profissional. Cuidar de ti é um ato de coragem.',
  },
  'guia-02-frases': {
    paleta: 'freeme',
    badge: 'GUIA · FREEME',
    tipo: 'guia',
    disclaimer: 'Este guia é um material de autoconhecimento sobre limites e maternidade. Não substitui acompanhamento terapêutico. Se sentes que a culpa te impede de funcionar no dia a dia, procura apoio profissional.',
  },
  'ebook-02-herdaste': {
    paleta: 'freeme',
    badge: 'EBOOK · FREEME',
    tipo: 'ebook',
    disclaimer: 'Este ebook é um material de autoconhecimento e compreensão. Não substitui acompanhamento terapêutico nem sessões de constelação familiar. Se sentes que os padrões que reconheces te causam sofrimento persistente, procura apoio profissional. Ver é o primeiro passo. Cuidar de ti é o segundo.',
  },
  'ebook-01-culpa-en': {
    paleta: 'freeme',
    badge: 'EBOOK · FREEME',
    tipo: 'ebook',
    disclaimer: 'This ebook is a self-knowledge and understanding resource. It does not replace therapeutic support. If you feel that guilt persistently paralyzes you, if you experience symptoms of depression, intense anxiety, or a crisis, please seek professional help. There is no shame in that. There is courage.',
  },
  'guia-01-meu-en': {
    paleta: 'freeme',
    badge: 'GUIDE · FREEME',
    tipo: 'guia',
    disclaimer: 'This guide is a self-knowledge resource. It does not replace therapeutic support. If you feel that emotional weight is paralyzing you, please seek professional help. Taking care of yourself is an act of courage.',
  },
  'guia-02-frases-en': {
    paleta: 'freeme',
    badge: 'GUIDE · FREEME',
    tipo: 'guia',
    disclaimer: 'This guide is a self-knowledge resource about boundaries and motherhood. It does not replace therapeutic support. If you feel that guilt prevents you from functioning day to day, please seek professional help.',
  },
  'ebook-02-herdaste-en': {
    paleta: 'freeme',
    badge: 'EBOOK · FREEME',
    tipo: 'ebook',
    disclaimer: 'This ebook is a self-knowledge and understanding resource. It does not replace therapeutic support or family constellation sessions. If you feel that the patterns you recognize cause you persistent suffering, please seek professional help. Seeing is the first step. Taking care of yourself is the second.',
  },
  'ebook-03-quemes': {
    paleta: 'escola',
    badge: 'EBOOK · ESCOLA DOS VÉUS',
    tipo: 'ebook',
    disclaimer: 'Este ebook é um material de autoconhecimento e reflexão. Não substitui acompanhamento terapêutico ou psicológico. Se sentes que perdeste o sentido de quem és de forma persistente, ou se atravessas uma crise de identidade profunda, procura apoio profissional. Descobrir-te é um caminho, não um destino.',
  },
  'ebook-03-quemes-en': {
    paleta: 'escola',
    badge: 'EBOOK · ESCOLA DOS VÉUS',
    tipo: 'ebook',
    disclaimer: 'This ebook is a self-knowledge and reflection resource. It does not replace therapeutic or psychological support. If you feel you have persistently lost your sense of self, or are going through a deep identity crisis, please seek professional help. Discovering yourself is a path, not a destination.',
  },
  'ebook-04-sentido': {
    paleta: 'autora',
    badge: 'EBOOK · VIVIANNE DOS SANTOS',
    tipo: 'ebook',
    disclaimer: 'Este ebook é um material de autoconhecimento e reflexão existencial. Não substitui acompanhamento terapêutico. Se sentes um vazio persistente, perda de sentido ou sintomas depressivos, procura apoio profissional. Procurar sentido é humano. Pedir ajuda também.',
  },
  'ebook-04-sentido-en': {
    paleta: 'autora',
    badge: 'EBOOK · VIVIANNE DOS SANTOS',
    tipo: 'ebook',
    disclaimer: 'This ebook is a self-knowledge and existential reflection resource. It does not replace therapeutic support. If you experience persistent emptiness, loss of meaning, or depressive symptoms, please seek professional help. Seeking meaning is human. Asking for help is too.',
  },
  'ebook-03-quemes-en': { paleta: 'escola', badge: 'EBOOK · ESCOLA DOS VÉUS', tipo: 'ebook', disclaimer: 'This ebook is a self-knowledge and reflection resource. It does not replace therapeutic or psychological support. If you feel you have persistently lost your sense of self, please seek professional help.' },
  'ebook-04-sentido-en': { paleta: 'autora', badge: 'EBOOK · VIVIANNE DOS SANTOS', tipo: 'ebook', disclaimer: 'This ebook is a self-knowledge and existential reflection resource. It does not replace therapeutic support. If you experience persistent emptiness or loss of meaning, please seek professional help.' },
  'ebook-05-escuro-en': { paleta: 'escola', badge: 'EBOOK · ESCOLA DOS VÉUS', tipo: 'ebook', disclaimer: 'This ebook addresses sensitive topics. It does NOT replace therapeutic support. If you are in acute distress or having thoughts of giving up, please seek immediate help.' },
  'ebook-06-no-casal-en': { paleta: 'synchim', badge: 'EBOOK · SYNCHIM', tipo: 'ebook', disclaimer: 'This ebook is a self-knowledge resource about couple dynamics. It does not replace therapeutic support or couples therapy. If your relationship involves violence, please seek specialized help.' },
  'guia-03-presenca-en': { paleta: 'autora', badge: 'GUIDE · LORANNE', tipo: 'guia', disclaimer: 'This guide is a self-knowledge and well-being resource. It does not replace therapeutic support.' },
  'guia-04-mente-en': { paleta: 'infonte', badge: 'GUIDE · INFONTE', tipo: 'guia', disclaimer: 'This guide is a self-knowledge resource. It does not replace therapeutic support.' },
  'guia-05-luto-en': { paleta: 'autora', badge: 'GUIDE · VIVIANNE DOS SANTOS', tipo: 'guia', disclaimer: 'This guide addresses loss and grief. It does not replace therapeutic support. If your pain is greater than you can bear, please seek professional help.' },
  'guia-06-perguntas-en': { paleta: 'synchim', badge: 'GUIDE · SYNCHIM', tipo: 'guia', disclaimer: 'This guide is a self-knowledge resource about relationships. It does not replace couples therapy.' },
  'guia-03-presenca': {
    paleta: 'autora',
    badge: 'GUIA · LORANNE',
    tipo: 'guia',
    disclaimer: 'Este guia é um material de autoconhecimento e bem-estar. Não substitui acompanhamento terapêutico. Se sentes desconexão emocional persistente ou sintomas de esgotamento, procura apoio profissional.',
  },
  'guia-04-mente': {
    paleta: 'infonte',
    badge: 'GUIA · INFONTE',
    tipo: 'guia',
    disclaimer: 'Este guia é um material de autoconhecimento. Não substitui acompanhamento terapêutico. Se sentes que os teus pensamentos te dominam de forma persistente, procura apoio profissional.',
  },
  'guia-05-luto': {
    paleta: 'autora',
    badge: 'GUIA · VIVIANNE DOS SANTOS',
    tipo: 'guia',
    disclaimer: 'Este guia aborda perdas e luto. Não substitui acompanhamento terapêutico. Se sentes que a tua dor é maior do que consegues suportar, procura apoio profissional.',
  },
  'guia-06-perguntas': {
    paleta: 'synchim',
    badge: 'GUIA · SYNCHIM',
    tipo: 'guia',
    disclaimer: 'Este guia é um material de autoconhecimento sobre relações. Não substitui terapia de casal. Se a tua relação envolve violência, procura ajuda especializada.',
  },
  'ebook-07-sonho': { paleta: 'infonte', badge: 'EBOOK · INFONTE', tipo: 'ebook', disclaimer: 'Este ebook é um material de autoconhecimento. Não substitui acompanhamento terapêutico. Se sentes exaustão persistente ou sinais de burnout, procura apoio profissional.' },
  'ebook-08-voz': { paleta: 'infonte', badge: 'EBOOK · INFONTE', tipo: 'ebook', disclaimer: 'Este ebook é um material de autoconhecimento. Não substitui acompanhamento terapêutico. Se sentes que perdeste a tua voz de forma persistente, procura apoio profissional.' },
  'guia-07-teu': { paleta: 'infonte', badge: 'GUIA · INFONTE', tipo: 'guia', disclaimer: 'Este guia é um material de autoconhecimento. Não substitui acompanhamento terapêutico.' },
  'ebook-05-escuro': {
    paleta: 'escola',
    badge: 'EBOOK · ESCOLA DOS VÉUS',
    tipo: 'ebook',
    disclaimer: 'Este ebook aborda temas sensíveis. NÃO substitui acompanhamento terapêutico. Se estás em sofrimento agudo ou tens pensamentos sobre desistir da vida, procura ajuda imediata. Em Portugal: SNS 24 (808 24 24 24). Pedir ajuda é o ato mais corajoso que podes praticar.',
  },
  'ebook-06-no-casal': {
    paleta: 'synchim',
    badge: 'EBOOK · SYNCHIM',
    tipo: 'ebook',
    disclaimer: 'Este ebook é um material de autoconhecimento sobre relações de casal. Não substitui acompanhamento terapêutico ou terapia de casal. Se a tua relação envolve violência física ou psicológica, procura ajuda profissional imediata.',
  },
};

function getVSvg(color, size = 60) {
  return `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <g fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <path d="M150 120 C150 270 188 345 244 378"/>
      <path d="M362 120 C362 270 324 345 268 378"/>
    </g>
    <circle cx="256" cy="246" r="14" fill="${color}"/>
  </svg>`;
}

function getVSvgBig(color, size = 280) {
  return `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <g fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M150 120 C150 270 188 345 244 378"/>
      <path d="M362 120 C362 270 324 345 268 378"/>
    </g>
    <circle cx="256" cy="246" r="18" fill="${color}"/>
  </svg>`;
}

function buildHtml(titulo, subtitulo, bodyHtml, C, config) {
  const spiralSvg = getVSvg(C.barroClaro, 60);
  const spiralBig = getVSvgBig(C.areia, 280);

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500&display=swap');

  @page { size: A5; margin: 22mm 18mm 25mm 18mm; }
  @page:first { margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 300;
    font-size: 11pt;
    line-height: 1.85;
    color: ${C.texto};
    background: ${C.creme};
  }

  .capa {
    page-break-after: always;
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column; justify-content: flex-end;
    text-align: left;
    background: ${C.barro};
    position: relative; overflow: hidden;
  }
  .capa-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 70% 20%, ${C.barroClaro}40 0%, transparent 60%),
      radial-gradient(ellipse at 20% 80%, ${C.salvia}20 0%, transparent 50%),
      linear-gradient(170deg, ${C.barroClaro}90 0%, ${C.barro} 40%, #0D0A08 100%);
  }
  .capa-espiral-grande {
    position: absolute; top: 8%; right: -5%; opacity: 0.08;
  }
  .capa-conteudo {
    position: relative; z-index: 1;
    padding: 12mm 10mm 14mm 10mm;
    background: linear-gradient(to top, rgba(29,19,11,0.85) 0%, transparent 100%);
  }
  .capa-espiral { margin-bottom: 6mm; opacity: 0.7; }
  .capa-titulo {
    font-family: 'Fraunces', serif; font-weight: 300;
    font-size: 30pt; line-height: 1.1; color: ${C.areia};
    letter-spacing: -0.015em; margin-bottom: 4mm;
  }
  .capa-subtitulo {
    font-family: 'Fraunces', serif; font-weight: 300; font-style: italic;
    font-size: 10.5pt; line-height: 1.45; color: ${C.areia}cc;
    max-width: 90%; margin-bottom: 10mm;
  }
  .capa-linha { width: 30mm; height: 0.5pt; background: ${C.salvia}; margin-bottom: 5mm; opacity: 0.6; }
  .capa-autora {
    font-family: 'Outfit', sans-serif; font-weight: 400;
    font-size: 8.5pt; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.salvia};
  }

  .disclaimer-page {
    page-break-after: always;
    display: flex; align-items: center; justify-content: center;
    min-height: 60vh; padding: 20mm;
  }
  .disclaimer-box {
    border: 1pt solid ${C.salvia}50;
    border-radius: 3mm; padding: 8mm 10mm; max-width: 100%;
  }
  .disclaimer-box p {
    font-family: 'Fraunces', serif; font-weight: 300; font-style: italic;
    font-size: 9.5pt; line-height: 1.7; color: ${C.textoSuave}; text-align: center;
  }

  .corpo h2 {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: 18pt; line-height: 1.2; color: ${C.barro};
    margin-bottom: 5mm; page-break-before: always; page-break-after: avoid;
    letter-spacing: -0.005em; padding-top: 8mm;
  }
  .corpo h3 {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: 13pt; line-height: 1.3; color: ${C.barroClaro};
    margin-top: 8mm; margin-bottom: 3mm; page-break-after: avoid;
  }
  .corpo p { margin-bottom: 4mm; text-align: justify; hyphens: auto; orphans: 3; widows: 3; }
  .corpo strong { font-weight: 400; color: ${C.barro}; }
  .corpo em { font-style: italic; color: ${C.texto}; }
  .corpo blockquote {
    border-left: 2.5pt solid ${C.salvia}60;
    padding-left: 5mm; margin: 5mm 0;
    font-style: italic; color: ${C.textoSuave};
  }
  .corpo hr {
    border: none; height: 0.5pt;
    background: linear-gradient(90deg, transparent, ${C.barroClaro}50, transparent);
    margin: 10mm auto; max-width: 40mm;
  }
  .corpo ul, .corpo ol { padding-left: 6mm; margin-bottom: 4mm; }
  .corpo li { margin-bottom: 2mm; }

  .final {
    page-break-before: always;
    text-align: center; padding-top: 25mm;
  }
  .final-espiral { margin-bottom: 6mm; opacity: 0.7; }
  .final p { font-size: 9pt; color: ${C.textoSuave}; line-height: 1.6; margin-bottom: 3mm; }
  .final a { color: ${C.barro}; text-decoration: none; }
</style>
</head>
<body>

<div class="capa">
  <div class="capa-bg"></div>
  <div class="capa-espiral-grande">${spiralBig}</div>
  <div class="capa-conteudo">
    <div class="capa-espiral">${spiralSvg}</div>
    <h1 class="capa-titulo">${titulo}</h1>
    <p class="capa-subtitulo">${subtitulo}</p>
    <div class="capa-linha"></div>
    <p class="capa-autora">Vivianne dos Santos</p>
  </div>
</div>

<div class="disclaimer-page">
  <div class="disclaimer-box">
    <p>${config.disclaimer}</p>
  </div>
</div>

<div class="corpo">
${bodyHtml}
</div>

<div class="final">
  <div class="final-espiral">${spiralSvg}</div>
  <p>© 2026 Vivianne dos Santos</p>
  <p><a href="https://viviannedossantos.com">viviannedossantos.com</a></p>
  <p><a href="https://freeme.viviannedossantos.com">freeme.viviannedossantos.com</a></p>
</div>

</body>
</html>`;
}

function buildCapaHtml(titulo, subtitulo, C, config) {
  const spiral = getVSvgBig(C.areia, 220);
  const spiralSmall = getVSvg(C.barroClaro, 48);

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Outfit:wght@400&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 1400px; height: 1873px;
    position: relative; overflow: hidden;
    background: ${C.barro}; font-family: 'Fraunces', serif;
  }
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 65% 15%, ${C.barroClaro}50 0%, transparent 55%),
      radial-gradient(ellipse at 25% 85%, ${C.salvia}25 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, ${C.barroClaro}80 0%, transparent 70%),
      linear-gradient(175deg, ${C.barroClaro}90 0%, ${C.barro} 35%, #0D0A08 100%);
  }
  .spiral-bg { position: absolute; top: 6%; right: -8%; opacity: 0.07; }
  .spiral-bg svg { width: 900px; height: 900px; }
  .content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 80px 90px 100px;
    background: linear-gradient(to top, rgba(20,13,8,0.92) 0%, rgba(20,13,8,0.6) 50%, transparent 100%);
  }
  .small-spiral { margin-bottom: 30px; opacity: 0.75; }
  h1 {
    font-weight: 300; font-size: 72px; line-height: 1.08;
    color: ${C.areia}; letter-spacing: -0.02em;
    margin-bottom: 24px; max-width: 95%;
  }
  .sub {
    font-weight: 300; font-style: italic;
    font-size: 26px; line-height: 1.45;
    color: ${C.areia}bb; max-width: 88%; margin-bottom: 50px;
  }
  .line { width: 120px; height: 2px; background: ${C.salvia}; margin-bottom: 28px; opacity: 0.55; }
  .author {
    font-family: 'Outfit', sans-serif; font-weight: 400;
    font-size: 20px; letter-spacing: 0.2em;
    text-transform: uppercase; color: ${C.salvia};
  }
  .badge {
    position: absolute; top: 60px; left: 90px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 400;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: ${C.salvia};
    border: 1.5px solid ${C.salvia}60;
    border-radius: 30px; padding: 10px 24px; opacity: 0.8;
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="spiral-bg">${getVSvgBig(C.areia, 900)}</div>
  <div class="badge">${config.badge}</div>
  <div class="content">
    <div class="small-spiral">${spiralSmall}</div>
    <h1>${titulo}</h1>
    <p class="sub">${subtitulo}</p>
    <div class="line"></div>
    <p class="author">Vivianne dos Santos</p>
  </div>
</body></html>`;
}

async function main() {
  const slug = process.argv[2];
  if (!slug || !PRODUTOS[slug]) {
    console.log('Uso: node gerar-pdf.js <slug>');
    console.log('Slugs:', Object.keys(PRODUTOS).join(', '));
    process.exit(1);
  }

  const config = PRODUTOS[slug];
  const C = PALETAS[config.paleta];
  const mdPath = path.join(__dirname, '..', 'content', 'produtos', slug, `${slug}.md`);
  const pdfPath = path.join(__dirname, '..', 'public', 'produtos', `${slug}.pdf`);
  const capaPath = path.join(__dirname, '..', 'public', 'produtos', `${slug}-capa.png`);

  if (!fs.existsSync(mdPath)) {
    console.error(`Ficheiro nao encontrado: ${mdPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(mdPath, 'utf8');
  const { content } = matter(raw);
  const lines = content.split('\n');
  let titulo = '', subtitulo = '', bodyStartIdx = -1;

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

  if (!titulo) { console.error('Titulo nao encontrado'); process.exit(1); }
  const bodyMd = lines.slice(bodyStartIdx).join('\n');
  const bodyHtml = await marked.parse(bodyMd);

  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // PDF
  const pdfPage = await browser.newPage();
  const pdfHtml = buildHtml(titulo, subtitulo, bodyHtml, C, config);
  await pdfPage.setContent(pdfHtml, { waitUntil: 'networkidle0', timeout: 30000 });
  await pdfPage.pdf({
    path: pdfPath,
    format: 'A5',
    printBackground: true,
    margin: { top: '22mm', right: '18mm', bottom: '25mm', left: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Outfit,sans-serif;font-size:7pt;color:${C.textoSuave}80;"><span class="pageNumber"></span></div>`,
  });
  const pdfStats = fs.statSync(pdfPath);
  console.log(`PDF: ${pdfPath} (${(pdfStats.size / 1024).toFixed(0)} KB)`);

  // Capa (1400x1873 para Kobo)
  const capaPage = await browser.newPage();
  await capaPage.setViewport({ width: 1400, height: 1873 });
  const capaHtml = buildCapaHtml(titulo, subtitulo, C, config);
  await capaPage.setContent(capaHtml, { waitUntil: 'networkidle0', timeout: 20000 });
  await capaPage.screenshot({ path: capaPath, type: 'png', fullPage: false });
  const capaStats = fs.statSync(capaPath);
  console.log(`Capa: ${capaPath} (${(capaStats.size / 1024).toFixed(0)} KB, 1400x1873)`);

  await browser.close();
  console.log(`\nConcluido: ${slug}`);
}

main().catch(console.error);
