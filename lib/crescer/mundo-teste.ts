// GERADOR DE TESTE (sandbox) — CLEAN-ROOM TOTAL: NÃO importa nada do motor a sério
// (mundo-visual.ts), porque é precisamente o ADN dele que desvia tudo. Encarna a
// auditoria da Vivianne:
//   • o mundo NÃO é "pós-sobrevivência serena/calma/refinada" (o FLUX traduz isso em
//     ecovila / retiro espiritual / penumbra / pessoa sozinha contemplativa);
//   • é uma BIOSFERA PARALELA exuberante, VIVA, povoada, curiosa, tecnologicamente
//     madura e culturalmente rica — onde a evolução escolheu beleza, abundância,
//     complexidade, cooperação e sofisticação biológica;
//   • gera-se a partir do LUGAR, nunca do significado (o mundo é o sujeito da foto);
//   • objetivo: ESPANTO, vida em MOVIMENTO, densidade de informação — não calma.
// O conteúdo do lugar vem dos bancos JSON (que a auditoria considerou bons); o ADN
// (vida, luz, mundo) vive aqui. NADA disto toca no gerador a sério nem nos posts.
import mundo from '@/worldbuilding/banco_worldbuilding.json';

const idx = (n: number, len: number) => (len ? (((Math.floor(n) % len) + len) % len) : 0);
const pick = <T,>(arr: T[], n: number): T | null => (arr.length ? arr[idx(n, arr.length)] : null);

interface ItemMundo { nome: string; funcao?: string; descricao?: string; equivalente_terrestre?: string; estado?: string }
interface CenaQ { nome?: string; descricao?: string; participantes?: string[]; acao?: string; instituicao?: string; equivalente_terrestre?: string }

const CENAS = [...((mundo.CENAS ?? []) as CenaQ[]), ...((mundo.CENAS_QUOTIDIANAS ?? []) as CenaQ[])];
const INSTITUICOES = (mundo.INSTITUICOES ?? []) as ItemMundo[];
const PROFISSOES = (mundo.PROFISSOES ?? []) as ItemMundo[];
const ESPACOS = (mundo.ESPACOS ?? []) as ItemMundo[];
const BIOLOGIA = [
  ...((mundo.BIOLOGIA_DO_MUNDO ?? []) as string[]), ...((mundo.FLORA ?? []) as string[]),
  ...((mundo.FAUNA ?? []) as string[]), ...((mundo.RIOS_E_MARES ?? []) as string[]),
];
const VERBOS = (mundo.VERBOS_CIVILIZACIONAIS ?? []) as string[];

// ── O MUNDO: uma biocivilização REFINADA e SOFISTICADA (não aldeia rústica) ─────
const MUNDO =
  'A BIODIVERSE, ABUNDANT, ADVANCED PARALLEL EARTH where evolution and culture selected for BEAUTY, ABUNDANCE, COMPLEXITY, COOPERATION and BIOLOGICAL SOPHISTICATION. ' +
  'A REFINED, SOPHISTICATED, ELEGANT biocivilization, technologically MATURE through LIVING biotechnology: luminous glass vessels that hold living plants, delicate biological instruments, ornate grown tools, living libraries and laboratories — NOT screens/iPhones, and ABSOLUTELY NOT a rustic, poor, dusty or neolithic village. ' +
  'GRAND, sophisticated ORGANIC LIVING ARCHITECTURE: vine-draped marble-and-glass cathedrals, luminous ornate halls, suspended gardens, water running through the structures. Civilisational ELEGANCE and abundance are the everyday norm. ' +
  'Recognisably Earth-life yet clearly another, more beautiful branch of the tree of life. ';
// ── REFINAMENTO: roupa elegante + cultura material densa (a chave que faltava) ──
const REFINAMENTO =
  'THE PEOPLE: ethnically diverse humans with NORMAL bodies, wearing ELEGANT, FLOWING, INTRICATELY PATTERNED garments with fine jewellery, beads and adornments — REFINED and sophisticated, NEVER rustic peasant cloth, NEVER shirtless poor villagers, NEVER ragged or dusty. ' +
  'The frame is DENSE with exquisite material culture: luminous glass vessels holding living plants, delicate ornate instruments, refined organic objects in daily use — the signs of an advanced, abundant, beautiful culture. ';
