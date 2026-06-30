// GERADOR DE TESTE (sandbox) — SEPARADO do gerador a sério (mundo-visual.ts).
// Serve para afinar "o MUNDO dela" (multidões, mercados, instituições em uso,
// biodiversidade ao perto, arquitetura, vida em comunidade — as folhas de contacto)
// SEM tocar nos posts nem no live. Aqui experimento à vontade; quando estiver o mundo
// dela, copia-se para o live. NADA aqui afeta a geração real.
//
// O que MATA a Vivianne e está BANIDO aqui: a "pessoa sozinha sentada na vegetação,
// pensativa". O mundo é POVOADO e ACTIVO.
import mundo from '@/worldbuilding/banco_worldbuilding.json';
import { ESTILO_FOTO, ANTI_ESTETICA, BIOTECH, MANIFESTO_FOTO, PALETA_MUNDO } from './mundo-visual';

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

// O ETHOS: pós-sobrevivência das MENTES EVOLUÍDAS, abundância = novo normal (NÃO escassez).
const ABUNDANCIA =
  'THE ETHOS OF THIS WORLD: post-survival ABUNDANCE is the NEW NORMAL — these are EVOLVED MINDS, a post-scarcity civilization of consciousness, sophistication, refinement and plenty. ' +
  'Prosperous, serene, advanced, richly provided for; beauty and abundance are everyday and ordinary here, taken for granted. ' +
  'Their clothing and adornments are REFINED, sophisticated and abundant (cultivated/grown, never rough peasant cloth). ' +
  'BANNED: scarcity, poverty, hunger, ragged or worn clothing, a poor survivor, primitive or tribal survival, subsistence, a hard rustic life. ';
const ABERTURA = `${MANIFESTO_FOTO}${ESTILO_FOTO}. ${BIOTECH} ${ABUNDANCIA} A field-documentary photo of a NORMAL DAY in this PARALLEL BIOSPHERE. `;
// O banimento da cena que a mata.
const NAO_PESSOA_SO =
  'CRITICAL — BANNED: a single lone person sitting or kneeling in foliage/forest looking pensive or melancholic. NEVER that. ' +
  'Show a LIVED, POPULATED, ACTIVE world: people TOGETHER doing real things, crowds, institutions in use, work, building, study, trade, navigation, care, hands working, material culture in use, biodiversity. If people appear they are DOING something with others, never posing alone in nature. ';
const FIM =
  ` ${PALETA_MUNDO}. ${ANTI_ESTETICA}. NEVER Earth nor a futuristic Earth, NEVER cyberpunk/neon/robots/screens, no text, no letters, no watermark, no logos. ` +
  'A FULL society with work, science, building, navigation, care, mess and use; never a spiritual retreat.';

// 5 modos, TODOS povoados/activos ou mundo vivo — NENHUM "pessoa só na folhagem".
export function cenaMundoTeste(seed = 0): { briefing: string; categoria: string } {
  const m = idx(seed, 5);
  let categoria: string, briefing: string;
  if (m === 0) {
    const cena = pick(CENAS, seed);
    const verbo = cena?.acao || pick(VERBOS, seed * 7 + 1) || 'trade and gather together';
    categoria = cena?.nome ?? 'vida em comunidade';
    briefing = ABERTURA + NAO_PESSOA_SO + `A CROWDED COMMUNAL SCENE: MANY people of this world together, busy to ${verbo} — ${cena?.descricao ?? 'a market, a shared meal, a gathering'}. Wide, full of life, many figures, candid, lived-in.` + FIM;
  } else if (m === 1) {
    const inst = pick(INSTITUICOES, seed) ?? pick(PROFISSOES, seed);
    categoria = inst?.nome ?? 'instituição';
    briefing = ABERTURA + NAO_PESSOA_SO + `AN INSTITUTION IN FULL FUNCTION: the "${inst?.nome ?? 'institution'}"${inst?.equivalente_terrestre ? ` (their equivalent of a ${inst.equivalente_terrestre})` : ''} — ${inst?.descricao ?? 'a living library, a laboratory, a workshop'}. Several people at work inside, instruments and living architecture in use.` + FIM;
  } else if (m === 2) {
    const bio = pick(BIOLOGIA, seed) ?? 'a life-form of this world';
    categoria = 'biodiversidade';
    briefing = ABERTURA + `THE LIVING WORLD UP CLOSE — INVENT a plant, animal, river or sky of this biosphere in the SPIRIT of "${bio}" (do NOT copy it literally, do NOT limit yourself to it). A nature-documentary close-up, rich fine detail, evolved Earth-life of another branch of the tree of life.` + FIM;
  } else if (m === 3) {
    const esp = pick(ESPACOS, seed) ?? pick(INSTITUICOES, seed);
    categoria = esp?.nome ?? 'arquitetura do mundo';
    briefing = ABERTURA + `THE ARCHITECTURE OF THIS WORLD, a wide establishing view: ${esp?.descricao ?? 'an organic living city, suspended gardens, water running through the structures'}${esp?.equivalente_terrestre ? ` (like ${esp.equivalente_terrestre})` : ''}. People small but present and active across the scene.` + FIM;
  } else {
    const prof = pick(PROFISSOES, seed) ?? pick(INSTITUICOES, seed);
    const verbo = pick(VERBOS, seed * 3 + 1) || 'work';
    categoria = prof?.nome ?? 'profissão';
    briefing = ABERTURA + NAO_PESSOA_SO + `A PROFESSION OF THIS WORLD AT WORK: people practising "${prof?.nome ?? 'a craft'}"${prof?.descricao ? ` (${prof.descricao})` : ''}, busy to ${verbo}, tools and material culture IN USE, hands working, close and candid.` + FIM;
  }
  return { briefing, categoria };
}
