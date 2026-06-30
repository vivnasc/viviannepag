// Constituição Visual · Mundo Pós-Sobrevivência (worldbuilding/CONSTITUICAO.md).
// Etnografia de uma civilização que nunca existiu — o EQUIVALENTE FUNCIONAL, nunca o
// futuro da Terra nem a versão futurista de objectos terrestres. O motor escolhe
// escala + função + pergunta + categoria por seed (respeitando as proporções do
// Axioma 6 e ≥70% à distância íntima/média) e devolve o briefing da cena para o
// prompt da imagem. "Não se muda a escala, muda-se a ontologia."

export type Escala = 'micro' | 'intima' | 'social' | 'ecologica' | 'civilizacional';

// ESTILO — a CHAVE (diagnóstico da Vivianne+ChatGPT): o que faz a diferença entre
// "documentário de outra civilização" (o que ela quer) e "retiro espiritual dourado"
// (o atalho em que o modelo cai) é o VOCABULÁRIO. Por isso o prompt lidera com
// fotografia documental/antropológica, gente diversa, realismo cinematográfico — e
// NÃO com "consciência/transcendência/luz da própria matéria".
export const ESTILO_FOTO =
  'NATURE & FIELD DOCUMENTARY PHOTOGRAPHY of a PARALLEL BIOSPHERE, in SOFT INDIRECT DAYLIGHT, luminous rather than bright, penumbra with PRESERVED shadow detail (never underexposed, never crushed blacks) — cinematic realism, medium format, SHARP focus and crisp fine detail throughout (NOT blurry, NOT a heavy shallow-depth blur), ultra-detailed, candid, believable, OBSERVED not designed; ' +
  'when people appear: ETHNICALLY DIVERSE real humans with NORMAL human bodies — NO physical mutation, NO alien features, NO vegetal hair, NO strange eyes, NO skin patterns. ' +
  'What is DIFFERENT is NEVER their anatomy but their WAY OF BEING: the calm presence of a nervous system that is not in survival, an unfamiliar posture and body language, their own customs and gestures, and above all WHAT THEY WEAR (garments that are grown/cultivated rather than woven, unfamiliar yet clearly human clothing, adornments worn naturally) and WHAT THEY ARE DOING; natural daylight, real shadow';
export const ANTI_ESTETICA =
  'NOT concept art, NOT fantasy art, NOT sci-fi illustration, NOT a spiritual or meditation aesthetic, NOT an eco-utopia temple, NOT people in matching white/beige robes, NOT crystals, NOT glowing orbs or spheres, NOT golden divine light, NOT a wellness/yoga advertisement, NOT an all-white-and-gold palette, NOT a calm person contemplating something luminous, NOT an "ecological premium ashram"; ' +
  'NOT a rural/pre-industrial/Mediterranean/UNESCO-heritage village, NOT the past, NOT primitive, NOT only clay-and-wood crafts; ' +
  'AND NOT industrial/urban/port/functionalist, NOT machines, NOT devices/glass/interfaces/gadgets, NOT minimalism, NOT luxury organic architecture. The beauty here is BIOLOGICAL (abundance, diversity, symbiosis), never decorative/design/luxury.';
// A VERDADE do mundo dela (correção mais funda, Vivianne+ChatGPT): NÃO é uma civilização
// industrial nem tecnologia avançada — é uma BIOSFERA PARALELA. A Terra depois de milhões
// de anos de evolução noutra direcção, onde a evolução escolheu BELEZA, DIVERSIDADE e
// SIMBIOSE em vez da escassez. Beleza = ecologia, não decoração.
export const BIOTECH =
  'THE TRUTH OF THIS WORLD: it is NOT an industrial civilization and NOT advanced machine technology. It is a PARALLEL BIOSPHERE — Earth after millions of years of evolution in ANOTHER DIRECTION, where evolution selected for BEAUTY, DIVERSITY and SYMBIOSIS as survival strategies. EVOLVED BIOLOGY, not machines: ' +
  'translucent trees, flexible crystalline leaves, flowers that release luminous pollen, architectural lichens, suspended aquatic gardens; iridescent-membrane birds, bioluminescent migrating whales, giant pollinators, translucent tree-amphibians; rivers of translucent water carrying living seeds, seas under several moons. ' +
  'Rivers, seas, forests, moons, animals and people are all part of the SAME evolutionary language. Recognizable as Earth-life, yet clearly another branch of the tree of life. It must be at once HABITABLE and IMPOSSIBLE. ' +
  'These named examples are only the SPIRIT/register, NOT a fixed menu: INVENT new plants, animals, rivers, skies and forms freely in this register; never limit yourself to a list. ' +
  'Photograph this world in soft indirect DAYLIGHT (a daytime scene, never night) — even the luminous/iridescent biology is seen by day, in penumbra with PRESERVED detail, never crushed into black.';
