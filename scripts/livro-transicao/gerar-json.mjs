// Separa CONTEÚDO de APRESENTAÇÃO: lê o manuscrito + aparato e escreve um JSON
// limpo (livro/livro.json) com a estrutura semântica do livro. Este JSON é a
// FONTE única; o template (Typst ou Paged.js) só trata da forma.
//   node scripts/livro-transicao/gerar-json.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const LIVRO = (f) => path.join(ROOT, 'livro', f);

const aparato = JSON.parse(readFileSync(LIVRO('aparato.json'), 'utf8'));

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
    if (t.startsWith('#### ')) { if (cur) cur.titulo = t.slice(5).trim(); continue; }
    if (t.startsWith('### ')) {
      const h = t.slice(4).trim();
      if (/^(CAPÍTULO|INTERLÚDIO|EPÍLOGO)/i.test(h)) {
        push();
        const tipo = /^CAP/i.test(h) ? 'capitulo' : /^INTER/i.test(h) ? 'interludio' : 'epilogo';
        cur = { tipo, kicker: h, titulo: '', texto: [] };
      } else if (cur && (cur.tipo === 'parte' || cur.tipo === 'prologo' || cur.tipo === 'introducao') && !cur.titulo) {
        cur.titulo = h;
      }
      continue;
    }
    if (t.startsWith('## ')) {
      const h = t.slice(3).trim();
      push();
      if (/^PARTE/i.test(h)) cur = { tipo: 'parte', kicker: h, titulo: '', texto: [] };
      else if (/^PRÓLOGO/i.test(h)) cur = { tipo: 'prologo', kicker: 'Prólogo', titulo: '', texto: [] };
      else if (/^INTRODUÇÃO/i.test(h)) cur = { tipo: 'introducao', kicker: 'Introdução', titulo: '', texto: [] };
      else cur = { tipo: 'seccao', kicker: h, titulo: '', texto: [] };
      continue;
    }
    if (t.startsWith('# ')) continue;
    if (/^\*[^*]+\*$/.test(t)) continue;
    if (cur) cur.texto.push(t);
  }
  push();
  return units;
}

function chaveAparato(u) {
  if (u.tipo === 'prologo') return 'PRÓLOGO';
  if (u.tipo === 'introducao') return 'INTRODUÇÃO';
  return u.titulo;
}

// Respiro: parte parágrafos muito longos ("rio sem fim") em dois, na fronteira
// de frase mais próxima do meio. Não muda uma palavra; só dá ar à leitura.
function respirar(paras, limite = 105) {
  const out = [];
  for (const p of paras) {
    const palavras = p.split(/\s+/).length;
    if (palavras <= limite) { out.push(p); continue; }
    const frases = p.split(/(?<=[.!?])\s+/);
    if (frases.length < 4) { out.push(p); continue; }
    let melhor = 1, dist = 1e9, corre = 0; const meio = palavras / 2;
    for (let i = 0; i < frases.length - 1; i++) {
      corre += frases[i].split(/\s+/).length;
      const d = Math.abs(corre - meio);
      if (d < dist) { dist = d; melhor = i + 1; }
    }
    out.push(frases.slice(0, melhor).join(' ').trim());
    // a 2.ª metade pode ainda ser longa: parte recursivamente
    respirar([frases.slice(melhor).join(' ').trim()], limite).forEach((q) => out.push(q));
  }
  return out;
}

const unidades = parseManuscrito().map((u) => {
  const a = aparato[chaveAparato(u)] || {};
  const o = { tipo: u.tipo, kicker: u.kicker, titulo: u.titulo };
  if (a.epigrafe) o.epigrafe = a.epigrafe;
  if (u.texto && u.texto.length) o.texto = respirar(u.texto);
  if (a.ideia) o.ideia = a.ideia;
  if (a.dica) o.dica = a.dica; // nota prática (opcional, por capítulo)
  if (a.pergunta) o.pergunta = a.pergunta;
  return o;
});

const livro = {
  titulo: 'A Grande Transição',
  subtitulo: 'Introdução às Ciências da Consciência Emergente',
  selo: 'Ciências da Consciência Emergente',
  autora: 'Vivianne dos Santos',
  unidades,
};

const out = LIVRO('livro.json');
writeFileSync(out, JSON.stringify(livro, null, 2) + '\n');
const n = (t) => unidades.filter((u) => u.tipo === t).length;
console.log('livro.json:', out);
console.log(`  ${unidades.length} unidades · ${n('parte')} partes · ${n('capitulo')} capítulos · ${n('interludio')} interlúdios`);