// ── VIDA EM MOVIMENTO: curiosa, criativa, viva (mas refinada, não pobre) ─────────
const VIDA =
  'THIS WORLD IS CURIOUS, CREATIVE, BUSY, JOYFUL AND ALIVE: people study fascinated, make, build, gather and celebrate; children explore; animals interfere; markets and gatherings overflow with abundance; music, craft, science and discovery everywhere. ' +
  'Abundance is normal here, so life expands into CURIOSITY and WONDER, never into survival or empty serenity. Movement, abundance and many things happening at once. ';
// ── FOTOGRAFIA: cinematográfica, fotorrealista, luminosa, NÍTIDA, ornada ────────
const FOTOGRAFIA =
  'A richly detailed, LUMINOUS, ORNATE, CINEMATIC PHOTOREAL image — a REAL PHOTOGRAPH (NOT a painting, NOT concept art, NOT a matte painting, NOT fantasy art), believable and real, like a documentary frame of an advanced peaceful biocivilization; exquisite fine detail throughout. ' +
  'CLEAR, BRIGHT, LUMINOUS DAYLIGHT, jewel-like clarity, every detail visible, high LOCAL contrast, luminous WITHOUT darkness; TACK-SHARP, deep focus, crisp edge to edge; NOT soft, NOT blurry, NOT dreamy, NOT moody, NOT golden-hour haze, NOT god-rays. ' +
  'HIGH DENSITY of visual information: objects, materials, instruments, species, ornate architecture, people busy. ';
const REGRA =
  'GENERATE FROM PLACE, NEVER FROM MEANING: the WORLD is the subject of the photo, not any idea or metaphor. no text, no letters, no watermark, no logos.';
const BAN =
  'BANNED: a rustic / Mediterranean / Moroccan / North-African / tropical / adobe village; dusty mud paths; peasant, poor or ragged people; shirtless boys; a National-Geographic ethnographic village; a lone pensive person in foliage; empty contemplative serenity; spiritual/wellness/retreat/ashram aesthetic; golden spiritual glow; penumbra-as-darkness; scarcity, poverty, primitive survival; cyberpunk, neon, robots, screens. ';

// PESSOAS — a correção do "jardim paradisíaco vazio": gente é o SUJEITO, não o cenário.
const PESSOAS =
  'THIS IMAGE IS FULL OF PEOPLE — the FOREGROUND is filled with MANY people of this world, close, prominent and clearly visible, busy doing things together; PEOPLE ARE THE SUBJECT, not the scenery. ' +
  'An empty landscape, an empty garden or a beautiful scene with NO people is WRONG and BANNED for this image. ';

const ABERTURA = `${FOTOGRAFIA}${PESSOAS}${MUNDO}${REFINAMENTO}${VIDA}${BAN}`;

// 5 modos, TODOS povoados/vivos/em movimento. O lugar vem dos bancos; o ADN daqui.
export function cenaMundoTeste(seed = 0): { briefing: string; categoria: string } {
  const m = idx(seed, 5);
  let categoria: string, briefing: string;
  if (m === 0) { // mercado / festival / multidão a VIVER
    const cena = pick(CENAS, seed);
    const verbo = cena?.acao || pick(VERBOS, seed * 7 + 1) || 'trade, play and gather';
    categoria = cena?.nome ?? 'vida em comunidade';
    briefing = `${ABERTURA}SCENE — FOREGROUND FILLED WITH PEOPLE: a CROWDED, BUSY, JOYFUL public place of this world (a market, a festival, a gathering), MANY people of many cultures close in the foreground doing many things at once: ${cena?.descricao ?? 'trading, cooking, playing, making music'}, busy to ${verbo}. Movement, noise, abundance, children and animals; NOT an empty garden. ${REGRA}`;
  } else if (m === 1) { // instituição / laboratório / oficina em plena atividade
    const inst = pick(INSTITUICOES, seed) ?? pick(PROFISSOES, seed);
    categoria = inst?.nome ?? 'instituição em uso';
    briefing = `${ABERTURA}SCENE — FOREGROUND FILLED WITH PEOPLE working: a working INSTITUTION / LAB / WORKSHOP of this world in FULL busy activity: the "${inst?.nome ?? 'institution'}"${inst?.equivalente_terrestre ? ` (their ${inst.equivalente_terrestre})` : ''} — ${inst?.descricao ?? 'a living library, a laboratory, a workshop'}. MANY people close in the foreground working, fascinated, building, studying, handling instruments and biological technology IN USE; dense with material culture; NOT an empty room. ${REGRA}`;
  } else if (m === 2) { // biodiversidade ESPANTOSA ao perto
    const bio = pick(BIOLOGIA, seed) ?? 'a life-form of this world';
    categoria = 'biodiversidade';
    briefing = `${FOTOGRAFIA}${MUNDO}${BAN}SCENE — the LIVING WORLD up close, full of WONDER: INVENT an astonishing plant, animal, river or sky of this biosphere in the SPIRIT of "${bio}" (do not copy it literally). A nature-documentary close-up, dazzling rich detail, several species interacting, evolved Earth-life of another branch. ${REGRA}`;
  } else if (m === 3) { // cidade / arquitetura viva HABITADA
    const esp = pick(ESPACOS, seed) ?? pick(INSTITUICOES, seed);
    categoria = esp?.nome ?? 'cidade viva';
    briefing = `${ABERTURA}SCENE — a busy LIVING CITY street/plaza of this world THRONGED WITH PEOPLE: ${esp?.descricao ?? 'organic living architecture, suspended gardens, navigable roots, water running through the structures'}${esp?.equivalente_terrestre ? ` (like ${esp.equivalente_terrestre})` : ''}. MANY people in the foreground and across the scene, transport, trade, daily life; abundant, sophisticated, ALIVE; NOT an empty city. ${REGRA}`;
  } else { // crianças / jogo / descoberta
    categoria = 'crianças e descoberta';
    briefing = `${ABERTURA}SCENE — FOREGROUND FILLED WITH CHILDREN: MANY children and young people of this world, close and prominent, PLAYING, exploring and DISCOVERING together with curiosity and laughter, among the species, plants and instruments of their world; movement, joy, faces visible, wonder; NOT an empty garden. ${REGRA}`;
  }
  return { briefing, categoria };
}