// O MANIFESTO que muda o comportamento do modelo (insistência da Vivianne+ChatGPT):
// fotografia OBSERVADA, evidência de vida, não símbolo desenhado.
export const MANIFESTO_FOTO =
  'This is NOT concept art. This is DOCUMENTARY PHOTOGRAPHY from an EXISTING civilization: the photographer is visiting a real place where real people live and work. The image must feel OBSERVED, not designed — evidence of life, not a symbol. In the spirit of National Geographic photography, the ecological richness of Studio Ghibli, and the cinematic realism of Denis Villeneuve (people busy, material culture, tools, professions, ecosystems, activities). ';
// paleta GROUNDED (cor natural e variada, com sombra e contraste reais), não o branco-e-dourado.
// PREFIXO DE LUZ — vai à FRENTE do prompt do Flux (os primeiros tokens pesam mais).
// As cenas saíam escuras porque o pedido de luz vinha no fim e os TIPOS de cena
// (desfiladeiros, grutas, floresta densa, crepúsculo, bioluminescência) puxam para
// escuro. Este prefixo curto e duro força DIA, claro e nítido, sempre.
export const LUZ_PREFIXO =
  'PENUMBRA, NOT DARKNESS. The world exists in penumbra, not darkness: shadows contain information, nothing important disappears into black. The image should feel LUMINOUS rather than bright. ' +
  'Soft indirect daylight, diffuse ambient illumination, natural bounce light, high dynamic range, visible texture in shadows, deep shadows WITHOUT crushed blacks, readable faces and environments, film-grade exposure. ' +
  'Cinematic penumbra with PRESERVED DETAIL — clothing, faces, plant texture, objects, architecture and biodiversity all clearly visible and explorable. Tack-sharp focus, crisp, high-resolution, NOT blurry. ' +
  'Reference exposure quality: Blade Runner 2049 interiors, Dune interior readability, National Geographic rainforest photography. ' +
  'AVOID: underexposure, silhouettes, crushed blacks, missing facial information, loss of texture in shadows; oversaturated, garish, rainbow or neon colour. ';

export const PALETA_MUNDO =
  'SOFT INDIRECT DAYLIGHT, luminous rather than bright; high dynamic range with visible texture in shadows, deep shadows WITHOUT crushed blacks, readable faces and environments; ' +
  'natural REALISTIC colour (never oversaturated, never garish, never rainbow or neon); ' +
  'crisp ULTRA-HIGH RESOLUTION, sharp focus, fine detail; ' +
  'NOT underexposed, NOT murky, NOT a silhouette, NOT foggy, NOT hazy; avoid a uniform white-and-gold or beige look and avoid a golden spiritual glow';

export const EVITAR_MUNDO =
  'Rivers, seas, birds, plants, animals and people are WELCOME and important — but NEVER the ordinary Earth ones: they must clearly belong to THIS other biosphere (evolved differently). ' +
  'NO generic tropical valley / Avatar / fantasy / resort / book-cover look; NO present-day Earth animals or plants; ' +
  'NEVER cyberpunk, neon, robots, holograms, ships, screens, devices; no text, no letters, no watermark, no logos';

// EVENTOS — o que ACONTECE ao artefacto/organismo. É o evento (não a paisagem) que
// conta a ideia: o equivalente civilizacional do movimento da frase. O modelo escolhe
// o que melhor espelha a frase; estes são sementes/exemplos.
export const EVENTOS = [
  'is dissolving and coming apart in the hands',
  'one of its lights has gone dark while all the others stay luminous',
  'no longer responds to or recognizes the person it belonged to',
  'is sealing and closing shut',
  'is unfurling and opening for the first time',
  'is being gently set down and released',
  'has gone quiet and stopped glowing',
  'is splitting along a living seam',
  'is being passed from older hands to younger hands',
  'is drifting and stepping away for the first time',
  'is changing colour as an inner state shifts',
  'is being slowly rewoven and regrown',
];

export interface CategoriaVisual { id: string; peso: number; escalas: Escala[]; dica: string }

