import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
catch { ({ chromium } = require('playwright')); }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONT = (f) => 'file://' + path.join(__dirname, 'fonts', f);
const LIVRO = (f) => path.join(ROOT, 'livro', f);

// ---------------------------------------------------------------------------
// A Grande Transição · motor de impressão (Paged.js + @page reais).
// A APRECIAÇÃO É PRÓPRIA DESTE LIVRO (não é a prosa corrida de "Os 7 Sinais"):
//  · arco alto de ouro a emoldurar a abertura de cada secção;
//  · cabeçalho corrente = nome da secção; número de página ao fundo;
//  · vozes diferentes: a carta de 2150 / interlúdios respiram (medida estreita,
//    alinhamento à esquerda); os capítulos são justificados com capitular;
//  · caixas IDEIA CENTRAL e PERGUNTA PARA FICAR (com o olho);
//  · página "Mapa da Transição"; divisórias de Parte com vinheta.
// Conteúdo: livro/A_Grande_Transicao_completo.md · aparato: livro/aparato.json.
// ---------------------------------------------------------------------------

const TITLE = 'A Grande Transição';
const SUBTITLE = 'Introdução às Ciências da Consciência Emergente';
const SELO = 'Ciências da Consciência Emergente';
const AUTHOR = 'Vivianne Saraiva';

// paleta (manifesto Pós-Sobrevivência: papel quente envelhecido, ouro, tinta terra)
const PAPER = '#f1e8d6', INK = '#2c2114', TITLEINK = '#33291a', SOFT = '#6a5d49',
  GOLD = '#b9842f', GOLDSOFT = '#9c6a2c', BROWN = '#7a5e38', FAINT = '#9c8e79';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inl = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/"([^"]+)"/g, '“$1”');

const aparato = JSON.parse(readFileSync(LIVRO('aparato.json'), 'utf8'));

// ---- ornamentos ----
// arco alto a emoldurar a coluna de texto (linha dupla, remates, dote no ápice)
const ARCH = `<svg class="arch" viewBox="0 0 600 880" preserveAspectRatio="none" aria-hidden="true">
  <path d="M72 880 L72 300 C72 92 528 92 528 300 L528 880" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <path d="M90 880 L90 312 C90 126 510 126 510 312 L510 880" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.55"/>
  <circle cx="72" cy="300" r="3.4" fill="${GOLD}"/><circle cx="528" cy="300" r="3.4" fill="${GOLD}"/>
  <circle cx="300" cy="120" r="4.4" fill="${GOLD}"/>
  <line x1="284" y1="120" x2="270" y2="120" stroke="${GOLD}" stroke-width="1"/>
  <line x1="316" y1="120" x2="330" y2="120" stroke="${GOLD}" stroke-width="1"/>
</svg>`;
// régua-ponto-régua
const ORN = (c = GOLD) => `<svg class="orn" viewBox="0 0 240 18" aria-hidden="true"><line x1="34" y1="9" x2="104" y2="9" stroke="${c}" stroke-width="1"/><line x1="136" y1="9" x2="206" y2="9" stroke="${c}" stroke-width="1"/><circle cx="120" cy="9" r="4.2" fill="none" stroke="${c}" stroke-width="1"/><circle cx="120" cy="9" r="1.5" fill="${c}"/></svg>`;
// o olho (pergunta para ficar)
const EYE = `<svg class="eye" viewBox="0 0 64 36" aria-hidden="true"><path d="M4 18 C18 2 46 2 60 18 C46 34 18 34 4 18 Z" fill="none" stroke="${GOLDSOFT}" stroke-width="1.4"/><circle cx="32" cy="18" r="7" fill="none" stroke="${GOLDSOFT}" stroke-width="1.4"/><circle cx="32" cy="18" r="2.4" fill="${GOLDSOFT}"/></svg>`;