// ADN PERMANENTE recuperado pela Vivianne (as imagens que funcionaram): escala
// HUMANA, gente ocupada, objeto impossível EM USO, arquitetura só de fundo, natureza
// integrada — e a lista dura de negativos. Quando se passou a macro-escala/cidade,
// fugiu para Veneza/solarpunk. Por isso: só cenas humanas, nunca cidade vista de cima.
const BASE_MUNDO =
  'Documentary photography from an existing civilization. The civilization is real, inhabited and ordinary to its inhabitants. The image must feel OBSERVED rather than designed. ' +
  'The focus is everyday life, material culture and ordinary interactions of a COMPLETE civilization. The scale VARIES: sometimes an intimate human-scale moment (a table, a workshop, a small group), sometimes a WIDE view of a whole city, a port, an ocean, a public square or great infrastructure of this civilization — the full society, not only gardens, terrariums and children. ' +
  'People are mostly busy in ordinary activity (studying, teaching, cultivating, cooking, caring, building, learning, trading); a person may ALSO be alone, paused, apart, or in quiet relationship with another — but NEVER in a spiritual meditation pose and never reverently admiring technology. ' +
  'The people are ETHNICALLY DIVERSE — varied skin tones, features and hair, clearly different peoples together, NEVER all the same ethnicity. ' +
  'Their clothing and materials are REFINED, clean and dignified, beautiful and well-made — NEVER rustic, primitive, poor, ragged, tribal or peasant. ' +
  'Include UNFAMILIAR objects, materials or lifeforms being USED naturally in daily activities (transparent living vessels, seed-lamps, grown materials, cultivated tools, organisms used as tools) rather than displayed or admired. ' +
  'Architecture is only background, not the subject. Vegetation is integrated into the human space, never a forest or botanical garden. Beauty exists as INFRASTRUCTURE rather than decoration; abundance without luxury; technology without machinery; nature without wilderness. ' +
  'No dystopia. No cyberpunk. No post-apocalypse. No medieval village. No luxury resort. No spiritual retreat. No temples. No shrine. No altar. No sacred or central venerated object. No monument. No monumentality. No ritual veneration. No spiritual meditation pose. No robes. No crystals. No scarcity. No survival aesthetics. No Earth cultures. No recognisable historical civilizations. No solarpunk, no eco-city, no futuristic Earth. No Venice, no Singapore. No Montessori-greenhouse cliché, not only horticulture and terrariums. ' +
  'no text, no letters, no watermark, no logos.';

