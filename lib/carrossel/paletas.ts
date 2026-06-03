// Identidade visual por universo (7), para receitas de imagem coesas e
// ALINHADAS. Os 7 universos da loja mapeiam para 5 paletas-base do Estudio
// (mundo), mas cada um ganha aqui texturas/botanicos/motivos/luz proprios —
// assim dois universos que partilham paleta (ex.: forca e pertenca = navy)
// continuam visualmente distintos. A coesao flui pela notaVisual de cada slide,
// que o gerar-imagem (Flux) ja consome como "Author's note" — sem tocar nele.

import type { ColecaoId } from '@/lib/colecoes';

export type PaletaUniverso = {
  mundo: 'freeme' | 'infonte' | 'synchim' | 'escola' | 'autora';
  cores: string;        // ancoras hex, alinhadas ao STYLE_BASE existente
  luz: string;          // qualidade de luz
  texturas: string;     // materiais
  botanicos: string;    // natureza
  motivos: string;      // objectos/cenas recorrentes (sem pessoas/rostos)
  mood: string;
};

export const PALETAS_UNIVERSO: Record<ColecaoId, PaletaUniverso> = {
  'freeme-mae': {
    mundo: 'freeme',
    cores: 'terracotta #8C4A36, cream #F2E8DC, warm gold #EBAE4A',
    luz: 'soft morning light through linen curtains',
    texturas: 'raw linen, worn cotton, warm ceramic, aged wood',
    botanicos: 'dried wildflowers, olive branch, cotton stems',
    motivos: 'an unmade bed at dawn, two coffee cups, an open family photo album, a child shoe by the door',
    mood: 'tender, intimate, the weight that is set down',
  },
  infonte: {
    mundo: 'infonte',
    cores: 'amber #B8843D, cream #F2E8DC, honey gold #EBAE4A',
    luz: 'warm honey light, late afternoon clarity',
    texturas: 'handmade paper, ink, brass, smooth stone',
    botanicos: 'single eucalyptus sprig, wheat stalk',
    motivos: 'an open window to a horizon, a compass on paper, a quiet desk, a mirror catching light',
    mood: 'searching, clearing, the voice that finds its own direction',
  },
  amor: {
    mundo: 'synchim',
    cores: 'bordeaux #5A1A2A, cream #F2E8DC, soft rose #E08496',
    luz: 'low candlelight, warm dusk',
    texturas: 'silk, velvet, wine-stained linen, soft wool',
    botanicos: 'single rose, dried peony, intertwined stems',
    motivos: 'two glasses almost touching, a shared blanket, two pillows, hands apart on a table (no faces)',
    mood: 'longing, closeness, the distance that wants to be crossed',
  },
  forca: {
    mundo: 'escola',
    cores: 'deep navy #1A1A2E, cream #F2E8DC, lavender #C9B6FA',
    luz: 'single candle in darkness, then first light of dawn',
    texturas: 'cold stone, still water, heavy wool, rough rock',
    botanicos: 'bare branch, lone seedling pushing through',
    motivos: 'a candle against the dark, dawn breaking over water, a path through fog, a stone held',
    mood: 'crossing the dark, grief that nobody saw, quiet endurance',
  },
  prosperidade: {
    mundo: 'autora',
    cores: 'earthy brown #3A2818, cream #F2E8DC, abundant gold #EBAE4A',
    luz: 'golden sunlight, harvest warmth',
    texturas: 'golden wheat, brass, honey, warm grain wood',
    botanicos: 'wheat sheaf, ripe figs, honeycomb, sunflower',
    motivos: 'open hands in sunlight, a full harvest table, honey dripping, a brass scale in balance',
    mood: 'worth, receiving, abundance that is allowed in (never corporate)',
  },
  pertenca: {
    mundo: 'escola',
    cores: 'deep navy #1A1A2E, warm cream #F2E8DC, lavender #C9B6FA',
    luz: 'warm hearth glow in a navy evening',
    texturas: 'woven wool, knotted thread, communal wood table, clay',
    botanicos: 'roots, ivy, a circle of dried flowers',
    motivos: 'a long set table with empty chairs, woven threads joining, roots underground, a circle of stones',
    mood: 'belonging, the place that is also inside, being chosen',
  },
  trabalho: {
    mundo: 'infonte',
    cores: 'amber #B8843D, cream #F2E8DC, gold #EBAE4A',
    luz: 'warm workshop light, sunlit workbench',
    texturas: 'warm wood, craftsman tools, sawdust, worn leather apron',
    botanicos: 'a small potted plant on a desk, laurel',
    motivos: 'hands building (no faces), a desk by a window, a blueprint, tools laid in order',
    mood: 'vocation under the career, occupying your full size',
  },
};

export function paletaUniverso(u: ColecaoId): PaletaUniverso {
  return PALETAS_UNIVERSO[u];
}

// Bloco directivo de imagem para injectar no prompt do gerador: garante que
// as notaVisual de uma semana sao coesas e proprias do universo.
export function directivaImagem(u: ColecaoId): string {
  const p = PALETAS_UNIVERSO[u];
  return `DIRECCAO VISUAL (universo, para o campo notaVisual de cada slide — EN, editorial, SEM pessoas/rostos/maos-em-grande-plano/texto/logos):
- Palette: ${p.cores}
- Light: ${p.luz}
- Textures: ${p.texturas}
- Botanicals: ${p.botanicos}
- Recurring motifs: ${p.motivos}
- Mood: ${p.mood}
Varia entre macro-textura, natureza-morta, cena e estudo de luz. Cada slide visualmente DISTINTO mas coeso com este universo.`;
}
