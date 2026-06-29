// Gera lib/knowledge/saber.ts a partir das FONTES da Vivianne (knowledge/GLOSSARIO.md),
// para o conteúdo da mãe/Soulab ganhar profundidade SEM eu inventar termos: usa as
// palavras dela. Corre: `node scripts/gen-knowledge.js`. Reproduzível e fiel à fonte.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const glo = fs.readFileSync(path.join(root, 'knowledge', 'GLOSSARIO.md'), 'utf8');

// parse: "## D01 · Antropologia da Sobrevivência" + linhas "- **Conceito** (D01): definição."
const dominios = [];
let atual = null;
for (const raw of glo.split('\n')) {
  const h = raw.match(/^##\s+(D\d{2})\s+·\s+(.+?)\s*$/);
  if (h) { atual = { codigo: h[1], nome: h[2].trim(), conceitos: [] }; dominios.push(atual); continue; }
  if (!atual) continue;
  const c = raw.match(/^\s*-\s+\*\*(.+?)\*\*\s*\(D\d{2}\):\s*(.+?)\s*$/);
  if (c) atual.conceitos.push({ nome: c[1].trim(), def: c[2].trim().replace(/\s+/g, ' ') });
}
// junta linhas de definição que continuam (o glossário quebra linhas)
// (o regex acima só apanha a 1.ª linha; recolhemos o resto)
{
  const linhas = glo.split('\n');
  let di = -1, ci = -1;
  for (let i = 0; i < linhas.length; i++) {
    const h = linhas[i].match(/^##\s+(D\d{2})/);
    if (h) { di++; ci = -1; continue; }
    if (di < 0) continue;
    if (/^\s*-\s+\*\*/.test(linhas[i])) { ci++; continue; }
    // continuação de definição (linha indentada, não vazia, não cabeçalho)
    if (ci >= 0 && linhas[i].trim() && !linhas[i].startsWith('#') && dominios[di] && dominios[di].conceitos[ci]) {
      dominios[di].conceitos[ci].def = (dominios[di].conceitos[ci].def + ' ' + linhas[i].trim()).replace(/\s+/g, ' ');
    }
  }
}

const total = dominios.reduce((a, d) => a + d.conceitos.length, 0);
if (dominios.length !== 15 || total < 110) {
  console.error(`[erro] esperava 15 domínios e ~120 conceitos; obtive ${dominios.length} domínios e ${total} conceitos`);
  process.exit(1);
}

// os 7 SINAIS DE DESENCAIXE (do livro irmão de Os Sete Véus) — a experiência sentida
// de pertença vs autenticidade. Profundidade da MÃE (a sua autoridade ampla).
const livro = fs.readFileSync(path.join(root, 'content', 'LIVRO-SINAIS-completo.md'), 'utf8');
const llin = livro.split('\n');
const sinais = [];
for (let i = 0; i < llin.length; i++) {
  const m = llin[i].match(/^#\s+Sinal\s+\d+\s*,\s*(.+?)\s*$/);
  if (!m) continue;
  // a epígrafe em itálico (*...*) logo a seguir = a essência sentida (palavras dela).
  let essencia = '';
  for (let j = i + 1; j < Math.min(i + 5, llin.length); j++) {
    const e = llin[j].match(/^\*(.+?)\*\s*$/);
    if (e) { essencia = e[1].trim(); break; }
  }
  sinais.push({ nome: m[1].trim(), essencia });
}
if (sinais.length !== 7 || sinais.some((s) => !s.essencia)) {
  console.error(`[erro] esperava 7 sinais com epígrafe; obtive ${sinais.length} (${sinais.filter((s) => !s.essencia).length} sem epígrafe)`);
  process.exit(1);
}

const header = `// GERADO por scripts/gen-knowledge.js a partir de knowledge/GLOSSARIO.md — NÃO editar à mão.
// Os 15 domínios das Ciências da Consciência Emergente (as palavras da Vivianne).
// Servem de PROFUNDIDADE POR BAIXO na geração (mãe/Soulab): dão rigor e densidade,
// mas NUNCA se nomeiam no texto que sai (sem jargão, sem autores, sem domínios).
`;

const body =
  `export interface ConceitoSaber { nome: string; def: string }\n` +
  `export interface DominioSaber { codigo: string; nome: string; conceitos: ConceitoSaber[] }\n\n` +
  `// Os 7 Sinais de Desencaixe (livro "Os 7 Sinais de Desencaixe"): a experiência\n` +
  `// SENTIDA de pertencer sem deixar de se ser inteiro. Cada sinal traz a sua\n` +
  `// EPÍGRAFE (a frase sentida, palavras do livro). Profundidade da MÃE.\n` +
  `export interface SinalDesencaixe { nome: string; essencia: string }\n` +
  `export const SINAIS_DESENCAIXE: SinalDesencaixe[] = ${JSON.stringify(sinais, null, 2)};\n\n` +
  `export const DOMINIOS: DominioSaber[] = ${JSON.stringify(dominios, null, 2)};\n\n` +
  `// uma FATIA rotativa de domínios (por seed) -> profundidade variada por peça, sem
// encher o prompt nem repetir. n = quantos domínios; devolve um bloco de texto pronto
// a injetar como "para pensares mais fundo". NUNCA nomear isto no resultado.
export function profundidadePorBaixo(seed = 0, n = 3): string {
  const L = DOMINIOS.length;
  const inicio = ((seed % L) + L) % L;
  const escolhidos = Array.from({ length: Math.min(n, L) }, (_, k) => DOMINIOS[(inicio + k * 5) % L]);
  return escolhidos
    .map((d) => d.conceitos.map((c) => \`\${c.nome}: \${c.def}\`).join(' · '))
    .join('\\n');
}\n`;

const out = path.join(root, 'lib', 'knowledge', 'saber.ts');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header + '\n' + body);
console.log(`[ok] ${dominios.length} domínios, ${total} conceitos -> ${path.relative(root, out)}`);
