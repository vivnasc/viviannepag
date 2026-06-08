// Preview renderer for "Cá em Casa" — reproduz o BandaSlide.tsx em SVG e
// rasteriza para PNG (resvg). Só para a Vivianne VER um conto antes de produzir.
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const DIR = __dirname;
const conto = JSON.parse(fs.readFileSync(path.join(DIR, 'conto.json'), 'utf8'));

// ── Paleta synchim (lib/estudio-conteudo.ts) ──
const PAL = { bg: '#5A1A2A', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#E08496' };
const BG1 = PAL.bg, BG2 = PAL.bg2, ACCENT = PAL.destaque, TXT = PAL.texto;

// ── Família (lib/banda/personagens.ts) ──
const FAMILIA = [
  { id: 'nina', nome: 'Nina', skin: '#E8C4A0', cabelo: '#3A2A1E', estilo: 'comprido', roupa: '#7E9B8E' },
  { id: 'alice', nome: 'Avó Alice', skin: '#E6C2A2', cabelo: '#CFC7BC', estilo: 'apanhado', roupa: '#B89A6E' },
  { id: 'teresa', nome: 'Teresa', skin: '#E8C6A4', cabelo: '#7A4A2E', estilo: 'medio', roupa: '#B05C38' },
  { id: 'rui', nome: 'Rui', skin: '#D8B086', cabelo: '#2E2218', estilo: 'curto', roupa: '#3A4A6A' },
  { id: 'to', nome: 'Tó', skin: '#EDCBA6', cabelo: '#4A3320', estilo: 'tufo', roupa: '#D8A24A', crianca: true },
];
const getP = (id) => FAMILIA.find((p) => p.id === id);

// Fontes (substitutos do Cormorant/Inter/JetBrains)
const SERIF = 'Liberation Serif';
const SANS = 'Liberation Sans';
const MONO = 'DejaVu Sans Mono';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// quebra de linha aproximada por largura
function wrap(text, fontSize, maxWidth, factor) {
  const cw = fontSize * (factor || 0.5);
  const max = Math.max(1, Math.floor(maxWidth / cw));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (t.length > max && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── Avatar SVG (idêntico ao componente) ──
function avatar(p, size) {
  const s = p.crianca ? size * 0.78 : size;
  const { skin, cabelo, roupa, estilo } = p;
  let inner = '';
  inner += `<path d="M40 200 Q40 150 100 150 Q160 150 160 200 Z" fill="${roupa}"/>`;
  inner += `<rect x="88" y="128" width="24" height="28" fill="${skin}"/>`;
  if (estilo === 'comprido') inner += `<path d="M52 92 Q48 160 70 168 L130 168 Q152 160 148 92 Z" fill="${cabelo}"/>`;
  if (estilo === 'apanhado') inner += `<circle cx="100" cy="40" r="22" fill="${cabelo}"/>`;
  if (estilo === 'medio') inner += `<path d="M56 90 Q54 130 72 138 L128 138 Q146 130 144 90 Z" fill="${cabelo}"/>`;
  inner += `<circle cx="100" cy="92" r="46" fill="${skin}"/>`;
  if (estilo === 'curto') inner += `<path d="M56 88 Q60 48 100 46 Q140 48 144 88 Q140 70 100 68 Q60 70 56 88 Z" fill="${cabelo}"/>`;
  if (estilo === 'tufo') inner += `<path d="M62 78 Q70 50 100 50 Q130 50 138 78 Q126 64 100 64 Q74 64 62 78 Z" fill="${cabelo}"/>`;
  if (estilo === 'comprido' || estilo === 'medio') inner += `<path d="M54 90 Q58 50 100 48 Q142 50 146 90 Q138 66 100 64 Q62 66 54 90 Z" fill="${cabelo}"/>`;
  if (estilo === 'apanhado') inner += `<path d="M58 92 Q62 56 100 54 Q138 56 142 92 Q134 70 100 68 Q66 70 58 92 Z" fill="${cabelo}"/>`;
  inner += `<circle cx="84" cy="94" r="4.5" fill="#2A211A"/><circle cx="116" cy="94" r="4.5" fill="#2A211A"/>`;
  inner += `<path d="M86 110 Q100 120 114 110" stroke="#2A211A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return { w: s, h: s, svg: `<svg x="0" y="0" width="${s}" height="${s}" viewBox="0 0 200 200">${inner}</svg>` };
}

// ── Balão: devolve {w,h,render(cx,topY)} ──
function balao(f) {
  const p = getP(f.id);
  const herdada = f.modo === 'herdada';
  const pensa = f.modo === 'pensa';
  const label = herdada ? 'A VOZ HERDADA' : (p ? p.nome.toUpperCase() : f.id.toUpperCase());
  const fontSize = 40, lh = fontSize * 1.22, padX = 32, padY = 26;
  const inner = 460 - padX * 2;
  let txt = f.fala;
  if (herdada) txt = '«' + txt + '»';
  const lines = wrap(txt, fontSize, inner, herdada ? 0.5 : 0.52);
  const boxW = Math.min(460, Math.max(...lines.map((l) => l.length)) * fontSize * 0.52 + padX * 2);
  const boxH = padY * 2 + lines.length * lh;
  const labelH = 22 + 6;
  const totalH = labelH + boxH + (pensa ? 16 : 0);
  const fill = herdada ? '#efe7da' : '#f3ece0';
  const stroke = herdada ? '#b8956a' : 'rgba(38,34,28,0.12)';
  const rx = pensa ? 40 : 26;
  function render(cx, topY) {
    let s = '';
    // label
    s += `<text x="${cx}" y="${topY + 18}" font-family="${SANS}" font-size="22" letter-spacing="3.5" text-anchor="middle" fill="${herdada ? '#b8956a' : '#8a8378'}">${esc(label)}</text>`;
    const bx = cx - boxW / 2, by = topY + labelH;
    s += `<rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${herdada ? 2 : 1}" ${herdada ? 'stroke-dasharray="8 6"' : ''}/>`;
    // texto
    const ty0 = by + padY + fontSize * 0.78;
    lines.forEach((l, i) => {
      s += `<text x="${cx}" y="${ty0 + i * lh}" font-family="${SERIF}" font-size="${fontSize}" ${herdada ? 'font-style="italic"' : ''} text-anchor="middle" fill="#26221c">${esc(l)}</text>`;
    });
    // cauda (não no pensa)
    if (!pensa) {
      const tipY = by + boxH;
      s += `<path d="M${cx - 16} ${tipY} L${cx + 16} ${tipY} L${cx} ${tipY + 18} Z" fill="${fill}"/>`;
    } else {
      [10, 7, 4].forEach((d, i) => { s += `<circle cx="${cx}" cy="${by + boxH + 12 + i * 0}" r="${d / 2}" fill="${fill}" opacity="0.85"/>`; });
    }
    return s;
  }
  return { w: boxW, h: totalH, render };
}

function painelSVG(painel, numero, total) {
  const W = 1080, H = 1920;
  const personagens = (painel.personagens || []).filter((f) => f.fala && getP(f.id)).slice(0, 2);
  const ehLicao = !!painel.licao && personagens.length === 0;
  let body = '';

  // defs: gradiente de fundo
  body += `<defs><radialGradient id="bg" cx="50%" cy="24%" r="80%"><stop offset="0%" stop-color="${BG1}"/><stop offset="76%" stop-color="${BG2}"/></radialGradient></defs>`;
  body += `<rect width="${W}" height="${H}" fill="${BG2}"/>`;
  body += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;

  // título da série
  body += `<text x="${W / 2}" y="160" font-family="${SANS}" font-size="24" letter-spacing="10" text-anchor="middle" fill="${ACCENT}" opacity="0.9">CÁ EM CASA</text>`;

  if (ehLicao) {
    const lines = wrap(painel.licao, 76, 880, 0.52);
    const lh = 76 * 1.2;
    const blockH = 60 + 28 + lines.length * lh;
    let y = (H - blockH) / 2;
    body += `<text x="${W / 2}" y="${y + 30}" font-family="${SERIF}" font-size="30" letter-spacing="14" text-anchor="middle" fill="${ACCENT}" opacity="0.6">◇ ◇ ◇</text>`;
    y += 60 + 28 + 76 * 0.78;
    lines.forEach((l, i) => {
      body += `<text x="${W / 2}" y="${y + i * lh}" font-family="${SERIF}" font-size="76" font-weight="300" text-anchor="middle" fill="${TXT}">${esc(l)}</text>`;
    });
  } else {
    // medir blocos
    const cenLines = painel.cenario ? wrap(painel.cenario, 38, 820, 0.5) : [];
    const cenH = cenLines.length ? cenLines.length * 38 * 1.3 + 40 : 0;
    const baloes = personagens.map(balao);
    const balRowH = Math.max(0, ...baloes.map((b) => b.h));
    const avSize = 300;
    const avH = avSize; // criança 0.78 mas alinhado em baixo
    const gapBal = 56;
    const totalH = cenH + balRowH + gapBal + avH;
    let y = (H - totalH) / 2;

    // cenário
    cenLines.forEach((l, i) => {
      body += `<text x="${W / 2}" y="${y + 38 * 0.78 + i * 38 * 1.3}" font-family="${SERIF}" font-style="italic" font-size="38" text-anchor="middle" fill="${TXT}" opacity="0.8">${esc(l)}</text>`;
    });
    y += cenH;

    // balões (lado a lado, alinhados em baixo)
    const gapCols = 40;
    const totalBalW = baloes.reduce((a, b) => a + b.w, 0) + gapCols * (baloes.length - 1);
    let bx = W / 2 - totalBalW / 2;
    baloes.forEach((b) => {
      const cx = bx + b.w / 2;
      const topY = y + (balRowH - b.h); // alinhar em baixo
      body += b.render(cx, topY);
      bx += b.w + gapCols;
    });
    y += balRowH + gapBal;

    // avatares (lado a lado, gap 80, alinhados em baixo)
    const gapAv = 80;
    const avs = personagens.map((f) => avatar(getP(f.id), avSize));
    const totalAvW = avs.reduce((a, b) => a + b.w, 0) + gapAv * (avs.length - 1);
    let ax = W / 2 - totalAvW / 2;
    avs.forEach((a) => {
      const ty = y + (avH - a.h);
      body += `<g transform="translate(${ax} ${ty})">${a.svg}</g>`;
      ax += a.w + gapAv;
    });
  }

  // rodapé
  let fy = H - 120;
  if (total > 1) {
    const dotGap = 24, dotsW = (total - 1) * dotGap;
    let dx = W / 2 - dotsW / 2;
    for (let i = 0; i < total; i++) {
      body += `<circle cx="${dx}" cy="${fy}" r="6" fill="${ACCENT}" opacity="${i + 1 === numero ? 1 : 0.3}"/>`;
      dx += dotGap;
    }
    fy += 40;
  }
  body += `<text x="${W / 2}" y="${fy + 24}" font-family="${SERIF}" font-style="italic" font-size="32" text-anchor="middle" fill="${TXT}" opacity="0.72">Véu a Véu</text>`;
  body += `<text x="${W / 2}" y="${fy + 66}" font-family="${MONO}" font-size="22" letter-spacing="1" text-anchor="middle" fill="${ACCENT}" opacity="0.8">viviannedossantos.com</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

// render todos
const total = conto.paineis.length;
const outDir = path.join(DIR, 'png');
fs.mkdirSync(outDir, { recursive: true });
conto.paineis.forEach((pa, i) => {
  const svg = painelSVG(pa, i + 1, total);
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 }, font: { loadSystemFonts: true } });
  const png = r.render().asPng();
  const f = path.join(outDir, `painel-${i + 1}.png`);
  fs.writeFileSync(f, png);
  console.log('escrito', f, png.length, 'bytes');
});
console.log('OK', total, 'painéis');
