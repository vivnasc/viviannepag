'use strict';
// GERA a Biblioteca Visual VDS: 59 componentes SVG modulares (o manifesto da spec),
// tokens/vds-tokens.css e index.html de revisao. Cada SVG cumpre o contrato tecnico:
// viewBox normalizado, cor so via var(--vds-*, fallback), pathLength=1 nos tracos
// animaveis, linecap/linejoin round, ids limpos, comentario de cabecalho. Sem travessoes.
// Correr: node scripts/gen-biblioteca-vds.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', 'biblioteca-vds');

const TOK = {
  '--vds-bg': '#1c1610', '--vds-bg-2': '#241c14', '--vds-gold': '#c9a15e',
  '--vds-gold-soft': '#d9bd8a', '--vds-light': '#f4ede1', '--vds-line': '#6f5a3d',
};
const V = (name) => `var(${name}, ${TOK[name]})`;
const f2 = (n) => (Math.round(n * 100) / 100).toString();

// deterministico (para poeira/particulas): LCG
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }

// envelope do ficheiro (defs/style com as variaveis usadas + corpo)
function file({ name, cat, variante, anim, vb, defs = '', body = '', vars = ['--vds-gold'] }) {
  const varLine = vars.map((v) => `${v}: ${TOK[v]};`).join(' ');
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
  <!-- ${name} | ${cat} | ${variante} | animar: ${anim} -->
  <defs>
    <style>
      :root { ${varLine} }
    </style>${defs ? '\n    ' + defs : ''}
  </defs>
${body}
</svg>
`;
}
const strokeG = (inner, { id, sw = 1.25, stroke = '--vds-gold', extra = '' } = {}) =>
  `<g${id ? ` id="${id}"` : ''} fill="none" stroke="${V(stroke)}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra ? ' ' + extra : ''}>
    ${inner}
  </g>`;

// caminho seno (topografia/correntes)
function sinePath(orient, offset, amp, waves, extent = 100, steps = 44) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, pos = t * extent, w = amp * Math.sin(t * waves * 2 * Math.PI);
    const x = orient === 'h' ? pos : offset + w, y = orient === 'h' ? offset + w : pos;
    d += (i === 0 ? 'M' : 'L') + f2(x) + ' ' + f2(y) + ' ';
  }
  return d.trim();
}
function spiralPath(turns, r0, r1, cx = 50, cy = 50, steps = 240) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, th = t * turns * 2 * Math.PI, r = r0 + (r1 - r0) * t;
    const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    d += (i === 0 ? 'M' : 'L') + f2(x) + ' ' + f2(y) + ' ';
  }
  return d.trim();
}

// ---------------- GEOMETRIA (100x100) ----------------
function ringsConcentric(n) {
  const step = 40 / n, r = [];
  for (let i = 1; i <= n; i++) r.push(`<circle id="ring-${i}" cx="50" cy="50" r="${f2(step * i)}" pathLength="1"/>`);
  return { body: strokeG(r.join('\n    '), { id: 'rings' }) };
}
function ringsIncomplete() {
  const r = [];
  for (let i = 1; i <= 5; i++) r.push(`<circle id="ring-${i}" cx="50" cy="50" r="${f2(8 * i)}" pathLength="1" stroke-dasharray="0.72 0.28" transform="rotate(${i * 24} 50 50)"/>`);
  return { body: strokeG(r.join('\n    '), { id: 'rings' }) };
}
function ringsOffset() {
  const r = [];
  for (let i = 1; i <= 5; i++) r.push(`<circle id="ring-${i}" cx="${f2(50 + (i - 3) * 3)}" cy="50" r="${f2(8 * i)}" pathLength="1"/>`);
  return { body: strokeG(r.join('\n    '), { id: 'rings' }) };
}
function eclipse(variant) {
  let cx = 50, off = 0, halo = '';
  if (variant === 'partial') off = 6;
  if (variant === 'lateral') cx = 63;
  const defs = `<radialGradient id="corona">
      <stop offset="52%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/>
      <stop offset="72%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/>
    </radialGradient>`;
  if (variant === 'halo') halo = `\n  <circle id="halo" cx="${cx}" cy="50" r="27" fill="none" stroke="${V('--vds-gold-soft')}" stroke-width="0.6" opacity="0.55"/>`;
  const body = `<circle id="corona-glow" cx="${cx}" cy="50" r="30" fill="url(#corona)"/>${halo}
  <circle id="disc" cx="${f2(cx + off)}" cy="50" r="20" fill="${V('--vds-bg')}" stroke="${V('--vds-gold')}" stroke-width="1.1"/>`;
  return { defs, body, vars: ['--vds-gold', '--vds-gold-soft', '--vds-bg'] };
}
function vesica(variant) {
  const r = 22, h = 11;
  const pairs = [];
  if (variant === 'horizontal') pairs.push([50 - h, 50], [50 + h, 50]);
  else if (variant === 'vertical') pairs.push([50, 50 - h], [50, 50 + h]);
  else if (variant === 'stacked') pairs.push([50, 38 - h], [50, 38 + h], [50, 62 - h], [50, 62 + h]);
  else if (variant === 'triple') pairs.push([50 - h, 44], [50 + h, 44], [50, 44 + h * 1.6]);
  else pairs.push([50 - h, 50], [50 + h, 50]); // intersection
  const circ = pairs.map((p, i) => `<circle id="c-${i + 1}" cx="${f2(p[0])}" cy="${f2(p[1])}" r="${r}" pathLength="1"/>`).join('\n    ');
  let extra = '', defs = '', vars = ['--vds-gold'];
  if (variant === 'intersection') {
    defs = `<radialGradient id="lens"><stop offset="0%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0.85"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`;
    extra = `\n  <ellipse id="focus" cx="50" cy="50" rx="6" ry="11" fill="url(#lens)"/>`;
    vars = ['--vds-gold', '--vds-gold-soft'];
  }
  return { defs, body: strokeG(circ, { id: 'vesica' }) + extra, vars };
}
function orbit(variant) {
  const node = `<circle id="node" cx="86" cy="50" r="2.4" fill="${V('--vds-gold-soft')}"/>`;
  let arc, vars = ['--vds-gold', '--vds-gold-soft'], dash = '';
  if (variant === 'dotted') dash = ' stroke-dasharray="0.006 0.02"';
  if (variant === 'continuous' || variant === 'dotted')
    arc = `<circle id="orbit" cx="50" cy="50" r="36" pathLength="1"${dash}/>`;
  else if (variant === 'incomplete')
    arc = `<path id="orbit" d="M50 14 A36 36 0 1 1 22 78" pathLength="1"/>`;
  else // asymmetric
    arc = `<ellipse id="orbit" cx="50" cy="50" rx="40" ry="22" pathLength="1" transform="rotate(-18 50 50)"/>`;
  return { body: strokeG(arc, { id: 'orbit-g' }) + '\n  ' + node, vars };
}

// ---------------- TOPOGRAFIA (100x100) ----------------
function flow(variant) {
  const lines = [];
  if (variant === 'horizontal' || variant === 'vertical' || variant === 'diagonal') {
    const or = variant === 'vertical' ? 'v' : 'h';
    for (let i = 0; i < 6; i++) lines.push(`<path id="l-${i + 1}" d="${sinePath(or, 18 + i * 13, 5, 1.5)}" pathLength="1"/>`);
    const rot = variant === 'diagonal' ? ' transform="rotate(-22 50 50)"' : '';
    return { body: strokeG(lines.join('\n    '), { id: 'flow', sw: 0.9, extra: rot }) };
  }
  if (variant === 's') { for (let i = 0; i < 5; i++) lines.push(`<path id="l-${i + 1}" d="${sinePath('v', 22 + i * 14, 10, 1)}" pathLength="1"/>`); return { body: strokeG(lines.join('\n    '), { id: 'flow', sw: 0.9 }) }; }
  if (variant === 'spiral') return { body: strokeG(`<path id="spiral" d="${spiralPath(3.2, 2, 42)}" pathLength="1"/>`, { id: 'flow', sw: 1.1 }) };
  // convergent: lines meeting a point
  for (let i = 0; i < 9; i++) { const y = 12 + i * 9.5; lines.push(`<path id="l-${i + 1}" d="M6 ${f2(y)} Q60 ${f2((y + 50) / 2)} 92 50" pathLength="1"/>`); }
  return { body: strokeG(lines.join('\n    '), { id: 'flow', sw: 0.8 }) + `\n  <circle cx="92" cy="50" r="2.2" fill="${V('--vds-gold-soft')}"/>`, vars: ['--vds-gold', '--vds-gold-soft'] };
}
function field() {
  const l = [];
  for (let i = 0; i < 5; i++) { const s = 8 + i * 8; l.push(`<path id="f-${i + 1}" d="M50 8 C ${50 + s * 1.8} 30, ${50 + s * 1.8} 70, 50 92" pathLength="1"/>`); l.push(`<path id="fm-${i + 1}" d="M50 8 C ${50 - s * 1.8} 30, ${50 - s * 1.8} 70, 50 92" pathLength="1"/>`); }
  return { body: strokeG(l.join('\n    '), { id: 'field', sw: 0.85 }) + `\n  <circle cx="50" cy="50" r="1.8" fill="${V('--vds-gold-soft')}"/>`, vars: ['--vds-gold', '--vds-gold-soft'] };
}
function current(kind) {
  const cfg = { water: [7, 2, 6], wind: [4, 3, 7], smoke: [11, 1.2, 5] }[kind];
  const l = [];
  for (let i = 0; i < cfg[2]; i++) l.push(`<path id="c-${i + 1}" d="${sinePath('h', 20 + i * (60 / cfg[2]), cfg[0], cfg[1])}" pathLength="1" opacity="${f2(0.5 + 0.5 * (i % 2))}"/>`);
  return { body: strokeG(l.join('\n    '), { id: 'current', sw: 0.85 }) };
}

// ---------------- FIOS (60x200) ----------------
function thread(variant) {
  const base = 'M30 10 C 40 55, 20 105, 30 150 S 36 188, 30 192';
  if (variant === 'simple') return { vb: '0 0 60 200', body: strokeG(`<path id="thread" d="${base}" pathLength="1"/>`, {}) };
  if (variant === 'double') return { vb: '0 0 60 200', body: strokeG(`<path id="t1" d="${base}" pathLength="1"/>
    <path id="t2" d="M30 10 C 20 55, 40 105, 30 150 S 24 188, 30 192" pathLength="1" opacity="0.55"/>`, {}) };
  if (variant === 'broken') return { vb: '0 0 60 200', body: strokeG(`<path id="thread" d="${base}" pathLength="1" stroke-dasharray="0.14 0.06"/>`, {}) };
  if (variant === 'knot') return {
    vb: '0 0 60 200',
    body: strokeG(`<path id="thread" d="M30 10 C 42 50, 46 78, 30 90 C 14 102, 18 120, 30 122 C 44 124, 40 150, 30 160 S 34 188, 30 192" pathLength="1"/>`, {}) + `\n  <circle cx="30" cy="106" r="2" fill="${V('--vds-gold-soft')}"/>`,
    vars: ['--vds-gold', '--vds-gold-soft'],
  };
  // glow-tip (exemplo canonico)
  return {
    vb: '0 0 60 200',
    defs: `<radialGradient id="tip-glow"><stop offset="0%" stop-color="${V('--vds-gold-soft')}"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`,
    body: `<path id="thread" d="M30 10 C 38 60, 22 110, 30 160 S 34 185, 30 190" fill="none" stroke="${V('--vds-gold')}" stroke-width="1.25" stroke-linecap="round" pathLength="1"/>
  <circle id="tip" cx="30" cy="190" r="10" fill="url(#tip-glow)"/>
  <circle cx="30" cy="190" r="2" fill="${V('--vds-gold-soft')}"/>`,
    vars: ['--vds-gold', '--vds-gold-soft'],
  };
}
function destiny() { return { vb: '0 0 60 200', body: strokeG(`<path id="destiny" d="M14 6 C 48 40, 6 70, 34 100 C 56 124, 10 150, 40 176 C 48 184, 40 194, 30 196" pathLength="1"/>`, {}) }; }
function breath() { return { vb: '0 0 60 200', body: strokeG(`<path id="breath" d="${sinePath('v', 30, 8, 3, 190).replace('M', 'M ')}" pathLength="1"/>`, {}) }; }

// ---------------- PONTOS (100x100) ----------------
function node(variant) {
  if (variant === 'solid') return { body: `<circle id="node" cx="50" cy="50" r="6" fill="${V('--vds-gold')}"/>` };
  if (variant === 'hollow') return { body: strokeG(`<circle id="node" cx="50" cy="50" r="6" pathLength="1"/>`, { sw: 1.4 }) };
  return { defs: `<radialGradient id="ng"><stop offset="0%" stop-color="${V('--vds-gold-soft')}"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`, body: `<circle id="glow" cx="50" cy="50" r="22" fill="url(#ng)"/>
  <circle id="node" cx="50" cy="50" r="4" fill="${V('--vds-gold-soft')}"/>`, vars: ['--vds-gold-soft'] };
}
const STAR4 = 'M50 14 C 53 45, 55 47, 86 50 C 55 53, 53 55, 50 86 C 47 55, 45 53, 14 50 C 45 47, 47 45, 50 14 Z';
function star(variant) {
  if (variant === '4') return { body: strokeG(`<path id="star" d="${STAR4}" pathLength="1"/>`, { sw: 1.1 }) };
  if (variant === 'flare') return {
    defs: `<radialGradient id="fg"><stop offset="0%" stop-color="${V('--vds-gold-soft')}"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`,
    body: `<circle cx="50" cy="50" r="20" fill="url(#fg)"/>
  <path id="star" d="${STAR4}" fill="${V('--vds-gold-soft')}"/>
  ` + strokeG(`<line x1="50" y1="6" x2="50" y2="94"/><line x1="6" y1="50" x2="94" y2="50"/>`, { id: 'rays', sw: 0.5, extra: 'opacity="0.5"' }),
    vars: ['--vds-gold', '--vds-gold-soft'],
  };
  // cross
  return { body: strokeG(`<line x1="50" y1="20" x2="50" y2="80"/><line x1="20" y1="50" x2="80" y2="50"/>`, { id: 'cross', sw: 0.9 }) + `\n  <circle cx="50" cy="50" r="2.4" fill="${V('--vds-gold-soft')}"/>`, vars: ['--vds-gold', '--vds-gold-soft'] };
}
function dust(seed = 7) {
  const r = rng(seed), pts = [];
  for (let i = 0; i < 34; i++) { const x = f2(r() * 100), y = f2(r() * 100), rad = f2(0.4 + r() * 1.3), op = f2(0.25 + r() * 0.6); pts.push(`<circle cx="${x}" cy="${y}" r="${rad}" fill="${V('--vds-gold-soft')}" opacity="${op}"/>`); }
  return { body: `<g id="dust">\n    ${pts.join('\n    ')}\n  </g>`, vars: ['--vds-gold-soft'] };
}

// ---------------- DIVISORES (200x60) ----------------
function divider(variant) {
  if (variant === 'line') return { vb: '0 0 200 60', body: strokeG(`<line id="line" x1="20" y1="30" x2="180" y2="30" pathLength="1"/>`, { sw: 1 }) };
  if (variant === 'dashed') return { vb: '0 0 200 60', body: strokeG(`<line id="line" x1="20" y1="30" x2="180" y2="30" pathLength="1" stroke-dasharray="0.02 0.02"/>`, { sw: 1 }) };
  if (variant === 'center-dot') return { vb: '0 0 200 60', body: strokeG(`<line id="line-left" x1="20" y1="30" x2="92" y2="30" pathLength="1"/>
    <line id="line-right" x1="108" y1="30" x2="180" y2="30" pathLength="1"/>`, { sw: 1 }) + `\n  <circle id="dot" cx="100" cy="30" r="3" fill="${V('--vds-gold')}"/>` };
  return { vb: '0 0 200 60', defs: `<linearGradient id="dg"><stop offset="0%" stop-color="${V('--vds-gold')}" stop-opacity="0"/><stop offset="50%" stop-color="${V('--vds-gold')}"/><stop offset="100%" stop-color="${V('--vds-gold')}" stop-opacity="0"/></linearGradient>`, body: `<line id="line" x1="20" y1="30" x2="180" y2="30" stroke="url(#dg)" stroke-width="1.4" stroke-linecap="round" pathLength="1"/>
  <circle id="dot" cx="100" cy="30" r="2.4" fill="${V('--vds-gold-soft')}"/>`, vars: ['--vds-gold', '--vds-gold-soft'] };
}

// ---------------- MOLDURAS (100x100) ----------------
function frameEditorial() { return { body: strokeG(`<rect id="frame" x="8" y="8" width="84" height="84" rx="2" pathLength="1"/>`, { sw: 0.9 }) }; }
function cornerBrackets() {
  const c = (x, y, dx, dy) => `<path d="M${x} ${f2(y + dy * 10)} L${x} ${y} L${f2(x + dx * 10)} ${y}" pathLength="1"/>`;
  return { body: strokeG([c(10, 10, 1, 1), c(90, 10, -1, 1), c(10, 90, 1, -1), c(90, 90, -1, -1)].join('\n    '), { id: 'brackets', sw: 1.1 }) };
}
function windowOpen() {
  return { body: strokeG(`<line x1="50" y1="18" x2="50" y2="82"/><line x1="18" y1="50" x2="82" y2="50"/>
    <line x1="46" y1="22" x2="54" y2="22"/><line x1="46" y1="78" x2="54" y2="78"/>
    <line x1="22" y1="46" x2="22" y2="54"/><line x1="78" y1="46" x2="78" y2="54"/>`, { id: 'cross', sw: 0.7 }) };
}

// ---------------- LUZ (100x100 / 200x60) ----------------
function halo() { return { defs: `<radialGradient id="hg"><stop offset="60%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/><stop offset="82%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0.7"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`, body: `<circle id="halo" cx="50" cy="50" r="40" fill="url(#hg)"/>`, vars: ['--vds-gold-soft'] }; }
function glowRadial() { return { defs: `<radialGradient id="gr"><stop offset="0%" stop-color="${V('--vds-light')}" stop-opacity="0.9"/><stop offset="45%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0.4"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></radialGradient>`, body: `<circle id="glow" cx="50" cy="50" r="46" fill="url(#gr)"/>`, vars: ['--vds-gold-soft', '--vds-light'] }; }
function beamHorizontal() { return { vb: '0 0 200 60', defs: `<linearGradient id="bg"><stop offset="0%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/><stop offset="50%" stop-color="${V('--vds-light')}" stop-opacity="0.85"/><stop offset="100%" stop-color="${V('--vds-gold-soft')}" stop-opacity="0"/></linearGradient>`, body: `<rect id="beam" x="0" y="27" width="200" height="6" fill="url(#bg)"/>`, vars: ['--vds-gold-soft', '--vds-light'] }; }
function reflection() { return { body: strokeG(`<line x1="20" y1="42" x2="80" y2="42"/>
    <line x1="26" y1="52" x2="74" y2="52" opacity="0.5"/>
    <line x1="32" y1="60" x2="68" y2="60" opacity="0.28"/>`, { id: 'reflection', sw: 0.9 }) }; }

// ---------------- ATMOSFERA (100x100), aplicar por cima (mix-blend-mode no post) ----------------
function grain() { return { defs: `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`, body: `<rect width="100" height="100" filter="url(#grain)" opacity="0.12"/>`, vars: ['--vds-gold'] }; }
function vignette() { return { defs: `<radialGradient id="vg"><stop offset="55%" stop-color="${V('--vds-bg')}" stop-opacity="0"/><stop offset="100%" stop-color="${V('--vds-bg')}" stop-opacity="0.9"/></radialGradient>`, body: `<rect width="100" height="100" fill="url(#vg)"/>`, vars: ['--vds-bg'] }; }
function mist() { return { defs: `<filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>`, body: `<g filter="url(#blur)" opacity="0.14">
    <ellipse cx="34" cy="60" rx="30" ry="12" fill="${V('--vds-light')}"/>
    <ellipse cx="70" cy="44" rx="24" ry="10" fill="${V('--vds-light')}"/>
  </g>`, vars: ['--vds-light'] }; }
function dustLight() { return dust(19); }
function windowShadow() { return { defs: `<linearGradient id="ws" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${V('--vds-bg')}" stop-opacity="0"/><stop offset="100%" stop-color="${V('--vds-bg')}" stop-opacity="0.55"/></linearGradient>`, body: `<g transform="rotate(-24 50 50)" opacity="0.5">
    <rect x="-20" y="18" width="140" height="12" fill="${V('--vds-bg')}"/>
    <rect x="-20" y="44" width="140" height="12" fill="${V('--vds-bg')}"/>
    <rect x="-20" y="70" width="140" height="12" fill="${V('--vds-bg')}"/>
  </g>
  <rect width="100" height="100" fill="url(#ws)"/>`, vars: ['--vds-bg'] }; }
function sunRays() {
  const rays = [];
  for (let i = 0; i < 7; i++) { const a = (-20 + i * 14) * Math.PI / 180; const x = 100 * Math.cos(a), y = 100 * Math.sin(a); rays.push(`<polygon points="0,0 ${f2(x)},${f2(y - 4)} ${f2(x)},${f2(y + 4)}" fill="${V('--vds-light')}" opacity="0.10"/>`); }
  return { defs: `<radialGradient id="sr"><stop offset="0%" stop-color="${V('--vds-light')}" stop-opacity="0.5"/><stop offset="100%" stop-color="${V('--vds-light')}" stop-opacity="0"/></radialGradient>`, body: `<g transform="translate(6 6)">
    ${rays.join('\n    ')}
    <circle cx="0" cy="0" r="14" fill="url(#sr)"/>
  </g>`, vars: ['--vds-light'] };
}

// ---------------- MANIFESTO ----------------
const M = [
  // geometria
  ['geometria', 'rings-concentric-03', '3 aneis', 'expansao radial escalonada', '0 0 100 100', () => ringsConcentric(3)],
  ['geometria', 'rings-concentric-05', '5 aneis', 'expansao radial escalonada', '0 0 100 100', () => ringsConcentric(5)],
  ['geometria', 'rings-concentric-07', '7 aneis', 'expansao radial escalonada', '0 0 100 100', () => ringsConcentric(7)],
  ['geometria', 'rings-incomplete-01', 'aneis incompletos', 'tracos a desenharem-se com rotacao', '0 0 100 100', () => ringsIncomplete()],
  ['geometria', 'rings-offset-01', 'aneis deslocados', 'deriva lenta dos centros', '0 0 100 100', () => ringsOffset()],
  ['geometria', 'eclipse-partial-01', 'parcial', 'passagem lenta do disco', '0 0 100 100', () => eclipse('partial')],
  ['geometria', 'eclipse-central-01', 'central', 'brilho no bordo a pulsar', '0 0 100 100', () => eclipse('central')],
  ['geometria', 'eclipse-lateral-01', 'lateral', 'disco a deslizar para o centro', '0 0 100 100', () => eclipse('lateral')],
  ['geometria', 'eclipse-halo-01', 'com halo', 'halo a respirar', '0 0 100 100', () => eclipse('halo')],
  ['geometria', 'vesica-horizontal-01', 'horizontal', 'intersecao como foco de luz', '0 0 100 100', () => vesica('horizontal')],
  ['geometria', 'vesica-vertical-01', 'vertical', 'intersecao como foco de luz', '0 0 100 100', () => vesica('vertical')],
  ['geometria', 'vesica-stacked-01', 'empilhada', 'aparecimento em cadeia', '0 0 100 100', () => vesica('stacked')],
  ['geometria', 'vesica-triple-01', 'tripla', 'tres focos a acender', '0 0 100 100', () => vesica('triple')],
  ['geometria', 'vesica-intersection-01', 'intersecao iluminada', 'foco de luz a crescer', '0 0 100 100', () => vesica('intersection')],
  ['geometria', 'orbit-continuous-01', 'continuo', 'rotacao suave, no a orbitar', '0 0 100 100', () => orbit('continuous')],
  ['geometria', 'orbit-dotted-01', 'pontilhado', 'rotacao suave', '0 0 100 100', () => orbit('dotted')],
  ['geometria', 'orbit-incomplete-01', 'incompleto', 'traco a desenhar-se', '0 0 100 100', () => orbit('incomplete')],
  ['geometria', 'orbit-asymmetric-01', 'assimetrico', 'rotacao da elipse', '0 0 100 100', () => orbit('asymmetric')],
  // topografia
  ['topografia', 'flow-horizontal-01', 'horizontais', 'ondulacao lenta, deslocamento de fase', '0 0 100 100', () => flow('horizontal')],
  ['topografia', 'flow-vertical-01', 'verticais', 'ondulacao lenta, deslocamento de fase', '0 0 100 100', () => flow('vertical')],
  ['topografia', 'flow-diagonal-01', 'diagonais', 'ondulacao lenta', '0 0 100 100', () => flow('diagonal')],
  ['topografia', 'flow-s-01', 'em S', 'ondulacao lenta', '0 0 100 100', () => flow('s')],
  ['topografia', 'flow-spiral-01', 'espiral', 'traco a desenhar-se para dentro', '0 0 100 100', () => flow('spiral')],
  ['topografia', 'flow-convergent-01', 'convergentes', 'convergencia para o ponto', '0 0 100 100', () => flow('convergent')],
  ['topografia', 'field-magnetic-01', 'campo', 'linhas a pulsar em torno do centro', '0 0 100 100', () => field()],
  ['topografia', 'current-water-01', 'agua', 'deslocamento de fase suave', '0 0 100 100', () => current('water')],
  ['topografia', 'current-wind-01', 'vento', 'deslocamento de fase rapido', '0 0 100 100', () => current('wind')],
  ['topografia', 'current-smoke-01', 'fumo', 'subida lenta e ondulada', '0 0 100 100', () => current('smoke')],
  // fios
  ['fios', 'thread-simple-01', 'simples', 'desenho de cima para baixo', '0 0 60 200', () => thread('simple')],
  ['fios', 'thread-double-01', 'duplo', 'desenho desfasado dos dois', '0 0 60 200', () => thread('double')],
  ['fios', 'thread-broken-01', 'interrompido', 'segmentos a acender em sequencia', '0 0 60 200', () => thread('broken')],
  ['fios', 'thread-glow-tip-01', 'brilho terminal', 'desenho de cima para baixo, brilho a descer', '0 0 60 200', () => thread('glow')],
  ['fios', 'thread-knot-01', 'com no', 'no a desfazer-se', '0 0 60 200', () => thread('knot')],
  ['fios', 'destiny-line-01', 'linha de destino', 'traco longo a desenhar-se', '0 0 60 200', () => destiny()],
  ['fios', 'breath-line-01', 'respiratoria', 'oscila, sobe e desce em ciclo', '0 0 60 200', () => breath()],
  // pontos
  ['pontos', 'node-solid-01', 'solido', 'pulsar suave', '0 0 100 100', () => node('solid')],
  ['pontos', 'node-hollow-01', 'vazio', 'traco a fechar', '0 0 100 100', () => node('hollow')],
  ['pontos', 'node-glow-01', 'brilhante', 'brilho a respirar', '0 0 100 100', () => node('glow')],
  ['pontos', 'star-4-01', '4 pontas', 'brilho a acender', '0 0 100 100', () => star('4')],
  ['pontos', 'star-flare-01', 'flare', 'raios a expandir', '0 0 100 100', () => star('flare')],
  ['pontos', 'star-cross-01', 'cruz luminosa', 'cruz a crescer do centro', '0 0 100 100', () => star('cross')],
  ['pontos', 'particle-dust-01', 'poeira', 'cintilar aleatorio', '0 0 100 100', () => dust(7)],
  // divisores
  ['divisores', 'divider-line-01', 'linha simples', 'a crescer do centro', '0 0 200 60', () => divider('line')],
  ['divisores', 'divider-dashed-01', 'interrompida', 'segmentos a acender', '0 0 200 60', () => divider('dashed')],
  ['divisores', 'divider-center-dot-01', 'ponto central', 'linhas a crescer do centro', '0 0 200 60', () => divider('center-dot')],
  ['divisores', 'divider-glow-01', 'brilho central', 'brilho a atravessar', '0 0 200 60', () => divider('glow')],
  // molduras
  ['molduras', 'frame-editorial-01', 'frame', 'perimetro a desenhar-se', '0 0 100 100', () => frameEditorial()],
  ['molduras', 'corner-brackets-01', 'cantos', 'cantos a aparecer', '0 0 100 100', () => cornerBrackets()],
  ['molduras', 'window-open-01', 'cruz de alinhamento', 'cruz a crescer do centro', '0 0 100 100', () => windowOpen()],
  // luz
  ['luz', 'halo-01', 'halo', 'halo a respirar', '0 0 100 100', () => halo()],
  ['luz', 'glow-radial-01', 'glow radial', 'brilho a pulsar', '0 0 100 100', () => glowRadial()],
  ['luz', 'beam-horizontal-01', 'feixe horizontal', 'feixe a atravessar', '0 0 200 60', () => beamHorizontal()],
  ['luz', 'reflection-01', 'reflexo', 'duplicacao a desvanecer', '0 0 100 100', () => reflection()],
  // atmosfera
  ['atmosfera', 'grain-overlay-01', 'grao cinematografico', 'cintilar do grao', '0 0 100 100', () => grain()],
  ['atmosfera', 'vignette-01', 'vinheta', 'estatico', '0 0 100 100', () => vignette()],
  ['atmosfera', 'mist-01', 'nevoa', 'deriva lenta', '0 0 100 100', () => mist()],
  ['atmosfera', 'dust-light-01', 'poeira iluminada', 'cintilar aleatorio', '0 0 100 100', () => dustLight()],
  ['atmosfera', 'window-shadow-01', 'sombra de janela', 'deslize lento', '0 0 100 100', () => windowShadow()],
  ['atmosfera', 'sun-rays-01', 'raios solares', 'raios a respirar', '0 0 100 100', () => sunRays()],
];

// escreve tudo
fs.rmSync(ROOT, { recursive: true, force: true });
fs.mkdirSync(path.join(ROOT, 'tokens'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tokens', 'vds-tokens.css'),
  `:root {\n${Object.entries(TOK).map(([k, v]) => `  ${k}:        ${v};`).join('\n')}\n}\n`);

const byCat = {};
for (const [cat, name, variante, anim, vbDefault, gen] of M) {
  const g = gen();
  const vb = g.vb || vbDefault;
  const svg = file({ name, cat, variante, anim, vb, defs: g.defs || '', body: '  ' + (g.body || '').trim(), vars: g.vars || ['--vds-gold'] });
  fs.mkdirSync(path.join(ROOT, cat), { recursive: true });
  fs.writeFileSync(path.join(ROOT, cat, name + '.svg'), svg);
  (byCat[cat] = byCat[cat] || []).push(name);
}

// index.html de revisao
const cats = Object.keys(byCat);
const sections = cats.map((cat) => {
  const cards = byCat[cat].map((n) => `      <figure><img src="${cat}/${n}.svg" alt="${n}" loading="lazy"/><figcaption>${n}</figcaption></figure>`).join('\n');
  return `    <h2>${cat} <span>(${byCat[cat].length})</span></h2>\n    <div class="grid">\n${cards}\n    </div>`;
}).join('\n');
const total = M.length;
fs.writeFileSync(path.join(ROOT, 'index.html'), `<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Biblioteca Visual VDS (${total})</title>
<link rel="stylesheet" href="tokens/vds-tokens.css">
<style>
  body{ background:var(--vds-bg,#1c1610); color:var(--vds-light,#f4ede1); font-family:Georgia,serif; margin:0; padding:30px; }
  header{ margin-bottom:8px; } h1{ font-weight:400; font-size:22px; margin:0; }
  .sub{ font-family:system-ui,sans-serif; font-size:12.5px; opacity:.55; margin:6px 0 22px; }
  h2{ font-weight:400; font-size:14px; letter-spacing:.22em; text-transform:uppercase; color:var(--vds-gold,#c9a15e); margin:30px 0 12px; }
  h2 span{ opacity:.5; }
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:16px; }
  figure{ margin:0; background:var(--vds-bg-2,#241c14); border:1px solid rgba(201,161,94,.14); border-radius:12px; padding:12px; text-align:center; }
  figure img{ width:100%; height:120px; object-fit:contain; display:block; }
  figcaption{ font-family:system-ui,sans-serif; font-size:10px; opacity:.55; margin-top:8px; word-break:break-all; }
</style></head>
<body>
  <header><h1>Biblioteca Visual VDS</h1>
  <p class="sub">${total} componentes SVG modulares, temaveis por tokens/vds-tokens.css. Alfabeto visual, nao posts: combina-se por sobreposicao.</p></header>
${sections}
</body></html>
`);
console.log(`Biblioteca VDS gerada: ${total} SVG + tokens + index.html em biblioteca-vds/`);
for (const c of cats) console.log(`  ${c}: ${byCat[c].length}`);
