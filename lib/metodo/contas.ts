// Método VS · as 3 contas (portas): canon
//
// Pipeline NOVO e SEPARADO da veu.a.veu. Não toca em lib/veu/*.
// Eixo descoberto (não inventado) dentro do próprio método: Ver, Vir, Viver.
//   Ver   = consciência (sair de dentro da tempestade e ver).
//   Vir   = regresso (parar de empurrar e regressar a si).
//   Viver = integração (entrar na própria vida, encarná-la).
//
// VS = Ver e Soltar = Vivianne Saraiva. SV = Sete Véus = Soltar o Véu.
//
// Regras de voz (invioláveis, ver CONTINUIDADE-METODO-VS.md):
//  - Travessões BANIDOS (—, –). Vírgulas, dois pontos, parênteses, ponto final.
//  - Português europeu, sereno, literário, sem hype, sem urgência artificial.
//  - Autoridade do caminho ("reconheci primeiro em mim"). Nunca inventar biografia.
//
// Identidade visual (família das capas, ver COVER-PROMPTS-METODO-VS.md):
//   base indigo-profundo e beringela, luz de ouro quente, textura renascentista
//   pintada, sfumato, contemplativo e intemporal. Sem pessoas, sem texto.
//   Cada conta tem o SEU símbolo: a margem · o colo · descalça.

export type ContaId = 'ver' | 'vir' | 'viver' | 'mae';
export type VeuNome =
  | 'Turbilhão'
  | 'Memória'
  | 'Esforço'
  | 'Desolação'
  | 'Horizonte'
  | 'Permanência'
  | 'Dualidade';

export interface Conta {
  id: ContaId;
  /** Movimento (canon): Ver · Vir · Viver (a mãe é o método inteiro). */
  movimento: string;
  /** Handle de Instagram (a fechar, ver CONTAS-METODO-VS.md). */
  handle: string;
  /** marca = id da conta no enum partilhado (lib/instagram/contas.ts). */
  marca: string;
  /** Essência do movimento numa palavra/sintagma. */
  essencia: string;
  /** O que a pessoa é depois (a transformação). */
  depois: string;
  /** Os dois véus que este movimento recolhe (o cacho). */
  veus: VeuNome[];
  /** Símbolo visual desta conta (família das capas). */
  simbolo: string;
  /** Prompt-base do fundo dos reels (família comum + símbolo da conta). */
  fundoBase: string;
  /** Cor de acento para o admin (= paleta.accent). */
  cor: string;
  /** Paleta PRÓPRIA da conta (identidade distinta, não a da veu.a.veu). */
  paleta: { bg1: string; bg2: string; accent: string };
  /** Atmosfera emocional da conta (o "mundo" visual). Alimenta o fundo Flux.
   *  PRINCÍPIO (descoberto a olhar contas virais): a imagem não ilustra o texto,
   *  REPRESENTA o estado psicológico por trás dele. Por isso os `elementos` são
   *  AMBIENTES SIMBÓLICOS de transição (limiares, portas, corredores, margens,
   *  nevoeiro, água, escadas) que encarnam o movimento da conta (ver da margem ·
   *  regressar a casa · atravessar o limiar para a vida · descer à estrutura
   *  oculta), não objetos literais. A linguagem repete-se = identidade. */
  atmosfera: { sensacao: string; fraseVisual: string; prompt: string; elementos: string[]; textura: string };
  /** Linha de manifesto (declarativa, curta): o 10% manifesto. (= manifestoLinhas[0]) */
  manifestoLinha: string;
  /** Manifestos da conta (declarações de 10 palavras, alto potencial de circulação). */
  manifestoLinhas: string[];
  emoji: string;
  /** Bios canónicas (CONTAS-METODO-VS.md). */
  bioPT: string;
  bioEN: string;
  /** Palavra do CTA por comentário. */
  comentaPalavra: string;
  ctaPT: string;
  /** Produto que esta porta vende. */
  manualNome: string;
  manualPrecoEur: number;
  /** Ficheiro-fonte do manual (para garimpo e citações). */
  manualFonte: string;
}

// A família comum a todas as capas/fundos (o que faz a coleção ser coleção).
// Equilíbrio: luz E sombra, não penumbra. Luminoso, arejado, sereno.
export const FUNDO_FAMILIA =
  'fine-art painterly background, soft natural light, luminous and airy, light ' +
  'and shadow in gentle balance, soft warm and cool tones, contemplative and ' +
  'serene, generous calm space, NO people, NO faces, NO figures, NO hands, NO ' +
  'text, NO letters, NO watermark, vertical 9:16';

