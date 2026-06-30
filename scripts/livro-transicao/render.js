// Render do livro "A Grande Transição" (miolo A4 art-direccionado + capa).
// Lê livro/A_Grande_Transicao_completo.md, monta o HTML tipografado (Fraunces /
// Outfit, arco nas aberturas, capitular, ornamentos, caixas IDEIA/PERGUNTA,
// diagrama "Mapa da Transição", divisórias de Parte com vinhetas) e produz o PDF
// via Puppeteer. As imagens (capa + 4 vinhetas) vêm do bucket público
// viviannepag-assets/livro-transicao/<chave>.jpg (capa-propria.png vence).
// Uso: node scripts/livro-transicao/render.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');

const RAIZ = path.join(__dirname, '..', '..');
const FONTE = path.join(RAIZ, 'livro', 'A_Grande_Transicao_completo.md');
const APARATO = path.join(RAIZ, 'livro', 'aparato.json');
const OUTDIR = path.join(RAIZ, 'livro-transicao');
const OUT = path.join(OUTDIR, 'A-GRANDE-TRANSICAO.pdf');
const SUPA = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const IMGBASE = SUPA ? `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-transicao` : '';

fs.mkdirSync(OUTDIR, { recursive: true });

// ---------- fontes (base64) ----------
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
  ['Fraunces', 400, 'italic', 'fraunces-latin-400-italic'],
  ['Outfit', 300, 'normal', 'outfit-latin-300-normal'],
  ['Outfit', 400, 'normal', 'outfit-latin-400-normal'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map((a) => fontFace(...a)).join('\n');

// ---------- imagens do bucket -> data URI ----------
async function fetchDataUri(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    const mime = url.includes('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}
async function loadImages() {
  const out = { capa: null, partes: [null, null, null, null] };
  if (!IMGBASE) return out;
  out.capa = (await fetchDataUri(`${IMGBASE}/capa-propria.png`)) || (await fetchDataUri(`${IMGBASE}/capa.jpg`));
  for (let i = 0; i < 4; i++) out.partes[i] = await fetchDataUri(`${IMGBASE}/parte-${i + 1}.jpg`);
  return out;
}

// ---------- aparato editorial ----------
let aparato = {};
if (fs.existsSync(APARATO)) {
  try { aparato = JSON.parse(fs.readFileSync(APARATO, 'utf8')); } catch { aparato = {}; }
}

const inl = (s) => marked.parseInline(s.trim());
const ARCH = `<svg class="arch" viewBox="0 0 600 250" preserveAspectRatio="xMidYMin meet"><path d="M60 250 L60 120 C60 35 540 35 540 120 L540 250" fill="none" stroke="#b9842f" stroke-width="1.1"/><path d="M78 250 L78 122 C78 52 522 52 522 122 L522 250" fill="none" stroke="#b9842f" stroke-width="0.7" opacity="0.55"/><circle cx="60" cy="120" r="4" fill="#b9842f"/><circle cx="540" cy="120" r="4" fill="#b9842f"/><circle cx="300" cy="47" r="4.5" fill="#b9842f"/></svg>`;
const ORN = `<svg class="orn" viewBox="0 0 240 18"><line x1="20" y1="9" x2="108" y2="9" stroke="#b9842f" stroke-width="1"/><line x1="132" y1="9" x2="220" y2="9" stroke="#b9842f" stroke-width="1"/><circle cx="120" cy="9" r="4" fill="none" stroke="#b9842f" stroke-width="1"/><circle cx="120" cy="9" r="1.4" fill="#b9842f"/></svg>`;
const EYE = `<svg class="eye" viewBox="0 0 64 36"><path d="M4 18 C18 2 46 2 60 18 C46 34 18 34 4 18 Z" fill="none" stroke="#9c6a2c" stroke-width="1.4"/><circle cx="32" cy="18" r="7" fill="none" stroke="#9c6a2c" stroke-width="1.4"/><circle cx="32" cy="18" r="2.4" fill="#9c6a2c"/></svg>`;

function mapaFig() {
  return `<section class="mapfig"><div class="ch-kicker">O mapa</div><h2 class="ch-title">Mapa da Transição</h2>${ORN}
  <div class="venn"><div class="circ c1"><span class="cl">Sobrevivência</span><span class="cs">viver<br>para não morrer</span></div>
  <div class="circ c2"><span class="cl">Fissura</span><span class="cs">entre-mundos<br>perda e possibilidade</span></div>
  <div class="circ c3"><span class="cl">Emergência</span><span class="cs">viver<br>para criar e significar</span></div><div class="lk l1"></div><div class="lk l2"></div><div class="lk l3"></div></div>
  <div class="cols"><div><h4>Mecanismos</h4><p>medo<br>escassez<br>controlo<br>identidade defensiva<br>esforço</p></div>
  <div><h4>Experiência</h4><p>crise de sentido<br>luto do antigo<br>deslocamento<br>busca<br>pergunta</p></div>
  <div><h4>Emergências</h4><p>criação<br>cooperação<br>consciência<br>identidade fluida<br>significado</p></div></div></section>`;
}

function parseBook(md, imgs) {
  md = md.replace(/^---\n[\s\S]*?\n---\n/, '');
  md = md.replace(/^\s*#\s+A Grande Transição[\s\S]*?\*Vivianne Saraiva\*\s*\n/, '');
  const anchor = md.indexOf('## ANEXOS');
  let body = md, anexMd = '';
  if (anchor !== -1) { body = md.slice(0, anchor); anexMd = md.slice(anchor); }

  const lines = body.split('\n');
  const nextNonEmpty = (k) => { while (k < lines.length && lines[k].trim() === '') k++; return k; };
  let html = '', i = 0, partIdx = 0, mapInserted = false, para = [], openSection = false, leadPending = false;
  const flushPara = () => {
    if (!para.length) return; const text = para.join(' ').trim(); para = [];
    if (!text) return;
    if (text.startsWith('[IMAGEM')) { html += `<p class="imgmark">${inl(text.replace(/^\[/, '').replace(/\]$/, ''))}</p>\n`; return; }
    const cls = leadPending ? ' class="lead"' : ''; leadPending = false;
    html += `<p${cls}>${inl(text)}</p>\n`;
  };
  const closeSection = () => { if (openSection) { html += `</section>\n`; openSection = false; } };
  const opener = (kicker, title, key) => {
    closeSection();
    const ap = key && aparato[key] ? aparato[key] : null;
    html += `<section class="opener">${ARCH}<div class="ch-kicker">${inl(kicker)}</div>` +
      (title ? `<h2 class="ch-title">${inl(title)}</h2>` : '') + ORN +
      (ap && ap.epigrafe ? `<p class="epigraph">${inl(ap.epigrafe)}</p>` : '');
    openSection = true; leadPending = true; return ap;
  };

  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === '---' || t === '') { flushPara(); i++; continue; }
    let m;
    if ((m = t.match(/^##\s+(PARTE\s+.+)$/))) {
      flushPara(); closeSection();
      const j = nextNonEmpty(i + 1);
      const sub = (lines[j] && lines[j].trim().match(/^###\s+(.+)$/)) ? RegExp.$1 : '';
      partIdx++;
      const img = imgs.partes[partIdx - 1];
      const bg = img ? `<img class="partimg" src="${img}">` : `<div class="partimg imgslot">imagem: parte-${partIdx}</div>`;
      if (!mapInserted) { html += mapaFig(); mapInserted = true; }
      html += `<section class="part">${bg}<div class="part-veil"></div><div class="part-inner"><div class="part-kicker">${inl(m[1])}</div>` +
        (sub ? `<h1 class="part-title">${inl(sub)}</h1>` : '') + `<div class="partorn">${ORN}</div></div></section>\n`;
      i = sub ? j + 1 : i + 1; continue;
    }
    if ((m = t.match(/^##\s+(PRÓLOGO|INTRODUÇÃO|ANEXOS)\s*$/i))) {
      flushPara();
      const j = nextNonEmpty(i + 1);
      const sub = (lines[j] && lines[j].trim().match(/^###\s+(.+)$/)) ? RegExp.$1 : '';
      opener(m[1], sub, m[1].toUpperCase());
      i = sub ? j + 1 : i + 1; continue;
    }
    if ((m = t.match(/^###\s+(CAPÍTULO\s+.+|INTERLÚDIO\s+.+|EPÍLOGO)\s*$/))) {
      flushPara();
      const j = nextNonEmpty(i + 1);
      const title = (lines[j] && lines[j].trim().match(/^####\s+(.+)$/)) ? RegExp.$1 : '';
      const ap = opener(m[1], title, title || m[1]);
      if (ap) {
        if (ap.ideia) html += `<div class="box idea"><div class="boxlabel">Ideia central</div><p>${inl(ap.ideia)}</p></div>\n`;
        if (ap.pergunta) html += `<div class="box ask">${EYE}<div class="boxlabel">Pergunta para ficar</div><p class="q">${inl(ap.pergunta)}</p></div>\n`;
      }
      i = title ? j + 1 : i + 1; continue;
    }
    if (t.match(/^####\s+/)) { i++; continue; }
    if (t.startsWith('>')) { flushPara(); html += `<blockquote>${inl(t.replace(/^>\s?/, ''))}</blockquote>\n`; i++; continue; }
    para.push(t); i++;
  }
  flushPara(); closeSection();

  let anexHtml = '';
  if (anexMd) { const a = anexMd.replace(/^##\s+ANEXOS\s*$/m, ''); anexHtml = `<section class="annex"><div class="ch-kicker">Anexos</div>${marked.parse(a)}</section>`; }
  return { html, anexHtml };
}

const CSS = `
${FONTS}
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#F4ECDD;}
@page{size:A4;margin:24mm 30mm 22mm 30mm;}
body{color:#2a2114;background:#F4ECDD;font-family:Fraunces,Georgia,serif;font-weight:300;font-size:10.6pt;line-height:1.9;text-align:justify;hyphens:auto;-webkit-hyphens:auto;}
p{margin:0 0 .9em;}em{font-style:italic;}strong{font-weight:500;color:#7d5320;}
.opener{page-break-before:always;text-align:center;}
.opener>p,.annex p{text-align:justify;}
svg.arch{display:block;width:64mm;height:27mm;margin:0 auto 4mm;}
.ch-kicker{font-family:Outfit;font-weight:500;font-size:8pt;letter-spacing:.32em;text-transform:uppercase;color:#9c6a2c;}
.ch-title{font-family:Fraunces;font-weight:300;font-size:21pt;line-height:1.16;color:#332512;margin:2mm 0 0;}
svg.orn{display:block;width:40mm;height:3mm;margin:5mm auto 6mm;}
.epigraph{font-family:Fraunces;font-style:italic;font-weight:300;color:#7a5e38;font-size:11.5pt;text-align:center;margin:0 auto 7mm;max-width:78%;}
.opener>p.lead{text-indent:0;}
.opener>p.lead::first-letter{float:left;font-family:Fraunces;font-weight:400;font-size:3.5em;line-height:.78;padding:1mm 2mm 0 0;color:#9c6a2c;}
.box{border:0.8px solid rgba(185,132,47,.4);border-radius:1.5mm;padding:6mm 9mm;margin:7mm auto 8mm;max-width:88%;background:rgba(185,132,47,.035);text-align:center;page-break-inside:avoid;}
.boxlabel{font-family:Outfit;font-weight:500;font-size:7.5pt;letter-spacing:.28em;text-transform:uppercase;color:#9c6a2c;margin-bottom:2.5mm;}
.box.idea p{font-family:Fraunces;font-weight:300;font-size:11pt;line-height:1.55;color:#3a2c18;text-align:center;margin:0;}
.box.ask svg.eye{width:13mm;height:7.5mm;display:block;margin:0 auto 2mm;}
.box.ask p.q{font-family:Fraunces;font-style:italic;font-weight:300;font-size:12pt;color:#7d5320;text-align:center;margin:0;}
blockquote{font-family:Fraunces;font-style:italic;color:#7d5320;text-align:center;margin:5mm 6mm;}
.imgmark{text-align:left;font-family:Outfit;font-weight:300;font-size:8pt;line-height:1.6;color:#6f6151;background:rgba(156,106,44,.06);border-left:2px solid rgba(185,132,47,.5);padding:3.5mm 4.5mm;margin:7mm 0;}
.imgmark::before{content:"Imagem";display:block;font-weight:500;font-size:6.6pt;letter-spacing:.22em;text-transform:uppercase;color:#9c6a2c;margin-bottom:1.4mm;}
.part{page-break-before:always;page-break-after:always;position:relative;height:248mm;margin:-2mm -30mm 0;overflow:hidden;background:radial-gradient(120% 80% at 50% 28%,#2c2013,#1a120a 60%,#100b06);color:#f1e7d8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.part .partimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5;}
.part div.imgslot{position:absolute;inset:auto 0 30mm 0;color:#7a6a4f;font-family:Outfit;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;background:none;}
.part .part-veil{position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 40%,rgba(20,13,7,.25),rgba(16,11,6,.78));}
.part .part-inner{position:relative;z-index:2;padding:0 24mm;}
.part-kicker{font-family:Outfit;font-weight:400;font-size:10pt;letter-spacing:.38em;text-transform:uppercase;color:#d3a85e;}
.part-title{font-family:Fraunces;font-weight:300;font-size:27pt;line-height:1.14;color:#f3ead9;margin:6mm 0 0;}
.partorn{margin-top:7mm;}.partorn svg.orn line{stroke:#d3a85e;}.partorn svg.orn circle{stroke:#d3a85e;fill:#d3a85e;}
.mapfig{page-break-before:always;page-break-after:always;text-align:center;padding-top:6mm;}
.venn{position:relative;height:52mm;margin:11mm auto 6mm;width:156mm;}
.venn .circ{position:absolute;top:0;width:60mm;height:52mm;border-radius:50%;border:0.8px solid rgba(185,132,47,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;}
.venn .c1{left:0;background:rgba(124,83,32,.07);}
.venn .c2{left:48mm;background:rgba(156,106,44,.05);}.venn .c3{left:96mm;background:rgba(140,128,92,.09);}
.venn .cl{font-family:Outfit;font-weight:500;font-size:7pt;letter-spacing:.24em;text-transform:uppercase;color:#8a5d28;}
.venn .cs{font-family:Fraunces;font-style:italic;font-size:7.5pt;margin-top:1.4mm;line-height:1.32;color:#6b5a3f;}
.venn .lk{position:absolute;bottom:-7mm;width:0.8px;height:7mm;background:rgba(185,132,47,.5);}
.venn .lk.l1{left:30mm;}.venn .lk.l2{left:78mm;}.venn .lk.l3{left:126mm;}
.cols{display:flex;justify-content:center;gap:0;margin-top:3mm;}
.cols > div{width:52mm;padding:0 4mm;}
.cols h4{font-family:Outfit;font-weight:500;font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#9c6a2c;margin-bottom:2.5mm;padding-bottom:2mm;border-bottom:0.6px solid rgba(185,132,47,.35);}
.cols p{font-family:Fraunces;font-weight:300;font-size:8.5pt;line-height:1.85;color:#4f4231;text-align:center;}
.annex{page-break-before:always;font-size:9.4pt;line-height:1.6;}
.annex h1{font-family:Fraunces;font-weight:300;font-size:16pt;color:#332512;margin:0 0 1mm;}
.annex h2{font-family:Outfit;font-weight:500;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:#9c6a2c;margin:5mm 0 2mm;}
.annex p{text-align:left;margin:0 0 2mm;color:#4f4231;}.annex ul{list-style:none;}.annex li{margin:1.4mm 0;text-align:left;}
.cover{position:relative;height:251mm;margin:-24mm -30mm 0;page-break-after:always;overflow:hidden;background:radial-gradient(125% 80% at 50% 24%,#3a2a17,#241a10 38%,#100b06);color:#f1e7d8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.cover .ct{position:relative;z-index:2;}
.cover .cselo{font-family:Outfit;font-weight:400;font-size:8.5pt;letter-spacing:.34em;text-transform:uppercase;color:#c8b48b;margin:6mm 0 4mm;}
.cover .ctitle{font-family:Fraunces;font-weight:300;font-size:40pt;line-height:1.05;color:#f3ead9;}
.cover .csub{font-family:Fraunces;font-style:italic;font-size:13pt;color:#e6b25c;margin-top:6mm;}
.cover .caut{position:absolute;bottom:24mm;left:0;right:0;font-family:Outfit;font-size:10pt;letter-spacing:.3em;text-transform:uppercase;color:#d8c6a6;z-index:2;}
`;

(async () => {
  const md = fs.readFileSync(FONTE, 'utf8');
  const imgs = await loadImages();
  const { html, anexHtml } = parseBook(md, imgs);

  const coverArch = ARCH.replace('class="arch"', 'class="arch" style="width:90mm;height:42mm;"').replace(/#b9842f/g, '#e6b25c');
  const coverInner = `<div class="ct">${coverArch}<div class="cselo">Ciências da Consciência Emergente</div><div class="ctitle">A Grande<br>Transição</div><div class="csub">Introdução às Ciências da Consciência Emergente</div></div><div class="caut">Vivianne Saraiva</div>`;
  const coverHtml = imgs.capa
    ? `<section class="cover"><img src="${imgs.capa}"></section>`
    : `<section class="cover">${coverInner}</section>`;

  const doc = `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${coverHtml}${html}${anexHtml}</body></html>`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(doc, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.emulateMediaType('print');
  const header = `<div style="width:100%;text-align:center;font-family:Georgia,serif;font-size:7px;letter-spacing:2.4px;color:#bcae98;text-transform:uppercase;">A Grande Transição</div>`;
  const footer = `<div style="width:100%;text-align:center;font-family:Georgia,serif;font-size:8.5px;color:#9c8e79;"><span class="pageNumber"></span></div>`;
  await page.pdf({
    path: OUT, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: header, footerTemplate: footer,
    margin: { top: '24mm', bottom: '20mm', left: '30mm', right: '30mm' },
  });
  await browser.close();
  console.log('PDF escrito:', OUT, '(', fs.statSync(OUT).size, 'bytes )');
})();