// CENAS pelos TEMAS que a Vivianne DE FACTO aborda (não worldbuilding genérico): a
// pessoa só, o desencaixe, as linhagens/heranças, os ciclos/fins, a sombra, os
// vínculos, a transformação, o corpo, o sentido, a emergência. Cada cena é uma JANELA
// do mundo dela que carrega UM tema seu (sem ilustrar a frase). `tema` = a temática
// que serve; `atlas` = que aspetos herda da bíblia visual.
interface CenaFund { cena: string; categoria: string; tema: string; atlas: string[] }
const CENAS_FUNDADORAS: CenaFund[] = [
  // ── OS TEMAS DELA ───────────────────────────────────────────────────────────
  { cena: 'a single person of this world sitting a little apart at the edge of a busy gathering, present but not quite belonging, the others continuing warmly behind', categoria: 'desencaixe · à beira', tema: 'desencaixe', atlas: ['pessoas', 'roupa', 'interior'] },
  { cena: 'one person of this world alone for a quiet moment in the middle of ordinary daily life, the world still moving around them — paused, not meditating', categoria: 'o eu · pausa', tema: 'corpo', atlas: ['pessoas', 'roupa', 'cidade'] },
  { cena: 'an elder of this world placing a living heirloom object into the hands of a young person, three generations present and watching', categoria: 'herança · linhagem', tema: 'raizes', atlas: ['pessoas', 'objectos', 'roupa'] },
  { cena: 'several generations of one family of this world together in a line, the very old and the very young, hands connected, a quiet continuity', categoria: 'gerações · cura ancestral', tema: 'campo', atlas: ['pessoas', 'roupa', 'interior'] },
  { cena: 'a small group of this world gently releasing a luminous living thing onto bright water, a farewell that is also a beginning', categoria: 'ciclos · despedida', tema: 'ciclos', atlas: ['oceano', 'pessoas', 'roupa'] },
  { cena: 'two people of this world in close quiet company, the bond and the small space they keep between them, a real human moment', categoria: 'vínculos', tema: 'vinculos', atlas: ['pessoas', 'roupa', 'interior'] },
  { cena: 'a person of this world caught mid-passage crossing a threshold between two living spaces of different light, leaving one for the other', categoria: 'transformação · limiar', tema: 'transformacao', atlas: ['arquitectura', 'roupa', 'interior'] },
  { cena: 'a healer of this world caring for another person with gentle living instruments, both fully present, in a calm bright room', categoria: 'corpo · cuidado', tema: 'corpo', atlas: ['interior', 'roupa', 'pessoas'] },
  { cena: 'a person of this world standing half in clear light and half in soft shadow, fine detail visible in BOTH the lit and the shadowed side, the shown self and the hidden self', categoria: 'sombra', tema: 'sombra', atlas: ['interior', 'roupa', 'pessoas'] },
  { cena: 'a person of this world setting out alone along a bright waterway toward an open horizon, the wide world ahead', categoria: 'sentido · caminho', tema: 'sentido', atlas: ['oceano', 'natureza', 'roupa'] },
  { cena: 'people of this world together looking up at a migration of enormous gentle creatures crossing the bright sky or sea, wonder and openness', categoria: 'emergência · para onde vamos', tema: 'emergencia', atlas: ['oceano', 'animais', 'pessoas'] },
  { cena: 'a warm communal meal of this world, many people of different ages and peoples together, belonging', categoria: 'pertença · refeição', tema: 'vinculos', atlas: ['refeicoes', 'pessoas', 'roupa'] },
  // ── TEXTURA DO MUNDO (variedade) ────────────────────────────────────────────
  { cena: 'a crowded bright market of this world, many people trading goods and knowledge, dense material culture', categoria: 'mercado', tema: 'comunidade', atlas: ['mercado', 'pessoas', 'objectos'] },
  { cena: 'a living library of this world, adults consulting living archives among tall living shelves', categoria: 'biblioteca', tema: 'aprendizagem', atlas: ['biblioteca', 'interior', 'pessoas'] },
  { cena: 'a woman and a child gently feeding a large calm herbivore creature with plants and flowers growing along its back, beside a pond of lilies', categoria: 'criatura · lago', tema: 'ciclos', atlas: ['animais', 'pessoas', 'roupa'] },
  { cena: 'an extraordinary creature or plant of this biosphere up close, a nature-documentary portrait, few or no people', categoria: 'biodiversidade', tema: 'mundo', atlas: ['animais', 'natureza'] },
  { cena: 'a coastal city of canals and navigable waterways of this world, wide at human level from a bridge, living boats and people in urban life', categoria: 'cidade', tema: 'comunidade', atlas: ['cidade', 'arquitectura', 'transportes'] },
  { cena: 'an ocean port of this world, large living vessels at the quay, the open sea, people loading goods', categoria: 'porto', tema: 'comunidade', atlas: ['oceano', 'transportes', 'cidade'] },
  { cena: 'astronomers of this world at an observatory studying a clear starry night and several moons, luminous instruments', categoria: 'observatório · noite', tema: 'emergencia', atlas: ['noite', 'ciencia', 'arquitectura'] },
  { cena: 'children of this world learning together, busy and curious, among the living instruments of their world', categoria: 'infância · aprender', tema: 'aprendizagem', atlas: ['infancia', 'aprendizagem', 'pessoas'] },
];

