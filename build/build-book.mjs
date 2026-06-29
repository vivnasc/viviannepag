import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const C = (p) => path.join(ROOT, 'content', p);
const FONT = (f) => 'file://' + path.join(__dirname, 'fonts', f);

const TITLE = 'Os 7 Sinais de Desencaixe';
const SUBTITLE = 'O equilíbrio entre pertença e autenticidade';
const AUTHOR = 'Vivianne dos Santos';

// ---------- tiny markdown ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  s = esc(s);
  // *italic*
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}
// Parse a chapter markdown file into { label, title, epigraph, paragraphs[] }
function parseChapter(file) {
  const raw = readFileSync(C(file), 'utf8').replace(/\r/g, '');
  const lines = raw.split('\n');
  let label = '', title = '', epigraph = '';
  const paras = [];
  let buf = [];
  const flush = () => { if (buf.length) { paras.push(buf.join(' ').trim()); buf = []; } };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    if (t.startsWith('# ')) {
      const h = t.slice(2).trim();
      const idx = h.indexOf(',');
      if (idx > 0 && /^(Sinal|Introdução|Epílogo)/i.test(h)) {
        label = h.slice(0, idx).trim();
        title = h.slice(idx + 1).trim();
      } else {
        label = ''; title = h;
      }
      continue;
    }
    if (/^\*[^*].*\*$/.test(t) && epigraph === '' && paras.length === 0) {
      epigraph = t.slice(1, -1).trim();
      continue;
    }
    buf.push(t);
  }
  flush();
  return { label, title, epigraph, paras };
}

function chapterHTML(file, { roman = false } = {}) {
  const { label, title, epigraph, paras } = parseChapter(file);
  let h = '<section class="chapter">';
  h += '<header class="chap-head">';
  if (label) h += `<p class="chap-label">${esc(label)}</p>`;
  h += `<h1 class="chap-title">${inline(title)}</h1>`;
  if (epigraph) h += `<p class="epigraph"><em>${inline(epigraph)}</em></p>`;
  h += '</header>';
  paras.forEach((p, i) => {
    const cls = i === 0 ? 'first' : '';
    h += `<p class="${cls}">${inline(p)}</p>`;
  });
  h += '</section>';
  return h;
}

// Dedication: plain paragraphs, no header, centered page
function dedicationHTML(file) {
  const raw = readFileSync(C(file), 'utf8').replace(/\r/g, '');
  const paras = raw.split('\n').map(s => s.trim()).filter(Boolean);
  let h = '<section class="dedication">';
  for (const p of paras) h += `<p>${inline(p)}</p>`;
  h += '</section>';
  return h;
}

// ---------- assemble ----------
const titlePage = `
<section class="title-page">
  <div class="tp-inner">
    <p class="tp-numeral">7</p>
    <h1 class="tp-title">Os Sinais<br>de Desencaixe</h1>
    <p class="tp-sub">${esc(SUBTITLE)}</p>
    <p class="tp-author">${esc(AUTHOR)}</p>
  </div>
</section>`;

const indexHTML = `
<section class="toc">
  <h2>Índice</h2>
  <ul>
    <li><span class="t">Nota de abertura</span></li>
    <li><span class="t">Introdução</span><span class="s">Porque este não é um livro sobre aprender a encaixar</span></li>
    <li><span class="n">Sinal 1</span><span class="s">Estás presente mas não te sentes pertencente</span></li>
    <li><span class="n">Sinal 2</span><span class="s">Começas a diminuir-te para caber</span></li>
    <li><span class="n">Sinal 3</span><span class="s">Sentes saudades de algo que nunca viveste</span></li>
    <li><span class="n">Sinal 4</span><span class="s">Oscilas entre hiper-adaptação e isolamento</span></li>
    <li><span class="n">Sinal 5</span><span class="s">O teu sistema nervoso começa a rejeitar certos ambientes</span></li>
    <li><span class="n">Sinal 6</span><span class="s">Começas a confundir paz com ausência de pessoas</span></li>
    <li><span class="n">Sinal 7</span><span class="s">Percebes que o problema nunca foi pertencer, mas o preço da pertença</span></li>
    <li><span class="t">Epílogo</span><span class="s">O véu do horizonte</span></li>
  </ul>
</section>`;