// ---- parser do manuscrito ----
function parseManuscrito() {
  let raw = readFileSync(LIVRO('A_Grande_Transicao_completo.md'), 'utf8').replace(/\r/g, '');
  const start = raw.indexOf('## PRÓLOGO');
  if (start > 0) raw = raw.slice(start);
  const anexI = raw.indexOf('## ANEXOS');
  if (anexI > 0) raw = raw.slice(0, anexI);
  const lines = raw.split('\n');
  const units = [];
  let cur = null;
  const push = () => { if (cur) units.push(cur); };
  for (let i = 0; i < lines.length; i++) {
    let t = lines[i].trim();
    if (!t || t === '---') continue;
    if (t.startsWith('[IMAGEM')) { while (i < lines.length && !lines[i].trim().endsWith(']')) i++; continue; }
    if (t.startsWith('#### ')) { if (cur) cur.title = t.slice(5).trim(); continue; }
    if (t.startsWith('### ')) {
      const h = t.slice(4).trim();
      if (/^(CAPÍTULO|INTERLÚDIO|EPÍLOGO)/i.test(h)) {
        push();
        const kind = /^CAP/i.test(h) ? 'chapter' : /^INTER/i.test(h) ? 'interlude' : 'epilogue';
        cur = { kind, label: h, title: '', paras: [] };
      } else if (cur && (cur.kind === 'part' || cur.kind === 'prologo' || cur.kind === 'introducao') && !cur.title) {
        cur.title = h;
      }
      continue;
    }
    if (t.startsWith('## ')) {
      const h = t.slice(3).trim();
      push();
      if (/^PARTE/i.test(h)) cur = { kind: 'part', label: h, title: '', paras: [] };
      else if (/^PRÓLOGO/i.test(h)) cur = { kind: 'prologo', label: 'Prólogo', title: '', paras: [] };
      else if (/^INTRODUÇÃO/i.test(h)) cur = { kind: 'introducao', label: 'Introdução', title: '', paras: [] };
      else cur = { kind: 'section', label: h, title: '', paras: [] };
      continue;
    }
    if (t.startsWith('# ')) continue;
    if (/^\*[^*]+\*$/.test(t)) continue;
    if (cur) cur.paras.push(t);
  }
  push();
  return units;
}

function splitLong(paras) {
  const out = [];
  for (const p of paras) {
    const words = p.split(/\s+/).length;
    if (words <= 180) { out.push(p); continue; }
    const sents = p.split(/(?<=[.!?])\s+/);
    if (sents.length < 4) { out.push(p); continue; }
    let best = 1, bestd = 1e9, run = 0; const half = words / 2;
    for (let i = 0; i < sents.length - 1; i++) { run += sents[i].split(/\s+/).length; const d = Math.abs(run - half); if (d < bestd) { bestd = d; best = i + 1; } }
    out.push(sents.slice(0, best).join(' ').trim());
    out.push(sents.slice(best).join(' ').trim());
  }
  return out;
}

function aparatoKey(u) {
  if (u.kind === 'prologo') return 'PRÓLOGO';
  if (u.kind === 'introducao') return 'INTRODUÇÃO';
  return u.title;
}

// abertura emoldurada pelo arco (página própria, sem cabeçalho).
function openerHTML(u) {
  const a = aparato[aparatoKey(u)] || {};
  const setsHeader = u.kind !== 'chapter'; // capítulos herdam o cabeçalho da Parte
  const hcls = setsHeader ? ' sets-head' : '';
  let h = `<section class="opener${hcls}"><div class="arch-wrap">${ARCH}</div><div class="op-col">`;
  if (u.label) h += `<p class="op-kicker">${esc(u.label)}</p>`;
  h += `<h1 class="op-title${setsHeader ? ' head-src' : ''}">${inl(u.title)}</h1>`;
  if (a.epigrafe) h += `<p class="op-epi">${inl(a.epigrafe)}</p>`;
  h += `<div class="op-orn">${ORN()}</div>`;
  h += `</div></section>`;
  return h;
}

