import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
// playwright: no dev container está no caminho global; no CI (GitHub Actions)
// é instalado via npm. Tenta o global, recua para o normal.
let chromium;
try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
catch { ({ chromium } = require('playwright')); }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONT = (f) => 'file://' + path.join(__dirname, 'fonts', f);

// idioma: `node build-book.mjs en` ou LANG_BOOK=en
const LANG = (process.argv[2] || process.env.LANG_BOOK || 'pt').toLowerCase().startsWith('en') ? 'en' : 'pt';

// ---- configuração por idioma (a veu.a.veu e o método não se misturam com isto) ----
const CFG = {
  pt: {
    dir: 'content',
    title: 'Os 7 Sinais de Desencaixe',
    subtitle: 'O equilíbrio entre pertença e autenticidade',
    coverTitle: 'Os Sinais<br>de Desencaixe',
    htmlLang: 'pt-PT',
    out: 'Os-7-Sinais-de-Desencaixe.pdf',
    headRe: /^(Sinal|Introdução|Epílogo)/i,
    dedicationFile: '00a-dedicatoria.md',
    notaFile: '00b-nota-de-abertura.md',
    chapters: ['00-introducao.md','01-sinal.md','02-sinal.md','03-sinal.md','04-sinal.md',
               '05-sinal.md','06-sinal.md','07-sinal.md','08-epilogo.md'],
    epilogueFile: '08-epilogo.md',
    notaTitleFallback: 'Nota de abertura',
    tocTitle: 'Índice',
    toc: [
      { t:'Nota de abertura' },
      { t:'Introdução', s:'Porque este não é um livro sobre aprender a encaixar' },
      { n:'Sinal 1', s:'Estás presente mas não te sentes pertencente' },
      { n:'Sinal 2', s:'Começas a diminuir-te para caber' },
      { n:'Sinal 3', s:'Sentes saudades de algo que nunca viveste' },
      { n:'Sinal 4', s:'Oscilas entre hiper-adaptação e isolamento' },
      { n:'Sinal 5', s:'O teu sistema nervoso começa a rejeitar certos ambientes' },
      { n:'Sinal 6', s:'Começas a confundir paz com ausência de pessoas' },
      { n:'Sinal 7', s:'Percebes que o problema nunca foi pertencer, mas o preço da pertença' },
      { t:'Epílogo', s:'O véu do horizonte' },
    ],
    colophonHead: 'Para ti, que leste',
    colophonBody: 'O que acabou foi um lugar. Nenhum dos amores acabou. Se algum destes sinais te reconheceu, fica com ele, sem pressa, e continua a permanecer.',
  },
  en: {
    dir: 'content/en',
    title: 'The Seven Signs of Not Belonging',
    subtitle: 'The balance between belonging and authenticity',
    coverTitle: 'The Signs<br>of Not Belonging',
    htmlLang: 'en',
    out: 'The-Seven-Signs-of-Not-Belonging.pdf',
    headRe: /^(Sign|Introduction|Epilogue)/i,
    dedicationFile: '00a-dedication.md',
    notaFile: '00b-opening-note.md',
    chapters: ['00-introduction.md','01-sign.md','02-sign.md','03-sign.md','04-sign.md',
               '05-sign.md','06-sign.md','07-sign.md','08-epilogue.md'],
    epilogueFile: '08-epilogue.md',
    notaTitleFallback: 'Opening note',
    tocTitle: 'Contents',
    toc: [
      { t:'Opening note' },
      { t:'Introduction', s:'Why this is not a book about learning to fit in' },
      { n:'Sign 1', s:'You are present but you do not feel you belong' },
      { n:'Sign 2', s:'You begin to diminish yourself in order to fit' },
      { n:'Sign 3', s:'You feel homesick for something you never lived' },
      { n:'Sign 4', s:'You swing between over-adaptation and isolation' },
      { n:'Sign 5', s:'Your nervous system begins to reject certain environments' },
      { n:'Sign 6', s:'You begin to confuse peace with the absence of people' },
      { n:'Sign 7', s:'You realise the problem was never belonging, but the price of belonging' },
      { t:'Epilogue', s:'The veil of the horizon' },
    ],
    colophonHead: 'For you, who read',
    colophonBody: 'What ended was a place. None of the loves ended. If any of these signs recognised you, stay with it, without hurry, and go on remaining.',
  },
};
const cfg = CFG[LANG];
const TITLE = cfg.title, SUBTITLE = cfg.subtitle, AUTHOR = 'Vivianne dos Santos';
const C = (p) => path.join(ROOT, cfg.dir, p);

