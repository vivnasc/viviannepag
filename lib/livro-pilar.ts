// O livro-pilar: Os Sete Véus (2.ª edição), o manual-mãe do Método VS.
// Modelado na aba Romances: aqui gere-se a CAPA (Replicate, sem texto na
// imagem) e dispara-se o render do PDF (capa composta + miolo A5).
// O texto vive em OS-7-VEUS-v2.md (raiz). Registo estático, sem fs em runtime.

export type LivroPilar = {
  slug: string;
  titulo: string;       // como aparece no admin
  sub: string;
  selo: string;
  autora: string;
  palavras: number;     // aproximado
  fonte: string;        // markdown de origem (na raiz do repo)
  cena: string;         // cena da capa (SEM texto na imagem; a tipografia entra na composição)
};

// Estilos de capa do pilar (estética renascentista-do-véu). A paleta é comum.
// IMPORTANTE: a capa é SEM pessoas e SEM caras (pedido da Vivianne). Cada estilo
// é um SÍMBOLO central (véu, limiar, labirinto, chave), em registo fine-art.
export const PILAR_CAPA_ESTILOS: Record<string, { nome: string; prompt: string }> = {
  limiar: {
    nome: 'Limiar (arco de luz)',
    prompt: 'a single ancient ornate stone archway or doorway standing alone, empty, opening onto warm radiant golden light, seen straight on, symbolic threshold, painterly fine-art, NO people, NO figures',
  },
  veu: {
    nome: 'Véu (tecido + luz)',
    prompt: 'a single sheer translucent veil of fabric alone in mid-air, no one wearing it, empty cloth lifting and parting to reveal warm golden light behind it, painterly still-life of fabric and light, NO people, NO body, NO figure, NO face',
  },
  labirinto: {
    nome: 'Labirinto dourado',
    prompt: 'a circular labyrinth of fine gold lines on deep indigo, a single winding path to a glowing centre, elegant sacred geometry, symbolic of an inner journey, NO people, NO figures',
  },
  chave: {
    nome: 'Chave (soltar)',
    prompt: 'a single ornate antique golden key resting in soft light against deep indigo, painterly still-life, symbolic of unlocking and letting go, NO people, NO figures, NO hands',
  },
};
export const PILAR_CAPA_ESTILO_DEFAULT = 'limiar';
export const PILAR_CAPA_PALETA =
  'deep indigo and aubergine night, warm gold, cream and soft dusk-violet palette';

export const LIVRO_PILAR: LivroPilar = {
  slug: 'os-7-veus',
  titulo: 'Os Sete Véus',
  sub: 'Vê o que te prende. Solta o que te faz repetir.',
  selo: 'Método VS · Ver e Soltar',
  autora: 'Vivianne dos Santos',
  palavras: 22000,
  fonte: 'OS-7-VEUS-v2.md',
  cena: `book cover painting, vertical composition: layers of sheer, translucent veils and flowing gauze, parting and lifting to reveal a soft glow of warm golden light at the centre, against a deep indigo and aubergine background; folds of luminous cloth dissolving toward the edges; entirely abstract and symbolic, with NO human figure, NO face, NO body, NO person, NO portrait; painterly renaissance texture, sfumato, quiet and timeless; generous calm space in the upper third for a title; contemplative and serene`,
};

export function getLivroPilar(slug: string): LivroPilar | undefined {
  return slug === LIVRO_PILAR.slug ? LIVRO_PILAR : undefined;
}
