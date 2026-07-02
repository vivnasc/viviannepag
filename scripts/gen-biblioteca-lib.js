#!/usr/bin/env node
'use strict';
// Le a Biblioteca Visual VDS (biblioteca-vds/**/*.svg, a biblioteca REAL da Vivianne)
// e emite lib/crescer/biblioteca-vds.js: o inner de cada componente, pronto a entrar
// no reel (outer <svg> e :root removidos, ids locais com prefixo para nao chocarem
// com os gradientes do container). Assim o reel usa a biblioteca INTEIRA, nao 11 formas
// metidas a mao. Correr: node scripts/gen-biblioteca-lib.js
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', 'biblioteca-vds');
const CATS = fs.readdirSync(RAIZ).filter((d) => fs.statSync(path.join(RAIZ, d)).isDirectory());

function prepara(svgRaw, compId) {
  // 1) tira o outer <svg ...> ... </svg> -> fica so o inner
  let inner = svgRaw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  // 2) tira o bloco <style> :root (as vars; ficam os fallbacks embutidos nos var(...,#hex))
  inner = inner.replace(/<style>[\s\S]*?<\/style>/g, '');
  // 3) tira comentarios
  inner = inner.replace(/<!--[\s\S]*?-->/g, '');
  // 4) NAMESPACE dos ids locais (evita chocar com halo/corona/cg do container do reel)
  const ids = [...inner.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  for (const id of [...new Set(ids)]) {
    const novo = `v_${compId}_${id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    inner = inner.replace(new RegExp(`id="${id}"`, 'g'), `id="${novo}"`);
    inner = inner.replace(new RegExp(`url\\(#${id}\\)`, 'g'), `url(#${novo})`);
  }
  return inner.replace(/\s+/g, ' ').trim();
}

const bib = {};
let total = 0;
for (const cat of CATS) {
  const dir = path.join(RAIZ, cat);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'));
  if (!files.length) continue;
  bib[cat] = files.map((f) => {
    const id = f.replace(/\.svg$/, '');
    const inner = prepara(fs.readFileSync(path.join(dir, f), 'utf8'), id);
    total++;
    return { id, inner };
  });
}

const out = `'use strict';
// GERADO por scripts/gen-biblioteca-lib.js a partir de biblioteca-vds/ — NAO editar a mao.
// A Biblioteca Visual VDS da Vivianne (${total} componentes), pronta para o reel da mae.
// Cada componente: { id, inner } (o inner do SVG, ids ja com namespace). O container do
// reel poe os gradientes (halo/cg) e a animacao anima tudo por [pathLength] + fills.
const BIBLIOTECA = ${JSON.stringify(bib, null, 1)};

function componente(id) {
  for (const cat of Object.keys(BIBLIOTECA)) {
    const c = BIBLIOTECA[cat].find((x) => x.id === id);
    if (c) return c;
  }
  return null;
}
const idsDe = (cat) => (BIBLIOTECA[cat] || []).map((c) => c.id);

module.exports = { BIBLIOTECA, componente, idsDe };
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'crescer', 'biblioteca-vds.js'), out);
console.log(`[biblioteca] ${total} componentes -> lib/crescer/biblioteca-vds.js`);
for (const cat of Object.keys(bib)) console.log(`  ${cat}: ${bib[cat].length}`);
