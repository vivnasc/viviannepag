// Gera a amostra pública de um romance (assentos + capítulo 1) a partir dos md.
// Uso: node gerar-amostra.js <pasta-do-livro> <slug>
//   ex.: node gerar-amostra.js caderno-das-dividas-livro caderno-das-dividas
// Escreve lib/amostras/<slug>.ts. Inclui os campos EN (tituloEn/assentosEn/
// capituloEn) quando existe a pasta irmã <pasta>-en (00-opening.md + 01-*.md).
// Não editar a amostra à mão; regenera-se daqui.
const fs = require('fs');
const path = require('path');

const PASTA = process.argv[2];
const SLUG = process.argv[3];
if (!PASTA || !SLUG) { console.error('faltam argumentos: <pasta> <slug>'); process.exit(1); }

const ROOT = path.join(__dirname, '..', '..');
const strip = s => s.replace(/^##\s.*\n/, '').trim();

// Lê a página de abertura (assentos) + o capítulo 1 de uma pasta de livro.
function extrair(dir, openingFile) {
  const abertura = strip(fs.readFileSync(path.join(dir, openingFile), 'utf8'));
  const ch1name = fs.readdirSync(dir).filter(f => f.startsWith('01-'))[0];
  const cap1raw = fs.readFileSync(path.join(dir, ch1name), 'utf8');
  const titulo = (cap1raw.match(/^##\s*\d+\.\s*(.+)$/m) || [, ''])[1].trim();
  return { abertura, titulo, capitulo: strip(cap1raw) };
}

const pt = extrair(path.join(ROOT, 'ficcao-plano', PASTA), '00-abertura.md');

const enDir = path.join(ROOT, 'ficcao-plano', PASTA + '-en');
const en = fs.existsSync(enDir) ? extrair(enDir, '00-opening.md') : null;

const varName = 'AMOSTRA_' + SLUG.toUpperCase().replace(/-/g, '_');
const linhasEn = en ? `
  tituloEn: ${JSON.stringify(en.titulo)},
  assentosEn: ${JSON.stringify(en.abertura)},
  capituloEn: ${JSON.stringify(en.capitulo)},` : '';
const out = `// ${SLUG} · amostra pública (página dos Assentos + capítulo 1).
// Gerado por scripts/romances/gerar-amostra.js a partir de ficcao-plano/${PASTA}/ (+ -en).
// Não editar à mão; emendas fazem-se nos md do livro e regenera-se.
export const ${varName} = {
  titulo: ${JSON.stringify(pt.titulo)},
  assentos: ${JSON.stringify(pt.abertura)},
  capitulo: ${JSON.stringify(pt.capitulo)},${linhasEn}
};
`;
fs.mkdirSync(path.join(ROOT, 'lib', 'amostras'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'lib', 'amostras', SLUG + '.ts'), out);
console.log('amostra:', 'lib/amostras/' + SLUG + '.ts', '·', varName, en ? '(PT+EN)' : '(PT)');
