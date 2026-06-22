// Método VS · O BARALHO "Sou Aquela" (mãe, meio da manhã).
//
// FIXO e curado: uma carta por PERSONAGEM (lib/metodo/personagens.ts), tirada do
// material real de cada uma (essência, frases, sombra). Não se gera ao calhas: é
// um baralho a sério, estável e editável à mão. A semana ORDENA estas cartas (a
// personagem do dia → a sua carta). Voz 2026 (a mulher fala/reclama, sem "estou
// bem" nem mártir muda). Cada carta: 3 a 4 comportamentos concretos + "Sou aquela."
//
// Para afinar: edita as linhas aqui. Para travar: ficam aqui (não mudam sozinhas).

// POSES TRAVADAS por personagem (ditadas pela Vivianne). Se uma personagem tem aqui
// uma pose, a figura usa EXATAMENTE essa (o modelo não improvisa); senão, a pose
// encarna a essência. Preenche personagemId: 'descrição da pose'. Editável à mão.
export const POSE_BARALHO: Record<string, string> = {
  // Poses ditadas e afinadas pela Vivianne — cada corpo carrega a SOMBRA do arquétipo.
  // AS QUE CARREGAM
  salvadora: 'inclinada para a frente a agarrar o problema de alguém fora do quadro, antes de lho pedirem, o corpo a resgatar',
  diretora: 'sentada muito direita, imóvel, a dirigir tudo só com o olhar e um gesto da mão (não faz, comanda); a têmpora tensa de quem não desliga',
  provedora: 'a oferecer com as duas mãos um prato cheio, e a recuar o corpo quando algo lhe é oferecido de volta, como quem recusa uma dívida',
  heroina: 'serena e firme no meio do caos à volta, viva no problema; e o vazio à frente, onde a paz a deixaria sem função',
  indispensavel: 'rodeada de mãos que se estendem para ela, exausta, mas a segurar todas, sem conseguir largar nenhuma',
  // AS QUE PROCURAM
  peregrina: 'de costas, a partir outra vez para um horizonte, mala na mão; e a resposta que procura está atrás dela, em casa, por ver',
  navegadora: 'a olhar tudo à procura de um significado oculto, a tecer fios de sentido no ar à volta de uma coisa simples',
  'aluna-eterna': 'rodeada de livros abertos e empilhados, a ler um e já a alcançar o seguinte, nunca a fechar nenhum, sempre a preparar-se para começar',
  'buscadora-casa': 'à porta de muitas portas, a mão pousada numa maçaneta, a olhar para dentro sem entrar, a casa que procura é a interior',
  // AS QUE DESAPARECEM
  invisivel: 'a fazer muito ao fundo do quadro, encostada à margem, o olhar a espreitar se alguém repara, e ninguém repara',
  desaparecida: 'de frente, o contorno do corpo a dissolver-se no fundo, a ver-se desaparecer e a continuar a desaparecer',
  orfa: 'ao centro de uma sala cheia de gente de costas, sozinha no meio de todos, os braços a abraçar-se a si',
  'rebelde-silenciosa': 'de pé a carregar uma braçada de tarefas/peso, a boca aberta a protestar em voz alta, e as mãos a agarrar com força o que diz que quer largar; o corpo recusa o que a boca exige',
  // AS QUE SE ADAPTAM
  adaptadora: 'o corpo a tomar a forma do espaço à volta, sem contorno próprio, já sem saber qual é a sua forma',
  tradutora: 'entre duas figuras, a dar voz às emoções delas com as mãos; e a sua própria boca calada, sem ninguém a traduzi-la',
  diplomata: 'de pé entre dois lados, palmas abertas para ambos, o peso igual nos dois pés, e nunca virada para si',
  fiel: 'curvada perante algo que ama (uma casa, uma figura), a mão no peito, presa por um fio que confunde com gratidão',
  // AS QUE VIGIAM
  guardia: 'postura de sentinela à entrada, a antecipar uma ameaça que não chega, o corpo que nunca pousa a tensão',
  sentinela: 'alerta no escuro, todos os sentidos abertos, a guarda nunca em baixo, vigilância que chama segurança',
  perfeccionista: 'debruçada a corrigir um detalhe mínimo que ninguém vê, e nunca a dar por terminado',
  observadora: 'afastada ao canto/alto, a ler a sala inteira, a ver tudo, e a não entrar em nada',
  // (A "Silenciosa" que chegou a ser ditada foi descartada — era outro arquétipo, não existe no baralho.)
};
export const poseDoBaralho = (personagemId: string): string | undefined => POSE_BARALHO[personagemId];

