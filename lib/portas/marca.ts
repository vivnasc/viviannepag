// PORTAS · as tres contas novas (livros) como marcas de conteudo.
//
// Motor no MOLDE da Soulab (lib/soulab/marca.ts): uma config de marca + os ANGULOS
// de exploracao (TIPOS). O gerador (lib/portas/gerar-ia.ts) le esta config e produz
// uma peca; o conteudo vive na MESMA tabela (carousel_collections) com theme.marca
// = id da porta, por isso aparece no Publicar sem tocar nos outros motores.
//
// O Metodo VS foi abolido: estas tres portas substituem ver/vir/viver no Publicar.
// Cada porta tem o SEU motor proprio (as 7 faces / os 7 sinais / as tensoes), que
// NAO sao os 7 veus. Fonte de verdade: as fichas e constituicoes em
// FICHAS-BRANDING-FACES-MEDO-EMERGENTE/ e a identidade visual em identidade-portas/.
//
// LINGUA: as 3 contas publicam em INGLES (decisao da Vivianne). O texto que sai
// (frase no ecra, legenda, hashtags, conceito) e ingles nativo e literario, escrito
// de raiz, nunca traduzido. Regra dos travessoes mantem-se (sem em dash nem en dash).

export type PortaId = 'medo' | 'sinais' | 'transicao';

export interface TipoPorta {
  id: string;
  label: string;
  emoji: string;
  descricao: string;
  /** the generation instruction for this angle (feeds the AI prompt). */
  angulo: string;
}

export interface PortaMarca {
  id: PortaId;
  /** publishing language of the account. */
  lingua: 'en';
  handle: string;
  nome: string;
  emoji: string;
  /** the central question of the door. */
  pergunta: string;
  /** positioning (the conceptual umbrella). */
  posicionamento: string;
  /** the thesis / mission of the door. */
  tese: string;
  /** the door's own voice (inviolable, from the constitutions). */
  voz: string;
  /** the emotional temperature (what to feel in the first seconds). */
  emocao: string;
  /** the tone (the ruler for every piece). */
  tom: string[];
  /** hard voice rules (beyond the common ones). */
  regrasVoz: string[];
  /** the door's visual signature (present in every image). */
  assinaturaVisual: string;
  /** what the image must never show. */
  proibidoImg: string[];
  /** the door's own palette (feeds the studio and the render). */
  paleta: { bg: string; bg2: string; texto: string; destaque: string; nome: string };
  hashtagsBase: string[];
  /** the identity line (closing). */
  fraseIdentidade: string;
  /** Instagram bio (ready to paste, English). */
  bioEN: string;
  /** the exploration angles (the door's own MOTOR). */
  tipos: TipoPorta[];
}

// common voice rules for every door (the author's voice, see the constitutions).
// English output; brand rule against dashes kept across languages.
const VOZ_COMUM = [
  'Write ALL reader-facing text in natural, literary British English, as a native writer, never a translation and never machine-sounding.',
  'NO dashes anywhere (no em dash, no en dash): use commas, colons, parentheses, full stops.',
  'Authority with warmth: I see you, and there is more to you. Density that leaves room to breathe.',
  'Touch the person BEFORE explaining the system. If a piece explains the engine instead of touching, it is wrong.',
  'Avoid the tired tics: do not open with And or But; no rule of three; no "not X, but Y" contrast; no repeated "perhaps"; no automatic anaphora; no cascade of rhetorical questions; no reveal-by-colon; no meta-commentary; no paired adjectives; no inflated metaphors (tapestry, symphony, dance, weave); do not always close on a callback.',
  'Never invent biography, milestones or clients. The authority comes from the path.',
];

