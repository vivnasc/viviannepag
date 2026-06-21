// SOULAB · @soulab.studio — laboratório criativo da alma humana.
//
// QUARTO motor, SEPARADO dos outros três (veu.a.veu didática · Carrosséis 7 Véus
// loja · Método VS comercial). NÃO se mistura com nenhum: a Soulab não ensina,
// não vende, não é o método. EXPLORA. Cada publicação é uma experiência de
// laboratório (uma observação, um símbolo, uma hipótese, um fragmento).
//
// Pipeline próprio (lib/soulab/*). O conteúdo gerado vive na MESMA tabela
// (carousel_collections) com theme.marca='soulab', por isso aparece em Publicar
// e no Analítico (lib/instagram/contas.ts) sem tocar nos outros motores.

export const SOULAB = {
  id: 'soulab',
  handle: 'soulab.studio',
  nome: 'Soul Lab',
  emoji: '🧪',
  // o "guarda-chuva" conceptual: porque existe a conta e porque pode publicar uma
  // imagem, uma música, um vídeo ou uma frase sem parecer aleatório.
  posicionamento: 'Soulab — um laboratório de imagens, símbolos, ideias e experiências sobre a alma humana.',
  missao:
    'Transformar ideias abstractas da alma humana em conteúdos visuais, sonoros e ' +
    'narrativos que despertem curiosidade, contemplação e reconhecimento interior.',
  bioPT: 'Um espaço de exploração da alma através de imagens, símbolos, palavras, música e imaginação.',
  // o que a distingue: não ensina, não convence, não converte. Explora. Não dá
  // respostas definitivas; apresenta perguntas interessantes. Não segue nicho
  // rígido; segue uma investigação contínua sobre a alma humana.
  distincao: [
    'não ensina, não convence, não converte: explora',
    'não apresenta respostas definitivas: apresenta perguntas interessantes',
    'não segue um nicho rígido: segue uma investigação contínua sobre a alma humana',
  ],
  // tom da marca (a régua de cada peça).
  tom: [
    'profundo sem ser pesado',
    'espiritual sem ser religioso',
    'inteligente sem ser académico',
    'poético sem ser excessivamente místico',
    'contemplativo',
    'criativo',
    'elegante',
    'curioso',
  ],
  // identidade visual própria (escuro, elegante, lunar) — não é a paleta de
  // nenhum dos outros motores. Registada em PALETAS como mundo 'soulab'.
  paleta: { bg: '#1B1726', bg2: '#0E0B16', texto: '#ECE6F2', destaque: '#B9A8E0', nome: 'Soulab' },
  hashtagsBase: ['#soulab', '#almahumana', '#simbolismo', '#arquetipos', '#contemplacao', '#imaginacao'],
} as const;

// o mundo (palette key) que a Soulab usa no render dos reels — ver PALETAS em
// lib/estudio-conteudo.ts (entrada 'soulab').
export const SOULAB_MUNDO = 'soulab';

// TIPOS DE CONTEÚDO (a investigação da Soulab, sem achatar tudo a "frase"). Cada
// tipo é um ÂNGULO de exploração; o vehículo do 1.º passo é um reel contemplativo
// (um símbolo/imagem + um fragmento de texto), mas o ângulo muda a voz e a imagem.
export type TipoSoulabId = 'arquetipo' | 'frase' | 'simbolo' | 'imagem' | 'experiencia';

export interface TipoSoulab {
  id: TipoSoulabId;
  label: string;
  emoji: string;
  descricao: string;
  // a instrução de geração própria deste ângulo (alimenta o prompt da IA).
  angulo: string;
}

export const TIPOS_SOULAB: TipoSoulab[] = [
  {
    id: 'arquetipo',
    label: 'Arquétipo',
    emoji: '🜂',
    descricao: 'Uma personagem simbólica que representa um estado interno, um padrão humano ou uma fase da jornada.',
    angulo:
      'Apresenta UM arquétipo (uma figura simbólica: o Eremita, a Guardiã do Limiar, o Viajante, a Sombra que pede luz…). ' +
      'Nomeia-o e revela o estado interno que ele encarna, como uma observação de laboratório. NÃO o expliques como um manual de tarot: evoca-o. A imagem é a figura simbólica.',
  },
  {
    id: 'frase',
    label: 'Frase / Aforismo',
    emoji: '✶',
    descricao: 'Um pensamento breve, um aforismo, uma observação sobre a experiência humana.',
    angulo:
      'Escreve UM aforismo curto e afiado sobre a experiência da alma humana: uma observação que faz parar e pensar, nunca uma frase motivacional oca. ' +
      'Breve, denso, com uma virada. A imagem é um símbolo contemplativo abstracto.',
  },
  {
    id: 'simbolo',
    label: 'Símbolo',
    emoji: '◬',
    descricao: 'Uma observação a partir de um símbolo (a porta, o espelho, a água, o limiar, a chave).',
    angulo:
      'Parte de UM símbolo concreto (uma porta, um espelho, a água, um limiar, uma chave, uma máscara) e abre uma hipótese sobre o que ele diz da alma. ' +
      'Trata-o como um fragmento de algo maior, uma pergunta interessante. A imagem É o símbolo, em registo contemplativo.',
  },
  {
    id: 'imagem',
    label: 'Imagem contemplativa',
    emoji: '❖',
    descricao: 'Arte conceptual, surrealista, simbólica ou contemplativa, com texto mínimo.',
    angulo:
      'A IMAGEM manda (arte conceptual, surrealista, simbólica). O texto é mínimo: uma só linha que abre o sentido sem o fechar, um sussurro ao lado da imagem. ' +
      'Descreve uma imagem rica, conceptual e original.',
  },
  {
    id: 'experiencia',
    label: 'Experiência',
    emoji: '⟡',
    descricao: 'Um convite criativo: uma pergunta, um exercício de imaginação, uma observação para o espectador fazer.',
    angulo:
      'Propõe uma pequena EXPERIÊNCIA ao espectador: uma pergunta para contemplar, um exercício de imaginação, uma observação para fazer hoje. ' +
      'Convida a explorar, nunca a obedecer. Termina aberto. A imagem é um convite visual contemplativo.',
  },
];

export const getTipoSoulab = (id: string): TipoSoulab | undefined => TIPOS_SOULAB.find((t) => t.id === id);
