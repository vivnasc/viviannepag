// A Biblioteca de Véspera — a secção pública dos romances.
// Sete estantes (uma pergunta cada), espelho das sete coleções da loja.
// Fonte: ficcao-plano/REPERTORIO-biblioteca.md (os títulos "a caminho" são a
// montra do que vem; só entram aqui quando a Vivianne os fechar no repertório).

export type LivroBiblioteca = {
  slug: string;
  titulo: string;
  tituloEn: string;
  estado: 'disponivel' | 'caminho';
  // só os disponíveis têm página própria
  href?: string;
  nota?: string;
  notaEn?: string;
};

export type Estante = {
  id: string;
  romano: string;
  nome: string;
  nomeEn: string;
  pergunta: string;
  perguntaEn: string;
  livros: LivroBiblioteca[];
};

export const ESTANTES: Estante[] = [
  {
    id: 'casas',
    romano: 'I',
    nome: 'As Casas de Família',
    nomeEn: 'The Family Houses',
    pergunta: 'O que estou a carregar que não é meu?',
    perguntaEn: "What am I carrying that isn't mine?",
    livros: [
      {
        slug: 'rom-01-amparo',
        titulo: 'As Mãos de Amparo',
        tituloEn: "Amparo's Hands",
        estado: 'disponivel',
        href: '/amparo',
        nota: 'oferta da casa · lê o capítulo 1 sem pedir nada',
        notaEn: 'a gift from the house · read chapter 1 freely',
      },
      { slug: 'rom-tradutora', titulo: 'A Tradutora', tituloEn: 'The Translator', estado: 'caminho' },
      { slug: 'rom-sentinela', titulo: 'A Sentinela', tituloEn: 'The Sentinel', estado: 'caminho' },
      { slug: 'rom-ferrolho', titulo: 'O Ferrolho', tituloEn: 'The Bolt', estado: 'caminho' },
    ],
  },
  {
    id: 'fonte',
    romano: 'II',
    nome: 'O Largo da Fonte',
    nomeEn: 'The Fountain Square',
    pergunta: 'O que estou a perseguir que não é meu?',
    perguntaEn: "What am I chasing that isn't mine?",
    livros: [
      { slug: 'rom-irma', titulo: 'O Nome da Irmã', tituloEn: "The Sister's Name", estado: 'caminho' },
      { slug: 'rom-estrada', titulo: 'A Estrada Nova', tituloEn: 'The New Road', estado: 'caminho' },
      { slug: 'rom-portas', titulo: 'As Portas Baixas', tituloEn: 'The Low Doors', estado: 'caminho' },
    ],
  },
  {
    id: 'mercearia',
    romano: 'III',
    nome: 'A Mercearia',
    nomeEn: 'The Shop',
    pergunta: 'O que me impede de receber o que é meu?',
    perguntaEn: 'What keeps me from receiving what is mine?',
    livros: [
      { slug: 'rom-caderno', titulo: 'O Caderno das Dívidas', tituloEn: 'The Ledger of Debts', estado: 'caminho' },
      { slug: 'rom-despensa', titulo: 'A Despensa Cheia', tituloEn: 'The Full Pantry', estado: 'caminho' },
      { slug: 'rom-presente', titulo: 'O Presente por Abrir', tituloEn: 'The Unopened Gift', estado: 'caminho' },
    ],
  },
  {
    id: 'ponte',
    romano: 'IV',
    nome: 'A Ponte',
    nomeEn: 'The Bridge',
    pergunta: 'O que me faz perder-me quando amo?',
    perguntaEn: 'What makes me lose myself when I love?',
    livros: [
      { slug: 'rom-cheias', titulo: 'O Homem das Cheias', tituloEn: 'The Man the Floods Brought', estado: 'caminho' },
      { slug: 'rom-casa-acabar', titulo: 'A Casa por Acabar', tituloEn: 'The Unfinished House', estado: 'caminho' },
      { slug: 'rom-trovoada', titulo: 'A Trovoada', tituloEn: 'The Thunderstorm', estado: 'caminho' },
    ],
  },
  {
    id: 'mesa',
    romano: 'V',
    nome: 'A Mesa Comprida',
    nomeEn: 'The Long Table',
    pergunta: 'Qual é o meu lugar entre os outros?',
    perguntaEn: 'What is my place among others?',
    livros: [
      { slug: 'rom-trave', titulo: 'A Trave-Mestra', tituloEn: 'The Master Beam', estado: 'caminho' },
      { slug: 'rom-estrangeira', titulo: 'A Estrangeira de Cá', tituloEn: 'The Foreigner from Here', estado: 'caminho' },
      { slug: 'rom-incomodo', titulo: 'Nenhum Incómodo', tituloEn: 'No Trouble at All', estado: 'caminho' },
    ],
  },
  {
    id: 'serra',
    romano: 'VI',
    nome: 'A Serra',
    nomeEn: 'The Mountains',
    pergunta: 'O que tive de me tornar para sobreviver?',
    perguntaEn: 'What did I have to become in order to survive?',
    livros: [
      { slug: 'rom-frio', titulo: 'A Mulher Que Nunca Teve Frio', tituloEn: 'The Woman Who Never Felt the Cold', estado: 'caminho' },
      { slug: 'rom-cisterna', titulo: 'A Cisterna', tituloEn: 'The Cistern', estado: 'caminho' },
      { slug: 'rom-travessas', titulo: 'As Travessas Devolvidas', tituloEn: 'The Returned Dishes', estado: 'caminho' },
    ],
  },
  {
    id: 'fiandeira',
    romano: 'VII',
    nome: 'A Fiandeira',
    nomeEn: 'The Mill',
    pergunta: 'Quem sou eu sem aquilo que faço?',
    perguntaEn: 'Who am I without what I do?',
    livros: [
      { slug: 'rom-fabrica', titulo: 'Enquanto a Fábrica Dorme', tituloEn: 'While the Mill Sleeps', estado: 'caminho' },
      { slug: 'rom-chave', titulo: 'A Chave da Fábrica', tituloEn: 'The Key to the Mill', estado: 'caminho' },
      { slug: 'rom-manta', titulo: 'A Manta Sem Nome', tituloEn: 'The Unsigned Blanket', estado: 'caminho' },
    ],
  },
];