// ── BÍBLIA VISUAL DAS CARTAS (ideia da Vivianne) ─────────────────────────────
// Define cada carta NÃO pelo nome (que o Flux só sabe escrever mal), mas por uma
// ASSINATURA CORPORAL: gesto + objeto + olhar + energia. Assim qualquer gerador
// desenha a PERSONAGEM, não uma modelo qualquer. 1.º rascunho (derivado das poses
// ditadas + os 4 exemplos da Vivianne) — para AFINAR à mão, carta a carta.
export interface Assinatura { gesto: string; objeto: string; olhar: string; energia: string }
export const ASSINATURA: Record<string, Assinatura> = {
  // As que carregam
  salvadora: { gesto: 'inclinada para a frente a amparar/agarrar o problema de alguém fora do quadro', objeto: 'braços estendidos para fora do quadro', olhar: 'fixo em alguém fora da imagem', energia: 'resgate, corpo desequilibrado para a frente' },
  diretora: { gesto: 'a gerir tudo só com o olhar e um gesto da mão (não faz, comanda)', objeto: 'telemóvel numa mão, agenda na outra', olhar: 'dividido, atento a algo fora da imagem', energia: 'alerta permanente, nunca relaxada' },
  provedora: { gesto: 'a oferecer com as duas mãos um prato cheio e a recuar o corpo quando recebe', objeto: 'um prato cheio estendido (o dela vazio)', olhar: 'no outro, nunca em si', energia: 'dádiva; receber sabe a dívida' },
  heroina: { gesto: 'serena e firme de pé no meio do caos à volta', objeto: 'destroços/caos em redor', olhar: 'calmo dentro da crise', energia: 'calma estranha que só existe na crise; vazio à frente' },
  indispensavel: { gesto: 'a segurar muitas mãos que se estendem para ela de todos os lados', objeto: 'mãos a estenderem-se de todos os lados', olhar: 'exausto mas a não largar', energia: 'exaustão; não consegue largar nenhuma' },
  // As que procuram
  peregrina: { gesto: 'de costas, a partir outra vez para um horizonte, a casa atrás já pequena', objeto: 'uma mala na mão', olhar: 'para longe, para a frente', energia: 'partida eterna; a resposta ficou atrás' },
  navegadora: { gesto: 'a tecer fios de sentido no ar à volta de uma coisa simples', objeto: 'fios/linhas de sentido no ar', olhar: 'para cima, à procura de significado', energia: 'busca de sentido; pés sem assentar' },
  'aluna-eterna': { gesto: 'a ler um livro e já a alcançar o seguinte, nunca a fechar nenhum', objeto: 'livros abertos e empilhados', olhar: 'no próximo livro', energia: 'preparação infinita; adiar começar' },
  'buscadora-casa': { gesto: 'à porta de muitas portas, a mão na maçaneta, a olhar para dentro sem entrar', objeto: 'muitas portas, uma maçaneta', olhar: 'para dentro, sem entrar', energia: 'procura de pertença/casa' },
  // As que desaparecem
  invisivel: { gesto: 'a fazer muito ao fundo do quadro, encostada à margem, a fazer-se pequena', objeto: 'nenhum', olhar: 'baixo, a espreitar se alguém repara', energia: 'à espera de ser vista; ninguém repara' },
  desaparecida: { gesto: 'de frente, o contorno do corpo a dissolver-se no fundo', objeto: 'nenhum', olhar: 'a ver-se desaparecer', energia: 'a apagar-se e a continuar a apagar-se' },
  orfa: { gesto: 'sozinha ao centro de uma sala cheia de gente de costas, os braços a abraçar-se', objeto: 'gente de costas à volta', olhar: 'para dentro, só', energia: 'só no meio de todos' },
  'rebelde-silenciosa': { gesto: 'a carregar uma braçada de peso, a boca aberta a protestar, as mãos a agarrar com força o que diz querer largar', objeto: 'uma braçada de tarefas/peso', olhar: 'de revolta', energia: 'queixa e fidelidade no mesmo gesto; o corpo recusa o que a boca exige' },
  // As que se adaptam
  adaptadora: { gesto: 'o corpo a tomar a forma do espaço à volta, sem contorno próprio', objeto: 'nenhum (forma meio-líquida)', olhar: 'sem foco próprio', energia: 'sem forma própria; já não sabe o que quer' },
  tradutora: { gesto: 'entre duas presenças, corpo inclinado para uma enquanto olha para a outra', objeto: 'duas figuras de costas ao seu lado', olhar: 'alternado entre as duas', energia: 'mediação; ela própria sem lugar' },
  diplomata: { gesto: 'de pé entre dois lados, palmas abertas para ambos, peso igual nos dois pés', objeto: 'dois lados/duas presenças', olhar: 'medido, para ambos', energia: 'paz a todo o custo; nunca virada para si' },
  fiel: { gesto: 'corpo virado para uma porta aberta, cabeça virada para trás, um pé quer avançar e o outro continua preso', objeto: 'uma porta aberta', olhar: 'para trás', energia: 'hesitação; presa por um fio que confunde com gratidão' },
  // As que vigiam
  guardia: { gesto: 'à entrada de algo, postura de sentinela, a antecipar uma ameaça', objeto: 'uma soleira/entrada', olhar: 'para fora, a vigiar a ameaça que não vem', energia: 'antecipação; o corpo que nunca pousa a tensão' },
  sentinela: { gesto: 'imóvel, peito aberto, pronta para reagir', objeto: 'nenhum, mãos livres', olhar: 'distante, no horizonte', energia: 'prontidão; a guarda nunca em baixo' },
  perfeccionista: { gesto: 'debruçada a corrigir um detalhe mínimo que ninguém vê', objeto: 'um trabalho com um pormenor minúsculo', olhar: 'fixo no detalhe', energia: 'tensão; nunca está terminado' },
  observadora: { gesto: 'afastada ao canto ou no alto, braços cruzados, a ler a sala inteira', objeto: 'a sala/grupo ao longe', olhar: 'a ver tudo, de fora', energia: 'vê tudo e não entra em nada' },
  // Cartas de fecho
  leal: { gesto: 'sentada, a segurar no colo uma armadura/peso antigo que já podia pousar', objeto: 'uma armadura/peso antigo ao colo', olhar: 'para o peso, com ternura, não com medo', energia: 'a viragem: poder pousar' },
  'ja-pode-viver': { gesto: 'de pé, leve, as mãos abertas e vazias viradas para cima, o rosto erguido para a luz', objeto: 'nada (mãos vazias)', olhar: 'erguido para a luz', energia: 'chegada, leveza, nada a carregar' },
};