function aparatoBoxes(u) {
  const a = aparato[aparatoKey(u)];
  if (!a) return '';
  let h = '';
  if (a.ideia) h += `<section class="box idea"><p class="box-label">Ideia central</p><p class="box-body">${inl(a.ideia)}</p></section>`;
  if (a.pergunta) h += `<section class="box ask">${EYE}<p class="box-label">Pergunta para ficar</p><p class="box-q">${inl(a.pergunta)}</p></section>`;
  return h;
}

function bodyHTML(paras, voz) {
  const blocks = splitLong(paras);
  const cls = voz ? 'body voz' : 'body';
  let h = `<section class="${cls}">`;
  blocks.forEach((p, i) => {
    h += `<p${i === 0 && !voz ? ' class="first"' : ''}>${inl(p)}</p>`;
  });
  h += `</section>`;
  return h;
}

function mapaHTML() {
  return `<section class="mapfig">
    <p class="map-kicker head-src">Cartografia da consciência</p>
    <h2 class="map-title">Mapa da Transição</h2>
    <div class="map-orn">${ORN()}</div>
    <div class="venn">
      <div class="circ c1"><span class="cl">Sobrevivência</span><span class="cs">viver<br>para não morrer</span></div>
      <div class="circ c2"><span class="cl">Fissura</span><span class="cs">entre-mundos<br>perda e possibilidade</span></div>
      <div class="circ c3"><span class="cl">Emergência</span><span class="cs">viver<br>para criar e significar</span></div>
    </div>
    <div class="map-axis"></div>
    <div class="cols">
      <div><h4>Mecanismos</h4><p>medo<br>escassez<br>controlo<br>identidade defensiva<br>esforço</p></div>
      <div><h4>Experiência</h4><p>crise de sentido<br>luto do antigo<br>deslocamento<br>busca<br>pergunta</p></div>
      <div><h4>Emergências</h4><p>criação<br>cooperação<br>consciência<br>identidade fluida<br>significado</p></div>
    </div>
  </section>`;
}

function partHTML(u, n, img) {
  const vis = img
    ? `<img class="part-img" src="${img}">`
    : `<div class="part-img slot">vinheta · parte ${n + 1}</div>`;
  return `<section class="part">
    <p class="pt-kicker">${esc(u.label)}</p>
    <h1 class="pt-title head-src">${inl(u.title)}</h1>
    <div class="pt-orn">${ORN()}</div>
    <div class="part-frame">${vis}</div>
  </section>`;
}

// imagens (proof: nenhuma; produção: data URIs por chave). env TRANSICAO_IMG_DIR.
function partImg() { return null; }

// ---- montar o corpo ----
const units = parseManuscrito();
let partN = 0, mapPut = false;
const bodyUnits = units.map((u) => {
  if (u.kind === 'part') {
    let pre = '';
    if (!mapPut) { pre = mapaHTML(); mapPut = true; }
    return pre + partHTML(u, partN, partImg(partN++));
  }
  if (u.kind === 'prologo' || u.kind === 'introducao')
    return openerHTML(u) + bodyHTML(u.paras, true) + aparatoBoxes(u);
  if (u.kind === 'chapter')
    return openerHTML(u) + bodyHTML(u.paras, false) + aparatoBoxes(u);
  if (u.kind === 'interlude')
    return openerHTML(u) + bodyHTML(u.paras, true);
  if (u.kind === 'epilogue')
    return openerHTML(u) + bodyHTML(u.paras, true) + aparatoBoxes(u);
  return '';
}).join('');

const titlePage = `
<section class="front titlepage">
  <p class="tp-selo">${esc(SELO)}</p>
  <div class="tp-orn">${ORN()}</div>
  <h1 class="tp-title">${esc(TITLE)}</h1>
  <p class="tp-sub">${esc(SUBTITLE)}</p>
  <div class="tp-orn tp-orn2">${ORN()}</div>
  <p class="tp-author">${esc(AUTHOR)}</p>
</section>`;