export const CONTAS: Record<ContaId, Conta> = {
  ver: {
    id: 'ver',
    movimento: 'Ver',
    handle: 'ver.soltar',
    marca: 'versoltar',
    essencia: 'a consciência',
    depois: 'Sai de dentro da cabeça e vê a tempestade passar de terra.',
    veus: ['Turbilhão', 'Memória'],
    simbolo: 'a margem',
    fundoBase:
      'a calm still expanse of dark water with a single thin line of warm ' +
      'light on the far horizon, seen from the near shore, serene, room to breathe',
    cor: '#cdd8df',
    paleta: { bg1: '#324a59', bg2: '#1c2a33', accent: '#cdd8df' }, // azul petróleo, cinza frio, branco suave
    atmosfera: {
      sensacao: 'silêncio depois do ruído',
      fraseVisual: 'alguém observa a tempestade sem estar dentro dela',
      prompt: 'cool contemplative atmosphere, petrol blue and cool grey with soft white light, serene and still, the feeling of watching the storm pass from a calm distance, silence after the noise',
      elementos: ['a calm far shore facing a vast still expanse of water', 'a high window looking out over a distant misty city', 'fog slowly lifting to reveal a quiet open horizon', 'a long pier reaching out into calm pale water', 'a lighthouse beam crossing slow drifting mist', 'rain easing on the far side of a wide glass window', 'storm clouds parting over a calm distant plain', 'a still mirror-like lake holding a pale sky', 'a quiet threshold between a dim room and pale daylight', 'a wide empty shoreline under soft grey light', 'a calm bank watching a slow river drift past', 'mist clearing from tall quiet pines'],
      textura: 'shallow depth of field, soft blur, wet glass, fine grain',
    },
    manifestoLinha: 'Nem tudo o que passa pela tua cabeça merece um lugar na tua vida.',
    manifestoLinhas: [
      'Nem tudo o que passa pela tua cabeça merece um lugar na tua vida.',
      'Pensar não é ver.',
      'A paz não é a cabeça em silêncio. É deixares de te agarrar ao barulho.',
    ],
    emoji: '🌊',
    bioPT:
      'Não consegues desligar a cabeça? Aprende a criar distância dos ' +
      'pensamentos sem lutares contra eles. Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Can’t switch your head off? Learn to create distance from your ' +
      'thoughts without fighting them. Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VER',
    ctaPT: 'Comenta VER e envio-te o primeiro passo, de graça.',
    manualNome: 'ver.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VER-SOLTAR-PT.md',
  },
  vir: {
    id: 'vir',
    movimento: 'Vir',
    handle: 'vir.soltar',
    marca: 'virsoltar',
    essencia: 'o regresso',
    depois: 'Para de empurrar, regressa a si, deixa-se segurar e descansar.',
    veus: ['Esforço', 'Desolação'],
    simbolo: 'o colo',
    fundoBase:
      'a soft cupped hollow of warm golden light cradled in deep shadow, ' +
      'like a held nest or a quiet hearth, tender and sheltering, abstract, no figure',
    cor: '#e8bd84',
    paleta: { bg1: '#6a4838', bg2: '#322218', accent: '#e8bd84' }, // terracota, âmbar, castanho quente, dourado suave
    atmosfera: {
      sensacao: 'finalmente pousar',
      fraseVisual: 'o momento em que alguém larga o peso que carregava',
      prompt: 'warm tender atmosphere, terracotta amber and warm brown with soft golden light, the feeling of coming home and being received after a long day, warm and sheltering, room to breathe',
      elementos: ['a warm lit doorway at the end of a darkening path', 'a small harbour with warm lights glowing at dusk', 'a lit window seen from the cold outside, welcoming', 'a glowing hearth in a dim quiet room', 'a sheltered hollow cupped in warm golden light', 'a covered porch glowing at the end of the day', 'lantern light marking a path leading home', 'a warm passage opening toward golden light', 'an open gate into a sheltered warm garden', 'a quiet valley holding the last warm light', 'a soft nest of warm light deep in shadow', 'a doorway spilling warm light onto a cold step'],
      textura: 'analog film, warm grain, soft warm light',
    },
    manifestoLinha: 'Não precisas de carregar tudo para mereceres o teu lugar.',
    manifestoLinhas: [
      'Não precisas de carregar tudo para mereceres o teu lugar.',
      'Descansar não é desistir.',
      'O amor que se paga com exaustão não era amor, era medo.',
    ],
    emoji: '🤲',
    bioPT:
      'Fazes tudo por toda a gente e sentes culpa quando pensas em ti? ' +
      'Aprende a descansar sem culpa e a deixar-te apoiar. Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Do everything for everyone and feel guilty when you think of ' +
      'yourself? Learn to rest without guilt and let yourself be supported. ' +
      'Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VIR',
    ctaPT: 'Comenta VIR e envio-te o primeiro passo, de graça.',
    manualNome: 'vir.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VIR-SOLTAR-PT.md',
  },
  viver: {
    id: 'viver',
    movimento: 'Viver',
    handle: 'viver.soltar',
    marca: 'viversoltar',
    essencia: 'a integração',
    depois:
      'Sai da sala de espera, tira a armadura dos papéis e entra na própria vida, agora.',
    veus: ['Horizonte', 'Permanência'],
    simbolo: 'descalça',
    fundoBase:
      'an open doorway seen from inside a dark room, the threshold and the ' +
      'ground just beyond it bathed in warm morning light, a path of light leading out',
    cor: '#cfe0a0',
    paleta: { bg1: '#3e5a4f', bg2: '#21302a', accent: '#cfe0a0' }, // azul claro, verde suave, dourado solar
    atmosfera: {
      sensacao: 'voltar a entrar na própria vida',
      fraseVisual: 'alguém que deixa de esperar e começa a caminhar',
      prompt: 'living green nature, soft green and warm solar gold light, airy alive and bright, the feeling of crossing the threshold into your own life',
      elementos: ['an open doorway onto a sunlit green landscape', 'a threshold from shadow into bright green light', 'a path beginning across a sunlit green meadow', 'wide gates opening onto green fields in the sun', 'a bridge crossing into a bright green valley', 'a forest opening into a clearing full of light', 'an open window onto a living green morning', 'a green hillside path rising toward open sky', 'light pouring through an archway into greenery', 'stepping stones crossing a clear green stream', 'a road unfolding through bright green hills', 'a garden gate ajar onto sunlit green'],
      textura: 'air, space, depth, verdant and clear, soft warm sunlight',
    },
    manifestoLinha: 'Não estás atrasada para lugar nenhum.',
    manifestoLinhas: [
      'Não estás atrasada para lugar nenhum.',
      'A tua vida não começa depois. Já começou.',
      'Não há nenhum comboio a partir sem ti.',
    ],
    emoji: '🌅',
    bioPT:
      'Estás sempre à espera que a tua vida comece? Aprende a sair do ' +
      '"depois" e a transformar o que já compreendeste em mudança real. ' +
      'Método VS · Ver e Soltar 🕯️ ↓',
    bioEN:
      'Always waiting for your life to begin? Learn to step out of the ' +
      '"later" and turn what you understand into real change. Method VS · See and Release 🕯️ ↓',
    comentaPalavra: 'VIVER',
    ctaPT: 'Comenta VIVER e envio-te o primeiro passo, de graça.',
    manualNome: 'viver.soltar',
    manualPrecoEur: 9,
    manualFonte: 'VIVER-SOLTAR-PT.md',
  },
  // A conta-mãe: a largura (o método inteiro, transversal), a voz da autora,
  // difunde o pilar Os Sete Véus (€19). É o mundo do mistério (escuro, cinematográfico).
  mae: {
    id: 'mae',
    movimento: 'Ver e Soltar',
    handle: 'vivianne.dos.santos',
    marca: 'loja', // publica na conta vivianne.dos.santos (já existente)
    essencia: 'o método inteiro',
    depois: 'Vês o que te prende e soltas o que te faz repetir, véu a véu.',
    // a mãe segura os SETE véus. A Dualidade (o 7.º) é território só dela: a raiz
    // comum que as portas não cobrem (ver/vir/viver repartem os outros seis).
    veus: ['Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência', 'Dualidade'],
    simbolo: 'o limiar',
    fundoBase:
      'an ancient ornate stone archway opening onto warm radiant golden light, ' +
      'seen straight on, a threshold, cinematic chiaroscuro',
    cor: '#d8b25a',
    paleta: { bg1: '#1a1726', bg2: '#0b0a13', accent: '#d8b25a' }, // preto, dourado, azul profundo
    atmosfera: {
      sensacao: 'entrar numa biblioteca secreta da alma',
      fraseVisual: 'existe algo por trás do que vês',
      prompt: 'cinematic mysterious atmosphere, deep black, gold and deep blue, candlelit, archetypal and symbolic, the feeling of entering a secret library of the soul',
      elementos: ['a long candlelit corridor fading into deep shadow', 'an ornate doorway opening onto radiant golden light', 'a spiral staircase descending into darkness', 'a hidden passage lit by a single distant flame', 'sheer veils parting before a shaft of gold light', 'a vast dim library aisle in warm candlelight', 'golden light pouring through an ancient stone arch', 'an antique mirror holding a single candle flame', 'a threshold between deep dark and warm gold', 'a high window dropping a shaft of light into the dark', 'an arched gateway into glowing darkness', 'a chamber of old books touched by gold light'],
      textura: 'cinematic, chiaroscuro, symbolic, warm gold on deep dark',
    },
    bioPT:
      'Continuas a repetir o que te faz sofrer? Ajudo-te a reconhecer os padrões ' +
      'invisíveis por trás da ansiedade, da culpa e das relações que se repetem. ' +
      'Método VS · Ver e Soltar 📖 Os Sete Véus ↓',
    bioEN:
      'Do you keep repeating what makes you suffer? I help you recognise the ' +
      'invisible patterns behind anxiety, guilt and relationships that keep ' +
      'repeating. Method VS 📖 The Seven Veils ↓',
    comentaPalavra: 'VÉUS',
    ctaPT: 'Descobre qual é o teu véu.',
    manualNome: 'Os Sete Véus',
    manualPrecoEur: 19,
    manualFonte: 'OS-7-VEUS-v2.md',
    manifestoLinha: 'Vê o que te prende. Solta o que te faz repetir.',
    manifestoLinhas: [
      'Vê o que te prende. Solta o que te faz repetir.',
      'Os padrões que te fazem repetir são véus. Aprende a vê-los e a soltá-los.',
      'Não há soltar sem ver.',
      'Nunca, em momento nenhum, caminhaste sozinha.',
      'A casa que procuras nunca esteve longe.',
    ],
    emoji: '✨',
  },
};

