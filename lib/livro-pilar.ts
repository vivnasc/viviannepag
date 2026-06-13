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
// IMPORTANTE: a capa é SEM caras e SEM figura humana (pedido da Vivianne).
// Só véus, tecido e luz, abstrato e simbólico. Universal, sem etnia nem pose.
export const PILAR_CAPA_ESTILOS: Record<string, { nome: string; prompt: string }> = {
  renascentista: {
    nome: 'Renascentista do véu',
    prompt: 'fine-art book cover painting, renaissance chiaroscuro, layers of sheer translucent veils and folds of luminous cloth catching soft light, painterly oil texture, sfumato, contemplative and timeless, museum-quality, NO figures, NO faces, generous calm space at the top for a title',
  },
  etereo: {
    nome: 'Etéreo / luz',
    prompt: 'ethereal book cover art, sheer flowing veils and gauze catching warm golden light against deep dusk, soft volumetric glow, dreamlike and quiet, abstract and purely symbolic, NO figures, NO faces, generous negative space',
  },
  simbolico: {
    nome: 'Simbólico minimal',
    prompt: 'minimal symbolic book cover, a single translucent veil lifting against a deep contemplative background, elegant restraint, fine grain, lots of negative space, NO figures, NO faces, sophisticated literary non-fiction feel',
  },
  dourado: {
    nome: 'Dourado contemplativo',
    prompt: 'luminous book cover painting, gold-leaf and deep indigo, sheer veils dissolving into warm light, sacred and serene, painterly texture with subtle gilt highlights, NO figures, NO faces, contemplative spiritual non-fiction',
  },
};
export const PILAR_CAPA_ESTILO_DEFAULT = 'renascentista';
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
