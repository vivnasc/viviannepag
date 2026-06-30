// Constituição Visual · Mundo Pós-Sobrevivência (worldbuilding/CONSTITUICAO.md).
// Etnografia de uma civilização que nunca existiu — o EQUIVALENTE FUNCIONAL, nunca o
// futuro da Terra nem a versão futurista de objectos terrestres. O motor escolhe
// escala + função + pergunta + categoria por seed (respeitando as proporções do
// Axioma 6 e ≥70% à distância íntima/média) e devolve o briefing da cena para o
// prompt da imagem. "Não se muda a escala, muda-se a ontologia."

export type Escala = 'micro' | 'intima' | 'social' | 'ecologica' | 'civilizacional';

export const PALETA_MUNDO =
  'palette of warm whites, soft gold, pearl, champagne, pale sand, sage green, mist rose, matte silver; nothing saturated; ' +
  'light emitted by the matter itself; technology invisible and fully integrated into living ecology; ' +
  'bright, luminous, crystal-clear, razor-sharp ultra-high resolution; no haze, no fog, no murk, no heavy shadows';

export const EVITAR_MUNDO =
  'The SUBJECT is NEVER a landscape and NEVER a lone human silhouette standing in scenery; ' +
  'NO tropical valley / forest / river / canyon vista, NO Avatar / fantasy / resort / book-cover look; the place is NEVER the point. ' +
  'NEVER a terrestrial object nor a futuristic version of our things; NEVER ordinary trees, birds, flowers, dogs, hands, houses, rivers or cities; ' +
  'NEVER cyberpunk, neon, robots, holograms, ships, screens; NEVER monumentality as the default; no text, no letters, no watermark, no logos';

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
    `ETHNOGRAPHY of a civilization that NEVER existed — a National Geographic photograph from the year 2300 of a world that is NOT Earth, the FUNCTIONAL EQUIVALENT, never the future of Earth. ` +
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
    `${PALETA_MUNDO}. ${EVITAR_MUNDO} ${NAO_E_GLOBAL}${naoEItem} ` +
    `BRUTAL TEST before you finish: if the caption were removed, would someone ask "what does this MEAN?" (FAIL) or "what IS this object/being/ritual, who uses it, what happened?" (PASS)? Only the second is acceptable.`;
  return { escala: s?.reino ? 'ecologica' : 'intima', funcao, pergunta, categoria: s?.tipo_en ?? 'objecto', evento, briefing };
}

// ─── MOTOR 2 · WORLDBUILDING (worldbuilding/banco_worldbuilding.json) ───────────────
// NÃO parte da frase. Parte da CIVILIZAÇÃO: escolhe uma CENA QUOTIDIANA (e, se houver,
// um fragmento concreto: instituição/profissão/espécie/espaço) e compõe o "documentário
// fotográfico de um dia normal" — a lógica que gerou as imagens fortes. Aqui a escala
// PODE variar (de íntima a uma vista da cidade). A imagem partilha a civilização com o
// texto, mas não o ilustra. "Que fotografia tiraria um antropólogo num dia normal?"
interface CenaQ { categoria: string; descricao: string; escala?: string }
interface ItemMundo { nome: string; funcao?: string; descricao?: string; equivalente_terrestre?: string }
const CENAS_Q = (mundo.CENAS_QUOTIDIANAS ?? []) as CenaQ[];
const FRAGMENTOS: ItemMundo[] = ['INSTITUICOES', 'PROFISSOES', 'ESPECIES', 'ESPACOS', 'OBJETOS', 'RITUAIS']
  .flatMap((k) => ((mundo as Record<string, unknown>)[k] ?? []) as ItemMundo[]);

export function cenaWorldbuilding(seed = 0): CenaVisual {
  const cena = CENAS_Q.length ? CENAS_Q[idx(seed, CENAS_Q.length)] : null;
  // um fragmento concreto para ancorar (objecto/ser/instituição desta civilização).
  const frag = FRAGMENTOS.length ? FRAGMENTOS[idx(seed * 5 + 2, FRAGMENTOS.length)] : null;
  const categoria = cena?.categoria ?? 'vida quotidiana';
  const descricao = cena?.descricao ?? 'um momento de um dia normal desta civilização';
  const enquadramento = cena?.escala ?? 'íntima ou média';
  const briefing =
    `DOCUMENTARY photograph an anthropologist would take on a NORMAL DAY in a civilization that NEVER existed — a National Geographic photo of a world that is NOT Earth (the functional equivalent, never the future of Earth). ` +
    `Start from the CIVILIZATION, not from a phrase. DAILY-LIFE CATEGORY: ${categoria}. THE SCENE: ${descricao}. ` +
    (frag ? `You may anchor it with a concrete element of this world: the "${frag.nome}"${frag.descricao ? ` (${frag.descricao})` : ''}. ` : '') +
    `Real people of this civilization, living WITH the world (symbiotic relations, living instruments, conscious materials, living architecture); faces present, without vigilance; relations rather than isolated individuals. ` +
    `FRAMING: ${enquadramento} (scale may vary, from a close detail to a city seen breathing). Candid, lived-in, real, NOT staged, NOT an advertisement. ` +
    `${PALETA_MUNDO}. NEVER Earth, NEVER a futuristic version of Earth, NEVER cyberpunk/neon/robots/ships/screens, NEVER self-help symbolism (a glowing orb or a flower in cupped hands), no text, no letters, no watermark, no logos. ` +
    `TEST: without a caption the image must make someone ask "what civilization is this? how do they live?", never "where is this place?" nor "what does this mean?".`;
  const escala: Escala = enquadramento.includes('civiliz') ? 'civilizacional' : enquadramento.includes('eco') ? 'ecologica' : enquadramento.includes('social') ? 'social' : 'intima';
  return { escala, funcao: categoria, pergunta: `como vivem: ${categoria}`, categoria, evento: descricao, briefing };
}
