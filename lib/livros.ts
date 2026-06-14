// Os manuais-filhos do Método VS (os 3 movimentos), para as páginas de venda e
// os produtos. O texto vive em VER/VIR/VIVER-SOLTAR-{PT,EN}.md; aqui ficam os
// metadados de montra (título, promessa, amostra, o que está lá dentro, para
// quem é, o estado-depois em linguagem clara, preço, cor de marca).

export type ManualLivro = {
  slug: string;            // ver-soltar | vir-soltar | viver-soltar
  marca: string;           // ver.soltar
  movimento: string;       // a consciência
  cacho: string;           // Turbilhão + Memória
  promessa: string;        // a metáfora (vai mais abaixo, como reconhecimento)
  promessaEn: string;
  intro: string;           // 2-3 linhas de pitch
  introEn: string;
  // LINGUAGEM DA PESSOA (topo): a dor nas palavras dela, não na metáfora
  dorTitulo: string; dorTituloEn: string;       // "Não consegues parar de pensar?"
  sintomas: string[]; sintomasEn: string[];     // 3 sintomas curtos (reconhecimento imediato)
  aprende: string; aprendeEn: string;           // "Aprende a…" — o benefício concreto, na língua da dor
  comoFunciona: string; comoFuncionaEn: string; // o que o método faz, concreto, 1 linha
  protocoloPara: string; protocoloParaEn: string; // "para os momentos de ansiedade"
  mudancas: string[]; mudancasEn: string[];     // o que muda na vida (concreto), 5 linhas
  amostra: string[];       // 2 parágrafos de amostra (PT)
  amostraEn: string[];
  // o que NÃO é / o que É — para separar de "mais um texto sobre ansiedade"
  naoE: string; naoEEn: string;
  e: string; eEn: string;
  // reconhecimento: "isto é para ti se…"
  paraQuem: string[]; paraQuemEn: string[];
  // o que está lá dentro: o protocolo. NÃO se dão os passos (isso é o produto);
  // diz-se que são cinco tempos e descreve-se a FORMA, para cativar sem entregar.
  protocoloNome: string; protocoloNomeEn: string; // "o protocolo do ver"
  protocoloForma: string; protocoloFormaEn: string; // o que o protocolo faz, sem o revelar
  caminho: string; caminhoEn: string;             // "Sete dias a ver"
  // o estado-depois EM LINGUAGEM CLARA (não só "a margem", que só faz sentido
  // a quem já leu): uma frase que um leitor frio entende.
  depois: string;          // a palavra-imagem (a margem)
  depoisEn: string;
  depoisFrase: string; depoisFraseEn: string;
  preco: string;           // €9
  cor: { topo: string; baixo: string }; // gradiente do herói
};

// A autora, com a sua autoridade real (igual à do "quem sou" da home; nada
// inventado). É o que dá peso ao método na página de venda.
export const AUTORA = {
  nome: 'Vivianne dos Santos',
  bio: 'Autora de Os 7 Véus do Despertar e criadora do Método VS. Estuda os sistemas que nos formam, em formação em psicologia transpessoal, psicologia e espiritualidade, e constelação familiar sistémica. Não escreve de um lugar de chegada: cada coisa que aqui partilha passou primeiro por ela.',
  bioEn: 'Author of The 7 Veils of Awakening and creator of the VS Method. She studies the systems that shape us, in training in transpersonal psychology, psychology and spirituality, and systemic family constellation therapy. She does not write from a place of arrival: everything she shares here passed first through her.',
};

