const BASE =
  'oil painting in the style of 17th century baroque masters, deep warm palette of terra, ochre and amber, dramatic chiaroscuro lighting, fine canvas grain, museum archival quality, no human faces. Composition: ';

export const PROMPTS_CAPA: Record<string, string> = {
  'o-no-que-ninguem-te-ensinou-a-ver':
    BASE +
    'two hands pulling a thick golden silk rope, a single hidden tight knot in the middle of the rope, dark linen background, intimate still life, soft side light revealing the knot',

  'porque-repetes-o-mesmo-padrao':
    BASE +
    'single golden silk thread tangled into a small tight knot resting on dark linen, extreme close-up macro detail, soft warm side lighting, contemplative atmosphere',

  'o-silencio-que-tu-evitas':
    BASE +
    'single weathered wooden chair facing an open window, soft golden morning light falling on a wood floor, dust particles in the air, sense of melancholy and silence, vermeer-style interior',

  'voltar-a-casa-sem-sair-do-sitio':
    BASE +
    'open wooden doorway with warm amber interior light spilling out into a dark exterior, weathered door frame, sense of quiet return home, hammershoi-style restraint',

  'cada-veu-e-uma-forma-de-te-protegeres':
    BASE +
    'soft folded silk veil in ochre and cream tones draped on a dark wooden table beside a single burning candle, dim warm candlelight, deep amber shadows, intimate atmosphere',

  'atravessar-nao-e-destruir':
    BASE +
    'single hand gently parting a thin translucent curtain of golden light, fingertips soft and visible, intimate and tender gesture, sense of revelation',

  'a-lealdade-invisivel-que-te-tira-o-que-queres':
    BASE +
    'single figure from behind walking forward with a thin golden thread trailing back into deep shadow toward indistinct ancestral silhouettes, subtle invisible pull, intimate scale',

  'o-corpo-sabe-primeiro':
    BASE +
    'close-up of two hands resting gently on a clothed abdomen, warm ochre fabric draped, soft amber side lighting, sense of inward listening and embodied presence',

  'a-mulher-que-tu-tens-medo-de-ser':
    BASE +
    'woman from behind in deep shadow standing before a tall antique mirror, the mirrored reflection illuminated by warm amber light, sense of confrontation and recognition',

  'o-que-tu-herdaste-sem-dizer-sim':
    BASE +
    'several thin golden threads descending from above and gathering into a single open palm, dark warm background, sense of inheritance and quiet weight, baroque still life',

  'a-respiracao-que-tu-deixas-a-meio':
    BASE +
    'soft warm breath visible as faint golden vapor in the air, dark warm background, intimate macro detail of just the breath itself, sense of return to body',

  'o-que-tu-nao-te-deixas-querer':
    BASE +
    'closed weathered wooden door with warm golden light spilling through the gap at the floor and through the keyhole, dark surroundings, sense of suppressed desire and the room beyond',
};

export function promptParaSlug(slug: string, override?: string): string | null {
  if (override && override.trim().length > 0) return override.trim();
  return PROMPTS_CAPA[slug] ?? null;
}
