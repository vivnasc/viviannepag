// GERA lib/knowledge/veias.ts a partir dos LIVROS dela (as fontes primárias):
//   livro/A_Grande_Transicao_completo.md  (A Grande Transição)
//   content/LIVRO-SINAIS-completo.md       (Os 7 Sinais de Desencaixe)
//
// Cada VEIA = uma secção real do livro (um capítulo, um interlúdio, um sinal),
// com o TEXTO dela (não um resumo meu). O gerador minera daqui as ideias,
// metáforas e hipóteses — a fonte de descoberta passa a ser o livro, não o
// comportamento do quotidiano. Correr: node scripts/gen-veias.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CAP = 7000; // máximo de caracteres por veia (chega para minerar uma ideia)

// corta num limite de frase perto do teto, para não cortar a meio de uma palavra.
function capar(txt) {
  const t = txt.trim();
  if (t.length <= CAP) return t;
  const corte = t.slice(0, CAP);
  const ult = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('.\n'), corte.lastIndexOf('? '), corte.lastIndexOf('! '));
  return (ult > CAP * 0.6 ? corte.slice(0, ult + 1) : corte).trim();
}

const limpaH = (l) => l.replace(/^#{1,6}\s+/, '').trim();
const ehH = (l) => /^#{1,6}\s+/.test(l);

// parte o ficheiro em secções: começa numa heading cujo TEXTO casa `inicioRe`,
// pára quando o texto casa `fimRe` (ou no fim). Junta a subheading seguinte ao título.
function seccoes(md, { inicioRe, fimRe, livro, parteRe }) {
  const linhas = md.split('\n');
  const out = [];
  let parte = null;
  let atual = null;
  const fecha = () => { if (atual && atual.corpo.trim()) { atual.texto = capar(atual.corpo); delete atual.corpo; out.push(atual); } atual = null; };

  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (ehH(l)) {
      const h = limpaH(l);
      if (fimRe && fimRe.test(h)) { fecha(); break; }
      if (parteRe && parteRe.test(h)) { parte = h; continue; }
      if (inicioRe.test(h)) {
        fecha();
        // subtítulo: a heading seguinte (####/###) é o "nome" real da ideia.
        let titulo = h;
        for (let j = i + 1; j < Math.min(i + 4, linhas.length); j++) {
          if (linhas[j].trim() === '') continue;
          if (ehH(linhas[j])) { titulo = limpaH(linhas[j]); }
          break;
        }
        atual = { id: '', livro, parte, titulo, corpo: '' };
        continue;
      }
    }
    if (atual) atual.corpo += l + '\n';
  }
  fecha();
  return out;
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

// --- A Grande Transição: prólogo, introdução, capítulos, interlúdios, epílogo
// (pára nos ANEXOS/Glossário, que já vivem em saber.ts) ---
const transicaoMd = fs.readFileSync(path.join(ROOT, 'livro/A_Grande_Transicao_completo.md'), 'utf8');
const vT = seccoes(transicaoMd, {
  livro: 'transicao',
  inicioRe: /^(PRÓLOGO|INTRODUÇÃO|CAPÍTULO\s+\d+|INTERLÚDIO|EPÍLOGO)/i,
  fimRe: /^(ANEXOS|Glossário|O mapa dos quinze)/i,
  parteRe: /^PARTE\s+[IVX]+/i,
});

// --- Os 7 Sinais de Desencaixe ---
const sinaisMd = fs.readFileSync(path.join(ROOT, 'content/LIVRO-SINAIS-completo.md'), 'utf8');
const vS = seccoes(sinaisMd, {
  livro: 'sinais',
  inicioRe: /^(Introdução|Sinal\s+\d+|Epílogo)/i,
  fimRe: null,
  parteRe: null,
});

const todas = [...vT, ...vS];
const usados = new Set();
for (const v of todas) {
  let s = slug(`${v.livro}-${v.titulo}`) || slug(v.livro);
  let n = s, k = 2; while (usados.has(n)) n = `${s}-${k++}`;
  usados.add(n); v.id = n;
}

const LIVROS = { transicao: 'A Grande Transição', sinais: 'Os 7 Sinais de Desencaixe' };

const ts = `// GERADO por scripts/gen-veias.js a partir dos LIVROS dela — NÃO editar à mão.
// As VEIAS são as secções reais dos livros (capítulos, interlúdios, sinais), com
// o TEXTO dela. São a FONTE PRIMÁRIA de descoberta da mãe e da Soulab: o gerador
// minera daqui as ideias, metáforas e hipóteses, em vez de partir de comportamentos
// do quotidiano. "Se o conteúdo pudesse existir sem os livros, é o conteúdo errado."

export interface Veia { id: string; livro: string; livroTitulo: string; parte: string | null; titulo: string; texto: string }

export const VEIAS: Veia[] = ${JSON.stringify(
  todas.map((v) => ({ id: v.id, livro: v.livro, livroTitulo: LIVROS[v.livro], parte: v.parte, titulo: v.titulo, texto: v.texto })),
  null,
  2,
)};

export const getVeia = (id: string): Veia | undefined => VEIAS.find((v) => v.id === id);

// escolhe uma veia ainda NÃO minerada (anti-repetição por id); se todas já foram,
// recomeça pelas menos usadas. \`usadas\` = ids já usados (mais recentes ao fim).
export function escolherVeia(usadas: string[] = [], seed = 0): Veia {
  const naoUsadas = VEIAS.filter((v) => !usadas.includes(v.id));
  const pool = naoUsadas.length ? naoUsadas : VEIAS;
  return pool[((seed % pool.length) + pool.length) % pool.length];
}
`;

const dest = path.join(ROOT, 'lib/knowledge/veias.ts');
fs.writeFileSync(dest, ts);
console.log(`veias.ts gerado: ${todas.length} veias (${vT.length} de A Grande Transição, ${vS.length} dos 7 Sinais)`);
for (const v of todas) console.log(`  [${v.livro}] ${v.titulo}  (${v.texto.length} chars)`);
