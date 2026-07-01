'use strict';
// ASSINATURA DA MAE (motor do reel): compoe um reel 9:16 editorial a partir da
// Biblioteca Visual VDS (geometria/luz/atmosfera) + a frase real da mae + movimento.
// Zero custo, deterministico, tematavel. reelHTML devolve um documento HTML autonomo
// (para a pagina de render e o pipeline Puppeteer). Sem travessoes nos comentarios.

const TOK = {
  bg: '#1c1610', bg2: '#241c14', gold: '#c9a15e', goldSoft: '#d9bd8a', light: '#f4ede1', line: '#6f5a3d',
};

// TEMA (materia da mae) -> MOTIVO geometrico que carrega o sentido, + palavra de topo.
// A geometria e ESTRUTURAL (a metafora do conteudo), nunca mistica.
const RECEITAS = {
  consciencia: { motivo: 'rings', label: 'presença' },
  emergencia: { motivo: 'spiral', label: 'para onde vamos' },
  eumaior: { motivo: 'rings', label: 'o eu maior' },
  transformacao: { motivo: 'knot', label: 'soltar' },
  raizes: { motivo: 'lineage', label: 'heranças' },
  sombra: { motivo: 'eclipse', label: 'sombra' },
  vinculos: { motivo: 'vesica', label: 'vínculos' },
  campo: { motivo: 'constellation', label: 'não te curas só a ti' },
  desencaixe: { motivo: 'ringsOffset', label: 'desencaixe' },
  sentido: { motivo: 'orbit', label: 'sentido' },
  corpo: { motivo: 'breath', label: 'corpo e presença' },
  ciclos: { motivo: 'orbitFull', label: 'ciclos' },
};
const RECEITA_DEFAULT = { motivo: 'rings', label: 'crescer' };
const receitaDe = (tema) => RECEITAS[tema] || RECEITA_DEFAULT;

// SEQUÊNCIA de motivos por tema: o reel tem VÁRIAS cenas (frames), cada uma com a sua
// geometria (todas coerentes com o tema). Cada segmento do texto vai numa cena destas.
const SEQUENCIAS = {
  consciencia: ['rings', 'constellation', 'spiral'],
  emergencia: ['spiral', 'rings', 'orbitFull'],
  eumaior: ['rings', 'orbit', 'constellation'],
  transformacao: ['knot', 'vesica', 'orbit'],
  raizes: ['lineage', 'constellation', 'rings'],
  sombra: ['eclipse', 'ringsOffset', 'orbit'],
  vinculos: ['vesica', 'constellation', 'rings'],
  campo: ['constellation', 'vesica', 'orbitFull'],
  desencaixe: ['ringsOffset', 'vesica', 'orbit'],
  sentido: ['orbit', 'spiral', 'lineage'],
  corpo: ['breath', 'rings', 'orbit'],
  ciclos: ['orbitFull', 'rings', 'spiral'],
};
const motivosDoTema = (tema) => SEQUENCIAS[tema] || [receitaDe(tema).motivo, 'orbit', 'constellation'];

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

