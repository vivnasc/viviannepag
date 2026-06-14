// Textos da composição das capas (a tipografia que entra POR CIMA da imagem
// escolhida). Fonte única para os scripts de render (capa-compor.js). Espelha
// lib/livros-capa.ts; aqui em CommonJS porque os scripts de render não importam
// TypeScript. O pilar leva título em duas linhas; os manuais levam a marca numa
// só linha (com o ponto) e o movimento por baixo.
module.exports = {
  'os-7-veus': {
    px: 142,
    pt: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'Os Sete', t2: 'Véus', sub: 'Vê o que te prende.\nSolta o que te faz repetir.', autora: 'VIVIANNE DOS SANTOS' },
    en: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'The Seven', t2: 'Veils', sub: 'See what binds you.\nRelease what makes you repeat.', autora: 'VIVIANNE DOS SANTOS' },
  },
  'ver-soltar': {
    px: 118,
    pt: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'ver.soltar', t2: '', sub: 'a consciência', autora: 'VIVIANNE DOS SANTOS' },
    en: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'ver.soltar', t2: '', sub: 'seeing', autora: 'VIVIANNE DOS SANTOS' },
  },
  'vir-soltar': {
    px: 118,
    pt: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'vir.soltar', t2: '', sub: 'o regresso', autora: 'VIVIANNE DOS SANTOS' },
    en: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'vir.soltar', t2: '', sub: 'returning', autora: 'VIVIANNE DOS SANTOS' },
  },
  'viver-soltar': {
    px: 104,
    pt: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'viver.soltar', t2: '', sub: 'a integração', autora: 'VIVIANNE DOS SANTOS' },
    en: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'viver.soltar', t2: '', sub: 'living', autora: 'VIVIANNE DOS SANTOS' },
  },
};