// paleta
const INK = '#2A2536', SOFT = '#5A5468', GOLD = '#B98D3E', VIOLETA = '#3A3357', SALVIA = '#8A8FA3';
// cor por capítulo (muda o título/ornamento; o drop-cap é sempre ouro). chave = índice no array chapters
const CHAP_COLOR = [VIOLETA,'#7C4A4A','#9A6A3A','#8A7A2E','#4F6E55','#3C6E72','#3A4A7A','#5A3A6A','#3C6E72'];

const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl = (s) => esc(s).replace(/\*([^*]+)\*/g,'<em>$1</em>');

// Bloco "pausa" (respiro para o leitor): título em **negrito**, intro, um
// exercício (linha a começar por "> ") e perguntas (linhas a começar por "- ").
function parsePausa(lines){
  let titulo='', exercicio=''; const perguntas=[]; const intro=[];
  for(const l of lines){
    const t=l.trim(); if(!t) continue;
    const mb=t.match(/^\*\*(.+?)\*\*$/);
    if(mb){ titulo=mb[1].trim(); continue; }
    if(t.startsWith('> ')){ exercicio=t.slice(2).trim(); continue; }
    if(t.startsWith('- ')){ perguntas.push(t.slice(2).trim()); continue; }
    intro.push(t);
  }
  return { t:'pausa', titulo, intro:intro.join(' ').trim(), exercicio, perguntas };
}

function parseChapter(file){
  const raw = readFileSync(C(file),'utf8').replace(/\r/g,'');
  let label='', title='', epigraph=''; const blocks=[]; let buf=[]; let pausa=null;
  const flush=()=>{ if(buf.length){ blocks.push({ t:'p', s:buf.join(' ').trim() }); buf=[]; } };
  for(const line of raw.split('\n')){
    const t=line.trim();
    if(pausa!==null){
      if(t===':::'){ blocks.push(parsePausa(pausa)); pausa=null; }
      else pausa.push(t);
      continue;
    }
    if(t===':::pausa' || t==='::: pausa'){ flush(); pausa=[]; continue; }
    if(!t){ flush(); continue; }
    if(t.startsWith('# ')){
      const h=t.slice(2).trim(), i=h.indexOf(',');
      if(i>0 && cfg.headRe.test(h)){ label=h.slice(0,i).trim(); title=h.slice(i+1).trim(); }
      else { label=''; title=h; }
      continue;
    }
    if(/^\*[^*].*\*$/.test(t) && !epigraph && !blocks.length){ epigraph=t.slice(1,-1).trim(); continue; }
    buf.push(t);
  }
  if(pausa!==null) blocks.push(parsePausa(pausa));
  flush();
  return { label, title, epigraph, blocks };
}
// parte parágrafos muito longos (>190 palavras) na frase mais perto do meio.
// Só mexe em blocos de prosa; as pausas passam intactas.
function splitLong(blocks){
  const out=[];
  for(const b of blocks){
    if(b.t!=='p'){ out.push(b); continue; }
    const p=b.s;
    const words=p.split(/\s+/).length;
    if(words<=190){ out.push(b); continue; }
    const sents=p.split(/(?<=[.!?])\s+/);
    if(sents.length<4){ out.push(b); continue; }
    let best=1, bestd=1e9, run=0; const half=words/2;
    for(let i=0;i<sents.length-1;i++){ run+=sents[i].split(/\s+/).length; const d=Math.abs(run-half); if(d<bestd){bestd=d;best=i+1;} }
    out.push({ t:'p', s:sents.slice(0,best).join(' ').trim() });
    out.push({ t:'p', s:sents.slice(best).join(' ').trim() });
  }
  return out;
}