// O SÍMBOLO de cada carta (a ideia da Vivianne: é o símbolo/arcano que distingue uma
// carta de baralho, não a atividade). UM emblema claro e único por arquétipo — é o que
// torna o deck reconhecível à primeira. Determinístico; afinável à mão.
export const SIMBOLO: Record<string, string> = {
  salvadora: 'uma bóia de salvação que ela estende a alguém fora do quadro',
  diretora: 'um molho de chaves e um relógio nas mãos',
  provedora: 'um prato cheio que ela oferece com as duas mãos',
  heroina: 'uma única chama acesa que ela protege com a mão, no meio do escuro',
  indispensavel: 'muitos fios e cordas que lhe saem das mãos, a segurar tudo',
  peregrina: 'uma mala de viagem na mão',
  navegadora: 'uma bússola antiga (ou um mapa de estrelas)',
  'aluna-eterna': 'uma pilha alta de livros',
  'buscadora-casa': 'uma chave grande de porta e uma casa em miniatura',
  invisivel: 'um espelho para onde ninguém olha',
  desaparecida: 'um retrato onde o rosto se apagou',
  orfa: 'uma cadeira vazia ao lado dela',
  'rebelde-silenciosa': 'uma braçada pesada de coisas que ela não larga',
  adaptadora: 'água a tomar a forma de um copo',
  tradutora: 'duas máscaras que ela segura, uma em cada mão',
  diplomata: 'uma balança equilibrada nas mãos',
  fiel: 'uma corrente com uma âncora presa ao pulso',
  sentinela: 'uma lanterna acesa, na vigília do escuro',
  guardia: 'um cadeado e uma chave à entrada de uma porta',
  perfeccionista: 'uma lupa sobre um pormenor minúsculo',
  observadora: 'uns binóculos, a observar de longe',
  leal: 'uma armadura antiga pousada no colo',
  'ja-pode-viver': 'as mãos abertas e vazias viradas para a luz',
};
export const simboloDe = (id: string): string | undefined => SIMBOLO[id];

