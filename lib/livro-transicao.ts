// A Grande Transição · Ciências da Consciência Emergente.
// Metadados e PROMPTS das imagens do livro (capa + vinhetas das 4 Partes),
// ancorados no manifesto visual Pós-Sobrevivência. Servem a página de admin
// /admin/livro-transicao para gerar no Replicate (Flux 1.1 pro) e o render
// scripts/livro-transicao/render.js, que as vai buscar ao bucket por chave.

export const LIVRO_TRANSICAO = {
  slug: 'a-grande-transicao',
  titulo: 'A Grande Transição',
  sub: 'Introdução às Ciências da Consciência Emergente',
  selo: 'Ciências da Consciência Emergente',
  autora: 'Vivianne dos Santos',
};

// Estética comum (do manifesto: Dune, Arrival, Interstellar, Avatar, Moebius).
// Não é ilustração nem néon: é pintura matte cinematográfica, luz volumétrica,
// matéria que parece luz. "Evoluído, não avançado."
const ESTILO =
  'cinematic fine-art matte painting, painterly renaissance light, sfumato, ' +
  'volumetric god rays, epic monumental scale, deep atmospheric perspective, ' +
  'photorealistic yet painterly, awe-inspiring and serene';

const PALETA =
  'warm palette of warm whites, soft gold, pearl, champagne, pale sand, ' +
  'sage green, mist rose, matte silver; nothing oversaturated; light emitted ' +
  'by the matter itself, no visible artificial lighting';

// Lista do "nunca" do manifesto + sem texto.
const NUNCA =
  'NO text, NO words, NO letters, NO logos, NO watermarks, NO captions, ' +
  'NO neon, NO cyberpunk, NO robots, NO spaceships, NO screens, NO holograms, ' +
  'NO post-apocalyptic decay, NO crystals, NO chakras, NO esoteric symbols';

// A capa e as vinhetas PODEM ter uma figura humana minúscula, de costas, ao
// longe, sem rosto (a pessoa diante do colossal). Nunca rosto, nunca primeiro plano.
const FIGURA =
  'if any human figure appears it is a single tiny distant figure seen from ' +
  'behind, no visible face, dwarfed by the scale, contemplative';
const SEM_FIGURA = 'no people, no figures, no faces';

function full(cena: string, opts?: { figura?: boolean; aspect?: string }): string {
  return [cena, ESTILO, PALETA, opts?.figura ? FIGURA : SEM_FIGURA, NUNCA].join('\n\n');
}

export type ImagemLivro = {
  nome: string; // rótulo na UI
  chave: string; // path no bucket: livro-transicao/<chave>.jpg
  aspect: string; // aspect_ratio do Flux
  legenda: string; // o que é, para a UI
  prompt: string;
};

export const IMAGENS_LIVRO: ImagemLivro[] = [
  {
    nome: 'Capa · os dois mundos',
    chave: 'capa',
    aspect: '2:3',
    legenda: 'A figura no limiar entre o mundo antigo e o mundo que emerge.',
    prompt: full(
      'A vast threshold between two worlds: on the left a colossal heavy ' +
        'industrial city of dark stone and steel in warm gloom; on the right a ' +
        'luminous organic city of suspended gardens, waterfalls and a river ' +
        'flowing in the sky, bathed in radiant golden light; a single tiny ' +
        'figure seen from behind walks a path of light across the centre toward ' +
        'the luminous side. Generous calm sky in the upper third for a title.',
      { figura: true, aspect: '2:3' },
    ),
  },
  {
    nome: 'Parte I · A humanidade da sobrevivência',
    chave: 'parte-1',
    aspect: '3:2',
    legenda: 'O mundo antigo, industrial e colossal, construído para sobreviver.',
    prompt: full(
      'A colossal heavy industrial city built for survival: endless layers of ' +
        'old stone-and-steel structures stacked into the distance, slow smoke, ' +
        'monumental machinery, warm gloom; the weight of an old world. Beautiful ' +
        'and exhausted at once.',
      { figura: true, aspect: '3:2' },
    ),
  },
  {
    nome: 'Parte II · A fissura',
    chave: 'parte-2',
    aspect: '3:2',
    legenda: 'O entre-mundos: o limiar, a fenda, a ponte que nasce ao avançar.',
    prompt: full(
      'A threshold between two worlds: a great fissure opening in a colossal ' +
        'wall, warm light pouring through from an indistinct landscape beyond; ' +
        'a canyon of waterfalls and mist; a bridge of light that seems to be ' +
        'born only a few steps ahead; the void between the old and the new.',
      { figura: true, aspect: '3:2' },
    ),
  },
  {
    nome: 'Parte III · A humanidade da emergência',
    chave: 'parte-3',
    aspect: '3:2',
    legenda: 'O mundo que emerge: orgânico, luminoso, jardins suspensos, rio no céu.',
    prompt: full(
      'An organic luminous emergent city glimpsed afar through an opening: ' +
        'suspended gardens, a river flowing in the sky, living cultivated ' +
        'structures emitting their own soft light, invisible technology, ' +
        'impossible serene scale; expansion, safety, mystery.',
      { figura: true, aspect: '3:2' },
    ),
  },
  {
    nome: 'Parte IV · As Ciências da Consciência Emergente',
    chave: 'parte-4',
    aspect: '3:2',
    legenda: 'Um saber por nascer: um anel colossal de luz, a faculdade que não existe.',
    prompt: full(
      'A colossal circular structure of light suspended in the sky, like a ' +
        'living library or observatory made of many breathing rings; at its ' +
        'centre not a throne but a common gathering place, a hearth of light, ' +
        'evoking an ancestral circle and a great communal tree; tiny distant ' +
        'figures gather along the rings; a knowledge yet to be born.',
      { figura: true, aspect: '3:2' },
    ),
  },
];

export const IMAGENS_POR_CHAVE: Record<string, ImagemLivro> = Object.fromEntries(
  IMAGENS_LIVRO.map((i) => [i.chave, i]),
);