const colophon = `
<section class="front colophon">
  <div class="cl-orn">${ORN()}</div>
  <h3>A dureza com que tratamos a vida não é quem somos, é a estação em que vivemos.</h3>
  <p class="cl-credit">© 2026 ${esc(AUTHOR)} · ${esc(SELO)}</p>
</section>`;

const body = titlePage + bodyUnits + colophon;

const css = `
@font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
@font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-Italic-var.ttf')}') format('truetype');font-weight:300 600;font-style:italic;}
@font-face{font-family:'Outfit';src:url('${FONT('Outfit-var.ttf')}') format('truetype');font-weight:300 700;font-style:normal;}

@page{ size:148mm 210mm; margin:19mm 17mm 18mm 17mm;
  @top-center{ content:string(sect); font-family:'Outfit',sans-serif; font-weight:400; font-size:6.6pt; letter-spacing:.28em; text-transform:uppercase; color:${FAINT}; }
  @bottom-center{ content:counter(page); font-family:'Outfit',sans-serif; font-size:8pt; color:${SOFT}; }
}
@page front{ @top-center{content:none} @bottom-center{content:none} }
@page opener{ @top-center{content:none} @bottom-center{content:none} }
@page part{ @top-center{content:none} @bottom-center{content:none} }

*{box-sizing:border-box; margin:0; padding:0;}
html{font-family:'Fraunces',Georgia,serif; background:${PAPER};}
body{font-weight:300; font-size:10.6pt; line-height:1.82; color:${INK}; background:${PAPER};
  font-feature-settings:"onum" 1,"liga" 1,"kern" 1; -webkit-hyphens:auto; hyphens:auto;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;}
.head-src{ string-set: sect content(text); }

.front{ page:front; break-before:page; }
.opener{ page:opener; break-before:page; break-after:page; }
.part{ page:part; break-before:page; break-after:page; }
.mapfig{ break-before:page; break-after:page; }
section.body{ break-before:avoid; }
.box{ break-inside:avoid; }

/* ---- abertura emoldurada pelo arco ---- */
.opener{ position:relative; height:172mm; }
.opener .arch-wrap{ position:absolute; inset:6mm 2mm 0; pointer-events:none; }
.opener .arch{ width:100%; height:100%; }
.op-col{ position:absolute; left:14%; right:14%; top:34%; text-align:center; }
.op-kicker{ font-family:'Outfit',sans-serif; font-weight:500; font-size:8.5pt; letter-spacing:.34em; text-transform:uppercase; color:${GOLDSOFT}; margin-bottom:7mm; }
.op-title{ font-family:'Fraunces',serif; font-weight:300; font-size:25pt; line-height:1.14; color:${TITLEINK}; letter-spacing:-.01em; }
.op-epi{ font-style:italic; font-size:11.5pt; color:${BROWN}; margin-top:8mm; line-height:1.5; }
.op-orn{ margin-top:9mm; display:flex; justify-content:center; }
.op-orn svg.orn, .map-orn svg.orn, .pt-orn svg.orn, .tp-orn svg.orn, .cl-orn svg.orn{ width:34mm; height:2.6mm; }

/* ---- corpo dos capítulos: justificado, capitular ---- */
.body p{ text-align:justify; hyphens:auto; orphans:2; widows:2; margin:0 0 3.4mm; }
.body p.first::first-letter{ font-family:'Fraunces',serif; font-weight:400; font-size:38pt; line-height:0.84; color:${GOLD}; float:left; margin:1mm 2.6mm -1mm 0; }
.body em{ font-style:italic; }
/* ---- voz (carta de 2150 / interlúdios): respira, medida estreita, à esquerda ---- */
.body.voz{ max-width:104mm; margin:0 auto; }
.body.voz p{ text-align:left; font-size:11pt; line-height:2.0; margin:0 0 5mm; color:${INK}; }
.body.voz p:first-of-type{ font-style:normal; }

/* ---- caixas do aparato ---- */
.box{ border:0.5pt solid rgba(185,132,47,.45); border-radius:1.6mm; padding:7mm 9mm; margin:9mm auto 7mm; max-width:108mm; background:rgba(185,132,47,.045); text-align:center; }
.box-label{ font-family:'Outfit',sans-serif; font-weight:500; font-size:7.5pt; letter-spacing:.28em; text-transform:uppercase; color:${GOLDSOFT}; margin-bottom:3.5mm; }
.box.idea .box-body{ font-size:10.6pt; line-height:1.62; color:${TITLEINK}; }
.box.ask{ margin-top:6mm; }
.box.ask svg.eye{ width:12mm; height:7mm; display:block; margin:0 auto 2.5mm; }
.box.ask .box-q{ font-style:italic; font-size:11.5pt; line-height:1.5; color:${BROWN}; }

/* ---- rosto ---- */
.titlepage{ height:172mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.tp-selo{ font-family:'Outfit',sans-serif; font-weight:500; font-size:8.5pt; letter-spacing:.3em; text-transform:uppercase; color:${GOLDSOFT}; margin-bottom:7mm; }
.tp-orn{ margin-bottom:12mm; display:flex; justify-content:center; }
.tp-orn2{ margin:12mm 0 0; }
.tp-title{ font-family:'Fraunces',serif; font-weight:300; font-size:40pt; line-height:1.05; color:${TITLEINK}; letter-spacing:-.015em; }
.tp-sub{ font-style:italic; font-size:12.5pt; color:${SOFT}; max-width:74%; margin-top:8mm; line-height:1.5; }
.tp-author{ font-family:'Outfit',sans-serif; font-weight:400; font-size:10pt; letter-spacing:.3em; text-transform:uppercase; color:${INK}; margin-top:7mm; }

/* ---- divisória de Parte ---- */
.part{ height:172mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.pt-kicker{ font-family:'Outfit',sans-serif; font-weight:500; font-size:10pt; letter-spacing:.4em; text-transform:uppercase; color:${GOLDSOFT}; margin-bottom:6mm; }
.pt-title{ font-family:'Fraunces',serif; font-weight:300; font-size:28pt; line-height:1.12; color:${TITLEINK}; max-width:84%; }
.pt-orn{ margin:8mm 0 11mm; display:flex; justify-content:center; }
.part-frame{ width:108mm; height:64mm; border:0.5pt solid rgba(185,132,47,.5); border-radius:1.6mm; overflow:hidden; }
.part-img{ width:100%; height:100%; object-fit:cover; display:block; }
.part-img.slot{ display:flex; align-items:center; justify-content:center; font-family:'Outfit',sans-serif; font-size:8pt; letter-spacing:.22em; text-transform:uppercase; color:${FAINT}; background:rgba(156,106,44,.06); }

/* ---- mapa ---- */
.mapfig{ text-align:center; padding-top:6mm; }
.map-kicker{ font-family:'Outfit',sans-serif; font-weight:500; font-size:8pt; letter-spacing:.3em; text-transform:uppercase; color:${GOLDSOFT}; }
.map-title{ font-family:'Fraunces',serif; font-weight:300; font-size:22pt; color:${TITLEINK}; margin-top:2mm; }
.map-orn{ margin:5mm 0 12mm; display:flex; justify-content:center; }
.venn{ position:relative; height:52mm; width:150mm; margin:0 auto; }
.venn .circ{ position:absolute; top:0; width:60mm; height:52mm; border-radius:50%; border:0.6pt solid rgba(185,132,47,.5); display:flex; flex-direction:column; align-items:center; justify-content:center; }
.venn .c1{ left:0; background:rgba(60,46,28,.16); }
.venn .c2{ left:45mm; background:rgba(156,106,44,.06); }
.venn .c3{ left:90mm; background:rgba(140,128,92,.10); }
.venn .cl{ font-family:'Outfit',sans-serif; font-weight:500; font-size:7pt; letter-spacing:.22em; text-transform:uppercase; color:${GOLDSOFT}; }
.venn .c1 .cl{ color:#efe6d4; }
.venn .cs{ font-style:italic; font-size:7.5pt; margin-top:1.6mm; line-height:1.34; color:${SOFT}; }
.venn .c1 .cs{ color:#d8ccb4; }
.map-axis{ width:128mm; height:0.6pt; background:rgba(185,132,47,.5); margin:7mm auto 0; }
.cols{ display:flex; justify-content:center; margin-top:5mm; }
.cols > div{ width:48mm; padding:0 4mm; }
.cols h4{ font-family:'Outfit',sans-serif; font-weight:500; font-size:7.5pt; letter-spacing:.22em; text-transform:uppercase; color:${GOLDSOFT}; margin-bottom:3mm; padding-bottom:2mm; border-bottom:0.6pt solid rgba(185,132,47,.35); }
.cols p{ font-size:8.5pt; line-height:1.95; color:${SOFT}; }

/* ---- colofão ---- */
.colophon{ height:172mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.colophon .cl-orn{ margin-bottom:10mm; display:flex; justify-content:center; }
.colophon h3{ font-style:italic; font-weight:300; font-size:15pt; color:${TITLEINK}; margin-bottom:9mm; max-width:80%; line-height:1.5; }
.colophon .cl-credit{ font-family:'Outfit',sans-serif; font-size:7.5pt; letter-spacing:.26em; text-transform:uppercase; color:${FAINT}; }
`;

