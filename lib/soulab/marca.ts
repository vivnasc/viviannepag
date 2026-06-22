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
  paleta: { bg: '#1B1726', bg2: '#0E0B16', texto: '#ECE6F2', destaque: '#C9A2E6', nome: 'Soulab' },
  hashtagsBase: ['#soulab', '#almahumana', '#simbolismo', '#arquetipos', '#contemplacao', '#imaginacao'],
  // A VOZ (decisão da Vivianne): CONVITE contemplativo, NÃO confissão. Impessoal
  // e aberto ("o que está vivo aqui?"), nunca o "isto és tu" do Método VS.
  voz: 'convite contemplativo: impessoal, aberto, "o que está vivo aqui?"; nunca confissão pessoal, nunca conselho, nunca "isto és tu"',
  // AMPLA, ANCORADA EM TI (decisão da Vivianne): a Soulab explora a alma humana em
  // geral, MAS o seu centro de gravidade é o território real da Vivianne. Estas
  // correntes dão GRAVIDADE (não são tema fixo) — atravessam o que ela cria.
  // NÃO incluem os 7 véus nem o baralho "Sou Aquela": isso é DNA do Método VS (mãe).
  territorio: [
    'transformação interior',
    'heranças e o que se transmite entre gerações',
    'a passagem da sobrevivência para a vida',
    'arquétipos e estados internos',
    'consciência e presença',
    'sentido e travessia',
    'a sombra e o que se esconde',
    'descanso, entrega e receber',
  ],
  // ÂNCORAS académicas (das cadeiras dela): PROFUNDIDADE por baixo, NUNCA nomeadas
  // no conteúdo (zero autores, zero jargão) — exatamente como as referências do
  // método. Dão fundura sem virar aula.
  ancoras: [
    'individuação e a integração da sombra',
    'sincronicidade e o numinoso',
    'as ordens do amor e as lealdades invisíveis (sistémico)',
    'o sentido que sustenta a dor, a noite escura da alma',
    'o corpo como mensageiro',
    'a ilusão de separação',
  ],
  // O ACASO (decisão da Vivianne: "vários temas aleatórios"): NÃO é um calendário
  // nem série recorrente. É uma reserva de sementes amplas e contemplativas, do
  // território dela, para o botão "surpreende-me". Sem véus, sem baralho, sem jargão.
  sementes: [
    'o limiar entre dois quartos',
    'a memória da água',
    'o que a sombra guarda quando ninguém olha',
    'o peso que confundimos com identidade',
    'o silêncio que vem depois da pergunta',
    'a herança que ninguém chegou a nomear',
    'o corpo que sabe antes da mente',
    'a coincidência que parecia um sinal',
    'o cansaço de carregar o que já não é nosso',
    'a porta que só se abre para dentro',
    'a fronteira ténue entre descansar e fugir',
    'as vozes que herdámos e tomámos por nossas',
    'o instante exato antes de adormecer',
    'a beleza do que ficou inacabado',
    'o espelho que devolve mais do que mostra',
    'a solidão que não é falta de companhia',
    'a parte de nós que ficou num lugar antigo',
    'o que cresce no escuro sem pedir licença',
    'a diferença entre estar presente e estar disponível',
    'a vertigem de não ter nada a provar',
    'o sagrado escondido num gesto pequeno',
    'o mapa que desenhamos para não nos perdermos de nós',
  ],
} as const;

/** Uma semente ampla ao acaso, para o laboratório (o botão "surpreende-me"). */
export function sementeAleatoria(): string {
  const s = SOULAB.sementes;
  return s[Math.floor(Math.random() * s.length)];
}

// A MARCA da Soulab no KineticSlide: SEM o selo "Ancorar" e SEM o rótulo do
// conceito (são da veu.a.veu), com rodapé próprio (@soulab.studio). Usada tanto no
// preview do admin como no render do MP4 (app/render-veu) — fonte única.
export const SOULAB_SLIDE: { selo: string | null; mostrarConceito: boolean; assinatura: string; site: string } = {
  selo: null,
  mostrarConceito: false,
  assinatura: `@${SOULAB.handle}`,
  site: SOULAB.handle,
};

// o mundo (palette key) que a Soulab usa no render dos reels — ver PALETAS em
// lib/estudio-conteudo.ts (entrada 'soulab').
export const SOULAB_MUNDO = 'soulab';

// TIPOS DE CONTEÚDO (a investigação da Soulab, sem achatar tudo a "frase"). Cada
// tipo é um ÂNGULO de exploração; o vehículo do 1.º passo é um reel contemplativo
// (um símbolo/imagem + um fragmento de texto), mas o ângulo muda a voz e a imagem.
export type TipoSoulabId = 'arquetipo' | 'frase' | 'simbolo' | 'imagem' | 'experiencia' | 'conceito';

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
    descricao: 'Uma figura simbólica UNIVERSAL que encarna um estado interno ou uma fase da jornada (arquétipo mítico, não o baralho do método).',
    angulo:
      'Apresenta UM arquétipo UNIVERSAL/mítico (o Eremita, a Guardiã do Limiar, o Viajante, a Sombra que pede luz, o Mensageiro…). ' +
      'NÃO uses as personagens do método ("Sou Aquela": a Salvadora, a Provedora…) nem os 7 véus — isso é da conta mãe. ' +
      'Evoca-o como uma observação de laboratório (não um manual de tarot) e deixa em aberto o estado interno que ele encarna. A imagem é a figura simbólica.',
  },
  {
    id: 'conceito',
    label: 'Conceito',
    emoji: '⊚',
    descricao: 'Uma ideia funda do estudo da alma (sombra, sentido, sincronicidade, separação) tornada poética e contemplativa — a lente ampla, ancorada.',
    angulo:
      'Pega numa ideia funda do estudo da alma (a sombra, a sincronicidade, o sentido que sustenta a dor, a individuação, a ilusão de separação, a noite escura) e torna-a uma OBSERVAÇÃO poética e aberta, nunca uma aula. ' +
      'Zero autores, zero jargão: faz VER a ideia, não a expliques. A imagem é uma metáfora visual da ideia.',
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
