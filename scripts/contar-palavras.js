#!/usr/bin/env node
// Verifica se cada livro escrito está DENTRO DOS PARÂMETROS (8000–12000 palavras),
// usando exatamente a mesma contagem da auditoria (raw.trim().split(/\s+/)).
// Uso: node scripts/contar-palavras.js
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join('content', 'produtos');
const MIN = 8000, MAX = 12000;

const dirs = fs.readdirSync(DIR)
  .filter(n => /^(mae|inf|pros|syn|per|for|tra)-\d+/.test(n) && !n.endsWith('-en'))
  .sort();

let ok = 0;
const fora = [];
for (const d of dirs) {
  const f = path.join(DIR, d, `${d}.md`);
  if (!fs.existsSync(f)) continue;
  const w = fs.readFileSync(f, 'utf8').trim().split(/\s+/).length;
  if (w >= MIN && w <= MAX) ok++;
  else fora.push(`${w < MIN ? 'CURTO' : 'LONGO'}  ${d}  ${w}`);
}

console.log(`DENTRO DOS PARÂMETROS (${MIN}-${MAX}): ${ok}/${dirs.length}`);
if (fora.length) {
  console.log('FORA:');
  fora.forEach(x => console.log('  ' + x));
  process.exitCode = 1;
}
