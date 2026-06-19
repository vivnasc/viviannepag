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
  /** PORTAS: a FRASE-MÃE — a confissão recorrente que une os 2 véus da porta num
   *  só movimento humano (tensão causal, não dois temas lado a lado). É a
   *  identidade SENTIDA em QUALQUER post, em qualquer ordem (voz primeiro, arco
   *  depois). Infiltra-se na geração de todas as dores da conta. A mãe não tem:
   *  é a vista panorâmica (essa corre pelo percurso trimestral). */
  fraseMae?: string;
  /** PORTAS: as sensações que se REPETEM (a textura emocional do mundo da conta).
   *  Alimentam a geração para o feed reforçar sempre a mesma identidade. */
  sensacoes?: string[];
  /** PORTAS: o verbo de CHEGADA do movimento, o que distingue o fim de cada porta
   *  (ver: testemunhar · vir: regressar · viver: participar). */
  chegada?: string;
  /** FILHAS · "A CENA PRIMEIRO": a pergunta que a mulher se faz a si própria (a
   *  espinha da conta), NUNCA o nome do véu. Só ver/vir/viver. */
  perguntaEspinha?: string;
  /** FILHAS · a assinatura discreta no fim da peça (revelar · regressar · encarnar). */
  assinatura?: string;
  /** FILHAS · MOLDE da forma "cena primeiro": exemplos de micro-cenas concretas do
   *  dia a dia (a cena ilumina, não se explica; tão específica que a pessoa pensa
   *  numa cara). É finito, por isso NÃO é a fonte de conteúdo: ensina só a FORMA. O
   *  gerador escreve cenas NOVAS nesta forma a partir do SABER (que não acaba). */
  bancoCenas?: string[];
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
  atmosfera: { sensacao: string; fraseVisual: string; prompt: string; elementos: string[]; registos: string[]; textura: string };
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
    fraseMae: 'Estou sempre no que aí vem ou no que já passou, nunca no agora.',
    sensacoes: ['a cabeça que não desliga', 'pensar de mais, antecipar tudo', 'reviver o que já passou', 'ruído interno constante', 'nunca estar mesmo no presente'],
    chegada: 'testemunhar (ver a tempestade de fora)',
    perguntaEspinha: 'Porque faço isto sem reparar?',
    assinatura: 'revelar',
    bancoCenas: [
      'respondes "está tudo bem" antes de saber se está',
      'planeias a resposta antes de ouvir a pergunta',
      'pesquisas os sintomas dos outros e ignoras os teus',
      'adormeces a refazer o dia inteiro na cabeça',
      'o teu marido chega vinte minutos atrasado e na tua cabeça já houve uma discussão inteira',
      'ainda estás a reler uma mensagem que a outra pessoa já esqueceu',
      'já estás zangada com uma conversa que ainda não aconteceu',
      'ele demora a responder e tu já inventaste o motivo, o desfecho e a despedida',
      'ensaias no chuveiro o que vais dizer numa reunião que é só para a semana',
      'lês "podemos falar?" e o estômago cai antes de saberes do que se trata',
      'acordas às quatro da manhã a resolver um problema que ainda não existe',
      'alguém faz uma cara e tu passas o dia a decidir o que ela queria dizer',
      'guardas as conversas más de cor e esqueces os elogios no mesmo dia',
      'preparas-te para a pior versão de cada notícia, só para não seres apanhada',
      'antes de uma festa já imaginaste três maneiras de a noite correr mal',
      'relês a mensagem que enviaste à procura do que possa ter soado mal',
      'decides que a amiga está chateada porque demorou a pôr gosto',
      'fazes as contas todas de uma discussão antes de a teres com a pessoa',
      'o telemóvel toca com um número desconhecido e já é uma desgraça',
      'revives à noite uma coisa que disseste há dez anos e ainda te encolhes',
      'no meio de um jantar bom já estás a pensar em quando vai acabar',
      'percebes o tom de voz de toda a gente menos quando estás em paz',
      'preparas o que vais dizer ao médico e esqueces-te de ouvir o que ele diz',
      'estás de férias e a cabeça continua na caixa de entrada do trabalho',
    ],
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
      prompt: 'cool contemplative atmosphere, petrol blue and cool grey, serene and still, the feeling of watching the storm pass from a calm distance, silence after the noise',
      elementos: ['a calm far shore facing a vast still expanse of water', 'a high window looking out over a distant misty city', 'fog slowly lifting to reveal a quiet open horizon', 'a long pier reaching out into calm pale water', 'a lighthouse beam crossing slow drifting mist', 'rain easing on the far side of a wide glass window', 'storm clouds parting over a calm distant plain', 'a still mirror-like lake holding a pale sky', 'a quiet threshold between a dim room and pale daylight', 'a wide empty shoreline under soft grey light', 'a calm bank watching a slow river drift past', 'mist clearing from tall quiet pines'],
      // luz/hora (dentro do mundo frio): muda o brilho e a hora de post para post,
      // para o feed não sair todo com a mesma luz (a causa de parecer tudo igual).
      registos: ['the cold light just before dawn', 'soft silver overcast light', 'pale light diffused through mist', 'low cool side light', 'rain-washed grey light', 'the clearing light after a storm'],
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
    fraseMae: 'Não paro porque não aguento o que sinto quando paro.',
    sensacoes: ['exaustão de quem faz tudo', 'culpa ao parar', 'não saber receber', 'medo do silêncio e do vazio', 'encher o tempo para não sentir'],
    chegada: 'regressar (voltar a casa, a si)',
    perguntaEspinha: 'Quando foi que me perdi de mim?',
    assinatura: 'regressar',
    bancoCenas: [
      'tens catorze separadores abertos e nem um és tu',
      'planeaste as férias de todos e voltaste mais cansada',
      'a tua lista tem trinta coisas e nenhuma é para ti',
      'acordas já a resolver antes de pôr os pés no chão',
      'entraste na cozinha para beber água, respondeste a uma mensagem, arrumaste uma gaveta, e esqueceste-te da água',
      'tens cinco minutos livres, o corpo quer sentar-se e a cabeça inventa-te uma tarefa',
      'sabes a marca do iogurte de toda a gente lá de casa e não sabes qual é o teu',
      'sentas-te ao fim do dia e levantas-te logo porque te lembraste de uma coisa',
      'quando alguém te pergunta o que te apetece, ficas em branco',
      'marcas as consultas de todos e a tua está adiada há meses',
      'dás o último pedaço, o melhor lugar, a manta, e ficas com o resto',
      'alguém te oferece ajuda e dizes "não, eu trato" antes de pensar',
      'o teu corpo dói e a tua resposta é "logo vejo isso"',
      'choras no carro à porta de casa e entras a sorrir',
      'tens fotografias de toda a gente e quase nenhuma tua',
      'a casa fica em silêncio e tu vais procurar o que arrumar',
      'dizes que estás bem tantas vezes ao dia que já nem reparas',
      'lembras-te dos remédios e das chaves deles e perdes os teus óculos na cabeça',
      'quando paras, vem uma culpa, como se descansar fosse roubar',
      'tens uma massagem marcada e desmarca-la para levar alguém a algum lado',
      'ao domingo à noite já estás a viver a segunda-feira de toda a gente',
      'precisas de ajuda e, em vez de pedir, fazes tu mais depressa',
      'és a que toda a gente liga quando está mal, e não sabes a quem ligas tu',
      'acabas tudo o que tinhas a fazer e sentes-te estranha por não teres nada a fazer',
    ],
    veus: ['Esforço', 'Desolação'],
    simbolo: 'o colo',
    fundoBase:
      'a soft cupped hollow of warm golden light cradled in deep shadow, ' +
      'like a held nest or a quiet hearth, tender and sheltering, abstract, no figure',
    cor: '#e8bd84',
    paleta: { bg1: '#1b2742', bg2: '#0e1526', accent: '#e8bd84' }, // VIR (Chamamento): azul nocturno + dourado/cobre
    atmosfera: {
      // VESTE do universo VIR · o Chamamento (do documento mestre): dourado, âmbar,
      // cobre, azul nocturno · símbolos: bússolas, portais, rios de luz, aves
      // migratórias, fios dourados, constelações-guia, mapas celestes, espirais.
      sensacao: 'algo antigo a chamar-te de volta ao teu centro',
      fraseVisual: 'um fio de luz que te leva de volta a ti',
      prompt: 'the Calling: warm gold, amber, copper over deep night-blue, the feeling of something ancient calling you back to your own centre, returning home from dispersion, intimate and vast at once',
      elementos: ['an ancient compass with a glowing needle turning toward a still centre', 'a luminous golden spiral drawing inward to a calm point', 'a golden portal opening between slow drifting stars', 'a river of golden light winding across a deep night sky', 'migrating birds following a thread of light toward home', 'fine golden threads weaving a path through the dark', 'an old celestial map glowing with constellation lines', 'a guiding constellation pulsing softly over a dark horizon', 'a crescent moon above a quiet path between stars', 'a labyrinth of light seen from above, leading to its centre', 'a bridge of light arching across the dark between two points', 'a single warm star steady amid slow cosmic dust'],
      // luz/hora dentro do mundo do Chamamento (ouro/cobre sobre azul nocturno).
      registos: ['deep night-blue with warm gold light', 'amber glow against near-black', 'copper light through cosmic dust', 'soft distant starlight', 'golden hour fading into a night sky', 'warm light breaking the dark'],
      textura: 'luminous flowing particles, cinematic depth, warm gold over deep dark, fine grain',
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
    fraseMae: 'Adio a vida que quero porque mudar seria deixar de ser quem sempre fui.',
    sensacoes: ['adiar a vida para um quando', 'chegar e nunca chegar', 'agarrar-se a quem já se foi', 'medo de mudar e de expandir', 'viver na próxima ou na antiga versão de si'],
    chegada: 'participar (entrar na vida, agora)',
    perguntaEspinha: 'O que estou à espera para começar?',
    assinatura: 'encarnar',
    bancoCenas: [
      'o livro que vais ler "quando tiver tempo"',
      'a viagem adiada para "quando der"',
      'o curso comprado e nunca aberto',
      '"começo na segunda" há trezentas segundas',
      'guardaste a loiça boa para uma ocasião especial que nunca chegou',
      'tens um vestido que adoras e esperas o corpo certo para o usar',
      'a vela guardada, o perfume guardado, a loiça guardada, e a vida também',
      'dizes que vais ter o ateliê, a horta, as aulas de dança, depois',
      'tens o serviço de chá da avó dentro do armário há quinze anos',
      'compraste a tinta para o quarto há dois anos e as latas continuam fechadas',
      'adias a consulta, a viagem, a conversa, para um tempo com calma que nunca vem',
      'guardas as roupas boas para um dia que mereça, e os dias passam de fato de treino',
      'tens uma lista de sítios para visitar e vais sempre ao mesmo café',
      'dizes "quando os miúdos crescerem" como se a tua vida viesse a seguir à deles',
      'esperas estar pronta para começar, e a vida não espera que estejas',
      'tens um caderno bonito demais para escreveres nele',
      'fotografas tudo para ver depois e nunca abres a pasta',
      'dizes "para o ano" há tantos anos que já é uma morada',
      'guardas o melhor de ti para quando a casa estiver arrumada',
      'tens planos para a reforma e nenhum para domingo',
      'esperas o sinal certo para mudar, e o sinal és tu a decidires',
      'ficas onde já não cabes porque sair dá mais medo do que ficar',
      'dizes que mudavas tudo, e ao café pedes sempre o mesmo',
      'tens a mala meio feita há anos para uma viagem que adias todos os verões',
    ],
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
      prompt: 'soft verdant green and warm gold light as the PALETTE (alive, fresh, present), the feeling of finally stepping into your own life now, grounded and unhurried',
      // verde é a IDENTIDADE da viver, mas verde NÃO é só floresta: prado, água,
      // plantas, interior com verde, estufa, lago — variedade DENTRO do verde.
      elementos: ['a sunlit green meadow rolling toward the horizon', 'close-up of dewy green leaves in soft morning light', 'a calm river between green banks under a bright sky', 'potted plants and fresh herbs on a sunlit windowsill', 'a lush bright greenhouse full of light', 'soft green hills under a wide clear sky', 'young ferns unfurling in soft green light', 'ivy climbing a sunlit pale wall', 'a green garden path opening into light', 'water lilies on a calm green pond', 'a bright kitchen with fresh herbs and greens by the window', 'wildflowers and moss in a sunlit green clearing'],
      // luz/hora (dentro do mundo verdejante): da madrugada à hora azul, para o
      // feed deixar de ser uma só parede verde sempre com a mesma luz.
      registos: ['fresh first dawn light', 'clear bright morning air', 'warm afternoon sun', 'soft overcast daylight', 'golden-hour backlight', 'the cool stillness of blue hour'],
      textura: 'air, space, depth, soft natural light',
    },
    manifestoLinha: 'Não estás atrasada para lugar nenhum.',
    manifestoLinhas: [
      'Não estás atrasada para lugar nenhum.',
      'A tua vida não começa depois. Já começou.',
      'Não há nenhum comboio a partir sem ti.',
      'Não estás atrasada. É a pressa que te faz perder a vida que está a acontecer agora.',
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
      prompt: 'cinematic warm candlelit atmosphere, glowing gold and deep teal-blue, rich and LUMINOUS (clearly lit, never pitch black), archetypal and symbolic, a secret library of the soul filled with warm light',
      elementos: ['an open old book glowing in warm candlelight', 'a sunlit dust-filled grand hall with tall windows', 'golden light pouring generously through an ancient stone arch', 'an antique key resting on a table in warm light', 'sheer veils glowing before a bright shaft of gold light', 'a warm-lit library aisle rich with old books', 'a tall window dropping bright gold light across a room', 'an old map unrolled under warm lamplight', 'a doorway opening from shadow into radiant gold light', 'a candlelit table with an open book and a warm glow', 'morning light flooding a grand old hall', 'a spiral staircase warmly lit from above'],
      // luz/hora (mundo da mãe): a fonte de luz varia mas SEMPRE ilumina de facto
      // (a Vivianne pediu MENOS escuridão) — ouro quente e legível, não quase-preto.
      registos: ['warm candle glow filling the room', 'bright gold light through tall windows', 'soft warm lamplight', 'first morning light entering a grand hall', 'firelight warming the whole scene', 'a radiant shaft of gold light'],
      textura: 'painterly, warm gold light, rich but luminous shadow, cinematic and clearly readable',
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
      'Não precisas de quem te complete. Precisas de parar de te abandonar.',
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
  const regs = conta.atmosfera.registos;
  const el = els[mod(i, els.length)];
  const enq = ENQUADRAMENTOS[mod(j, ENQUADRAMENTOS.length)];
  // luz/hora DESFASADA do assunto e do enquadramento (offset +2), para posts
  // seguidos não saírem todos com a mesma luz — era isso que tornava o feed
  // monótono ("tudo a mesma imagem"). O ASSUNTO varia, a LUZ varia, o enquadramento varia.
  const reg = regs[mod(i + 2, regs.length)];
  return `${el}, ${reg}, ${enq}, ${conta.atmosfera.prompt}, ${conta.atmosfera.textura}, ${COMUM}`;
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