const body =
  titlePage +
  dedicationHTML('00a-dedicatoria.md') +
  chapterHTML('00b-nota-de-abertura.md') +
  indexHTML +
  chapterHTML('00-introducao.md') +
  chapterHTML('01-sinal.md') +
  chapterHTML('02-sinal.md') +
  chapterHTML('03-sinal.md') +
  chapterHTML('04-sinal.md') +
  chapterHTML('05-sinal.md') +
  chapterHTML('06-sinal.md') +
  chapterHTML('07-sinal.md') +
  chapterHTML('08-epilogo.md');

const css = `
@font-face{font-family:'EBG';src:url('${FONT('EBGaramond-var.ttf')}') format('truetype');font-weight:400 800;font-style:normal;font-display:block;}
@font-face{font-family:'EBG';src:url('${FONT('EBGaramond-Italic-var.ttf')}') format('truetype');font-weight:400 800;font-style:italic;font-display:block;}
*{box-sizing:border-box;}
html{font-family:'EBG',Georgia,serif;}
body{margin:0;color:#1a1714;font-size:12.6pt;line-height:1.52;text-rendering:optimizeLegibility;font-kerning:normal;font-feature-settings:"liga" 1,"onum" 1,"kern" 1;}
.chapter,.title-page,.dedication,.toc{page-break-before:always;break-before:page;}
p{margin:0;orphans:2;widows:2;}

/* ---- body paragraphs ---- */
.chapter p{text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-indent:1.5em;margin:0;}
.chapter p.first{text-indent:0;}
.chapter p.first::first-letter{
  float:left;font-size:3.1em;line-height:0.82;padding:0.02em 0.09em 0 0;font-weight:600;
}

/* ---- chapter head ---- */
.chap-head{margin:2.6em 0 2.1em;text-align:center;}
.chap-label{font-variant:small-caps;letter-spacing:.32em;font-size:11pt;color:#8a6a3a;margin:0 0 .9em;text-indent:0;font-weight:600;}
.chap-title{font-weight:600;font-size:21pt;line-height:1.18;margin:0 auto;max-width:90%;letter-spacing:.01em;}
.epigraph{margin:1.5em auto 0;max-width:78%;text-align:center;font-size:12.5pt;color:#3c352e;text-indent:0;}
.epigraph em{font-style:italic;}

/* nota de abertura uses chapter styling but no drop cap label color tweak handled above */

/* ---- title page ---- */
.title-page{height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;}
.tp-inner{padding:0 8mm;}
.tp-numeral{font-size:64pt;line-height:1;color:#b08d57;margin:0 0 .15em;font-weight:500;}
.tp-title{font-size:33pt;font-weight:600;line-height:1.1;margin:0 0 .6em;letter-spacing:.01em;}
.tp-sub{font-style:italic;font-size:14.5pt;color:#4a4038;margin:0 0 3.2em;}
.tp-author{font-variant:small-caps;letter-spacing:.26em;font-size:13pt;color:#26221d;margin:0;}

/* ---- dedication ---- */
.dedication{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.dedication p{font-style:italic;font-size:13pt;color:#332d27;max-width:72%;margin:0 0 1.1em;line-height:1.6;text-indent:0;}
.dedication p:first-child{font-style:normal;font-variant:small-caps;letter-spacing:.18em;font-size:13.5pt;color:#8a6a3a;margin-bottom:2em;}

/* ---- toc ---- */
.toc h2{text-align:center;font-variant:small-caps;letter-spacing:.26em;font-weight:600;font-size:16pt;color:#26221d;margin:.4em 0 1.4em;}
.toc ul{list-style:none;margin:0 auto;padding:0;max-width:88%;}
.toc li{margin:0 0 .62em;text-align:center;line-height:1.18;}
.toc .n,.toc .t{display:block;font-variant:small-caps;letter-spacing:.2em;font-size:10.5pt;color:#8a6a3a;}
.toc .s{display:block;font-style:italic;font-size:11.5pt;color:#2b2620;margin-top:.08em;}
`;

const html = `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>${esc(TITLE)}</title><style>${css}</style></head><body>${body}</body></html>`;

const htmlPath = path.join(__dirname, 'book.html');
writeFileSync(htmlPath, html);

const footer = `<div style="width:100%;font-family:'EBG',serif;font-size:9pt;color:#7a7068;text-align:center;"><span class="pageNumber"></span></div>`;
const emptyHeader = `<div></div>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
const outPath = path.join(ROOT, 'Os-7-Sinais-de-Desencaixe.pdf');
await page.pdf({
  path: outPath,
  width: '152mm',
  height: '229mm',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: emptyHeader,
  footerTemplate: footer,
  margin: { top: '20mm', bottom: '20mm', left: '19mm', right: '19mm' },
});
await browser.close();
console.log('PDF written to', outPath);