const FLOURISH = (c)=>`<svg class="fl" viewBox="0 0 60 360" width="34" height="200" aria-hidden="true">
  <path d="M44 6 C20 70 20 150 38 210 C50 250 50 300 26 354" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
</svg>`;
const VEU = (c)=>`<svg class="veu" viewBox="0 0 512 512" width="60" height="60" aria-hidden="true">
  <path d="M118 384 C118 224 178 124 256 124 C334 124 394 224 394 384" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
  <path d="M166 392 C166 270 204 200 256 200 C308 200 346 270 346 392" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
  <circle cx="256" cy="98" r="8" fill="${c}"/></svg>`;

function pausaHTML(b, c){
  let h = `<section class="pausa" style="--c:${c}">`;
  if(b.titulo) h += `<p class="pa-tit">${inl(b.titulo)}</p>`;
  if(b.intro) h += `<p class="pa-intro">${inl(b.intro)}</p>`;
  if(b.exercicio) h += `<p class="pa-ex">${inl(b.exercicio)}</p>`;
  if(b.perguntas && b.perguntas.length){
    h += `<ul class="pa-q">${b.perguntas.map(q=>`<li>${inl(q)}</li>`).join('')}</ul>`;
  }
  h += `</section>`;
  return h;
}

function chapter(file, idx){
  const { label, title, epigraph } = parseChapter(file);
  const blocks = splitLong(parseChapter(file).blocks);
  const c = CHAP_COLOR[idx] || VIOLETA;
  let h = `<section class="opener" style="--c:${c}">`;
  h += `<div class="fl-wrap">${FLOURISH(c)}</div>`;
  if(label) h += `<p class="op-label">${esc(label)}</p>`;
  h += `<h1 class="op-title">${inl(title)}</h1>`;
  if(epigraph) h += `<p class="op-epi"><em>${inl(epigraph)}</em></p>`;
  h += `<div class="op-orn">${VEU(c)}</div>`;
  h += `</section>`;
  // respiros: ornamento "· · ·" nos pontos de viragem (contados só na prosa).
  // Não se põe respiro logo antes/depois de uma pausa (já é um respiro).
  const proseIdx = blocks.map((b,i)=>b.t==='p'?i:-1).filter(i=>i>=0);
  const np = proseIdx.length;
  const nBreaks = file===cfg.epilogueFile ? 1 : 2;
  const pos = new Set();
  if(nBreaks===1) pos.add(proseIdx[Math.max(1, Math.min(np-2, Math.round(np/2)))]);
  if(nBreaks===2){ pos.add(proseIdx[Math.max(1, Math.round(np/3))]); pos.add(proseIdx[Math.min(np-2, Math.round(2*np/3))]); }
  h += `<section class="body" style="--c:${c}">`;
  let first=true;
  blocks.forEach((b,i)=>{
    if(b.t==='pausa'){ h += pausaHTML(b,c); return; }
    const prevPausa = i>0 && blocks[i-1].t==='pausa';
    const nextPausa = i<blocks.length-1 && blocks[i+1].t==='pausa';
    if(pos.has(i) && !first && !prevPausa && !nextPausa) h += `<div class="movbreak" style="--c:${c}">· · ·</div>`;
    h += `<p${first?' class="first"':''}>${inl(b.s)}</p>`;
    first=false;
  });
  h += `</section>`;
  return h;
}

const cover = `
<section class="front cover">
  <div class="cv-num">7</div>
  <h1 class="cv-title">${cfg.coverTitle}</h1>
  <div class="cv-rule"></div>
  <p class="cv-sub">${esc(SUBTITLE)}</p>
  <p class="cv-author">${esc(AUTHOR)}</p>
</section>`;

const dedicationHTML = (()=>{
  const paras = readFileSync(C(cfg.dedicationFile),'utf8').replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
  return `<section class="front dedication">${paras.map((p,i)=>`<p${i===0?' class="d-head"':''}>${inl(p)}</p>`).join('')}</section>`;
})();

const nota = (()=>{
  const { title, blocks } = parseChapter(cfg.notaFile);
  const paras = blocks.filter(b=>b.t==='p').map(b=>b.s);
  return `<section class="front nota"><h2 class="fm-title">${esc(title||cfg.notaTitleFallback)}</h2>${paras.map(p=>`<p>${inl(p)}</p>`).join('')}</section>`;
})();