// ---- MOTIVOS (viewBox 0 0 100 100, centro 50,50). Animacoes por classes do CSS. ----
function motivoSVG(motivo) {
  const halo = `<circle class="halo" cx="50" cy="50" r="34" fill="url(#halo)"/>`;
  const core = `<circle class="core" cx="50" cy="50" r="2" fill="url(#cg)"/>`;
  const rings = (n, off) => {
    let o = '';
    for (let i = 1; i <= n; i++) o += `<circle class="ring r${i}" cx="${off ? 50 + (i - 3) * 3 : 50}" cy="50" r="${(41 / n) * i}" pathLength="1"/>`;
    return o;
  };
  switch (motivo) {
    case 'rings': return halo + `<g>${rings(5, 0)}</g>` + `<g class="orbit"><circle cx="91" cy="50" r="1.7" fill="${TOK.goldSoft}"/></g>` + core;
    case 'ringsOffset': return halo + `<g>${rings(5, 1)}</g>` + core;
    case 'eclipse': return `<circle class="halo" cx="50" cy="50" r="30" fill="url(#corona)"/><circle class="disc" cx="50" cy="50" r="20"/>`;
    case 'vesica': return halo + `<g class="vg"><circle class="ring r1" cx="39" cy="50" r="22" pathLength="1"/><circle class="ring r2" cx="61" cy="50" r="22" pathLength="1"/></g><ellipse class="focus" cx="50" cy="50" rx="6" ry="11" fill="url(#cg)"/>`;
    case 'orbit': return halo + `<path class="drawpath" d="M50 14 A36 36 0 1 1 22 78" pathLength="1"/><g class="orbit"><circle cx="86" cy="50" r="2" fill="${TOK.goldSoft}"/></g>` + core;
    case 'orbitFull': return halo + `<circle class="ring r3" cx="50" cy="50" r="34" pathLength="1"/><circle class="ring r1" cx="50" cy="50" r="18" pathLength="1"/><g class="orbit"><circle cx="84" cy="50" r="2" fill="${TOK.goldSoft}"/></g>` + core;
    case 'knot': return halo + `<path class="drawpath" d="M50 12 C 66 40, 70 62, 50 70 C 30 78, 34 92, 50 92" pathLength="1"/><circle cx="50" cy="70" r="1.8" fill="${TOK.goldSoft}"/>` + `<g class="orbit"><circle cx="50" cy="12" r="1.6" fill="${TOK.goldSoft}"/></g>`;
    case 'breath': return halo + `<path class="breathe" d="M14 50 Q 32 38, 50 50 T 86 50" pathLength="1"/><path class="breathe d2" d="M14 58 Q 32 70, 50 58 T 86 58" pathLength="1"/>` + core;
    case 'lineage': return `<path class="drawpath" d="M50 12 C 58 34, 42 56, 50 78 S 54 92, 50 94" pathLength="1"/><circle cx="50" cy="24" r="2.2" fill="${TOK.goldSoft}"/><circle cx="50" cy="52" r="2.2" fill="${TOK.goldSoft}"/><circle cx="50" cy="80" r="2.2" fill="${TOK.goldSoft}"/>`;
    case 'constellation': {
      const pts = [[50, 24], [30, 46], [70, 46], [40, 74], [62, 72]];
      const lines = `<g class="cnet">` + pts.slice(1).map((p) => `<line x1="50" y1="24" x2="${p[0]}" y2="${p[1]}" pathLength="1"/>`).join('') + `<line x1="30" y1="46" x2="40" y2="74" pathLength="1"/><line x1="70" y1="46" x2="62" y2="72" pathLength="1"/></g>`;
      const nodes = pts.map((p, i) => `<circle class="cnode" style="animation-delay:${(i * 0.4).toFixed(1)}s" cx="${p[0]}" cy="${p[1]}" r="2.2" fill="${TOK.goldSoft}"/>`).join('');
      return halo + lines + nodes;
    }
    case 'spiral': {
      let d = ''; const T = 3.2, r0 = 2, r1 = 42, steps = 200;
      for (let i = 0; i <= steps; i++) { const t = i / steps, th = t * T * 2 * Math.PI, r = r0 + (r1 - r0) * t; d += (i ? 'L' : 'M') + (50 + r * Math.cos(th)).toFixed(2) + ' ' + (50 + r * Math.sin(th)).toFixed(2) + ' '; }
      return halo + `<path class="drawpath" d="${d.trim()}" pathLength="1"/>` + core;
    }
    default: return halo + `<g>${rings(5, 0)}</g>` + core;
  }
}

