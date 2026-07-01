'use strict';
// ASSINATURA DA MAE (motor do reel): compoe um reel 9:16 editorial a partir da
// Biblioteca Visual VDS (geometria/luz/atmosfera) + a frase real da mae + movimento.
// Zero custo, deterministico, tematavel. reelHTML devolve um documento HTML autonomo
// (para a pagina de render e o pipeline Puppeteer). Sem travessoes nos comentarios.

const TOK = {
  bg: '#1c1610', bg2: '#241c14', gold: '#d8a85a', goldSoft: '#e6c98f', light: '#f6efe2', line: '#6f5a3d',
};

// GEOMETRIA VDS — PRIMITIVOS que se COMBINAM (spec da Vivianne: orbits, dots, axis,
// contours, vesica, systems, arcs, dividers, light). NÃO uma forma solta: cada peça é uma
// COMPOSIÇÃO fina e nítida, como a referência (anéis + eixo + nós + foco de luz). viewBox
// 0 0 100 100, centro 50,50, linha fina. Zero espirais (rejeitadas). Ouro ${TOK.gold}.
const G = TOK.gold, GS = TOK.goldSoft, LT = TOK.light, SW = 0.7;
const axisV = (op = 0.45) => `<line x1="50" y1="6" x2="50" y2="94" stroke="${G}" stroke-width="${SW}" opacity="${op}" pathLength="1"/>`;
const foco = (r = 6) => `<circle class="halo" cx="50" cy="50" r="${r}" fill="url(#cg)"/><circle cx="50" cy="50" r="1.6" fill="${LT}"/>`;
const no = (x, y, r = 1.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GS}"/>`;

// ORBITS — anéis concêntricos (com eixo + nós + foco), como o slide 01.
function pRings(s) {
  const n = 4 + (s % 2), out = 46;
  let o = axisV() + `<g fill="none" stroke="${G}" stroke-width="${SW}">`;
  for (let i = 1; i <= n; i++) o += `<circle cx="50" cy="50" r="${(9 + i * ((out - 9) / n)).toFixed(1)}" pathLength="1"/>`;
  o += '</g>' + no(50, 50 - out) + no(50, 50 + out) + foco(6);
  return o;
}
// ORBIT — elipses cruzadas + órbita exterior pontilhada + foco (slide 03/07).
function pOrbit(s) {
  const swap = s % 2 === 0;
  let o = `<g fill="none" stroke="${G}" stroke-width="${SW}"><ellipse cx="50" cy="50" rx="${swap ? 40 : 26}" ry="${swap ? 26 : 40}" pathLength="1"/><ellipse cx="50" cy="50" rx="${swap ? 26 : 40}" ry="${swap ? 40 : 26}" pathLength="1"/></g>`;
  o += `<circle cx="50" cy="50" r="45" fill="none" stroke="${G}" stroke-width="${SW}" stroke-dasharray="0.6 3" opacity="0.55"/>`;
  o += foco(6);
  return o;
}
// CONTOURS — linhas topográficas onduladas (slide 02).
function pContour(s) {
  const dir = s % 2 ? -1 : 1;
  let o = `<g fill="none" stroke="${G}" stroke-width="${SW}">`;
  for (let i = 0; i < 7; i++) { const y = 26 + i * 8; o += `<path d="M6 ${y} Q 30 ${(y - 7 * dir).toFixed(1)}, 50 ${y} T 94 ${y}" pathLength="1"/>`; }
  return o + '</g>';
}
// INTERSECTIONS — vesica (2 ou 3 círculos) + eixo + foco.
function pVesica(s) {
  const trip = s % 2 === 0;
  let o = `<g fill="none" stroke="${G}" stroke-width="${SW}">`;
  o += trip
    ? '<circle cx="50" cy="37" r="19" pathLength="1"/><circle cx="39" cy="57" r="19" pathLength="1"/><circle cx="61" cy="57" r="19" pathLength="1"/>'
    : '<circle cx="37" cy="50" r="22" pathLength="1"/><circle cx="63" cy="50" r="22" pathLength="1"/>';
  o += '</g>' + axisV(0.4) + `<ellipse class="focus" cx="50" cy="50" rx="4.5" ry="9" fill="url(#cg)"/>`;
  return o;
}
// SYSTEMS — constelação (rede de nós).
function pConst(s) {
  const pts = s % 2 ? [[50, 20], [26, 42], [74, 42], [38, 72], [62, 72]] : [[50, 22], [30, 40], [70, 40], [50, 62], [34, 80], [66, 80]];
  const lines = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]];
  let o = `<g fill="none" stroke="${G}" stroke-width="${SW}">`;
  for (const [a, b] of lines) if (pts[a] && pts[b]) o += `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" pathLength="1"/>`;
  o += '</g>' + pts.map((p) => no(p[0], p[1])).join('');
  return o;
}
// ECLIPSE — anel + corona + órbita pontilhada + brilho (slide 03).
function pEclipse() {
  return `<circle cx="50" cy="50" r="26" fill="url(#corona)"/><circle cx="50" cy="50" r="20" fill="none" stroke="${GS}" stroke-width="1" pathLength="1"/>`
    + `<circle cx="50" cy="50" r="45" fill="none" stroke="${G}" stroke-width="${SW}" stroke-dasharray="0.6 3.4" opacity="0.5"/>`
    + `<circle cx="68" cy="35" r="2.2" fill="${LT}"/>`;
}
// SINGLE — um círculo fino + nó.
function pCircle() { return `<circle cx="50" cy="50" r="30" fill="none" stroke="${G}" stroke-width="${SW}" pathLength="1"/>` + no(80, 50, 1.8) + foco(4); }