/** A descrição visual de uma carta para o gerador: o SÍMBOLO (o que distingue a carta)
 *  + a ASSINATURA (postura/olhar/energia). É o símbolo que faz o deck reconhecível. */
export function figuraDescricao(id: string): string | undefined {
  const sim = SIMBOLO[id];
  const a = ASSINATURA[id];
  const base = a ? `${a.gesto}, olhar ${a.olhar}, energia de ${a.energia}` : POSE_BARALHO[id];
  if (!base && !sim) return undefined;
  if (sim) return `o SÍMBOLO desta carta, grande e claro, é o que a identifica: ${sim}. A mulher: ${base ?? ''}`.trim();
  return base;
}

// ── CARTAS ESPECIAIS (fecho do arco) ─────────────────────────────────────────
// NÃO são personagens das 5 famílias nem entram no baralho diário. São o FECHO:
// a carta-coração (a viragem) e a carta final (a chegada). Pose TRAVADA (ditada
// pela Vivianne); as LINHAS (frente/verso) são escritas por ela — aqui ficam vazias
// de propósito (nada inventado pelo assistente). Editável à mão.
export interface CartaEspecial {
  id: string;
  nome: string;
  papel: 'carta-coracao' | 'carta-final'; // o lugar no fecho do arco
  pose: string;        // travada pela Vivianne
  frente: string[];    // as linhas da frente — POR ESCREVER pela Vivianne
  verso: string[];     // as linhas do verso — POR ESCREVER pela Vivianne
}

export const CARTAS_ESPECIAIS: CartaEspecial[] = [
  {
    id: 'leal',
    nome: 'A Leal',
    papel: 'carta-coracao',
    pose: 'sentada, a segurar no colo uma armadura/peso antigo que já podia pousar, a olhá-lo com ternura, não com medo',
    frente: [],
    verso: [],
  },
  {
    id: 'ja-pode-viver',
    nome: 'Sou Aquela que Já Pode Viver',
    papel: 'carta-final',
    pose: 'de pé, leve, as mãos abertas e vazias viradas para cima, o rosto erguido para a luz, sem nada a carregar',
    frente: [],
    verso: [],
  },
];

export const cartaEspecial = (id: string): CartaEspecial | undefined =>
  CARTAS_ESPECIAIS.find((c) => c.id === id);
/** A pose travada de uma carta especial de fecho (Leal, Já Pode Viver). */
export const poseEspecial = (id: string): string | undefined => cartaEspecial(id)?.pose;