// Categorias com a proporção-alvo (Axioma 6) e a dica de taxonomia (equivalente
// funcional, nunca terrestre). O peso replica-se na roda para sair ~35/25/15/15/10.
export const CATEGORIAS: CategoriaVisual[] = [
  { id: 'objecto', peso: 35, escalas: ['micro', 'intima'], dica: 'a single LIVING INSTRUMENT of this civilization, held or resting close: a memory seed, a possibility compass that points to possibilities not north, a meaning crystal that only reveals what it holds when the observer asks the right question, a presence meter that shows the quality of attention not the hours, a listening bowl, a regulation cloth that answers inner states, an ontological mirror that reflects the shape of a consciousness not a face — an object that meets a need our world met with dead tools' },
  { id: 'retrato', peso: 25, escalas: ['intima'], dica: 'a HUMAN PORTRAIT of ANOTHER humanity — recognizably human, with a nervous system no longer braced for danger (a face without vigilance, comparison or hurry, undivided attention, deeply present like a child before defensive socialization, never posing; older faces are the most sought-after) — BUT carrying clear signs that this is NOT our civilization: living SYMBIOTIC markings or patterns on the skin that look like a gentle organism, not makeup; a living material worn at the body (a slow breathing textile, a symbiotic adornment) that is ecology not fashion; an impossible LIVING instrument held or in use; eyes that rest in an unfamiliar but not alien way; subtle traces of a different material culture. The brain must think "I recognize a human, but I do not fully recognize THIS humanity." NEVER cosmetic glitter or gold particles as decoration, NEVER sci-fi, alien, prosthetics or cyberpunk' },
  { id: 'ritual', peso: 15, escalas: ['social', 'intima'], dica: 'a small social scene of this civilization: sharing family memory, welcoming a newborn, reconciling two communities, choosing a purpose, a shared meal, a collective decision in a resonance chamber — photograph RELATIONS, not isolated individuals' },
  { id: 'especie', peso: 15, escalas: ['ecologica', 'intima'], dica: 'a LIVING BEING from one of the five kingdoms of this world: a temporal plant that flowers in emotional rhythms, an atmospheric whale of the high sky whose migrations mark cultural change, a cartographic animal that migrates through collective psychological states, a relation-organism that appears between two people in deep mutual understanding, an idea-pollinator — never a terrestrial animal or plant' },
  { id: 'arquitectura', peso: 10, escalas: ['civilizacional', 'social'], dica: 'LIVING architecture that grows with its dwellers: a habitational organism that changes when a child is born or someone dies, a bridge of coherence stable only while there is trust between communities, a house that remembers, a city that breathes — grown not built, never monumental by default' },
];

export const FUNCOES = ['memória', 'aprendizagem', 'pertença', 'orientação', 'luto', 'decisão', 'criatividade', 'cuidado', 'comunicação', 'tradução'];

export const PERGUNTAS = [
  'como guardam as memórias entre gerações', 'como educam as crianças sem as treinar para competir',
  'como vivem o luto', 'como celebram', 'como escolhem com quem caminham', 'como aprendem',
  'como tomam decisões em comum', 'como reconhecem a maturidade', 'como medem a riqueza',
  'como transmitem conhecimento', 'como acolhem um recém-nascido', 'como se reconciliam duas comunidades',
  'como reconhecem mudanças emocionais colectivas', 'como é uma refeição', 'como é um brinquedo',
  'como é guardar silêncio', 'como é um instrumento de escrita', 'como é um jardim doméstico',
  'como pertencem sem deixar de ser inteiros', 'como atravessam um limiar',
];

// roda ponderada das categorias (replica peso/5) -> proporções do Axioma 6. Só a
// 'arquitectura' (10%) usa escala ampla, por isso ~90% sai à distância íntima/média.
const idx = (n: number, len: number) => ((n % len) + len) % len;

