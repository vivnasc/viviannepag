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
const RODA: CategoriaVisual[] = CATEGORIAS.flatMap((c) => Array.from({ length: Math.max(1, Math.round(c.peso / 5)) }, () => c));
const idx = (n: number, len: number) => ((n % len) + len) % len;

export interface CenaVisual { escala: Escala; funcao: string; pergunta: string; categoria: string; evento: string; briefing: string }

// Escolhe a cena segundo a constituição (o seed roda categoria/escala/função/pergunta/evento).
// O SUJEITO é cultura material (artefacto/organismo) + o EVENTO que lhe acontece — NUNCA a
// paisagem. A frase traduz-se no evento (não num cenário/humor). É a resposta à pergunta
// "como tornar isto antropologicamente impossível", não "como tornar isto mais bonito".
export function cenaConstituicao(seed = 0): CenaVisual {
  const cat = RODA[idx(seed, RODA.length)];
  const escala = cat.escalas[idx(seed, cat.escalas.length)];
  const funcao = FUNCOES[idx(seed * 3 + 1, FUNCOES.length)];
  const pergunta = PERGUNTAS[idx(seed * 7 + 2, PERGUNTAS.length)];
  const evento = EVENTOS[idx(seed * 5 + 3, EVENTOS.length)];
  const briefing =
    `ETHNOGRAPHY of a civilization that NEVER existed — a National Geographic photograph from the year 2300 of a world that is NOT Earth, the FUNCTIONAL EQUIVALENT, never the future of Earth. ` +
    `This image answers an ANTHROPOLOGICAL QUESTION through MATERIAL CULTURE, never through scenery. ` +
    `SCALE: ${escala} (intimate and close; the place is never the subject). CIVILIZATIONAL FUNCTION: ${funcao}. QUESTION it answers: ${pergunta} nesta civilização. ` +
    `THE SUBJECT (this is the whole image, framed close): ${cat.dica}. ` +
    `THE EVENT (the point of the image, the civilizational equivalent of the sentence's emotional movement): the subject ${evento} — but choose the precise event that mirrors the sentence. ` +
    `If a person appears, they are in RELATION with this artifact/organism, which stays the true subject; people live WITH this world, not upon it. ` +
    `Translate the FEELING of the sentence into THIS event on the artifact/organism, not into a mood or a landscape. ` +
    `${PALETA_MUNDO}. ${EVITAR_MUNDO}. ` +
    `TEST: without any caption the image must make someone ask "what happened here, in what civilization?", never "where is this place?".`;
  return { escala, funcao, pergunta, categoria: cat.id, evento, briefing };
}
