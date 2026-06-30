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

// ── O MUNDO: um LUGAR que existe, não um ethos psicológico ──────────────────────
const MUNDO =
  'A BIODIVERSE PARALLEL EARTH where evolution selected for BEAUTY, ABUNDANCE, COMPLEXITY, COOPERATION and BIOLOGICAL SOPHISTICATION. ' +
  'It is ALIVE, POPULATED, technologically MATURE (biological technology, instruments, workshops, laboratories, libraries, vessels, navigation, craft — NOT iPhones/screens, and NOT a neolithic village), ecologically integrated and culturally RICH: many cultures, clothes, objects, materials and ways of living. ' +
  'Recognisably Earth-life yet clearly another branch of the tree of life. Civilisational luxury is the everyday norm (organic living architecture, sophistication, impossible-yet-habitable materials), never capitalist bling. ';
// ── VIDA EM MOVIMENTO: substitui o "ethos sereno" que gerava retiro espiritual ──
const VIDA =
  'THIS WORLD IS PLAYFUL, CURIOUS, CREATIVE, BUSY AND ALIVE. People laugh and argue and talk; children explore and play; teenagers mess about; scientists are fascinated; artists build; animals interfere; weather happens; festivals and markets overflow; food is cooked; boats travel; music, sport, craft, trade and discovery everywhere. ' +
  'Abundance is normal here, so life expands into CURIOSITY and WONDER, never into survival or serenity. There is friction, movement, noise, the mess of real use, many things happening at once. ';
// ── FOTOGRAFIA: só luz / lente / composição. Penumbra LUMINOSA, tudo visível, NADA moody ──
const FOTOGRAFIA =
  'A NATURE-DOCUMENTARY / ANTHROPOLOGY PHOTOGRAPH (BBC Planet Earth, National Geographic): a photographer visited a REAL place that existed before any caption and keeps existing after it. ' +
  'BRIGHT BUT SOFT diffuse daylight (like soft light after rain), CLEAR visibility, high LOCAL contrast, LUMINOUS penumbra WITHOUT darkness, every detail visible, rich texture, deep field with activity in the background. ' +
  'HIGH DENSITY OF VISUAL INFORMATION per square metre: objects, materials, tools, species, architecture, people busy, signs of use. ' +
  'ETHNICALLY DIVERSE real humans with NORMAL bodies (no mutation, no alien features); what differs is their cultures, clothes, tools and ways of living, never their anatomy. ' +
  'NOT moody, NOT atmospheric gloom, NOT dramatic deep shadows, NOT crushed blacks, NOT golden-hour spirituality, NOT god-rays, NOT a wellness/retreat/ashram look. ';
const REGRA =
  'GENERATE FROM PLACE, NEVER FROM MEANING: the WORLD is the subject of the photo, not any idea or metaphor. no text, no letters, no watermark, no logos.';
const BAN =
  'BANNED: a lone person sitting or kneeling in foliage looking pensive; an empty quiet contemplative scene; serene calm emptiness; spiritual/wellness/retreat aesthetic; golden spiritual glow; penumbra-as-darkness; scarcity, poverty, ragged clothes, primitive survival; cyberpunk, neon, robots, screens. ';

const ABERTURA = `${FOTOGRAFIA}${MUNDO}${VIDA}${BAN}`;

// 5 modos, TODOS povoados/vivos/em movimento. O lugar vem dos bancos; o ADN daqui.
export function cenaMundoTeste(seed = 0): { briefing: string; categoria: string } {
  const m = idx(seed, 5);
  let categoria: string, briefing: string;
  if (m === 0) { // mercado / festival / multidão a VIVER
    const cena = pick(CENAS, seed);
    const verbo = cena?.acao || pick(VERBOS, seed * 7 + 1) || 'trade, play and gather';
    categoria = cena?.nome ?? 'vida em comunidade';
    briefing = `${ABERTURA}SCENE — a CROWDED, BUSY, JOYFUL public place of this world (a market, a festival, a gathering) full of MANY people of many cultures doing many things at once: ${cena?.descricao ?? 'trading, cooking, playing, making music'}, busy to ${verbo}. Movement, noise, abundance, children and animals, depth of activity. ${REGRA}`;
  } else if (m === 1) { // instituição / laboratório / oficina em plena atividade
    const inst = pick(INSTITUICOES, seed) ?? pick(PROFISSOES, seed);
    categoria = inst?.nome ?? 'instituição em uso';
    briefing = `${ABERTURA}SCENE — a working INSTITUTION / LAB / WORKSHOP of this world in FULL busy activity: the "${inst?.nome ?? 'institution'}"${inst?.equivalente_terrestre ? ` (their ${inst.equivalente_terrestre})` : ''} — ${inst?.descricao ?? 'a living library, a laboratory, a workshop'}. Many people working, fascinated, building, studying; instruments, tools and biological technology IN USE; dense with material culture. ${REGRA}`;
  } else if (m === 2) { // biodiversidade ESPANTOSA ao perto
    const bio = pick(BIOLOGIA, seed) ?? 'a life-form of this world';
    categoria = 'biodiversidade';
    briefing = `${FOTOGRAFIA}${MUNDO}${BAN}SCENE — the LIVING WORLD up close, full of WONDER: INVENT an astonishing plant, animal, river or sky of this biosphere in the SPIRIT of "${bio}" (do not copy it literally). A nature-documentary close-up, dazzling rich detail, several species interacting, evolved Earth-life of another branch. ${REGRA}`;
  } else if (m === 3) { // cidade / arquitetura viva HABITADA
    const esp = pick(ESPACOS, seed) ?? pick(INSTITUICOES, seed);
    categoria = esp?.nome ?? 'cidade viva';
    briefing = `${ABERTURA}SCENE — a wide view of a LIVING CITY of this world, inhabited and busy: ${esp?.descricao ?? 'organic living architecture, suspended gardens, navigable roots, water running through the structures'}${esp?.equivalente_terrestre ? ` (like ${esp.equivalente_terrestre})` : ''}. Many people across the scene, transport, trade, daily life; abundant, sophisticated, ALIVE. ${REGRA}`;
  } else { // crianças / jogo / descoberta
    categoria = 'crianças e descoberta';
    briefing = `${ABERTURA}SCENE — CHILDREN and young people of this world PLAYING, exploring and DISCOVERING together with curiosity and laughter, among the species, plants and instruments of their world; movement, joy, mess, wonder. ${REGRA}`;
  }
  return { briefing, categoria };
}
