// Registo das capas dos 4 livros (pilar + 3 manuais), para a geração de capas
// num só sítio (/admin/livro-pilar). Cada livro partilha a MESMA base (coesão)
// e muda só o símbolo (distinção). A tipografia entra na composição.

export type LivroCapa = {
  slug: string;        // os-7-veus | ver-soltar | vir-soltar | viver-soltar
  marca: string;       // Os Sete Véus | ver.soltar
  sub: string;         // movimento / promessa curta
  simbolo: string;     // o símbolo (prompt) próprio do livro
  // textos da composição (tipografia por cima da imagem)
  comp: { selo: string; t1: string; t2: string; sub: string; autora: string };
  compEn: { selo: string; t1: string; t2: string; sub: string; autora: string };
};

// base comum da família (vai em todos)
export const CAPA_BASE =
  'fine-art book cover painting, deep indigo and aubergine night background, warm gold light, painterly renaissance texture, sfumato, contemplative and timeless, a single central symbol, generous calm space in the upper third for a title';
export const CAPA_SAFETY =
  'NO people, NO person, NO faces, NO figures, NO hands, NO text, NO words, NO letters, NO logos, NO watermarks';

export const LIVROS_CAPA: LivroCapa[] = [
  {
    slug: 'os-7-sinais', marca: 'Os 7 Sinais de Desencaixe', sub: 'o livro · pertença e autenticidade',
    simbolo: 'a warm candlelit gathering of several soft painterly human figures seated close together, glowing in golden light and turned toward one another in conversation, and a single figure among them set slightly apart, turned a little outward and rendered in cooler dimmer light, present in the same warm room yet quietly outside its warmth, atmospheric and intimate, faces undetailed, the feeling of being among others and still not belonging',
    comp: { selo: 'IRMÃO DE OS SETE VÉUS', t1: 'Os 7 Sinais', t2: 'de Desencaixe', sub: 'O equilíbrio entre pertença\ne autenticidade', autora: 'VIVIANNE DOS SANTOS' },
    compEn: { selo: 'A COMPANION TO THE SEVEN VEILS', t1: 'The 7 Signs', t2: 'of Not Belonging', sub: 'On belonging without\nmaking yourself smaller', autora: 'VIVIANNE DOS SANTOS' },
  },
  {
    slug: 'os-7-veus', marca: 'Os Sete Véus', sub: 'o pilar · o limiar',
    simbolo: 'a single ornate ancient stone archway standing alone, empty, opening onto warm radiant golden light, seen straight on, a threshold',
    comp: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'Os Sete', t2: 'Véus', sub: 'Vê o que te prende.\nSolta o que te faz repetir.', autora: 'VIVIANNE DOS SANTOS' },
    compEn: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'The Seven', t2: 'Veils', sub: 'See what binds you.\nRelease what makes you repeat.', autora: 'VIVIANNE DOS SANTOS' },
  },
  {
    slug: 'ver-soltar', marca: 'ver.soltar', sub: 'a consciência · a margem',
    simbolo: 'a calm still expanse of dark water with a single thin line of warm light on the far horizon, seen from the near shore, serene, room to breathe',
    comp: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'ver', t2: 'soltar', sub: 'a consciência', autora: 'VIVIANNE DOS SANTOS' },
    compEn: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'ver', t2: 'soltar', sub: 'seeing', autora: 'VIVIANNE DOS SANTOS' },
  },
  {
    slug: 'vir-soltar', marca: 'vir.soltar', sub: 'o regresso · o colo',
    simbolo: 'a soft cupped hollow of warm golden light cradled in deep shadow, like a held nest or a quiet hearth, tender and sheltering, abstract, no figure',
    comp: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'vir', t2: 'soltar', sub: 'o regresso', autora: 'VIVIANNE DOS SANTOS' },
    compEn: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'vir', t2: 'soltar', sub: 'returning', autora: 'VIVIANNE DOS SANTOS' },
  },
  {
    slug: 'viver-soltar', marca: 'viver.soltar', sub: 'a integração · descalça',
    simbolo: 'an open doorway seen from inside a dark room, the threshold and the ground just beyond it bathed in warm morning light, a path of light leading out',
    comp: { selo: 'MÉTODO VS · VER E SOLTAR', t1: 'viver', t2: 'soltar', sub: 'a integração', autora: 'VIVIANNE DOS SANTOS' },
    compEn: { selo: 'METHOD VS · SEE AND RELEASE', t1: 'viver', t2: 'soltar', sub: 'living', autora: 'VIVIANNE DOS SANTOS' },
  },
];

export function getLivroCapa(slug: string): LivroCapa | undefined {
  return LIVROS_CAPA.find((l) => l.slug === slug);
}