export const MANUAIS: ManualLivro[] = [
  {
    slug: 'ver-soltar',
    marca: 'ver.soltar',
    movimento: 'a consciência',
    cacho: 'Turbilhão + Memória',
    promessa: 'A tua cabeça não para, a remoer o passado e a ensaiar o que aí vem? O primeiro movimento é ver: sair de dentro da tempestade.',
    promessaEn: 'Your mind will not stop, reliving the past and rehearsing what is coming? The first movement is to see: to step out of the storm.',
    intro: 'Um método para saíres de dentro da cabeça e veres a tempestade passar de terra. Não é re-explicar a ansiedade, é um caminho com o seu protocolo.',
    introEn: 'A method to step out of your head and watch the storm pass from solid ground. Not a re-explanation of anxiety, but a path with its own protocol.',
    dorTitulo: 'Não consegues parar de pensar?',
    dorTituloEn: 'Can’t stop thinking?',
    sintomas: ['Revives conversas antigas.', 'Antecipas problemas que ainda não aconteceram.', 'Ficas presa dentro dos teus pensamentos.'],
    sintomasEn: ['You replay old conversations.', 'You anticipate problems that haven’t happened.', 'You get stuck inside your own thoughts.'],
    aprende: 'Aprende a sair das espirais de pensamento e da ansiedade, sem tentares desligar a cabeça.',
    aprendeEn: 'Learn to step out of thought spirals and anxiety, without trying to switch your head off.',
    comoFunciona: 'Este método ensina-te a criar distância dos pensamentos sem tentares desligá-los.',
    comoFuncionaEn: 'This method teaches you to create distance from your thoughts without trying to switch them off.',
    protocoloPara: 'para os momentos de ansiedade',
    protocoloParaEn: 'for moments of anxiety',
    mudancas: [
      'Deixas de seguir cada pensamento como se fosse uma ordem.',
      'Recuperas mais depressa das espirais mentais.',
      'Consegues interromper os ciclos de ruminação.',
      'Reconheces quando a ansiedade está a assumir o comando.',
      'Tens um protocolo concreto para usar quando precisas.',
    ],
    mudancasEn: [
      'You stop following every thought as if it were an order.',
      'You recover faster from mental spirals.',
      'You can interrupt cycles of rumination.',
      'You recognise when anxiety is taking over.',
      'You have a concrete protocol to use when you need it.',
    ],
    amostra: [
      'A tua cabeça não para. Antecipas conversas que ainda não aconteceram e revives, ponto por ponto, as que já aconteceram. E sentes cada coisa com tal intensidade que te tornas aquilo que sentes.',
      'Mas há uma margem. Se consegues ver um pensamento, então há em ti algo que não é esse pensamento. Não és a tempestade. És o céu por onde ela passa, e nenhum céu foi alguma vez rasgado por uma nuvem.',
    ],
    amostraEn: [
      'Your mind will not stop. You anticipate conversations that have not yet happened and relive, point by point, the ones that already have. And you feel each thing so intensely that you become what you feel.',
      'But there is a shore. If you can see a thought, then there is something in you that is not that thought. You are not the storm. You are the sky it passes through, and no sky was ever torn by a cloud.',
    ],
    naoE: 'Não é mais um texto para entenderes a ansiedade, nem uma técnica para esvaziar a cabeça (a mente não se esvazia).',
    naoEEn: 'It is not one more text to understand anxiety, nor a technique to empty your head (the mind does not empty).',
    e: 'É um método para fazeres: sair de dentro da tempestade e aprender a vê-la passar da margem.',
    eEn: 'It is a method to practise: to step out of the storm and learn to watch it pass from the shore.',
    paraQuem: [
      'Acordas já cansada de um dia que ainda não começou, porque o viveste todo durante a noite.',
      'Revives, ponto por ponto, conversas que acabaram há anos, e ensaias outras que talvez nunca aconteçam.',
      'Sentes cada emoção com tal força que deixas de a ter e passas a ser ela.',
      'Reages ao presente com uma dor que, no fundo, pertence a outro tempo.',
    ],
    paraQuemEn: [
      'You wake already tired of a day that has not begun, because you lived it all through the night.',
      'You relive, point by point, conversations that ended years ago, and rehearse others that may never happen.',
      'You feel each emotion so strongly that you stop having it and become it.',
      'You react to the present with a pain that, deep down, belongs to another time.',
    ],
    protocoloNome: 'o protocolo do ver',
    protocoloNomeEn: 'the protocol of seeing',
    protocoloForma: 'Os dois primeiros tempos tiram-te de dentro da água. Os dois do meio desfazem a tempestade pela raiz, em vez de só a aguentarem. O último devolve-te ao agora. Cabe num minuto, e treina-se até o corpo o saber de cor.',
    protocoloFormaEn: 'The first two movements take you out of the water. The middle two undo the storm at its root, instead of merely enduring it. The last returns you to the now. It fits in a minute, and is trained until the body knows it by heart.',
    caminho: 'Sete dias a ver',
    caminhoEn: 'Seven days of seeing',
    depois: 'a margem',
    depoisEn: 'the shore',
    depoisFrase: 'Deixas de ser arrastada por cada onda de pensamento. Ganhas uma margem, um lugar dentro de ti de onde ver a tempestade passar, e o caminho de volta a ela sempre que precisares.',
    depoisFraseEn: 'You stop being swept away by every wave of thought. You gain a shore, a place within you from which to watch the storm pass, and the way back to it whenever you need.',
    preco: '€9',
    cor: { topo: '#1F1B38', baixo: '#0E0B1A' },
  },
  {
    slug: 'vir-soltar',
    marca: 'vir.soltar',
    movimento: 'o regresso',
    cacho: 'Esforço + Desolação',
    promessa: 'Carregas tudo e, quando paras, vem o vazio? O movimento é vir: regressar a ti, deixar-te segurar.',
    promessaEn: 'You carry everything, and when you stop, the emptiness comes? The movement is to return: to come back to yourself, to let yourself be held.',
    intro: 'Um método para parares de empurrar e regressares a ti. Fazes e enches para não sentir o vazio; aqui aprendes a ficar, e a descobrir que ele te segura.',
    introEn: 'A method to stop pushing and return to yourself. You do and you fill so as not to feel the emptiness; here you learn to stay, and to discover it holds you.',
    dorTitulo: 'Carregas tudo sozinha?',
    dorTituloEn: 'Carrying everything alone?',
    sintomas: ['Não consegues descansar.', 'Sentes culpa quando paras.', 'Carregas mais do que te pertence.'],
    sintomasEn: ['You can’t rest.', 'You feel guilty when you stop.', 'You carry more than is yours.'],
    aprende: 'Aprende a parar de carregar tudo sozinha, a descansar sem culpa e a deixar-te apoiar.',
    aprendeEn: 'Learn to stop carrying everything alone, to rest without guilt and to let yourself be supported.',
    comoFunciona: 'Este método ensina-te a parar sem culpa e a deixar-te segurar, em vez de encheres o vazio com mais uma tarefa.',
    comoFuncionaEn: 'This method teaches you to stop without guilt and to let yourself be held, instead of filling the emptiness with one more task.',
    protocoloPara: 'para quando o vazio aperta',
    protocoloParaEn: 'for when the emptiness hits',
    mudancas: [
      'Consegues parar sem sentir que estás a falhar.',
      'Descansas sem a culpa a estragar o descanso.',
      'Deixas os outros segurarem-te, e não só o contrário.',
      'Reconheces quando estás a fugir para a próxima tarefa.',
      'Tens um protocolo concreto para quando o vazio aperta.',
    ],
    mudancasEn: [
      'You can stop without feeling you are failing.',
      'You rest without guilt ruining the rest.',
      'You let others hold you, not only the other way around.',
      'You recognise when you are escaping into the next task.',
      'You have a concrete protocol for when the emptiness hits.',
    ],
    amostra: [
      'Chegas sempre primeiro. Antecipas o que os outros vão precisar, resolves antes que peçam, e ainda pedes desculpa por não teres feito mais. Sentar-te sem nada para fazer dá-te uma culpa surda.',
      'A plenitude que andas a perseguir ao fundo de mais uma lista não está na corrida. Está no repouso que tens medo de te permitir. As mãos que toda a vida apanharam os outros podem, enfim, pousar.',
    ],
    amostraEn: [
      'You always arrive first. You anticipate what others will need, you solve before they ask, and still you apologise for not having done more. To sit with nothing to do gives you a dull guilt.',
      'The fullness you chase at the bottom of one more list is not in the race. It is in the rest you are afraid to allow yourself. The hands that all your life caught others can, at last, come to rest.',
    ],
    naoE: 'Não é um elogio ao descanso nem mais uma lista de autocuidado para cumprires (e onde possas falhar).',
    naoEEn: 'It is not a tribute to rest, nor one more self-care list to complete (and to fail at).',
    e: 'É um método para parares de empurrar a vida à força, regressares a ti, e te deixares segurar.',
    eEn: 'It is a method to stop forcing life forward, to return to yourself, and to let yourself be held.',
    paraQuem: [
      'Chegas sempre primeiro, resolves antes que peçam, e ainda pedes desculpa por não teres feito mais.',
      'Sentar-te sem nada para fazer dá-te uma culpa surda.',
      'Enches os dias para não sentir o vazio que aparece quando paras.',
      'Sabes segurar toda a gente, menos deixar-te segurar.',
    ],
    paraQuemEn: [
      'You always arrive first, you solve before they ask, and still you apologise for not doing more.',
      'To sit with nothing to do gives you a dull guilt.',
      'You fill your days so as not to feel the emptiness that comes when you stop.',
      'You know how to hold everyone, except how to let yourself be held.',
    ],
    protocoloNome: 'o protocolo do vir',
    protocoloNomeEn: 'the protocol of returning',
    protocoloForma: 'Os primeiros tempos param a corrida e trazem-te ao corpo. Os do meio ensinam-te a ficar no que dói sem o tapares com mais uma tarefa. O último abre-te as mãos para, enfim, receberes.',
    protocoloFormaEn: 'The first movements stop the race and bring you to the body. The middle ones teach you to stay with what hurts without covering it with one more task. The last opens your hands to, at last, receive.',
    caminho: 'Sete dias a regressar',
    caminhoEn: 'Seven days returning',
    depois: 'o colo',
    depoisEn: 'the lap',
    depoisFrase: 'Deixas de empurrar a vida à força. Aprendes a parar sem culpa e a deixar-te segurar, e descobres que o vazio que temias é, afinal, um colo.',
    depoisFraseEn: 'You stop forcing life forward. You learn to stop without guilt and to let yourself be held, and you discover that the emptiness you feared is, after all, a lap.',
    preco: '€9',
    cor: { topo: '#2C1E33', baixo: '#160E1A' },
  },
  {
    slug: 'viver-soltar',
    marca: 'viver.soltar',
    movimento: 'a integração',
    cacho: 'Horizonte + Permanência',
    promessa: 'Vives à espera de viver, presa a quem já foste? O movimento é viver: entrar na tua própria vida, agora.',
    promessaEn: 'You live waiting to live, clinging to who you once were? The movement is to live: to enter your own life, now.',
    intro: 'Um método para saíres da sala de espera e tirares a armadura dos papéis. Adias para um "quando" e agarras-te a quem foste; aqui entras no presente.',
    introEn: 'A method to step out of the waiting room and take off the armour of the roles. You postpone for a "when" and cling to who you were; here you enter the present.',
    dorTitulo: 'Sabes o que precisas, mas voltas sempre ao mesmo?',
    dorTituloEn: 'Know what you need, but keep ending up in the same place?',
    sintomas: ['Adias a vida para depois.', 'Vives em função da próxima meta.', 'Sentes que nunca chegas.'],
    sintomasEn: ['You postpone life for later.', 'You live for the next goal.', 'You feel you never arrive.'],
    aprende: 'Aprende a transformar o que já compreendeste em mudança real, e a parar de adiar a tua vida.',
    aprendeEn: 'Learn to turn what you already understand into real change, and to stop postponing your life.',
    comoFunciona: 'Este método ensina-te a sair da sala de espera e a entrar na tua vida agora, sem a armadura dos papéis.',
    comoFuncionaEn: 'This method teaches you to leave the waiting room and step into your life now, without the armour of the roles.',
    protocoloPara: 'para quando te perdes no "depois"',
    protocoloParaEn: 'for when you get lost in the "later"',
    mudancas: [
      'Páras de adiar a vida para um "quando" que não chega.',
      'Largas a armadura que carregas mesmo quando ninguém a pede.',
      'Deixas de te agarrar a quem já foste.',
      'Reconheces quando estás a viver no futuro em vez do presente.',
      'Tens um protocolo concreto para voltares ao agora.',
    ],
    mudancasEn: [
      'You stop postponing life for a "when" that never comes.',
      'You drop the armour you carry even when no one asks for it.',
      'You stop clinging to who you used to be.',
      'You recognise when you are living in the future instead of the present.',
      'You have a concrete protocol to return to now.',
    ],
    amostra: [
      'Vives inclinada para a frente, sempre um pouco à frente de onde estás, em direção a um "quando" onde, finalmente, vais poder ser feliz. E, ao mesmo tempo, agarrada a uma imagem de ti com medo de a perder.',
      'Mas não há chegada. Não estás atrasada para lugar nenhum. Podes parar de correr, tirar a armadura, e entrar na única vida que existe, esta. A estreia por que esperaste a vida toda é hoje.',
    ],
    amostraEn: [
      'You live leaning forward, always a little ahead of where you are, towards a "when" where, finally, you will be able to be happy. And, at the same time, clinging to an image of yourself, afraid to lose it.',
      'But there is no arrival. You are not late for anywhere. You can stop running, take off the armour, and enter the only life there is, this one. The premiere you waited for all your life is today.',
    ],
    naoE: 'Não é motivação para aproveitares mais a vida, nem um plano de produtividade.',
    naoEEn: 'It is not motivation to make the most of life, nor a productivity plan.',
    e: 'É um método para saíres da sala de espera e entrares no presente, sem a armadura dos papéis.',
    eEn: 'It is a method to leave the waiting room and enter the present, without the armour of the roles.',
    paraQuem: [
      'Vives inclinada para a frente, sempre em direção a um "quando" onde finalmente vais poder ser feliz.',
      'Adias a tua vida para depois, e agarras-te a uma imagem de quem já foste.',
      'Trazes a armadura dos papéis mesmo quando ninguém a pede.',
      'Sentes que estás atrasada para um lugar a que, no fundo, nunca chegas.',
    ],
    paraQuemEn: [
      'You live leaning forward, always towards a "when" where you will finally get to be happy.',
      'You postpone your life for later, and cling to an image of who you once were.',
      'You wear the armour of your roles even when no one asks for it.',
      'You feel late for a place you somehow never arrive at.',
    ],
    protocoloNome: 'o protocolo do viver',
    protocoloNomeEn: 'the protocol of living',
    protocoloForma: 'Os primeiros tempos trazem-te ao presente e tiram-te uma peça da armadura. Os do meio mostram-te de quem é a pressa, e o que ela protege. O último volta a pôr-te em contacto com uma coisa viva, agora.',
    protocoloFormaEn: 'The first movements bring you to the present and take off one piece of the armour. The middle ones show you whose hurry it is, and what it protects. The last puts you back in touch with one living thing, now.',
    caminho: 'Sete dias a viver',
    caminhoEn: 'Seven days of living',
    depois: 'descalça',
    depoisEn: 'barefoot',
    depoisFrase: 'Sais da sala de espera onde adiavas viver. Tiras a armadura dos papéis e entras, descalça, na única vida que existe: esta, agora.',
    depoisFraseEn: 'You step out of the waiting room where you kept postponing your life. You take off the armour of the roles and step, barefoot, into the only life there is: this one, now.',
    preco: '€9',
    cor: { topo: '#26203A', baixo: '#100C1C' },
  },
];

export function getManual(slug: string): ManualLivro | undefined {
  return MANUAIS.find((m) => m.slug === slug);
}