const toc = `
<section class="front toc">
  <h2 class="fm-title">${esc(cfg.tocTitle)}</h2>
  <ul>
    ${cfg.toc.map(e=>`<li>${e.t?`<span class="t">${esc(e.t)}</span>`:''}${e.n?`<span class="n">${esc(e.n)}</span>`:''}${e.s?`<span class="s">${esc(e.s)}</span>`:''}</li>`).join('\n    ')}
  </ul>
</section>`;

const colophon = `
<section class="front colophon">
  <div class="cl-orn">${VEU(GOLD)}</div>
  <h3>${esc(cfg.colophonHead)}</h3>
  <p>${esc(cfg.colophonBody)}</p>
  <p class="cl-credit">© 2026 ${esc(AUTHOR)}</p>
</section>`;

const body =
  cover + dedicationHTML + nota + toc +
  cfg.chapters.map((f,i)=>chapter(f,i)).join('') +
  colophon;

const css = `
@font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-var.ttf')}') format('truetype');font-weight:300 600;font-style:normal;}
@font-face{font-family:'Fraunces';src:url('${FONT('Fraunces-Italic-var.ttf')}') format('truetype');font-weight:300 600;font-style:italic;}
@font-face{font-family:'Outfit';src:url('${FONT('Outfit-var.ttf')}') format('truetype');font-weight:300 700;font-style:normal;}

@page{ size:148mm 210mm; margin:17mm 16mm 18mm 16mm;
  @top-center{ content:"${TITLE}"; font-family:'Outfit',sans-serif; font-weight:400; font-size:6.7pt; letter-spacing:.24em; text-transform:uppercase; color:${SALVIA}; }
  @bottom-center{ content:counter(page); font-family:'Outfit',sans-serif; font-size:8pt; color:${SOFT}; }
}
@page front{ @top-center{content:none} @bottom-center{content:none} }
@page opener{ @top-center{content:none} @bottom-center{content:none} }

*{box-sizing:border-box; margin:0; padding:0;}
html{font-family:'Fraunces',Georgia,serif;}
body{font-weight:300; font-size:10.8pt; line-height:1.8; color:${INK}; -webkit-hyphens:auto; hyphens:auto;}

.front{ page:front; break-before:page; }
.cover{ break-before:avoid; }
.opener{ page:opener; break-before:page; break-after:page; }
.body{ break-before:avoid; }
section.body{ break-before:page; }

/* ---- corpo ---- */
.body p{ text-align:justify; hyphens:auto; -webkit-hyphens:auto; orphans:2; widows:2; margin:0 0 3.2mm; }
.body p.first{ }
.body p.first::first-letter{ font-family:'Fraunces',serif; font-weight:400; font-size:40pt; line-height:0.82; color:${GOLD}; float:left; margin:1mm 2.4mm -1mm 0; }
.body em{ font-style:italic; }
.movbreak{ text-align:center; margin:8mm auto 7mm; color:var(--c); letter-spacing:.45em; font-size:11pt; opacity:.65; break-after:avoid; break-before:avoid; }

/* ---- pausa (respiro do leitor): caixa serena, mais clara, não se parte ---- */
.pausa{ break-inside:avoid; margin:9mm 1mm; padding:7mm 8mm; border:0.4pt solid var(--c); border-radius:2mm; background:rgba(184,141,62,0.05); }
.pausa .pa-tit{ font-family:'Outfit',sans-serif; font-weight:500; font-size:8pt; letter-spacing:.26em; text-transform:uppercase; color:var(--c); text-align:center; margin:0 0 4mm; }
.pausa .pa-intro{ text-align:center; font-style:italic; font-size:10.5pt; line-height:1.6; color:${SOFT}; margin:0 0 4mm; }
.pausa .pa-ex{ text-align:left; font-size:10.5pt; line-height:1.7; color:${INK}; margin:0 0 4mm; }
.pausa .pa-q{ list-style:none; margin:0; padding:0; }
.pausa .pa-q li{ font-style:italic; font-size:10.5pt; line-height:1.55; color:${INK}; text-align:center; margin:0 0 2.4mm; }
.pausa .pa-q li::before{ content:"·"; color:var(--c); margin-right:2mm; }

/* ---- página de abertura ---- */
.opener{ position:relative; height:176mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.opener .fl-wrap{ position:absolute; left:-4mm; top:50%; transform:translateY(-50%); }
.op-label{ font-family:'Outfit',sans-serif; font-weight:500; font-size:8.5pt; letter-spacing:.34em; text-transform:uppercase; color:var(--c); margin-bottom:8mm; }
.op-title{ font-family:'Fraunces',serif; font-weight:400; font-size:24pt; line-height:1.18; color:var(--c); max-width:84%; letter-spacing:-.01em; }
.op-epi{ font-style:italic; font-size:12pt; color:${GOLD}; margin-top:9mm; max-width:74%; }
.op-orn{ margin-top:11mm; opacity:.92; }

/* ---- rosto ---- */
.cover{ height:176mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.cv-num{ font-family:'Fraunces',serif; font-weight:300; font-size:52pt; color:${GOLD}; line-height:1; margin-bottom:3mm; }
.cv-title{ font-family:'Fraunces',serif; font-weight:300; font-size:33pt; line-height:1.1; color:${VIOLETA}; letter-spacing:-.015em; }
.cv-rule{ width:22mm; height:1px; background:${GOLD}; opacity:.7; margin:7mm 0; }
.cv-sub{ font-style:italic; font-size:12pt; color:${SOFT}; max-width:80%; margin-bottom:14mm; }
.cv-author{ font-family:'Outfit',sans-serif; font-weight:400; font-size:9.5pt; letter-spacing:.26em; text-transform:uppercase; color:${INK}; }

/* ---- dedicatória ---- */
.dedication{ height:176mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.dedication p{ font-style:italic; font-size:12pt; color:${INK}; max-width:74%; margin-bottom:6mm; line-height:1.7; }
.dedication .d-head{ font-style:normal; font-family:'Outfit',sans-serif; font-weight:500; letter-spacing:.2em; text-transform:uppercase; font-size:10pt; color:${GOLD}; margin-bottom:11mm; }

/* ---- nota / front titles ---- */
.fm-title{ font-family:'Fraunces',serif; font-weight:300; font-size:21pt; color:${VIOLETA}; text-align:center; margin:6mm 0 9mm; }
.nota p{ text-align:justify; margin:0 0 3.2mm; }
.nota p::first-letter{ }

/* ---- índice ---- */
.toc ul{ list-style:none; max-width:90%; margin:0 auto; }
.toc li{ text-align:center; margin:0 0 4.4mm; line-height:1.2; }
.toc .n,.toc .t{ display:block; font-family:'Outfit',sans-serif; font-weight:500; font-size:8.5pt; letter-spacing:.2em; text-transform:uppercase; color:${GOLD}; }
.toc .s{ display:block; font-style:italic; font-size:11pt; color:${INK}; margin-top:.5mm; }

/* ---- colofão ---- */
.colophon{ height:176mm; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.colophon .cl-orn{ margin-bottom:9mm; }
.colophon h3{ font-style:italic; font-weight:300; font-size:16pt; color:${VIOLETA}; margin-bottom:7mm; }
.colophon p{ font-size:10.5pt; color:${SOFT}; max-width:78%; margin-bottom:4mm; line-height:1.7; }
.colophon .cl-credit{ font-family:'Outfit',sans-serif; font-size:7.5pt; letter-spacing:.26em; text-transform:uppercase; color:${SALVIA}; margin-top:10mm; }
`;

const html = `<!doctype html><html lang="${cfg.htmlLang}"><head><meta charset="utf-8">
<title>${esc(TITLE)}</title>
<script>window.PagedConfig={auto:false};</script>
<script src="${'file://'+path.join(__dirname,'paged.polyfill.js')}"></script>
<style>${css}</style></head><body>${body}</body></html>`;

const htmlPath = path.join(__dirname, LANG==='en' ? 'book-en.html' : 'book.html');
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://'+htmlPath, { waitUntil:'load', timeout:120000 });
const total = await page.evaluate(async ()=>{ await document.fonts.ready; const r=await window.PagedPolyfill.preview(); return r.total; });
console.log('['+LANG+'] Paged.js paginou:', total, 'páginas');
const outPath = path.join(ROOT, cfg.out);
await page.pdf({ path:outPath, preferCSSPageSize:true, printBackground:true, margin:{top:'0',right:'0',bottom:'0',left:'0'} });
await browser.close();
console.log('PDF:', outPath);
