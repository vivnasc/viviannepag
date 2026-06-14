// Os manuais-filhos do Método VS (os 3 movimentos), para as páginas de venda e
// os produtos. O texto vive em VER/VIR/VIVER-SOLTAR-{PT,EN}.md; aqui ficam os
// metadados de montra (título, promessa, amostra, preço, cor de marca).

export type ManualLivro = {
  slug: string;            // ver-soltar | vir-soltar | viver-soltar
  marca: string;           // ver.soltar
  movimento: string;       // a consciência
  cacho: string;           // Turbilhão + Memória
  promessa: string;        // dor -> alívio (uma linha)
  promessaEn: string;
  intro: string;           // 2-3 linhas de pitch
  introEn: string;
  amostra: string[];       // 2 parágrafos de amostra (PT)
  amostraEn: string[];
  depois: string;          // o estado-depois (uma palavra/imagem)
  depoisEn: string;
  preco: string;           // €9
  cor: { topo: string; baixo: string }; // gradiente do herói
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
    amostra: [
      'A tua cabeça não para. Antecipas conversas que ainda não aconteceram e revives, ponto por ponto, as que já aconteceram. E sentes cada coisa com tal intensidade que te tornas aquilo que sentes.',
      'Mas há uma margem. Se consegues ver um pensamento, então há em ti algo que não é esse pensamento. Não és a tempestade. És o céu por onde ela passa, e nenhum céu foi alguma vez rasgado por uma nuvem.',
    ],
    amostraEn: [
      'Your mind will not stop. You anticipate conversations that have not yet happened and relive, point by point, the ones that already have. And you feel each thing so intensely that you become what you feel.',
      'But there is a shore. If you can see a thought, then there is something in you that is not that thought. You are not the storm. You are the sky it passes through, and no sky was ever torn by a cloud.',
    ],
    depois: 'a margem',
    depoisEn: 'the shore',
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
    amostra: [
      'Chegas sempre primeiro. Antecipas o que os outros vão precisar, resolves antes que peçam, e ainda pedes desculpa por não teres feito mais. Sentar-te sem nada para fazer dá-te uma culpa surda.',
      'A plenitude que andas a perseguir ao fundo de mais uma lista não está na corrida. Está no repouso que tens medo de te permitir. As mãos que toda a vida apanharam os outros podem, enfim, pousar.',
    ],
    amostraEn: [
      'You always arrive first. You anticipate what others will need, you solve before they ask, and still you apologise for not having done more. To sit with nothing to do gives you a dull guilt.',
      'The fullness you chase at the bottom of one more list is not in the race. It is in the rest you are afraid to allow yourself. The hands that all your life caught others can, at last, come to rest.',
    ],
    depois: 'o colo',
    depoisEn: 'the lap',
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
    amostra: [
      'Vives inclinada para a frente, sempre um pouco à frente de onde estás, em direção a um "quando" onde, finalmente, vais poder ser feliz. E, ao mesmo tempo, agarrada a uma imagem de ti com medo de a perder.',
      'Mas não há chegada. Não estás atrasada para lugar nenhum. Podes parar de correr, tirar a armadura, e entrar na única vida que existe, esta. A estreia por que esperaste a vida toda é hoje.',
    ],
    amostraEn: [
      'You live leaning forward, always a little ahead of where you are, towards a "when" where, finally, you will be able to be happy. And, at the same time, clinging to an image of yourself, afraid to lose it.',
      'But there is no arrival. You are not late for anywhere. You can stop running, take off the armour, and enter the only life there is, this one. The premiere you waited for all your life is today.',
    ],
    depois: 'descalça',
    depoisEn: 'barefoot',
    preco: '€9',
    cor: { topo: '#26203A', baixo: '#100C1C' },
  },
];

export function getManual(slug: string): ManualLivro | undefined {
  return MANUAIS.find((m) => m.slug === slug);
}
