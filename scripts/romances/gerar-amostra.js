// Gera a amostra pública de um romance (assentos + capítulo 1) a partir dos md.
// Uso: node gerar-amostra.js <pasta-do-livro> <slug>
//   ex.: node gerar-amostra.js caderno-das-dividas-livro caderno-das-dividas
// Escreve lib/amostras/<slug>.ts. Não editar a amostra à mão; regenera-se daqui.
const fs = require('fs');
const path = require('path');

const PASTA = process.argv[2];
const SLUG = process.argv[3];
if (!PASTA || !SLUG) { console.error('faltam argumentos: <pasta> <slug>'); process.exit(1); }

const DIR = path.join(__dirname, '..', '..', 'ficcao-plano', PASTA);
const strip = s => s.replace(/^##\s.*\n/, '').trim();

const abertura = strip(fs.readFileSync(path.join(DIR, '00-abertura.md'), 'utf8'));
const cap1raw = fs.readFileSync(path.join(DIR, '01-' + fs.readdirSync(DIR).filter(f => f.startsWith('01-'))[0].slice(3)), 'utf8');
const titulo = (cap1raw.match(/^##\s*\d+\.\s*(.+)$/m) || [, ''])[1].trim();
const capitulo = strip(cap1raw);

const varName = 'AMOSTRA_' + SLUG.toUpperCase().replace(/-/g, '_');
const out = `// ${SLUG} · amostra pública (página dos Assentos + capítulo 1).
// Gerado por scripts/romances/gerar-amostra.js a partir de ficcao-plano/${PASTA}/.
// Não editar à mão; emendas fazem-se nos md do livro e regenera-se.
export const ${varName} = {
  titulo: ${JSON.stringify(titulo)},
  assentos: ${JSON.stringify(abertura)},
  capitulo: ${JSON.stringify(capitulo)},
};
`;
fs.mkdirSync(path.join(__dirname, '..', '..', 'lib', 'amostras'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', '..', 'lib', 'amostras', SLUG + '.ts'), out);
console.log('amostra:', 'lib/amostras/' + SLUG + '.ts', '·', varName);