export const CONTAS_LISTA: Conta[] = [CONTAS.mae, CONTAS.ver, CONTAS.vir, CONTAS.viver];

export function getConta(id: string): Conta | undefined {
  return (CONTAS as Record<string, Conta>)[id];
}

// O fundo (prompt Flux) de um post: o MUNDO da conta + um elemento variado.
// É isto que dá a cada conta uma atmosfera própria (e evita repetir imagens).
const COMUM = 'fine-art painterly, contemplative, generous calm space, NO people, NO faces, NO figures, NO hands, NO text, NO letters, NO watermark, vertical 9:16';
// enquadramentos rodam para dar imagens DISTINTAS mesmo dentro do mesmo mundo.
const ENQUADRAMENTOS = ['wide cinematic shot', 'intimate close detail', 'soft-focus background', 'seen from above', 'low warm angle', 'distant atmospheric view'];
const mod = (n: number, m: number) => ((n % m) + m) % m;
// i = índice do ELEMENTO (assunto). j = índice do ENQUADRAMENTO (por defeito = i,
// mas pode ser dado à parte para variar o enquadramento sem repetir o assunto).
export function fundoDaConta(conta: Conta, i = 0, j = i): string {
  const els = conta.atmosfera.elementos;
  const el = els[mod(i, els.length)];
  const enq = ENQUADRAMENTOS[mod(j, ENQUADRAMENTOS.length)];
  // o ASSUNTO (elemento) varia muito; a atmosfera dá só o ambiente (luz, cor, sensação).
  return `${el}, ${enq}, ${conta.atmosfera.prompt}, ${conta.atmosfera.textura}, ${COMUM}`;
}

/** O índice do elemento atual de um prompt já gerado (lê o início do notaVisual).
 *  Serve para o "outra imagem" escolher um assunto DIFERENTE do que já lá está. */
export function indiceElementoAtual(conta: Conta, notaVisual?: string | null): number {
  if (!notaVisual) return -1;
  const inicio = notaVisual.split(',')[0].trim().toLowerCase();
  return conta.atmosfera.elementos.findIndex((e) => e.trim().toLowerCase() === inicio);
}

// O hub (conta-mãe) e a didática, aqui só para referência (não geramos por elas).
export const CONTA_MAE = {
  handle: 'vivianne.dos.santos',
  papel: 'LARGURA: a autora + o método inteiro + o pilar + o diagnóstico',
  vende: 'Os Sete Véus (pilar, €19)',
};
export const CONTA_DIDATICA = {
  handle: 'veu.a.veu',
  papel: 'DIDÁTICA: ensina (4 matérias), fora da venda. Já orquestrada. NÃO TOCAR.',
};
