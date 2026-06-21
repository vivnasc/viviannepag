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
  // FALTA pose (cai na essência): rebelde-silenciosa = "A Insatisfeita" no código (cumpre
  //   tudo, diz que está farta, NÃO larga nada). A pose "A Silenciosa" que ditaste é de OUTRO
  //   arquétipo (palavra retida) — não encaixa aqui. Dá-me a pose da Insatisfeita (ou cria
  //   "A Silenciosa" como personagem própria) e eu travo-a.
  // CARTAS ESPECIAIS por criar (personagem própria com essência + carta, escritas pela Vivianne):
  //   · A Leal (carta-coração) — 'sentada, a segurar no colo uma armadura/peso antigo que já podia pousar, a olhá-lo com ternura, não com medo'
  //   · Sou Aquela que Já Pode Viver (carta final) — 'de pé, leve, as mãos abertas e vazias viradas para cima, o rosto erguido para a luz, sem nada a carregar'
};
export const poseDoBaralho = (personagemId: string): string | undefined => POSE_BARALHO[personagemId];

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
