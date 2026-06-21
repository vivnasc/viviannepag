// A Biblioteca de Véspera · a secção pública dos romances.
// Sete estantes (uma pergunta cada), espelho das sete coleções da loja.
// Fonte: ficcao-plano/REPERTORIO-biblioteca.md (os títulos "a caminho" são a
// montra do que vem; só entram aqui quando a Vivianne os fechar no repertório).
// NOTA (12 jun 2026): a Vivianne decidiu manter os nomes das estantes na
// página pública, mas pequenos e sempre acompanhados da pergunta e do tema
// em linguagem comum; o nome nunca aparece sozinho como cabeçalho.

export type LivroBiblioteca = {
  slug: string;
  titulo: string;
  tituloEn: string;
  estado: 'disponivel' | 'caminho';
  // só os disponíveis têm página própria
  href?: string;
  nota?: string;
  notaEn?: string;
  // uma frase de promessa, em linguagem comum (do repertório, não inventada)
  promessa?: string;
  promessaEn?: string;
};

export type Estante = {
  id: string;
  romano: string;
  // nome da estante (aparece pequeno, sempre com a pergunta e o tema ao lado)
  nome: string;
  nomeEn: string;
  pergunta: string;
  perguntaEn: string;
  // o tema da estante dito de forma simples, para quem chega de fora
  tema: string;
  temaEn: string;
  // cor da estante = cor da coleção irmã na loja (lib/colecoes.ts);
  // classes Tailwind completas, porque o JIT só gera literais
  cor: {
    texto: string;       // a linha "estante · nome"
    textoSuave: string;  // o selo "a caminho"
    borda: string;       // contorno dos cartões
    bordaHover: string;  // contorno do cartão disponível ao passar
  };
  livros: LivroBiblioteca[];
};