// a biblioteca file-based que a Vivianne JÁ tinha (somar, não apagar). Renderizada com o
// mesmo tratamento fino (foco de luz + linha fina). Só entram as BOAS (fora fios/linhas
// soltas e espirais, que ela rejeitou).
const { componente } = require('./biblioteca-vds');
const renderId = (id) => { const c = componente(id); return c ? foco(6) + c.inner : pRings(0); };

// POOL por tema = as COMPOSIÇÕES novas (funções) + os componentes da biblioteca antiga
// (ids). O seed escolhe um; assim há as duas linguagens somadas e muita variedade.
const POOL = {
  consciencia: [pRings, 'rings-concentric-05', 'rings-concentric-07', 'rings-concentric-03'],
  eumaior: [pRings, 'rings-concentric-05', 'rings-incomplete-01'],
  raizes: [pRings, 'rings-offset-01', 'field-magnetic-01'],
  sentido: [pOrbit, 'orbit-continuous-01', 'orbit-dotted-01', 'orbit-asymmetric-01'],
  ciclos: [pOrbit, 'orbit-continuous-01', 'rings-concentric-07'],
  desencaixe: [pOrbit, 'rings-offset-01', 'rings-incomplete-01', 'orbit-incomplete-01', 'eclipse-partial-01'],
  corpo: [pContour, 'current-water-01', 'current-wind-01', 'flow-horizontal-01'],
  vinculos: [pVesica, 'vesica-horizontal-01', 'vesica-vertical-01', 'vesica-intersection-01', 'vesica-triple-01'],
  transformacao: [pVesica, 'vesica-stacked-01', 'vesica-intersection-01', 'orbit-incomplete-01'],
  campo: [pConst, 'star-cross-01', 'star-flare-01', 'field-magnetic-01', 'node-glow-01'],
  emergencia: [pConst, 'field-magnetic-01', 'flow-convergent-01'],
  sombra: [pEclipse, 'eclipse-halo-01', 'eclipse-central-01', 'eclipse-lateral-01', 'eclipse-partial-01'],
};
// a peça (varia por seed dentro do tema; composição nova OU componente antigo, mesma linguagem).
function geometriaVDS(tema, seed) {
  const pool = POOL[tema] || [pRings];
  const h = hashStr(String(seed || tema || ''));
  const pick = pool[h % pool.length];
  return typeof pick === 'function' ? pick(h) : renderId(pick);
}

