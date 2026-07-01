// Lê as 10 peças do livro e escreve o JSON que o template Typst
// (build/livro-medo.typ) consome. Bilingue:
//   node gerar-json.mjs        → PT: livro_medo/*.md        → livro-medo.json
//   node gerar-json.mjs en     → EN: livro_medo/en/*.md     → livro-medo_en.json
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const lang = (process.argv[2] || process.env.LANG_LIVRO || 'pt').toLowerCase() === 'en' ? 'en' : 'pt';
const SRC = lang === 'en' ? path.join(ROOT, 'livro_medo', 'en') : path.join(ROOT, 'livro_medo');
const OUT = path.join(ROOT, 'livro_medo', lang === 'en' ? 'livro-medo_en.json' : 'livro-medo.json');
const L = (f) => path.join(SRC, f);

const PECAS_PT = [
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

// EN: mesmos ficheiros (em livro_medo/en/), mesmos glyphs; rótulos curados em inglês.
const PECAS_EN = [
  { file: '00-prologo.md',                    kind: 'prologo' },
  { file: '01-introducao.md',                 kind: 'intro' },
  { file: '02-rejeicao-o-espelho.md',         kind: 'face', cap: 'Chapter One',   ord: 'the first face of fear',          medo: 'Rejection',       glyph: 'espelho' , pergunta: "how many of your yeses do you actually like, and how many were only the way you stayed inside the room?", destaque: "It is not an overreaction.¦It is memory." },
  { file: '03-perda-o-punho.md',              kind: 'face', cap: 'Chapter Two',   ord: 'the second face of fear',         medo: 'Loss',            glyph: 'punho' , pergunta: "does your love, today, make the one you love larger or smaller?", destaque: "It grips so as not to lose,¦and it is the grip that makes it lose." },
  { file: '04-escassez-o-inverno.md',         kind: 'face', cap: 'Chapter Three', ord: 'the third face of fear',          medo: 'Scarcity',        glyph: 'inverno' , pergunta: "what are you postponing living, waiting for a security that, when it arrives, you will find is still one step ahead of you?", destaque: "It is always winter inside,¦whatever the weather outside." },
  { file: '05-incerteza-a-fortaleza.md',      kind: 'face', cap: 'Chapter Four',  ord: 'the fourth face of fear',         medo: 'Uncertainty',     glyph: 'fortaleza' , pergunta: "how much life are you depriving yourself of, so as not to feel that you do not know what comes next?", destaque: "Life is not mastered.¦It is accompanied." },
  { file: '06-exposicao-a-luz.md',            kind: 'face', cap: 'Chapter Five',  ord: 'the fifth face of fear',          medo: 'Exposure',        glyph: 'luz' , pergunta: "what does the world lose by never seeing what only you had to give, and who, in truth, is served by your staying hidden?", destaque: "The perfect façade isolates.¦The imperfect truth connects." },
  { file: '07-insignificancia-o-apagamento.md', kind: 'face', cap: 'Chapter Six', ord: 'the sixth face of fear',          medo: 'Insignificance',  glyph: 'apagamento' , pergunta: "would you still do the good you do if you were certain that no one would ever know it was you?", destaque: "Life offers the mark,¦without the name." },
  { file: '08-separacao-o-abismo.md',         kind: 'face', cap: 'Chapter Seven', ord: 'the seventh face of fear, the root', medo: 'Separation',   glyph: 'abismo' , pergunta: "what would you still be afraid of, and what would you do with the life that fear had been saving for nothing?", destaque: "The wave does not die when it falls.¦It returns to what it was always made of." },
  { file: '09-epilogo.md',                    kind: 'epilogo' },
];

const PECAS = lang === 'en' ? PECAS_EN : PECAS_PT;

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
  // faces: "A Rejeição · O Espelho" / "Rejection · The Mirror" -> nome é depois do ·
  if (titulo.includes('·')) nome = titulo.split('·').pop().trim();
  else subtitulo = titulo;
  return { nome, subtitulo, blocos };
}

const livro = PECAS.map((p) => {
  const { nome, subtitulo, blocos } = parse(p.file);
  return { ...p, nome: p.kind === 'face' ? nome : '', subtitulo, blocos };
});

writeFileSync(OUT, JSON.stringify(livro, null, 1), 'utf8');
const nb = livro.reduce((s, p) => s + p.blocos.length, 0);
console.log(`${path.basename(OUT)}: ${livro.length} peças, ${nb} blocos (${lang})`);