// ─── BANCO VISUAL (worldbuilding/banco_visual.json) — o coração do universo. A
// geração segue a CADEIA: frase -> função -> artefacto/organismo -> evento -> imagem.
// O ficheiro é enriquecido/calibrado fora (ChatGPT + geração); aqui só se lê. ───
import banco from '@/worldbuilding/banco_visual.json';
import mundo from '@/worldbuilding/banco_worldbuilding.json';
interface Sujeito {
  nome: string; funcao: string; descricao?: string; comportamento?: string; reino?: string;
  evento_visual?: string; quando_falha?: string; simbolo_visual?: string; escala_preferencial?: string;
  emocao_predominante?: string; emocao_associada?: string; equivalente_terrestre?: string; categoria_antropologica?: string;
  nao_e?: string[];
  // EMBEBIMENTO CULTURAL (campos da Vivianne) — forçam objecto ESPECÍFICO da civilização,
  // não símbolo universal: quem usa, quando, o que faz, o que acontece se falhar, etc.
  utilizador?: string; momento_de_uso?: string; o_que_faz?: string;
  o_que_acontece_se_falhar?: string; quem_aprende_a_usar?: string; quem_nao_pode_usar?: string;
}
interface Evento { evento: string; significado: string; categoria: string }
interface Exemplar { funcao: string; pergunta: string; prompt_en: string }
// As coleções por TIPO (uma civilização vive de artefactos, seres, rituais, instituições,
// profissões, tecnologias e espaços — não só de objectos). tipo_en alimenta o prompt.
const TIPOS: { chave: string; tipo_en: string }[] = [
  { chave: 'ARTEFACTOS', tipo_en: 'a personal ARTIFACT / piece of material culture' },
  { chave: 'ORGANISMOS', tipo_en: 'a LIVING ORGANISM of this world' },
  { chave: 'RITUAIS', tipo_en: 'a RITUAL / social practice' },
  { chave: 'INSTITUICOES', tipo_en: 'an INSTITUTION / communal place' },
  { chave: 'PROFISSOES', tipo_en: 'a PROFESSION / someone at their civilizational work' },
  { chave: 'TECNOLOGIAS', tipo_en: 'a living social TECHNOLOGY' },
  { chave: 'ESPACOS', tipo_en: 'a SPACE of this civilization' },
];
type SujeitoTipado = Sujeito & { tipo_en: string };
const SUJEITOS: SujeitoTipado[] = TIPOS.flatMap(({ chave, tipo_en }) =>
  (((banco as Record<string, unknown>)[chave] ?? []) as Sujeito[]).map((s) => ({ ...s, tipo_en })),
);
const EVENTOS_BANCO = (banco.EVENTOS ?? []) as Evento[];
const EXEMPLARES = (banco.EXEMPLARES ?? []) as Exemplar[];
const FUNCOES_CIV = (banco.FUNCOES_CIVILIZACIONAIS ?? FUNCOES) as string[];

// PROIBIDO o vocabulário visual da auto-ajuda/publicidade (metáfora). É o que faz o
// motor regredir para luz/portal/canyon/névoa. Global, sempre no prompt.
const NAO_E_GLOBAL =
  'STRICTLY FORBIDDEN (self-help / advertising / sci-fi visual language — it destroys the world): abstract light, glow, energy, particles, sparkles, ' +
  'a portal, a doorway, a vortex, mist, fog, a canyon, a glowing horizon, a vertical light beam, a tiny person before a giant abstract phenomenon, ' +
  'a beautiful landscape, a forest/valley/river vista, AND the UNIVERSAL SYMBOL trap: a glowing golden sphere/orb, a lotus or flower in cupped hands, a glowing seed, a mandala, ' +
  'cupped hands holding light as a symbol, a mindfulness/coaching/wellness branding look. The subject is NEVER a symbol; it is a SPECIFIC FUNCTIONAL THING of this society, ' +
  'engineered or grown for one exact job, showing its MECHANISM and signs of real use/wear. If the image reads as a METAPHOR or a pretty symbol ("what does this mean?" / "how beautiful"), it FAILED. ' +
  'It must read as an OBJECT/BEING/RITUAL/INSTITUTION of a real civilization ("what IS this? why does it exist? who uses it? what happened here?").';

export interface CenaVisual { escala: Escala; funcao: string; pergunta: string; categoria: string; evento: string; briefing: string }

