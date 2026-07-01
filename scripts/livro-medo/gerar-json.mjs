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
  { file: '02-rejeicao-o-espelho.md',         kind: 'face', cap: 'Capítulo um',   ord: 'a primeira face do medo',        medo: 'A Rejeição',       glyph: 'espelho' , pergunta: "de quantos dos teus sim é que gostas mesmo, e quantos foram só a forma de continuares dentro da sala?", destaque: "Não é exagero.¦É memória." },
  { file: '03-perda-o-punho.md',              kind: 'face', cap: 'Capítulo dois',  ord: 'a segunda face do medo',         medo: 'A Perda',          glyph: 'punho' , pergunta: "o teu amor, hoje, faz a pessoa amada maior ou mais pequena?", destaque: "Aperta para não perder,¦e é o aperto que o faz perder." },
  { file: '04-escassez-o-inverno.md',         kind: 'face', cap: 'Capítulo três',  ord: 'a terceira face do medo',        medo: 'A Escassez',       glyph: 'inverno' , pergunta: "o que é que estás a adiar viver à espera de uma segurança que, quando chegar, vais descobrir que continua um passo à frente?", destaque: "É sempre inverno lá dentro,¦faça o tempo que fizer lá fora." },
  { file: '05-incerteza-a-fortaleza.md',      kind: 'face', cap: 'Capítulo quatro', ord: 'a quarta face do medo',         medo: 'A Incerteza',      glyph: 'fortaleza' , pergunta: "de quanta vida te estás a privar para não teres de sentir que não sabes o que vem a seguir?", destaque: "A vida não se domina.¦Acompanha-se." },
  { file: '06-exposicao-a-luz.md',            kind: 'face', cap: 'Capítulo cinco',  ord: 'a quinta face do medo',         medo: 'A Exposição',      glyph: 'luz' , pergunta: "o que é que o mundo perde por nunca chegar a ver aquilo que só tu tinhas para dar, e a quem serve, de facto, que continues escondida?", destaque: "A fachada perfeita isola.¦A verdade imperfeita liga." },
  { file: '07-insignificancia-o-apagamento.md', kind: 'face', cap: 'Capítulo seis', ord: 'a sexta face do medo',          medo: 'A Insignificância', glyph: 'apagamento' , pergunta: "serias capaz de fazer o bem que fazes se tivesses a certeza de que ninguém alguma vez saberia que foste tu?", destaque: "A vida oferece a marca,¦sem o nome." },
  { file: '08-separacao-o-abismo.md',         kind: 'face', cap: 'Capítulo sete',  ord: 'a sétima face do medo, a raiz',  medo: 'A Separação',      glyph: 'abismo' , pergunta: "do que é que ainda terias medo, e o que farias com a vida que o medo te andou a poupar para nada?", destaque: "A onda não morre quando baixa.¦Regressa àquilo de que sempre foi feita." },
  { file: '09-epilogo.md',                    kind: 'epilogo' },
];


// parte parágrafos-parede em fronteiras de frase (respiração), sem cortar frases
function partir(texto, max = 360) {
  if (texto.length <= max) return [texto];
  const frases = texto.match(/[^.!?]+[.!?]+(?=\s|$)\s*/g) || [texto];
  const out = []; let cur = '';
  for (const f of frases) {
    if (cur && (cur.length + f.length) > max) { out.push(cur.trim()); cur = f; }
    else cur += f;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

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
    for (const sub of partir(t)) blocos.push({ t: 'par', texto: sub });
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
