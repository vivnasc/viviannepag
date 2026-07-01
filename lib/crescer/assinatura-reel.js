'use strict';
// ASSINATURA DA MAE (motor do reel): compoe um reel 9:16 editorial a partir da
// Biblioteca Visual VDS (geometria/luz/atmosfera) + a frase real da mae + movimento.
// Zero custo, deterministico, tematavel. reelHTML devolve um documento HTML autonomo
// (para a pagina de render e o pipeline Puppeteer). Sem travessoes nos comentarios.

const TOK = {
  bg: '#1c1610', bg2: '#241c14', gold: '#c9a15e', goldSoft: '#d9bd8a', light: '#f4ede1', line: '#6f5a3d',
};

// A BIBLIOTECA VISUAL VDS real da Vivianne (59 componentes: geometria, fios, topografia,
// pontos, luz, molduras...). A geometria e ESTRUTURAL (a metafora do conteudo), nunca
// mistica; varia por SEED dentro do tema (2 posts nunca iguais) e, entre temas, percorre
// a biblioteca INTEIRA. Ja nao ha formas metidas a mao.
const { componente, idsDe } = require('./biblioteca-vds');
const GEO = idsDe('geometria');
const fam = (arr, ...pfx) => arr.filter((id) => pfx.some((p) => id.startsWith(p)));
const rings = fam(GEO, 'rings'), orbits = fam(GEO, 'orbit'), vesicas = fam(GEO, 'vesica'), eclipses = fam(GEO, 'eclipse');

// TEMA -> pool de motivos REAIS da biblioteca (o hash do seed escolhe um; muita variedade).
// SÓ formas fechadas/estruturais (anéis, vesica, órbita, eclipse, ondas, campos). NUNCA
// linhas soltas a cortar o halo (os "fios" pareciam um círculo cortado — a Vivianne rejeitou).
const SEQUENCIAS = {
  consciencia: [...rings, 'orbit-continuous-01', 'eclipse-halo-01'],
  emergencia: ['flow-spiral-01', 'field-magnetic-01', 'flow-convergent-01', ...orbits],
  eumaior: [...rings, ...orbits],
  transformacao: [...vesicas, 'rings-offset-01', 'orbit-incomplete-01'],
  raizes: [...rings, 'field-magnetic-01', 'current-smoke-01'],
  sombra: [...eclipses],
  vinculos: [...vesicas],
  campo: ['node-glow-01', 'star-cross-01', 'field-magnetic-01', 'star-flare-01'],
  desencaixe: ['rings-offset-01', 'rings-incomplete-01', 'orbit-incomplete-01', 'eclipse-partial-01'],
  sentido: [...orbits, 'orbit-continuous-01'],
  corpo: ['current-water-01', 'current-wind-01', 'flow-horizontal-01', 'flow-s-01'],
  ciclos: ['orbit-continuous-01', 'flow-spiral-01', 'rings-concentric-07'],
};
const LABELS = {
  consciencia: 'presença', emergencia: 'para onde vamos', eumaior: 'o eu maior', transformacao: 'soltar',
  raizes: 'heranças', sombra: 'sombra', vinculos: 'vínculos', campo: 'não te curas só a ti',
  desencaixe: 'desencaixe', sentido: 'sentido', corpo: 'corpo e presença', ciclos: 'ciclos',
};
const motivosDoTema = (tema) => (SEQUENCIAS[tema] && SEQUENCIAS[tema].length ? SEQUENCIAS[tema] : GEO);
const receitaDe = (tema) => ({ motivo: motivosDoTema(tema)[0], label: LABELS[tema] || 'crescer' });
const RECEITAS = LABELS; // compat de export

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

// ---- MOTIVO: o inner REAL do componente da biblioteca VDS (viewBox 0 0 100 100), com
// um halo suave por tras. A animacao (draw-in por [pathLength], pulsar dos brilhos) e do
// CSS/JS do reel, generica, para TODOS os 59 componentes de uma vez. ----
function motivoSVG(id) {
  const halo = `<circle class="halo" cx="50" cy="50" r="34" fill="url(#halo)"/>`;
  const c = componente(id);
  if (c) return halo + c.inner;
  // fallback simples (nunca deve acontecer): 3 aneis concentricos.
  return halo + `<g fill="none" stroke="${TOK.gold}" stroke-width="1.1" stroke-linecap="round"><circle cx="50" cy="50" r="14" pathLength="1"/><circle cx="50" cy="50" r="26" pathLength="1"/><circle cx="50" cy="50" r="38" pathLength="1"/></g>`;
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
  const seqR = motivosDoTema(tema);
  const motivo = seqR[hashStr(o.seed || linhas.join(' ') || tema) % seqR.length];
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
  <svg class="geo" viewBox="0 0 100 100">${DEFS}${motivoSVG(motivo)}</svg>
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
  const seqM = motivosDoTema(tema);
  const motivo = seqM[hashStr(o.seed || tema) % seqM.length];

  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${estiloEditorial()}
  .geo [fill^="url"],.halo{ opacity:.8; }
</style></head><body><div class="card">
  ${grao('100 125')}
  <div class="head"><span>${esc(marca)}</span><span>${idx} / ${total}</span></div>
  <svg class="geo" viewBox="0 0 100 100">${DEFS}${motivoSVG(motivo)}</svg>
  <div class="block">${capa
    ? `<div class="titulo">${esc(texto)}</div><div class="rule"></div>`
    : `<div class="rule" style="margin-top:0"></div><div class="corpo" style="font-size:3.9vw">${esc(texto)}</div>`}</div>
  <div class="foot"><span>${esc(label)}</span></div>
  <div class="layer vignette"></div>
</div></body></html>`;
}

module.exports = { reelHTML, slideHTML, RECEITAS, receitaDe, motivosDoTema, motivoSVG, segmentar, TOK };