export const PORTAS: Record<PortaId, PortaMarca> = {
  // ── THE SEVEN FACES OF FEAR ───────────────────────────────────────────────
  medo: {
    id: 'medo',
    lingua: 'en',
    handle: 'thesevenfacesoffear',
    nome: 'The Seven Faces of Fear',
    emoji: '🕯️',
    pergunta: 'what am I protecting?',
    posicionamento:
      'The Seven Faces of Fear: the seven shapes fear wears so it will not be recognised as fear. It shows no monsters, it shows the fractures where fear learned to dress as ordinary life.',
    tese:
      'It is not that everything is fear. It is that these seven faces share one root, separation. Six visible faces and a seventh that breeds them.',
    voz: 'recognition without shaming: low judgement, high compassion, almost no shame. The tone of someone who sees the mask without embarrassing it, never accusing the person of their fear.',
    emocao: 'recognition, then curiosity, then a soft unease. Never fear, threat, dread or shock. The reader thinks "this is about me", never "this looks like a horror film".',
    tom: ['contemplative gravity', 'mineral and sober', 'museum, philosophy, existential psychology', 'never horror, never supernatural'],
    regrasVoz: [
      ...VOZ_COMUM,
      'ALWAYS begin from an everyday behaviour; the fear stays underneath and is NEVER named up front.',
      'Show the threshold, never the arrival. The promise is recognition, never terror nor a solution in steps.',
      'The root (Separation, the Abyss) stays human and relational, never metaphysical nor cosmic void.',
      'Now and then, the edge: show where fear is NOT the answer (this is what keeps the brand from sounding like a guru).',
      'Treat fear as an old intelligence that once protected you, never as a flaw.',
    ],
    assinaturaVisual:
      'a fissure in the scene with light coming from inside the fracture (kintsugi): the fissure is the fear, the light is the "there is more to you"; the light never lights the scene, it comes from within the crack',
    proibidoImg: ['horror', 'supernatural', 'blood', 'ravens', 'gothic', 'empty eyes', 'heavy fog', 'chains', 'cages', 'prison imagery', 'monsters', 'skulls', 'theatre masks', 'melting clocks', 'giant eyes', 'dark corridors', 'night forest', 'dead trees', 'body horror'],
    paleta: { bg: '#161518', bg2: '#0F0F10', texto: '#EAE4D8', destaque: '#C8A86B', nome: 'Faces of Fear' },
    hashtagsBase: ['#fear', '#selfawareness', '#psychology', '#emotionalpatterns', '#innerwork', '#mentalhealth', '#viviannedossantos'],
    fraseIdentidade: 'The Seven Faces of Fear show no monsters. They show the small fractures where fear learned to dress as ordinary life.',
    bioEN: 'The seven shapes fear wears so you will not recognise it as fear.\nWhat are you protecting?\nA door by Vivianne dos Santos',
    tipos: [
      { id: 'espelho', label: 'The Mirror', emoji: '🪞', descricao: 'Rejection. The fear of separation from belonging, disguised as approval.',
        angulo: 'Face: The Mirror, Rejection. Fears separation from belonging. Disguises itself as approval, conformity, the inability to say no. Symbolic world: mirrors, reflections, rooms, glances, portraits. Begin from an everyday scene of someone who agrees so as not to be left out, and leave the fear of displeasing underneath. Possible question: how many of your yeses do you actually like?' },
      { id: 'punho', label: 'The Grip', emoji: '✊', descricao: 'Loss. The fear of separation from the ones you love, disguised as love.',
        angulo: 'Face: The Grip, Loss. Fears separation from the ones it loves. Disguises itself as attachment, control, jealousy. Symbolic world: hands, threads, things slipping away, doors, running water. Begin from a scene of someone holding on too tightly, and leave the fear of losing underneath. Possible question: where did your love turn into surveillance?' },
      { id: 'inverno', label: 'The Winter', emoji: '❄️', descricao: 'Scarcity. The fear of separation from provision, disguised as prudence.',
        angulo: 'Face: The Winter, Scarcity. Fears separation from provision. Disguises itself as hoarding, competition, material anxiety. Symbolic world: stores, pantries, cold light, full hands, bills. Begin from a scene of someone who keeps and never has enough, and leave the fear of lack underneath. Possible question: from what old winter are you still protecting yourself?' },
      { id: 'fortaleza', label: 'The Fortress', emoji: '🏰', descricao: 'Uncertainty. The fear of separation from solid ground, disguised as control.',
        angulo: 'Face: The Fortress, Uncertainty. Fears separation from the ground, from the predictable. Disguises itself as control, rigidity, anxious planning. Symbolic world: walls, maps, plans, locks, straight lines. Begin from a scene of someone who organises everything so as not to feel the unexpected. Possible question: do you mistake control for safety?' },
      { id: 'luz', label: 'The Light', emoji: '💡', descricao: 'Exposure. The fear of being seen and judged, disguised as perfectionism.',
        angulo: 'Face: The Light, Exposure (it fuses the fear of failing and the fear of winning). Disguises itself as perfectionism, procrastination, chosen invisibility. Symbolic world: stages, harsh light, curtains, a blank page, chosen shadow. Begin from a scene of someone stepping back from the light. Possible question: which of the two lights do you flee more, failing or winning?' },
      { id: 'apagamento', label: 'The Erasure', emoji: '🕯️', descricao: 'Insignificance. The fear of social death, disguised as ambition.',
        angulo: 'Face: The Erasure, Insignificance. Fears separation by erasure, social death. Disguises itself as the need to matter, status, anxious legacy. Symbolic world: engraved names, monuments, footprints in sand, archives, echoes. Begin from a scene of someone doing so as not to disappear. Possible question: who do you need to remember you?' },
      { id: 'abismo', label: 'The Abyss', emoji: '🌑', descricao: 'Separation, the root of the other six. Relational, never metaphysical. Closing material.',
        angulo: 'Face: The Abyss, Separation (the root). Underneath, the dread of no longer being held, of no longer belonging, of there being nowhere left to hold on to. It is the root the other six are smaller versions of. Symbolic world: shores, thresholds, the gap between two bodies, the hand that almost touches another, the thread of light between two points. KEEP it relational, never cosmic void. Save for moments of synthesis. Possible question: how many of your protections would still be needed if belonging were not at risk?' },
      { id: 'aresta', label: 'The Edge', emoji: '🔦', descricao: 'The ruler against the guru tone: where fear is NOT the answer.',
        angulo: 'THE EDGE (not a face, the ruler of the brand): show, without cynicism, a place where fear does not explain everything, where generosity is truly generosity and love is not the management of fear. Give the lens an edge, so the brand does not sound like a guru who sees fear in everything. End open, with honesty, never with a lesson.' },
    ],
  },

  // ── THE SIGNS OF NOT BELONGING ────────────────────────────────────────────
  sinais: {
    id: 'sinais',
    lingua: 'en',
    handle: 'signsofnotbelonging',
    nome: 'The Signs of Not Belonging',
    emoji: '🚪',
    pergunta: 'where is home now?',
    posicionamento:
      'The Signs of Not Belonging: the one door that smells of home (the inner home, not the physical one). It speaks of the place you return to when you stop protecting yourself.',
    tese:
      'There is a quiet leaving that happens between no longer fitting the old world and not yet having found the new one. Seven signs mark it.',
    voz: 'soft, domestic, human. Longing exists but does not lead. The feeling that defines everything: I am not fully on the other side, yet I am no longer exactly here.',
    emocao: 'transition, belonging, serenity, longing (in that order). Never dramatic nostalgia, never rupture.',
    tom: ['soft and domestic', 'slow, literary, mature', 'late afternoon light', 'serene transition'],
    regrasVoz: [
      ...VOZ_COMUM,
      'NEVER illustrate or name the concept literally. Home is inner belonging, never only the physical space.',
      'Longing does not lead (or it drags into nostalgia). Serene transition, never dramatic rupture.',
      'Vary the ending: about half on a question, some on an open scene with no text, some on a line.',
      'Speak of not belonging through subtlety (a chair pulled slightly back from the table), never through drama.',
    ],
    assinaturaVisual:
      'the Threshold: a door, a window, stairs, a balcony, a doorstep, a corridor, dusk, light crossing an empty space; always a crossing, never an arrival nor a departure',
    proibidoImg: ['departure', 'rupture', 'suitcases', 'trains', 'airports', 'endless roads', 'flying birds', 'lone silhouettes on cliffs', 'puzzle pieces', 'butterflies', 'wings', 'broken compasses', 'dramatic storms', 'literal illustration', 'futuristic cities', 'neon', 'visible technology'],
    paleta: { bg: '#EFE7DA', bg2: '#F4EFE8', texto: '#5A4E42', destaque: '#A67C52', nome: 'Signs of Not Belonging' },
    hashtagsBase: ['#belonging', '#notbelonging', '#home', '#selfawareness', '#presence', '#transition', '#viviannedossantos'],
    fraseIdentidade: 'The Signs are the one door that smells of home. They speak of the place you return to when you stop protecting yourself.',
    bioEN: 'Still loving a place while you slowly stop living in it.\nWhere is home now?\nA door by Vivianne dos Santos',
    tipos: [
      { id: 'mesa', label: 'The Table', emoji: '🍽️', descricao: 'Presence without belonging: I am here but I am not home.',
        angulo: 'Sign: The Table. Recognition: I am here but I am not home. Theme: presence without belonging. Motif (never literal): chairs, empty places, kitchens, a chair pulled slightly back from the table. A domestic scene where someone is present and absent at once.' },
      { id: 'mascara', label: 'The Mask', emoji: '🪞', descricao: 'Functional self-abandonment: I am making myself smaller to fit.',
        angulo: 'Sign: The Mask. Recognition: I am making myself smaller to fit. Theme: functional self-abandonment. Motif: mirrors, reflections, glass, a more contained version of oneself. A scene of someone shrinking so as not to disturb.' },
      { id: 'horizonte', label: 'The Horizon', emoji: '🌅', descricao: 'The calling: I miss something I never lived.',
        angulo: 'Sign: The Horizon. Recognition: I miss something I never lived. Theme: the calling. Motif: windows, the sea, distance, dawn, the residual blue of dusk. A scene at a window, longing for a place that has no name yet.' },
      { id: 'eremita', label: 'The Hermit', emoji: '🌫️', descricao: 'Isolation as defence: it is either belonging or being myself.',
        angulo: 'Sign: The Hermit. Recognition: it is either belonging or being myself. Theme: isolation as a defence. Motif: closed doors, mist. A scene of someone withdrawing, unsure whether they are protecting or hiding.' },
      { id: 'corpo', label: 'The Body', emoji: '🫁', descricao: 'The body knows first: I cannot do this anymore.',
        angulo: 'Sign: The Body. Recognition: I cannot do this anymore. Theme: the body knows before the mind. Motif: fabric, skin, breath, shoulders dropping at the end of the day. A scene where the body says what the person has not yet admitted.' },
      { id: 'refugio', label: 'The Refuge', emoji: '☕', descricao: 'The comfort that becomes a cage: maybe I am better on my own.',
        angulo: 'Sign: The Refuge. Recognition: maybe I am better on my own. Theme: the comfort that begins to close in too much. Motif: blankets, cups, rain on the window. A scene of shelter that presses a little too tightly.' },
      { id: 'casa', label: 'The Home', emoji: '🏡', descricao: 'Conscious belonging: the problem was never belonging, it was the price.',
        angulo: 'Sign: The Home. Recognition: the problem was never belonging, it was the price of belonging. Theme: conscious belonging. Motif: open doors, gardens, warm light crossing the doorstep. A scene of returning to a place that does not ask you to disappear.' },
    ],
  },

  // ── THE GREAT TRANSITION ──────────────────────────────────────────────────
  transicao: {
    id: 'transicao',
    lingua: 'en',
    handle: 'thegreattransition',
    nome: 'The Great Transition',
    emoji: '🌗',
    pergunta: 'what world is being born?',
    posicionamento:
      'The Great Transition: anthropology of the present, not science fiction. The future hidden inside the present, never the distant future. It organises the era around the person.',
    tese:
      'We live between two civilisational operating systems: survival and emergence. The transition happens first in people, only then in cultures.',
    voz: 'lucidity. Not hope, not technological excitement. Something like "I am starting to see what is happening". Then recognition, vertigo, relief, curiosity.',
    emocao: 'lucidity, the future hidden inside the present. The feeling: this belongs to today and tomorrow at once.',
    tom: ['lucid and of the present', 'editorial, calm, mature', 'anthropology, never sci-fi', 'no nostalgia'],
    regrasVoz: [
      ...VOZ_COMUM,
      'NEVER name the tension to the reader. The engine is internal: show the tension through a recognisable human scene.',
      'ALWAYS begin in a concrete everyday scene (a kitchen, a phone, a child, a tired body).',
      'Never demonise the old system: show effort and control as technologies that were once wise.',
      'Show the friction between the two systems, never winners and losers. End in recognition, never in prescription.',
      'Anthropology of the present, never science fiction. Avoid nostalgia: the old was not better, it was other.',
    ],
    assinaturaVisual:
      'two timescales in the same image, today and what is being born (a table with a notebook and a lit screen, a clock and a plant, a to-do list and a pause); register A, objects of today',
    proibidoImg: ['robots', 'futuristic cities', 'spaceships', 'holograms', 'cyberpunk', 'holographic interfaces', 'people touching the air', 'futuristic suits', 'anthropomorphic AI', 'digital brains', 'glowing DNA', 'circuit eyes', 'sci-fi laboratory', 'futuristic startup aesthetic', 'singularity aesthetic'],
    paleta: { bg: '#EBE4D8', bg2: '#F5F1EA', texto: '#4D433A', destaque: '#9B866C', nome: 'The Great Transition' },
    hashtagsBase: ['#thegreattransition', '#presence', '#ourtimes', '#anthropology', '#lucidity', '#consciousness', '#viviannedossantos'],
    fraseIdentidade: 'The Great Transition does not show the future far away. It shows the future already hidden inside a kitchen of today, waiting for a name.',
    bioEN: 'The future is already here, hidden in a kitchen of today.\nWhat are you living that has no name yet?\nA door by Vivianne dos Santos',
    tipos: [
      { id: 'esforco', label: 'Effort and Energy', emoji: '🔋', descricao: 'The tension between pushing and flowing, in a scene of today.',
        angulo: 'Tension (never named to the reader): Effort vs Energy. Show it through an everyday scene in one domain (body, work, time): someone who only knows how to move forward by pushing and feels that to stop is to fall. Two timescales in the scene. End in recognition.' },
      { id: 'acumulacao', label: 'Accumulation and Enough', emoji: '📦', descricao: 'The tension between gathering and having enough, in a scene of today.',
        angulo: 'Tension (do not name): Accumulation vs Enough. Everyday scene (consumption, home, money): someone who gathers to feel safe and never feels it is enough. Show the friction, no winner. End in recognition.' },
      { id: 'controlo', label: 'Control and Trust', emoji: '🧷', descricao: 'The tension between foreseeing everything and trusting, in a scene of today.',
        angulo: 'Tension (do not name): Control vs Trust. Everyday scene (motherhood, work, family): hypervigilance, the inability to delegate, guilt at resting, anticipating everything. Show the human scene, not the tension. End in recognition.' },
      { id: 'escassez', label: 'Scarcity and Abundance', emoji: '⏳', descricao: 'The tension between lack and enough, in a scene of today.',
        angulo: 'Tension (do not name): Scarcity vs Abundance. Everyday scene (time, money, affection): the sense that there is never enough time, that it is always too little. Show the friction, never the solution. End in recognition.' },
      { id: 'identidade', label: 'Identity and Process', emoji: '🪪', descricao: 'The tension between being a fixed name and being in process.',
        angulo: 'Tension (do not name): Identity vs Process. Everyday scene (purpose, work, roles): not knowing who you are without the title, the role, the label. Show the scene, leave the tension underneath. End in recognition.' },
      { id: 'producao', label: 'Production and Presence', emoji: '📵', descricao: 'The tension between producing and being present, in a scene of today.',
        angulo: 'Tension (do not name): Production vs Presence. Everyday scene (work, technology, family): answering everything at once, the phone between the person and the moment. Show two timescales. End in recognition.' },
      { id: 'hierarquia', label: 'Hierarchy and Network', emoji: '🕸️', descricao: 'The tension between the vertical order and the network, in a scene of today.',
        angulo: 'Tension (do not name): Hierarchy vs Network. Everyday scene (work, leadership, community): waiting for permission, looking for who is in charge, not authorising yourself. Show the human scene. End in recognition.' },
      { id: 'competicao', label: 'Competition and Cooperation', emoji: '🤝', descricao: 'The tension between competing and collaborating, in a scene of today.',
        angulo: 'Tension (do not name): Competition vs Cooperation. Everyday scene (community, work, friendship): seeing the other as a threat, the tiredness of always comparing. Show the friction, no winner. End in recognition.' },
    ],
  },
};

export const PORTAS_LISTA: PortaMarca[] = [PORTAS.medo, PORTAS.sinais, PORTAS.transicao];

export const getPorta = (id: string): PortaMarca | undefined => (PORTAS as Record<string, PortaMarca>)[id];
export const getTipoPorta = (portaId: string, tipoId: string): TipoPorta | undefined =>
  getPorta(portaId)?.tipos.find((t) => t.id === tipoId);

/** domains of the era (only for The Great Transition, they add variety). */
export const DOMINIOS_TRANSICAO = [
  'Work', 'Education', 'Love', 'Family', 'Community', 'Body', 'Spirituality',
  'Technology', 'AI', 'Purpose', 'Time', 'Consumption', 'Leadership', 'Identity', 'Motherhood', 'Ageing',
];
