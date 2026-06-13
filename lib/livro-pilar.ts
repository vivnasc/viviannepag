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
export const PILAR_CAPA_ESTILOS: Record<string, { nome: string; prompt: string }> = {
  renascentista: {
    nome: 'Renascentista do véu',
    prompt: 'fine-art book cover painting, renaissance chiaroscuro, a serene woman seen through layers of sheer translucent veils, soft sfumato, painterly oil texture, contemplative and timeless, museum-quality, generous calm space at the top for a title',
  },
  etereo: {
    nome: 'Etéreo / luz',
    prompt: 'ethereal book cover art, sheer flowing veils catching warm golden light against deep dusk, soft volumetric glow, dreamlike and quiet, fine-art atmosphere, abstract enough to feel symbolic, generous negative space',
  },
  simbolico: {
    nome: 'Simbólico minimal',
    prompt: 'minimal symbolic book cover, a single translucent veil lifting against a deep contemplative background, elegant restraint, fine grain, lots of negative space, sophisticated literary non-fiction feel',
  },
  dourado: {
    nome: 'Dourado contemplativo',
    prompt: 'luminous book cover painting, gold-leaf and deep indigo, a veiled silhouette dissolving into light, sacred and serene, painterly texture with subtle gilt highlights, contemplative spiritual non-fiction',
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
  cena: `book cover painting, vertical composition: a serene woman's face and shoulders seen through several layers of sheer, translucent veils that soften and dissolve toward the edges; warm golden light glowing from within against a deep indigo and aubergine background; the topmost veil lifting just slightly, as if about to be removed; painterly renaissance texture, sfumato, quiet and timeless; generous calm space in the upper third for a title; no harsh detail, intimate and contemplative`,
};

export function getLivroPilar(slug: string): LivroPilar | undefined {
  return slug === LIVRO_PILAR.slug ? LIVRO_PILAR : undefined;
}