// ---- documento completo ----
function reelHTML(opts) {
  const o = opts || {};
  const tema = o.tema || 'consciencia';
  const rec = receitaDe(tema);
  const label = o.label || rec.label;
  // os SEGMENTOS (entram por tempos, sincronia): parte a frase real em pedaços legiveis.
  const linhas = (Array.isArray(o.linhas) ? o.linhas : [o.capa || o.frase]).filter(Boolean);
  const segs = linhas.flatMap(segmentar).slice(0, 12);
  // geometria varia POR POST (seed): 2 posts nunca com a mesma.
  const seqR = motivosDoTema(tema);
  const motivo = seqR[hashStr(o.seed || linhas.join(' ') || tema) % seqR.length];
  const N = Math.max(1, segs.length);
  const PASSO = 2.7, TAIL = 0.6;      // segundos por segmento + cauda curta (sem geometria sozinha)
  const cyc = +(N * PASSO + TAIL).toFixed(2);
  const marca = o.marca || '@vivianne.dos.santos';
  const assinatura = o.assinatura || 'viviannedossantos.com';

  let kf = '', beats = '';
  segs.forEach((t, i) => {
    const a = i * PASSO;
    const s = a / cyc * 100, inp = (a + 0.45) / cyc * 100;
    // o ULTIMO segmento fica ate ao fim (nao deixa a geometria sozinha); os outros trocam.
    const ultimo = i === N - 1;
    const os = ultimo ? 100 : (a + PASSO - 0.2) / cyc * 100;
    const op = ultimo ? 100 : (a + PASSO) / cyc * 100;
    kf += `@keyframes beat${i}{0%,${s.toFixed(1)}%{opacity:0;transform:translateY(9px)}${inp.toFixed(1)}%{opacity:1;transform:none}${os.toFixed(1)}%{opacity:1}${op.toFixed(1)}%{opacity:${ultimo ? 1 : 0};transform:${ultimo ? 'none' : 'translateY(-7px)'}}100%{opacity:${ultimo ? 1 : 0}}}\n`;
    beats += `<div class="beat" style="animation:beat${i} ${cyc}s ease-in-out infinite">${esc(t)}</div>`;
  });

  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{ --bg:${TOK.bg}; --bg2:${TOK.bg2}; --gold:${TOK.gold}; --gold-soft:${TOK.goldSoft}; --light:${TOK.light}; --cyc:${cyc}s; }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ background:#0c0a08; }
  .reel{ position:relative; width:100vw; height:100vh; overflow:hidden; font-family:Georgia,'Times New Roman',serif; color:var(--light);
         background:radial-gradient(120% 80% at 50% 30%, #241c13 0%, #1c1610 52%, #100c09 100%); }
  .layer{ position:absolute; inset:0; width:100%; height:100%; }
  .grain{ opacity:.10; mix-blend-mode:screen; }
  .vignette{ background:radial-gradient(120% 90% at 50% 34%, transparent 52%, rgba(16,12,9,.9) 100%); }
  .top{ position:absolute; top:6.5%; left:8%; right:8%; display:flex; justify-content:space-between;
        font-family:system-ui,sans-serif; font-size:2.6vw; letter-spacing:.32em; text-transform:uppercase; color:var(--gold-soft); opacity:.72; }
  .geo{ position:absolute; top:15%; left:50%; transform:translateX(-50%); width:66%; fill:none; stroke:var(--gold); stroke-linecap:round; }
  .geo .ring,.geo .drawpath,.geo .breathe,.geo .cnet line{ stroke:var(--gold); }
  circle.ring,.drawpath,.breathe,.cnet line{ stroke-width:.7; fill:none; }
  .disc{ fill:var(--bg); stroke:var(--gold); stroke-width:1.1; }
  .ring,.drawpath,.cnet line{ stroke-dasharray:1; stroke-dashoffset:1; animation:draw var(--cyc) ease-in-out infinite; }
  .r1{animation-delay:0s}.r2{animation-delay:.4s}.r3{animation-delay:.8s}.r4{animation-delay:1.2s}.r5{animation-delay:1.6s}
  @keyframes draw{0%{stroke-dashoffset:1}22%,74%{stroke-dashoffset:0}100%{stroke-dashoffset:0}}
  .halo{ animation:breathe var(--cyc) ease-in-out infinite; transform-origin:50px 50px; }
  @keyframes breathe{0%,100%{opacity:.4}50%{opacity:1}}
  .orbit{ transform-origin:50px 50px; animation:spin calc(var(--cyc)*2.6) linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .core{ animation:corepulse var(--cyc) ease-in-out infinite; }
  @keyframes corepulse{0%,100%{opacity:.7}50%{opacity:1}}
  .breathe{ animation:bwave var(--cyc) ease-in-out infinite; transform-origin:center; }
  .breathe.d2{ animation-delay:.6s; opacity:.55; }
  @keyframes bwave{0%,100%{transform:scaleY(.9);opacity:.5}50%{transform:scaleY(1.15);opacity:1}}
  .focus{ animation:corepulse var(--cyc) ease-in-out infinite; }
  .cnode{ animation:tw calc(var(--cyc)/2) ease-in-out infinite; }
  @keyframes tw{0%,100%{opacity:.3}50%{opacity:1}}
  .copy{ position:absolute; left:8%; right:8%; bottom:19%; text-align:center; }
  .rule{ width:0; height:1px; margin:0 auto 4.5%; background:linear-gradient(90deg,transparent,var(--gold),transparent); animation:rule var(--cyc) ease-in-out infinite; }
  @keyframes rule{0%{width:0;opacity:0}14%{width:56%;opacity:1}92%{width:56%;opacity:1}100%{width:0;opacity:0}}
  .beatwrap{ position:relative; min-height:22vh; }
  .beat{ position:absolute; left:0; right:0; top:0; opacity:0; font-size:5.6vw; line-height:1.4; }
  .brand{ position:absolute; bottom:6.5%; left:0; right:0; text-align:center; font-size:3vw; letter-spacing:.42em; text-transform:uppercase; color:var(--gold-soft); opacity:.6; }
  .brand small{ display:block; font-family:system-ui,sans-serif; font-size:1.9vw; letter-spacing:.34em; opacity:.6; margin-top:1.4%; }
  ${kf}
</style></head>
<body><div class="reel">
  <svg class="layer grain" viewBox="0 0 100 178" preserveAspectRatio="none"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100" height="178" filter="url(#g)"/></svg>
  <svg class="geo" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="halo"><stop offset="58%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="80%" stop-color="${TOK.goldSoft}" stop-opacity=".5"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
      <radialGradient id="corona"><stop offset="52%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="72%" stop-color="${TOK.goldSoft}" stop-opacity=".9"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
      <radialGradient id="cg"><stop offset="0%" stop-color="${TOK.light}"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
    </defs>
    ${motivoSVG(motivo)}
  </svg>
  <div class="copy"><div class="rule"></div><div class="beatwrap">${beats}</div></div>
  <div class="brand">${esc(marca)}<small>${esc(assinatura)}</small></div>
  <div class="layer vignette"></div>
</div></body></html>`;
}

// UMA TELA de CARROSSEL (estática, na assinatura): a geometria do tema (desenhada) +
// UM segmento de texto + o contador. As telas juntas = o carrossel. Reusa o motivo.
function hashStr(s) { let h = 0; s = String(s || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function slideHTML(opts) {
  const o = opts || {};
  const tema = o.tema || 'consciencia';
  const rec = receitaDe(tema);
  const label = o.label || rec.label;
  const texto = o.texto || '';
  const idx = Math.max(1, o.idx || 1);
  const total = Math.max(idx, o.total || 1);
  // geometria COERENTE no post: a MESMA em todas as telas do carrossel (identidade do
  // post), escolhida por SEED. Muda só ENTRE posts diferentes, nunca de tela para tela.
  const seqM = motivosDoTema(tema);
  const motivo = seqM[hashStr(o.seed || tema) % seqM.length];
  // layout ajustavel (autonomia): posicao por OPCOES + tamanho.
  const geoTop = o.geoTop != null ? o.geoTop : 14, geoW = o.geoW != null ? o.geoW : 56;
  const txtSize = o.txtSize != null ? o.txtSize : 5.4;
  const av = o.av || 'baixo', ah = o.ah || 'centro', dist = o.dist != null ? o.dist : 15;
  const copyPos = av === 'topo' ? `top:${dist}%;` : av === 'centro' ? 'top:50%;transform:translateY(-50%);' : `bottom:${dist}%;`;
  const copyAlign = ah === 'esq' ? 'left' : ah === 'dir' ? 'right' : 'center';
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{ --gold:${TOK.gold}; --gold-soft:${TOK.goldSoft}; --light:${TOK.light}; --bg:${TOK.bg}; }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ background:#0c0a08; }
  .reel{ position:relative; width:100vw; height:100vh; overflow:hidden; font-family:Georgia,serif; color:var(--light);
         background:radial-gradient(120% 80% at 50% 30%, #241c13 0%, #1c1610 52%, #100c09 100%); }
  .layer{ position:absolute; inset:0; width:100%; height:100%; }
  .grain{ opacity:.10; mix-blend-mode:screen; }
  .vignette{ background:radial-gradient(120% 90% at 50% 34%, transparent 52%, rgba(16,12,9,.9) 100%); }
  .top{ position:absolute; top:6%; left:8%; right:8%; display:flex; justify-content:space-between; font-family:system-ui,sans-serif; font-size:2.4vw; letter-spacing:.3em; text-transform:uppercase; color:var(--gold-soft); opacity:.72; }
  .geo{ position:absolute; top:${geoTop}%; left:50%; transform:translateX(-50%); width:${geoW}%; fill:none; stroke:var(--gold); stroke-linecap:round; }
  circle.ring,.drawpath,.breathe,.cnet line{ stroke-width:.7; fill:none; stroke:var(--gold); }
  .disc{ fill:var(--bg); stroke:var(--gold); stroke-width:1.1; }
  .copy{ position:absolute; left:9%; right:9%; ${copyPos} text-align:${copyAlign}; }
  .rule{ width:44%; height:1px; margin:0 auto 5%; background:linear-gradient(90deg,transparent,var(--gold),transparent); }
  .txt{ font-size:${txtSize}vw; line-height:1.4; }
  .count{ position:absolute; bottom:7%; left:0; right:0; text-align:center; font-family:system-ui,sans-serif; font-size:2.2vw; letter-spacing:.3em; color:var(--gold-soft); opacity:.55; }
  .brand{ position:absolute; bottom:11.5%; left:0; right:0; text-align:center; font-size:2.6vw; letter-spacing:.4em; text-transform:uppercase; color:var(--gold-soft); opacity:.5; }
</style></head><body><div class="reel">
  <svg class="layer grain" viewBox="0 0 100 125" preserveAspectRatio="none"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100" height="125" filter="url(#g)"/></svg>
  <svg class="geo" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="halo"><stop offset="58%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="80%" stop-color="${TOK.goldSoft}" stop-opacity=".5"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
      <radialGradient id="corona"><stop offset="52%" stop-color="${TOK.goldSoft}" stop-opacity="0"/><stop offset="72%" stop-color="${TOK.goldSoft}" stop-opacity=".9"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
      <radialGradient id="cg"><stop offset="0%" stop-color="${TOK.light}"/><stop offset="100%" stop-color="${TOK.goldSoft}" stop-opacity="0"/></radialGradient>
    </defs>
    ${motivoSVG(motivo)}
  </svg>
  <div class="copy"><div class="rule"></div><div class="txt">${esc(texto)}</div></div>
  <div class="brand">@vivianne.dos.santos</div>
  <div class="count">${idx} / ${total}</div>
  <div class="layer vignette"></div>
</div></body></html>`;
}

module.exports = { reelHTML, slideHTML, RECEITAS, receitaDe, motivosDoTema, motivoSVG, segmentar, TOK };