// ETIQUETA do rodapé = o TEMA da mãe (secção editorial), NUNCA vocabulário do Método VS.
const LABELS = {
  consciencia: 'consciência', emergencia: 'para onde vamos', eumaior: 'o eu maior', transformacao: 'transformação',
  raizes: 'heranças', sombra: 'sombra', vinculos: 'vínculos', campo: 'não te curas só a ti',
  desencaixe: 'desencaixe', sentido: 'sentido', corpo: 'corpo e presença', ciclos: 'ciclos',
};
const motivosDoTema = (tema) => [tema]; // compat
const receitaDe = (tema) => ({ motivo: tema, label: LABELS[tema] || 'crescer' });
const RECEITAS = LABELS; // compat de export
// compat: motivoSVG(tema, seed) devolve a composição VDS do tema.
function motivoSVG(tema, seed) { return geometriaVDS(tema, seed); }

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// parte a frase em SEGMENTOS legiveis (para entrarem por tempos, nao tudo de uma vez):
// por frase (. ! ?), e os longos cortam-se numa virgula/espaco perto de ~52 carateres.
function segmentar(texto) {
  const bruto = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
  if (!bruto) return [];
  const frases = bruto.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const MAX = 52, out = [];
  for (const f of frases) {
    let resto = f.trim();
    while (resto.length > MAX) {
      let corte = resto.lastIndexOf(', ', MAX);
      if (corte < 20) corte = resto.lastIndexOf(' ', MAX);
      if (corte < 20) corte = MAX;
      const inclui = resto[corte] === ',' ? corte + 1 : corte;
      out.push(resto.slice(0, inclui).trim());
      resto = resto.slice(inclui).trim();
    }
    if (resto) out.push(resto);
  }
  return out;
}