// CADEIA OBRIGATÓRIA (decisão da Vivianne): frase -> domínio humano -> função civilizacional
// -> SUJEITO CONCRETO (artefacto|organismo|ritual|instituição|profissão|tecnologia|espaço)
// -> evento -> imagem. NUNCA frase->metáfora->paisagem. O equivalente_terrestre força o
// modelo a pensar "que problema humano resolve" em vez de "o que simboliza".
export function cenaConstituicao(seed = 0): CenaVisual {
  const funcao = FUNCOES_CIV[idx(seed, FUNCOES_CIV.length)];
  const daFuncao = SUJEITOS.filter((s) => s.funcao === funcao);
  const pool = daFuncao.length ? daFuncao : SUJEITOS;
  const s = pool.length ? pool[idx(seed, pool.length)] : null;

  const simbolo = s?.simbolo_visual ?? '';
  const corpo = s?.descricao ?? s?.comportamento ?? '';
  const sujeito = s
    ? `${s.tipo_en} of this civilization: the "${s.nome}"${simbolo ? ` (visual form: ${simbolo})` : ''} — ${corpo}${s.reino ? ` [reino: ${s.reino}]` : ''}`
    : 'a concrete artifact, organism or ritual of this civilization';
  const evDoBanco = EVENTOS_BANCO[idx(seed * 5 + 3, EVENTOS_BANCO.length)];
  const evento = s?.evento_visual
    ? `${s.evento_visual}${s.quando_falha ? ` (${s.quando_falha})` : ''}`
    : evDoBanco ? `${evDoBanco.evento} (${evDoBanco.significado})` : 'undergoes the event that mirrors the sentence';
  const emocao = s?.emocao_predominante ?? s?.emocao_associada ?? '';
  const enquadramento = s?.escala_preferencial ?? '';
  const equivalente = s?.equivalente_terrestre ?? '';
  const catAntropo = s?.categoria_antropologica ?? '';
  const naoEItem = s?.nao_e?.length ? ` Also avoid: ${s.nao_e.join(', ')}.` : '';
  const exemplar = EXEMPLARES.find((e) => e.funcao === funcao && e.prompt_en?.trim());
  const pergunta = exemplar?.pergunta || PERGUNTAS[idx(seed * 7 + 2, PERGUNTAS.length)];

  const briefing =
    `${MANIFESTO_FOTO}${ESTILO_FOTO}. ${BIOTECH} A field-documentary photograph from this PARALLEL BIOSPHERE — Earth after evolution took another direction, never the industrial future of Earth. ` +
    `Build the image strictly as a CHAIN, never sentence->metaphor->image: SENTENCE -> HUMAN DOMAIN -> CIVILIZATIONAL FUNCTION -> CONCRETE SUBJECT -> EVENT -> image. ` +
    `CIVILIZATIONAL FUNCTION: ${funcao}${catAntropo ? ` (${catAntropo})` : ''}. ANTHROPOLOGICAL QUESTION: ${pergunta} ` +
    `THE SUBJECT (fills the frame, intimate and close; the place is NEVER the subject): ${sujeito}. ` +
    (equivalente ? `IT IS THE CIVILIZATIONAL EQUIVALENT OF: ${equivalente} — i.e. it solves that exact HUMAN PROBLEM (think "what need does this meet", never "what does this symbolize"). ` : '') +
    // EMBEBIMENTO CULTURAL: quem usa, quando, o que faz, o que falha — torna o objecto específico daquela sociedade.
    ([s?.utilizador && `used by ${s.utilizador}`, s?.momento_de_uso && `used when ${s.momento_de_uso}`, s?.o_que_faz && `it does this: ${s.o_que_faz}`, s?.o_que_acontece_se_falhar && `if it fails: ${s.o_que_acontece_se_falhar}`].filter(Boolean).length
      ? `CULTURAL EMBEDDING (show it as a real used thing of this society, with mechanism and wear): ${[s?.utilizador && `used by ${s.utilizador}`, s?.momento_de_uso && `used when ${s.momento_de_uso}`, s?.o_que_faz && `it does this: ${s.o_que_faz}`, s?.o_que_acontece_se_falhar && `if it fails: ${s.o_que_acontece_se_falhar}`].filter(Boolean).join('; ')}. ` : '') +
    `THE EVENT (the whole point — this civilization's equivalent of the sentence's emotional movement): it ${evento}. Adjust the event so it mirrors THIS exact sentence. ` +
    (enquadramento ? `FRAMING/SCALE: ${enquadramento}. ` : '') +
    (emocao ? `PREDOMINANT EMOTION (shapes composition and light): ${emocao}. ` : '') +
    `If a person appears they are in RELATION with this subject, which stays the true subject. ` +
    (exemplar ? `REFERENCE of the right level (compose in this spirit, do not copy literally): ${exemplar.prompt_en} ` : '') +
    `${PALETA_MUNDO}. ${ANTI_ESTETICA}. ${EVITAR_MUNDO} ${NAO_E_GLOBAL}${naoEItem} ` +
    `BRUTAL TEST before you finish: if the caption were removed, would someone ask "what does this MEAN?" (FAIL) or "what IS this object/being/ritual, who uses it, what happened?" (PASS)? Only the second is acceptable.`;
  return { escala: s?.reino ? 'ecologica' : 'intima', funcao, pergunta, categoria: s?.tipo_en ?? 'objecto', evento, briefing };
}

