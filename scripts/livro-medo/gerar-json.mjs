// Lê livro_medo/*.md (as 10 peças) e escreve livro_medo/livro-medo.json,
// a fonte única que o template Typst (build/livro-medo.typ) consome.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const L = (f) => path.join(ROOT, 'livro_medo', f);

const PECAS = [
  { file: '00-prologo.md',                    kind: 'prologo' },
  { file: '01-introducao.md',                 kind: 'intro' },
  { file: '02-rejeicao-o-espelho.md',         kind: 'face', cap: 'Capítulo um',   ord: 'a primeira face do medo',        medo: 'A Rejeição',       glyph: 'espelho' },
  { file: '03-perda-o-punho.md',              kind: 'face', cap: 'Capítulo dois',  ord: 'a segunda face do medo',         medo: 'A Perda',          glyph: 'punho' },
  { file: '04-escassez-o-inverno.md',         kind: 'face', cap: 'Capítulo três',  ord: 'a terceira face do medo',        medo: 'A Escassez',       glyph: 'inverno' },
  { file: '05-incerteza-a-fortaleza.md',      kind: 'face', cap: 'Capítulo quatro', ord: 'a quarta face do medo',         medo: 'A Incerteza',      glyph: 'fortaleza' },
  { file: '06-exposicao-a-luz.md',            kind: 'face', cap: 'Capítulo cinco',  ord: 'a quinta face do medo',         medo: 'A Exposição',      glyph: 'luz' },
  { file: '07-insignificancia-o-apagamento.md', kind: 'face', cap: 'Capítulo seis', ord: 'a sexta face do medo',          medo: 'A Insignificância', glyph: 'apagamento' },
  { file: '08-separacao-o-abismo.md',         kind: 'face', cap: 'Capítulo sete',  ord: 'a sétima face do medo, a raiz',  medo: 'A Separação',      glyph: 'abismo' },
  { file: '09-epilogo.md',                    kind: 'epilogo' },
];

function parse(file) {
  const raw = readFileSync(L(file), 'utf8').replace(/\r/g, '');
  const lines = raw.split('\n');
  let titulo = '', nome = '', subtitulo = '';
  const blocos = [];
  for (let ln of lines) {
    const t = ln.trim();
    if (!t || t === '---') continue;
    if (t.startsWith('#### ')) { blocos.push({ t: 'sec', texto: t.slice(5).trim() }); continue; }
    if (t.startsWith('### ')) { blocos.push({ t: 'sec', texto: t.slice(4).trim() }); continue; }
    if (t.startsWith('## ')) { titulo = t.slice(3).trim(); continue; }
    if (t.startsWith('# ')) { continue; } // o kicker (PRÓLOGO/CAPÍTULO N) vem da meta
    blocos.push({ t: 'par', texto: t });
  }
  // faces: "A Rejeição · O Espelho" -> nome é depois do ·; senão o titulo é subtítulo
  if (titulo.includes('·')) nome = titulo.split('·').pop().trim();
  else subtitulo = titulo;
  return { nome, subtitulo, blocos };
}

const livro = PECAS.map((p) => {
  const { nome, subtitulo, blocos } = parse(p.file);
  return { ...p, nome: p.kind === 'face' ? nome : '', subtitulo, blocos };
});

writeFileSync(L('livro-medo.json'), JSON.stringify(livro, null, 1), 'utf8');
const nb = livro.reduce((s, p) => s + p.blocos.length, 0);
console.log(`livro-medo.json: ${livro.length} peças, ${nb} blocos`);