const html = `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">
<title>${esc(TITLE)}</title>
<script>window.PagedConfig={auto:false};</script>
<script src="${'file://' + path.join(__dirname, 'paged.polyfill.js')}"></script>
<style>${css}</style></head><body>${body}</body></html>`;

const htmlPath = path.join(__dirname, 'transicao.html');
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'load', timeout: 120000 });
const total = await page.evaluate(async () => { await document.fonts.ready; const r = await window.PagedPolyfill.preview(); return r.total; });
console.log('Paged.js paginou:', total, 'páginas');
const outPath = path.join(ROOT, 'A-Grande-Transicao.pdf');
const mioloBuf = await page.pdf({ preferCSSPageSize: true, printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
await browser.close();

const COVER = process.env.TRANSICAO_COVER && existsSync(process.env.TRANSICAO_COVER)
  ? path.resolve(process.env.TRANSICAO_COVER) : null;
if (COVER) {
  const { PDFDocument } = require('pdf-lib');
  const buf = readFileSync(COVER);
  let w = 1600, h = 2400, png = buf[0] === 0x89;
  if (png) { w = buf.readUInt32BE(16); h = buf.readUInt32BE(20); }
  else { let o = 2; while (o + 9 < buf.length) { if (buf[o] !== 0xFF) { o++; continue; } const m = buf[o + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) { h = buf.readUInt16BE(o + 5); w = buf.readUInt16BE(o + 7); break; } o += 2 + buf.readUInt16BE(o + 2); } }
  const A5W = 419.53, coverH = +(A5W * h / w).toFixed(2);
  const out = await PDFDocument.create();
  const img = png ? await out.embedPng(buf) : await out.embedJpg(buf);
  out.addPage([A5W, coverH]).drawImage(img, { x: 0, y: 0, width: A5W, height: coverH });
  const miolo = await PDFDocument.load(mioloBuf);
  (await out.copyPages(miolo, miolo.getPageIndices())).forEach((p) => out.addPage(p));
  writeFileSync(outPath, await out.save());
} else {
  writeFileSync(outPath, mioloBuf);
}
console.log('PDF:', outPath);