// ─── MOTOR 2 · WORLDBUILDING (worldbuilding/banco_worldbuilding.json) ───────────────
// NÃO parte da frase. Parte da CIVILIZAÇÃO: escolhe uma CENA QUOTIDIANA (e, se houver,
// um fragmento concreto: instituição/profissão/espécie/espaço) e compõe o "documentário
// fotográfico de um dia normal" — a lógica que gerou as imagens fortes. Aqui a escala
// PODE variar (de íntima a uma vista da cidade). A imagem partilha a civilização com o
// texto, mas não o ilustra. "Que fotografia tiraria um antropólogo num dia normal?"
interface CenaQ { categoria?: string; nome?: string; descricao?: string; escala?: string; instituicao?: string; participantes?: string[]; acao?: string; equivalente_terrestre?: string }
interface ItemMundo { nome: string; funcao?: string; descricao?: string; equivalente_terrestre?: string; estado?: string }
const CENAS_ACCAO = [ ...((mundo.CENAS ?? []) as CenaQ[]), ...((mundo.CENAS_QUOTIDIANAS ?? []) as CenaQ[]) ];
const VERBOS = (mundo.VERBOS_CIVILIZACIONAIS ?? []) as string[];
const DOMINIOS_VIDA = (mundo.DOMINIOS_DA_VIDA ?? []) as string[];
const INSTITUICOES = (mundo.INSTITUICOES ?? []) as ItemMundo[];
const BIOLOGIA = [ ...((mundo.BIOLOGIA_DO_MUNDO ?? []) as string[]), ...((mundo.FLORA ?? []) as string[]), ...((mundo.FAUNA ?? []) as string[]), ...((mundo.RIOS_E_MARES ?? []) as string[]) ];
const FENOMENOS = (mundo.FENOMENOS_DO_MUNDO ?? []) as string[];
const PAISAGENS_F = (mundo.PAISAGENS_FUNCIONAIS ?? []) as string[];
const VESTIGIOS = (mundo.VESTIGIOS_DA_CIVILIZACAO ?? []) as ItemMundo[];
const CENAS_VAZIAS = (mundo.CENAS_SEM_HUMANOS ?? []) as string[];
const FRAGMENTOS: ItemMundo[] = ['INSTITUICOES', 'PROFISSOES', 'ESPECIES', 'ESPACOS', 'OBJETOS', 'RITUAIS']
  .flatMap((k) => ((mundo as Record<string, unknown>)[k] ?? []) as ItemMundo[]);
const pick = <T,>(arr: T[], n: number): T | null => (arr.length ? arr[idx(n, arr.length)] : null);

const ABERTURA =
  `${MANIFESTO_FOTO}${ESTILO_FOTO}. ${BIOTECH} A field-documentary photo of a NORMAL DAY in this PARALLEL BIOSPHERE — Earth after evolution took another direction, never the industrial future of Earth. `;
const FIM_WB =
  ` ${PALETA_MUNDO}. ${ANTI_ESTETICA}. NEVER Earth nor a futuristic version of Earth, NEVER cyberpunk/neon/robots/ships/screens, no text, no letters, no watermark, no logos. ` +
  `It must NOT look like a spiritual retreat: this is a FULL society with work, science, building, navigation, care, mess and use. ` +
  `TEST: without a caption someone must think "this is clearly NOT Earth, yet I could imagine living here" and ask "what is happening / what world is this?", never "what does this mean?".`;