export const ESTANTES: Estante[] = [
  {
    id: 'casas',
    cor: {
      texto: 'text-bordeaux-claro/90',
      textoSuave: 'text-bordeaux-claro/60',
      borda: 'border-bordeaux-claro/25',
      bordaHover: 'hover:border-bordeaux-claro/70',
    },
    romano: 'I',
    nome: 'As Casas de Família',
    nomeEn: 'The Family Houses',
    pergunta: 'O que estou a carregar que não é meu?',
    perguntaEn: "What am I carrying that isn't mine?",
    tema: 'Romances de mães e filhos: o peso que se carrega por amor.',
    temaEn: 'Novels of mothers and children: the weight we carry out of love.',
    livros: [
      {
        slug: 'rom-01-amparo',
        titulo: 'As Mãos de Amparo',
        tituloEn: "Amparo's Hands",
        estado: 'disponivel',
        href: '/amparo',
        nota: 'oferta da casa · lê o capítulo 1 sem pedir nada',
        notaEn: 'a gift from the house · read chapter 1 freely',
        promessa: 'Há trinta e seis anos que Amparo apanha o filho antes de cada queda. Este é o ano em que aprende que as mãos também se pousam.',
        promessaEn: 'For thirty-six years, Amparo has caught her son before every fall. This is the year she learns that hands can also rest.',
      },
      {
        slug: 'rom-tradutora',
        titulo: 'A Tradutora',
        tituloEn: 'The Translator',
        estado: 'disponivel',
        href: '/a-tradutora',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Só ela entende o filho. Tornou-se a voz dele para o mundo inteiro, e esqueceu-se da sua.',
        promessaEn: 'Only she understands her son. She became his voice to the whole world, and forgot her own.',
      },
      {
        slug: 'rom-sentinela',
        titulo: 'A Sentinela',
        tituloEn: 'The Sentinel',
        estado: 'disponivel',
        href: '/a-sentinela',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Os filhos cresceram e vivem longe. Custódia continua de vigia, a guardar quartos vazios.',
        promessaEn: 'Her children are grown and far away. Custódia still keeps watch over empty rooms.',
      },
      {
        slug: 'rom-ferrolho',
        titulo: 'O Ferrolho',
        tituloEn: 'The Bolt',
        estado: 'disponivel',
        href: '/o-ferrolho',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'O filho só aparece para pedir, e quando bebe, assusta. A noite em que Dores fecha a porta.',
        promessaEn: 'Her son only comes to ask, and when he drinks, he frightens her. The night Dores bolts the door.',
      },
    ],
  },
  {
    id: 'fonte',
    cor: {
      texto: 'text-ambar/90',
      textoSuave: 'text-ambar/60',
      borda: 'border-ambar/25',
      bordaHover: 'hover:border-ambar/70',
    },
    romano: 'II',
    nome: 'O Largo da Fonte',
    nomeEn: 'The Fountain Square',
    pergunta: 'O que estou a perseguir que não é meu?',
    perguntaEn: "What am I chasing that isn't mine?",
    tema: 'Para quem corre atrás de metas e nunca se sente chegada.',
    temaEn: 'For anyone chasing goals and never feeling they have arrived.',
    livros: [
      {
        slug: 'rom-irma',
        titulo: 'O Nome da Irmã',
        tituloEn: "The Sister's Name",
        estado: 'disponivel',
        href: '/nome-da-irma',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Eufémia recebeu o nome da irmã que morreu, e com ele a vida que era dela. Nunca escolheu nada.',
        promessaEn: "Eufémia was given her dead sister's name, and with it her sister's life. She never chose anything.",
      },
      {
        slug: 'rom-estrada',
        titulo: 'A Estrada Nova',
        tituloEn: 'The New Road',
        estado: 'disponivel',
        href: '/a-estrada-nova',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Aurora foi a primeira em tudo e nunca se sentiu chegada. Cada vitória vira degrau da seguinte.',
        promessaEn: 'Aurora was first at everything and never felt she had arrived. Every win becomes a step to the next.',
      },
      {
        slug: 'rom-portas',
        titulo: 'As Portas Baixas',
        tituloEn: 'The Low Doors',
        estado: 'disponivel',
        href: '/as-portas-baixas',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Modesta tem a melhor voz do coro e canta para dentro. Aprendeu cedo que sobressair custa caro.',
        promessaEn: 'Modesta has the best voice in the choir and sings inward. She learned early that standing out costs dearly.',
      },
    ],
  },
  {
    id: 'mercearia',
    cor: {
      texto: 'text-ouro/90',
      textoSuave: 'text-ouro/60',
      borda: 'border-ouro/25',
      bordaHover: 'hover:border-ouro/70',
    },
    romano: 'III',
    nome: 'A Mercearia',
    nomeEn: 'The Shop',
    pergunta: 'O que me impede de receber o que é meu?',
    perguntaEn: 'What keeps me from receiving what is mine?',
    tema: 'Dinheiro, mérito e o medo de receber.',
    temaEn: 'Money, worth and the fear of receiving.',
    livros: [
      {
        slug: 'rom-caderno',
        titulo: 'O Caderno das Dívidas',
        tituloEn: 'The Ledger of Debts',
        estado: 'disponivel',
        href: '/caderno-das-dividas',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Benvinda sabe de cor o que a vila inteira lhe deve. Nunca cobrou nada a ninguém.',
        promessaEn: 'Benvinda knows by heart what the whole village owes her. She has never charged anyone.',
      },
      {
        slug: 'rom-despensa',
        titulo: 'A Despensa Cheia',
        tituloEn: 'The Full Pantry',
        estado: 'disponivel',
        href: '/a-despensa-cheia',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Fartura tem a despensa cheia e a mesa pobre. A fome já passou, mas ainda mora dentro dela.',
        promessaEn: "Fartura's pantry is full and her table is poor. The hunger is long gone, but it still lives in her.",
      },
      {
        slug: 'rom-presente',
        titulo: 'O Presente por Abrir',
        tituloEn: 'The Unopened Gift',
        estado: 'disponivel',
        href: '/o-presente-por-abrir',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Dádiva cuida de meia vila e não sabe receber. Há três anos que tem um presente por abrir.',
        promessaEn: 'Dádiva cares for half the village and cannot receive. A gift from her daughter has sat unopened for three years.',
      },
    ],
  },
  {
    id: 'ponte',
    cor: {
      texto: 'text-rosa/90',
      textoSuave: 'text-rosa/60',
      borda: 'border-rosa/25',
      bordaHover: 'hover:border-rosa/70',
    },
    romano: 'IV',
    nome: 'A Ponte',
    nomeEn: 'The Bridge',
    pergunta: 'O que me faz perder-me quando amo?',
    perguntaEn: 'What makes me lose myself when I love?',
    tema: 'Histórias de amor em que a mulher se perde de si.',
    temaEn: 'Love stories where a woman loses herself.',
    livros: [
      {
        slug: 'rom-cheias',
        titulo: 'O Homem das Cheias',
        tituloEn: 'The Man the Floods Brought',
        estado: 'disponivel',
        href: '/homem-das-cheias',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Rosário ama um homem que aparece e desaparece. O que fica não lhe acende nada.',
        promessaEn: 'Rosário loves a man who comes and goes. The one who stays lights nothing in her.',
      },
      {
        slug: 'rom-casa-acabar',
        titulo: 'A Casa por Acabar',
        tituloEn: 'The Unfinished House',
        estado: 'disponivel',
        href: '/a-casa-por-acabar',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Há vinte anos que o homem dela vai acabar a casa. Esperança ama a promessa, não o homem que existe.',
        promessaEn: 'For twenty years her man has been about to finish the house. Esperança loves the promise, not the man who exists.',
      },
      {
        slug: 'rom-trovoada',
        titulo: 'A Trovoada',
        tituloEn: 'The Thunderstorm',
        estado: 'caminho',
        promessa: 'Tranquilina só se sente amada em tempestade. A paz parece-lhe morte.',
        promessaEn: 'Tranquilina only feels loved in a storm. Peace feels like death to her.',
      },
    ],
  },
  {
    id: 'mesa',
    cor: {
      texto: 'text-salvia/90',
      textoSuave: 'text-salvia/60',
      borda: 'border-salvia/25',
      bordaHover: 'hover:border-salvia/70',
    },
    romano: 'V',
    nome: 'A Mesa Comprida',
    nomeEn: 'The Long Table',
    pergunta: 'Qual é o meu lugar entre os outros?',
    perguntaEn: 'What is my place among others?',
    tema: 'Família, pertença e o cansaço de segurar toda a gente.',
    temaEn: 'Family, belonging and the exhaustion of holding everyone up.',
    livros: [
      {
        slug: 'rom-trave',
        titulo: 'A Trave-Mestra',
        tituloEn: 'The Master Beam',
        estado: 'caminho',
        promessa: 'A família inteira assenta em Perpétua, e ninguém pergunta à coluna como está.',
        promessaEn: 'The whole family rests on Perpétua, and no one asks the pillar how she is.',
      },
      {
        slug: 'rom-estrangeira',
        titulo: 'A Estrangeira de Cá',
        tituloEn: 'The Foreigner from Here',
        estado: 'caminho',
        promessa: 'Lá fora era a de cá, cá é a de fora. Peregrina tem duas casas e nenhuma.',
        promessaEn: 'Abroad she was the one from here; here she is the one from away. Peregrina has two homes and none.',
      },
      {
        slug: 'rom-incomodo',
        titulo: 'Nenhum Incómodo',
        tituloEn: 'No Trouble at All',
        estado: 'disponivel',
        href: '/nenhum-incomodo',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Plácida não pede, não precisa, não incomoda. Já houve festas em que ninguém deu pela falta dela.',
        promessaEn: 'Plácida asks for nothing, needs nothing, troubles no one. There have been parties where no one noticed she was missing.',
      },
    ],
  },
  {
    id: 'serra',
    cor: {
      texto: 'text-lila/90',
      textoSuave: 'text-lila/60',
      borda: 'border-lila/25',
      bordaHover: 'hover:border-lila/70',
    },
    romano: 'VI',
    nome: 'A Serra',
    nomeEn: 'The Mountains',
    pergunta: 'O que tive de me tornar para sobreviver?',
    perguntaEn: 'What did I have to become in order to survive?',
    tema: 'As mulheres fortes demais, que nunca pedem nada.',
    temaEn: 'Women who became too strong and never ask for anything.',
    livros: [
      {
        slug: 'rom-frio',
        titulo: 'A Mulher Que Nunca Teve Frio',
        tituloEn: 'The Woman Who Never Felt the Cold',
        estado: 'disponivel',
        href: '/mulher-que-nunca-teve-frio',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'Serafina criou os irmãos desde os onze anos e nunca chorou. Toda a gente jura que ela não sente o frio.',
        promessaEn: 'Serafina raised her siblings from the age of eleven and never cried. Everyone swears she does not feel the cold.',
      },
      {
        slug: 'rom-cisterna',
        titulo: 'A Cisterna',
        tituloEn: 'The Cistern',
        estado: 'caminho',
        promessa: 'Soledade faz tudo sozinha desde sempre. Pedir, uma vez, não foi seguro, e nunca mais.',
        promessaEn: 'Soledade has always done everything alone. Asking, once, was not safe, and never again.',
      },
      {
        slug: 'rom-travessas',
        titulo: 'As Travessas Devolvidas',
        tituloEn: 'The Returned Dishes',
        estado: 'caminho',
        promessa: 'Quando adoece, a vila deixa-lhe comida à porta. Socorro devolve as travessas cheias.',
        promessaEn: 'When she falls ill, the village leaves food at her door. Socorro returns the dishes full.',
      },
    ],
  },
  {
    id: 'fiandeira',
    cor: {
      texto: 'text-ocre/90',
      textoSuave: 'text-ocre/60',
      borda: 'border-ocre/25',
      bordaHover: 'hover:border-ocre/70',
    },
    romano: 'VII',
    nome: 'A Fiandeira',
    nomeEn: 'The Mill',
    pergunta: 'Quem sou eu sem aquilo que faço?',
    perguntaEn: 'Who am I without what I do?',
    tema: 'Trabalho, mérito e a vida que fica por viver fora dele.',
    temaEn: 'Work, worth and the life left unlived outside it.',
    livros: [
      {
        slug: 'rom-fabrica',
        titulo: 'Enquanto a Fábrica Dorme',
        tituloEn: 'While the Mill Sleeps',
        estado: 'disponivel',
        href: '/enquanto-a-fabrica-dorme',
        nota: 'novo · terminado · lê o capítulo 1',
        notaEn: 'new · complete · read chapter 1',
        promessa: 'A fábrica fechou e Libânia continua a acordar às cinco. Sem trabalho, não sabe a que horas existe.',
        promessaEn: 'The mill has closed and Libânia still wakes at five. Without work, she does not know at what hour she exists.',
      },
      {
        slug: 'rom-chave',
        titulo: 'A Chave da Fábrica',
        tituloEn: 'The Key to the Mill',
        estado: 'caminho',
        promessa: 'Há trinta anos que a chave é dela: abre antes de todos, fecha depois de todos. Se ela parar, tudo cai.',
        promessaEn: 'For thirty years the key has been hers: first in, last out. If she stops, everything falls.',
      },
      {
        slug: 'rom-manta',
        titulo: 'A Manta Sem Nome',
        tituloEn: 'The Unsigned Blanket',
        estado: 'caminho',
        promessa: 'Meia vila dorme aquecida pelas mantas dela e não sabe. Velada não assina nada.',
        promessaEn: 'Half the village sleeps warm under her blankets and does not know it. Velada signs nothing.',
      },
    ],
  },
];