// ---- documento completo ----
function hashStr(s) { let h = 0; s = String(s || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

// gradientes + grão partilhados (o container poe os brilhos da geometria).
const DEFS = `<defs>
  <radialGradient id="halo"><stop offset="58%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="80%" stop-color="${TOK.goldSoft}" stop-opacity=".5"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
  <radialGradient id="corona"><stop offset="52%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="72%" stop-color="${TOK.goldSoft}" stop-opacity=".9"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
  <radialGradient id="cg"><stop offset="0%" stop-color="${TOK.light}"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
</defs>`;
const grao = (vb) => `<svg class="layer grain" viewBox="0 0 ${vb}" preserveAspectRatio="none"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100" height="${vb.split(' ')[3]}" filter="url(#g)"/></svg>`;

// BASE editorial VDS (docs/referencias/DESENHO-EDITORIAL-VDS.md): assimetrico, de revista.
// cabecalho (marca | meta) · coluna de TEXTO a esquerda (titulo serif maiusculo + regua
// + corpo) · geometria da biblioteca a DIREITA · etiqueta em baixo a esquerda.
function estiloEditorial(extra) {
  return `
  :root{ --bg:${TOK.bg}; --bg2:${TOK.bg2}; --gold:${TOK.gold}; --gold-soft:${TOK.goldSoft}; --light:${TOK.light};
         --vds-gold:${TOK.gold}; --vds-gold-soft:${TOK.goldSoft}; --vds-bg:${TOK.bg}; ${extra || ''} }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ background:#0c0a08; }
  .card{ position:relative; width:100vw; height:100vh; overflow:hidden; font-family:Georgia,'Times New Roman',serif; color:var(--light);
         background:radial-gradient(130% 90% at 64% 34%, #241c13 0%, #1a140e 55%, #0e0a07 100%); }
  .layer{ position:absolute; inset:0; width:100%; height:100%; }
  .grain{ opacity:.09; mix-blend-mode:screen; }
  .vignette{ background:radial-gradient(135% 95% at 58% 42%, transparent 48%, rgba(12,9,6,.92) 100%); }
  .head{ position:absolute; top:6.2%; left:9%; right:9%; display:flex; justify-content:space-between; align-items:center;
         font-family:system-ui,sans-serif; font-size:2.2vw; letter-spacing:.34em; text-transform:uppercase; color:var(--gold-soft); opacity:.68; z-index:3; }
  .geo{ position:absolute; right:3.5%; top:50%; transform:translateY(-50%); width:41%; fill:none; stroke:var(--gold); stroke-linecap:round; z-index:1; }
  .geo circle,.geo path,.geo ellipse,.geo line{ stroke-width:.7; }  /* linha FINA e nitida, como a referencia */
  .block{ position:absolute; left:9%; width:47%; top:50%; transform:translateY(-50%); z-index:2; }
  .titulo{ font-size:6.3vw; line-height:1.14; text-transform:uppercase; letter-spacing:.012em; color:var(--light); font-weight:400; }
  .rule{ width:60%; height:1px; margin:6.5% 0 6%; background:var(--gold); opacity:.85; }
  .corpo{ font-size:3.4vw; line-height:1.56; color:#cbb691; font-style:italic; }
  .foot{ position:absolute; bottom:6.2%; left:9%; right:9%; font-family:system-ui,sans-serif; font-size:2.1vw; letter-spacing:.34em; text-transform:uppercase; color:var(--gold-soft); opacity:.6; z-index:3; }
  ${extra ? '' : ''}`;
}

// REEL (video 9:16, motion): titulo = a FACA (fica); corpo = a viragem/vantagem, entra por
// tempos; geometria desenha-se a direita. Layout editorial VDS.
function reelHTML(opts) {
  const o = opts || {};
  const tema = o.tema || 'consciencia';
  const rec = receitaDe(tema);
  const label = String(o.label || rec.label || '').toUpperCase();
  const linhas = (Array.isArray(o.linhas) ? o.linhas : [o.capa || o.frase]).filter(Boolean);
  const segs = linhas.flatMap(segmentar).slice(0, 6);
  const titulo = segs[0] || '';
  const corpo = segs.slice(1);
  const geo = geometriaVDS(tema, o.seed || linhas.join(' '));
  const marca = o.marca || '@vivianne.dos.santos';
  const N = Math.max(1, corpo.length);
  const HEAD = 1.3, PASSO = 2.7, TAIL = 0.9;  // o titulo abre; depois cada batida do corpo
  const cyc = +(HEAD + N * PASSO + TAIL).toFixed(2);

  let kf = '', beats = '';
  corpo.forEach((t, i) => {
    const a = HEAD + i * PASSO;
    const s = a / cyc * 100, inp = (a + 0.5) / cyc * 100;
    const ultimo = i === N - 1;
    const os = ultimo ? 100 : (a + PASSO - 0.2) / cyc * 100;
    const op = ultimo ? 100 : (a + PASSO) / cyc * 100;
    kf += `@keyframes beat${i}{0%,${s.toFixed(1)}%{opacity:0;transform:translateY(8px)}${inp.toFixed(1)}%{opacity:1;transform:none}${os.toFixed(1)}%{opacity:1}${op.toFixed(1)}%{opacity:${ultimo ? 1 : 0};transform:${ultimo ? 'none' : 'translateY(-6px)'}}100%{opacity:${ultimo ? 1 : 0}}}\n`;
    beats += `<div class="beat" style="animation:beat${i} ${cyc}s ease-in-out infinite">${esc(t)}</div>`;
  });

  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${estiloEditorial(`--cyc:${cyc}s;`)}
  .titulo{ opacity:0; animation:rise var(--cyc) ease-out infinite; }
  .rule{ width:0; animation:ruleA var(--cyc) ease-in-out infinite; }
  .corpo{ position:relative; min-height:24vh; }
  .beat{ position:absolute; left:0; right:0; top:0; opacity:0; }
  .geo [pathLength]{ stroke-dasharray:1; stroke-dashoffset:1; animation:draw var(--cyc) ease-in-out infinite; }
  .geo g > :nth-child(2){animation-delay:.14s}.geo g > :nth-child(3){animation-delay:.28s}.geo g > :nth-child(4){animation-delay:.42s}.geo g > :nth-child(5){animation-delay:.56s}.geo g > :nth-child(6){animation-delay:.70s}.geo g > :nth-child(7){animation-delay:.84s}
  .geo [fill^="url"],.halo,.core,.focus{ animation:corepulse var(--cyc) ease-in-out infinite; }
  @keyframes draw{0%{stroke-dashoffset:1}24%,92%{stroke-dashoffset:0}100%{stroke-dashoffset:0}}
  @keyframes corepulse{0%,100%{opacity:.55}50%{opacity:1}}
  @keyframes rise{0%{opacity:0;transform:translateY(10px)}8%{opacity:1;transform:none}96%{opacity:1}100%{opacity:1}}
  @keyframes ruleA{0%,7%{width:0;opacity:0}17%{width:60%;opacity:.85}96%{width:60%;opacity:.85}100%{width:0;opacity:0}}
  ${kf}
</style></head>
<body><div class="card">
  ${grao('100 178')}
  <div class="head"><span>${esc(marca)}</span><span></span></div>
  <svg class="geo" viewBox="0 0 100 100">${DEFS}${geo}</svg>
  <div class="block"><div class="titulo">${esc(titulo)}</div><div class="rule"></div><div class="corpo">${beats}</div></div>
  <div class="foot"><span>${esc(label)}</span></div>
  <div class="layer vignette"></div>
</div></body></html>`;
}

// UMA TELA de CARROSSEL (estática, editorial): capa = titulo grande; telas seguintes =
// corpo. Geometria da biblioteca a direita (desenhada, sem animar). Contador no cabecalho.
function slideHTML(opts) {
  const o = opts || {};
  const tema = o.tema || 'consciencia';
  const rec = receitaDe(tema);
  const label = String(o.label || rec.label || '').toUpperCase();
  const texto = o.texto || '';
  const idx = Math.max(1, o.idx || 1);
  const total = Math.max(idx, o.total || 1);
  const capa = o.capa != null ? !!o.capa : idx === 1;
  const marca = o.marca || '@vivianne.dos.santos';
  const geo = geometriaVDS(tema, o.seed || tema);
  // FONTE VISUAL: imagem (Flux/Replicate ou MJ) OU geometria. fundo = cena inteira; acento = preto à direita.
  const img = o.img || '';
  const fundo = img && o.imgModo !== 'acento';
  const acento = img && o.imgModo === 'acento';
  const visual = fundo
    ? `<img src="${esc(img)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0"/><div style="position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(10,7,5,.94) 28%,rgba(10,7,5,.4) 58%,rgba(10,7,5,.05) 82%)"></div>`
    : acento
    ? `<img src="${esc(img)}" alt="" style="position:absolute;right:-4%;top:50%;transform:translateY(-50%);width:52%;mix-blend-mode:screen;z-index:1"/>`
    : `<svg class="geo" viewBox="0 0 100 100">${DEFS}${geo}</svg>`;

  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${estiloEditorial()}
  .geo [fill^="url"],.halo{ opacity:.8; }
  .head,.block,.foot{ z-index:3; }
</style></head><body><div class="card">
  ${grao('100 125')}
  ${visual}
  <div class="head"><span>${esc(marca)}</span><span>${idx} / ${total}</span></div>
  <div class="block">${capa
    ? `<div class="titulo">${esc(texto)}</div><div class="rule"></div>`
    : `<div class="rule" style="margin-top:0"></div><div class="corpo" style="font-size:3.9vw">${esc(texto)}</div>`}</div>
  <div class="foot"><span>${esc(label)}</span></div>
  <div class="layer vignette"></div>
</div></body></html>`;
}

module.exports = { reelHTML, slideHTML, RECEITAS, receitaDe, motivosDoTema, motivoSVG, geometriaVDS, segmentar, TOK };