// MOTOR 2 · WORLDBUILDING. Proporção (decisão da Vivianne): ~30% pessoas em ACÇÃO,
// ~30% instituição em funcionamento, ~20% biologia/ecologia do mundo, ~20% cenas SEM
// humanos (o mundo a existir sozinho, vestígios). Às vezes com pessoas, às vezes só o mundo.
export function cenaWorldbuilding(seed = 0): CenaVisual {
  const m = idx(seed, 10);
  let categoria: string, descricao: string, escalaTxt: string, briefing: string;

  if (m <= 2) { // 30% — pessoas DAQUELE mundo em acção (verbo activo)
    const cena = pick(CENAS_ACCAO, seed);
    const dominio = pick(DOMINIOS_VIDA, seed * 3 + 1) ?? 'vida quotidiana';
    const verbo = cena?.acao || pick(VERBOS, seed * 7 + 2) || 'work';
    const participantes = cena?.participantes?.length ? cena.participantes.join(' + ') : `people of this civilization (domain: ${dominio})`;
    const frag = pick(FRAGMENTOS, seed * 5 + 2);
    categoria = cena?.nome ?? cena?.categoria ?? dominio;
    descricao = cena?.descricao ?? `people busy in the domain of ${dominio}`;
    escalaTxt = cena?.escala ?? 'social';
    briefing = ABERTURA + `PEOPLE OF THIS WORLD IN ACTION (active verb, not passive sitting/looking): ${participantes} are busy to ${verbo} — ${descricao}${cena?.instituicao ? ` at the "${cena.instituicao}"` : ''}${cena?.equivalente_terrestre ? ` (like ${cena.equivalente_terrestre})` : ''}. ` +
      (frag ? `A being/object of this world is IN USE (not displayed): the "${frag.nome}"${frag.descricao ? ` (${frag.descricao})` : ''}. ` : '') +
      `Caught mid-gesture, candid, lived-in; faces present; relations not isolated individuals.` + FIM_WB;
  } else if (m <= 4) { // 20% — um lugar comum/instituição CULTIVADA (nunca industrial) em uso
    const inst = pick(INSTITUICOES, seed) ?? pick(FRAGMENTOS, seed);
    const verbo = pick(VERBOS, seed * 7 + 2) || 'function';
    categoria = inst?.nome ?? 'instituição';
    descricao = inst?.descricao ?? 'an institution of this civilization in full daily function';
    escalaTxt = 'social';
    briefing = ABERTURA + `AN INSTITUTION OF THIS WORLD IN FULL FUNCTION: the "${inst?.nome ?? 'institution'}"${inst?.equivalente_terrestre ? ` (their equivalent of a ${inst.equivalente_terrestre})` : ''} — ${descricao}. People at work inside it, to ${verbo}, going about real business; the living architecture and instruments in use.` + FIM_WB;
  } else if (m <= 7) { // 30% — biologia/ecologia do mundo (flora, fauna, rios, mares; pode ser sem pessoas)
    const bio = pick(BIOLOGIA, seed) ?? 'a life-form of this world';
    const fen = pick(FENOMENOS, seed * 3 + 1);
    categoria = 'biologia do mundo';
    descricao = bio + (fen ? `, during ${fen}` : '');
    escalaTxt = 'ecológica';
    briefing = ABERTURA + `THE LIVING WORLD ITSELF — flora, fauna, a river or a sea of this biosphere (people optional and small if present). INVENT a plant / animal / river / sky of this world FREELY, in the SPIRIT of examples like "${bio}" (do NOT copy it literally, and do NOT limit yourself to it; invent something new in the same register)${fen ? `, during the phenomenon of ${fen}` : ''}. Evolved Earth-life of another branch, observed up close like a nature documentary.` + FIM_WB;
  } else { // 20% — o mundo SEM humanos (vestígios / paisagem funcional / cena vazia)
    const vazia = pick(CENAS_VAZIAS, seed);
    const vest = pick(VESTIGIOS, seed * 3 + 1);
    const pais = pick(PAISAGENS_F, seed * 5 + 2);
    const alvo = vazia || (vest ? `${vest.nome} (${vest.estado}${vest.equivalente_terrestre ? `, like ${vest.equivalente_terrestre}` : ''})` : pais || 'the world existing on its own');
    categoria = 'cena sem humanos';
    descricao = alvo;
    escalaTxt = 'ecológica';
    briefing = ABERTURA + `NO PEOPLE AT ALL — the world existing on its own, a trace that someone lives here without any human in frame: ${alvo}. Like an empty market at dawn or a library at night on Earth: no humans needed to feel that a civilization lives here.` + FIM_WB;
  }

  const escala: Escala = escalaTxt.includes('civiliz') ? 'civilizacional' : escalaTxt.includes('eco') ? 'ecologica' : escalaTxt.includes('social') ? 'social' : 'intima';
  return { escala, funcao: categoria, pergunta: `que mundo é este: ${categoria}`, categoria, evento: descricao, briefing };
}
