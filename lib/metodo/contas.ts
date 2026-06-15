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
  | 'Permanência';

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
  /** Atmosfera emocional da conta (o "mundo" visual). Alimenta o fundo Flux:
   *  cada imagem nasce deste mundo, com um elemento variado. */
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
      prompt: 'cool contemplative atmosphere, petrol blue and cool grey with soft white light, serene and still, the feeling of silence after the noise',
      elementos: ['soft fog drifting over a quiet city', 'rain running down a window pane', 'a misty calm lake at dawn', 'a quiet empty room in cool grey light', 'soft reflections on wet pavement', 'mist among tall pine trees', 'a calm grey sea under a pale sky', 'condensation on cold glass', 'a lighthouse beam through fog', 'soft shadows on a pale wall', 'a still rainy street at dusk', 'a single chair by a cool grey window'],
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
      prompt: 'warm tender atmosphere, terracotta amber and warm brown with soft golden light, the feeling of finally setting down a weight, intimate and held',
      elementos: ['a warm cup of tea on a windowsill', 'golden hour light across a wooden floor', 'an empty armchair in warm lamplight', 'a single lit candle on a table', 'sunlight through soft linen curtains', 'a quiet kitchen corner at sunset', 'the warm glow of a lamp in a cosy room', 'an open book in golden light', 'a blanket draped over a sofa', 'warm evening light on a brick wall', 'steam rising from a mug', 'soft embers in a quiet hearth'],
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
      prompt: 'lush living green atmosphere, verdant plants and foliage, soft green and warm solar gold light, airy alive and bright, the feeling of stepping back into your own life',
      elementos: ['sunlight through fresh green leaves', 'a lush green forest clearing', 'ferns unfurling in soft green light', 'a green meadow full of wildflowers', 'morning light through a green canopy', 'dew on green grass at sunrise', 'a winding path through green woods', 'climbing plants on a sunlit wall', 'a green valley opening to the light', 'tall grasses swaying in warm light', 'moss and green leaves in dappled light', 'a garden alive in early summer light'],
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
    veus: ['Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência'],
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
      elementos: ['a long candlelit corridor', 'an ornate doorway opening to golden light', 'a spiral staircase fading into shadow', 'old books beside a single candle', 'sheer veils drifting in golden light', 'an antique key on dark velvet', 'golden light pouring through a stone arch', 'a dim library aisle with warm light', 'a single lantern in the dark', 'gold dust floating in a shaft of light', 'a moonlit threshold', 'an old mirror in candlelight'],
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
export function fundoDaConta(conta: Conta, i = 0): string {
  const els = conta.atmosfera.elementos;
  const idx = ((i % els.length) + els.length) % els.length;
  const el = els[idx];
  const enq = ENQUADRAMENTOS[((i % ENQUADRAMENTOS.length) + ENQUADRAMENTOS.length) % ENQUADRAMENTOS.length];
  // o ASSUNTO (elemento) varia muito; a atmosfera dá só o ambiente (luz, cor, sensação).
  return `${el}, ${enq}, ${conta.atmosfera.prompt}, ${conta.atmosfera.textura}, ${COMUM}`;
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