export const BARALHO: Record<string, string[]> = {
  // As que carregam
  salvadora: ['Resolvo o problema antes de mo pedirem.', 'Atiro-me ao fogo de toda a gente.', 'Chamo-lhe amor, mas é resgate.', 'Sou aquela.'],
  diretora: ['Já tratei, já confirmei, já marquei.', 'Sei o que falta lá em casa antes de faltar.', 'Deito-me e o cérebro continua a operação.', 'Sou aquela.'],
  provedora: ['Garanto que não falte nada a ninguém.', 'Dou sempre, e fico sem jeito quando me dão.', 'Receber sabe-me a dívida.', 'Sou aquela.'],
  heroina: ['Na crise, sou eu que apareço.', 'Fico estranhamente calma quando tudo arde.', 'E quando há paz, não sei o que fazer comigo.', 'Sou aquela.'],
  indispensavel: ['Faço eu, que é mais depressa.', 'Digo que estou cansada e não largo nada.', 'Preciso de ser precisa.', 'Sou aquela.'],
  // As que procuram
  peregrina: ['Compro outro curso, outro método, outra resposta.', 'Sinto sempre que falta qualquer coisa.', 'Procuro lá fora o que talvez esteja cá dentro.', 'Sou aquela.'],
  navegadora: ['Pergunto a tudo o que me veio ensinar.', 'Procuro um sentido em cada coisa que me acontece.', 'Às vezes interpreto tanto que me esqueço de viver.', 'Sou aquela.'],
  'aluna-eterna': ['Faço mais um curso antes de começar.', 'Digo que ainda não estou pronta.', 'Transformo preparar-me em adiar.', 'Sou aquela.'],
  'buscadora-casa': ['Procuro um sítio onde finalmente pertença.', 'Quero pousar e descansar de uma vez.', 'Procuro fora a casa que é cá dentro.', 'Sou aquela.'],
  // As que desaparecem (voz 2026: vocal, não muda)
  invisivel: ['Lembro-me dos aniversários e das consultas de todos.', 'Faço tudo e queixo-me de que ninguém repara.', 'Espero que perguntem por mim, e a mim nunca pergunto.', 'Sou aquela.'],
  desaparecida: ['Estou em todos os grupos e calendários.', 'Já nem sei do que gosto.', 'Olho-me ao espelho e não sei bem quem é.', 'Sou aquela.'],
  orfa: ['Estou rodeada de gente e sinto-me só.', 'Desabafo com toda a gente e continuo na mesma.', 'Nunca acredito que alguém fique.', 'Sou aquela.'],
  'rebelde-silenciosa': ['Digo a toda a gente que estou farta.', 'Cumpro tudo na mesma.', 'Tenho tudo e continuo inquieta.', 'Sou aquela.'],
  // As que se adaptam
  adaptadora: ['Sou uma com o marido, outra no trabalho, outra com a minha mãe.', 'Digo "para mim tanto faz" a tudo.', 'Já não sei o que quero.', 'Sou aquela.'],
  tradutora: ['Explico o que ele quis dizer.', 'Suavizo o que a outra fez.', 'Traduzo toda a gente, e a mim ninguém traduz.', 'Sou aquela.'],
  diplomata: ['Mantenho a paz, percebo os dois lados.', 'Evito o conflito a todo o custo.', 'Nunca tomo partido de mim.', 'Sou aquela.'],
  fiel: ['Fico por lealdade, mesmo quando dói.', 'Depois de tudo o que fizeram por mim, não posso sair.', 'Confundo gratidão com prisão.', 'Sou aquela.'],
  // As que vigiam
  guardia: ['Confirmo outra vez, só para garantir.', 'Antecipo tudo o que pode correr mal.', 'E nunca me sinto mesmo segura.', 'Sou aquela.'],
  sentinela: ['Nunca baixo a guarda.', 'Mais vale estar preparada.', 'Confundo vigiar com estar segura.', 'Sou aquela.'],
  perfeccionista: ['Ainda falta corrigir um pormenor.', 'Não procuro aplausos, procuro que não falhe nada.', 'E nunca está pronto.', 'Sou aquela.'],
  observadora: ['Leio a sala toda num segundo.', 'Já tinha percebido tudo antes de acontecer.', 'Observo tanto que me esqueço de participar.', 'Sou aquela.'],
};

/** A carta fixa de uma personagem (as linhas, a última é "Sou aquela."). */
export const cartaDoBaralho = (personagemId: string): string[] => BARALHO[personagemId] ?? [];