// Briefing ANCORADO: a IMAGEM de referência define o look; o texto traz a CENA + o ADN.
// devolve `atlas` (aspetos a herdar) e `tema` (a matéria que serve).
export function cenaAncorada(seed = 0): { briefing: string; categoria: string; atlas: string[]; tema: string } {
  const c = CENAS_FUNDADORAS[idx(seed, CENAS_FUNDADORAS.length)];
  return { briefing: `${c.cena}. ${BASE_MUNDO}`, categoria: c.categoria, atlas: c.atlas, tema: c.tema };
}

// ── MODO OBJETOS · o "IKEA do mundo" (a cultura material PRIMEIRO) ──────────────
// A descoberta da Vivianne: o mundo não se define pela arquitetura (que colapsa para
// templo/sagrado), define-se pela CULTURA MATERIAL. Gerar objetos SOZINHOS, sem
// arquitetura/templo/cena, é o que constrói o vocabulário do mundo.
const OBJETO_BASE =
  'isolated PRODUCT / CATALOG photograph of ONE single everyday object, on a plain neutral seamless studio background. ' +
  'The object is made of grown / cultivated / living materials, unfamiliar yet clearly FUNCTIONAL and ORDINARY (a real tool people use every day), with signs of everyday use; a hand using it is allowed. ' +
  'It is NOT precious, NOT venerated, NOT displayed reverently, NOT a relic. ' +
  'NO architecture, NO building, NO interior, NO temple, NO shrine, NO altar, NO ritual, NO garden, NO plants around it, NO landscape, NO crowd, NO person contemplating, NO sacred or spiritual mood, NO glow of worship. ' +
  'Documentary product photography, observed and ordinary. No Earth objects, no recognisable historical objects. no text, no letters, no watermark, no logos.';

const OBJETOS_FUNDADORES: { obj: string; categoria: string }[] = [
  { obj: 'a family meal vessel of this civilization', categoria: 'refeicoes' },
  { obj: 'an everyday drinking cup of this civilization', categoria: 'refeicoes' },
  { obj: 'a cooking utensil of this civilization', categoria: 'refeicoes' },
  { obj: 'a food-preservation container of this civilization', categoria: 'objectos' },
  { obj: "a child's learning toy of this civilization", categoria: 'infancia' },
  { obj: 'a writing / note-taking instrument of this civilization', categoria: 'aprendizagem' },
  { obj: 'a portable book or library object of this civilization', categoria: 'aprendizagem' },
  { obj: 'a scientific observation instrument of this civilization', categoria: 'objectos' },
  { obj: 'a measuring instrument of this civilization', categoria: 'objectos' },
  { obj: 'an agricultural hand tool of this civilization', categoria: 'objectos' },
  { obj: 'a building / construction hand tool of this civilization', categoria: 'objectos' },
  { obj: 'a garment of this civilization laid out', categoria: 'roupa' },
  { obj: 'a gift object exchanged between friends in this civilization', categoria: 'objectos' },
  { obj: 'a small personal boat or watercraft of this civilization', categoria: 'transportes' },
  { obj: 'a light source / everyday lamp of this civilization', categoria: 'objectos' },
  { obj: 'a musical instrument of this civilization', categoria: 'objectos' },
  { obj: 'a piece of everyday furniture (a chair or a low table) of this civilization', categoria: 'interior' },
  { obj: 'a childcare object of this civilization', categoria: 'infancia' },
];

export function cenaObjeto(seed = 0): { briefing: string; categoria: string } {
  const o = OBJETOS_FUNDADORES[idx(seed, OBJETOS_FUNDADORES.length)];
  return { briefing: `${o.obj}. ${OBJETO_BASE}`, categoria: o.categoria };
}
