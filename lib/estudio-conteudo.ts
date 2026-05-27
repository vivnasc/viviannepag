export type TipoConteudo =
  | 'carrossel-educativo'
  | 'carrossel-dica'
  | 'carrossel-produto'
  | 'reel-gancho'
  | 'reel-bastidores'
  | 'citacao-visual';

export type Plataforma = 'instagram' | 'tiktok' | 'ambas';

export type Mundo = 'freeme' | 'infonte' | 'synchim' | 'escola' | 'autora';

export type Slide = {
  tipo: 'capa' | 'conteudo' | 'citacao' | 'cta';
  titulo?: string;
  texto: string;
  destaque?: string;
};

export type ReelScript = {
  gancho: string;
  corpo: string[];
  cta: string;
  musica?: string;
  duracao: string;
};

export type ConteudoDia = {
  dia: number;
  tipo: TipoConteudo;
  plataforma: Plataforma;
  mundo: Mundo;
  titulo: string;
  descricao: string;
  hashtags: string[];
  produtoRelacionado?: string;
  slides?: Slide[];
  reelScript?: ReelScript;
  horario: string;
  notas?: string;
};

export const PALETAS: Record<Mundo, { bg: string; bg2: string; texto: string; destaque: string; nome: string }> = {
  freeme: { bg: '#8C4A36', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'FreeMe' },
  infonte: { bg: '#B8843D', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'Infonte' },
  synchim: { bg: '#5A1A2A', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#E08496', nome: 'SyncHim' },
  escola: { bg: '#1A1A2E', bg2: '#0F0F1A', texto: '#F2E8DC', destaque: '#C9B6FA', nome: 'Escola dos Véus' },
  autora: { bg: '#3A2818', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'Vivianne' },
};

export const TIPO_LABELS: Record<TipoConteudo, { label: string; emoji: string; cor: string }> = {
  'carrossel-educativo': { label: 'Carrossel Educativo', emoji: '📚', cor: '#C9B6FA' },
  'carrossel-dica': { label: 'Carrossel Dica', emoji: '💡', cor: '#EBAE4A' },
  'carrossel-produto': { label: 'Carrossel Produto', emoji: '🛒', cor: '#E08496' },
  'reel-gancho': { label: 'Reel / Gancho', emoji: '🎬', cor: '#8C4A36' },
  'reel-bastidores': { label: 'Reel Bastidores', emoji: '🎥', cor: '#B8843D' },
  'citacao-visual': { label: 'Citação Visual', emoji: '✨', cor: '#F2E8DC' },
};

const HASHTAGS_BASE = ['#viviannedossantos', '#psicologiatranspessoal', '#constelacaofamiliar', '#autoconhecimento'];
const HASHTAGS_MAE = ['#maternidade', '#culpamaterna', '#sermaeeserela', '#maereal'];
const HASHTAGS_CASAL = ['#relacionamento', '#vidaadois', '#terapiadecasal', '#amorsistemico'];
const HASHTAGS_CRESCIMENTO = ['#crescimentopessoal', '#transformacao', '#despertar', '#psicologia'];
const HASHTAGS_PRESENCA = ['#presenca', '#mindfulness', '#plenitude', '#viverdevagar'];

export const CALENDARIO_30_DIAS: ConteudoDia[] = [
  // ═══════════ SEMANA 1: CULPA + FREEME ═══════════
  {
    dia: 1,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: 'A culpa que ninguém te disse que era herdada',
    descricao: 'Carrossel educativo sobre a origem da culpa materna. Baseado no Ebook 1.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#culpa', '#lealdadesinvisiveis'],
    produtoRelacionado: 'ebook-01-culpa',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'A culpa que ninguém\nte disse que era herdada', destaque: 'herdada' },
      { tipo: 'conteudo', titulo: 'Tu conheces esta sensação', texto: 'Deitas-te e a casa finalmente está em silêncio.\nMas em vez de descansar, começas a contar:\no que não fizeste, o que disseste a mais,\no que devias ter sido e não foste.' },
      { tipo: 'conteudo', titulo: 'A culpa não nasceu contigo', texto: 'A tua mãe sentiu-a.\nA mãe da tua mãe sentiu-a.\nPassou de geração em geração\ncomo uma mala que ninguém abriu\nmas todas carregam.' },
      { tipo: 'conteudo', titulo: 'O que a culpa te faz', texto: '→ Compensas a mais\n→ Dizes sim quando querias dizer não\n→ Colocas-te sempre em último\n→ Ficas em alerta permanente\n→ Sentes que nunca é suficiente' },
      { tipo: 'conteudo', titulo: 'Culpa ≠ Responsabilidade', texto: 'A culpa paralisa.\nA responsabilidade move.\n\nA culpa diz "és má mãe".\nA responsabilidade diz\n"o que posso fazer diferente?"' },
      { tipo: 'citacao', texto: '"Ninguém diz.\nE por isso tu achas\nque és a única."', destaque: 'a única' },
      { tipo: 'cta', texto: 'Isto é o que exploro no ebook\n"A culpa não é boa conselheira"\n\n€7 · PDF imediato\nLink na bio', destaque: 'viviannedossantos.com/loja' },
    ],
  },
  {
    dia: 2,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: '"Tu sabes do que estou a falar"',
    descricao: 'Reel com gancho emocional sobre a culpa materna. Falar directamente para a câmara.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#reelsportugal', '#maternidadereal'],
    produtoRelacionado: 'ebook-01-culpa',
    horario: '12:00',
    reelScript: {
      gancho: 'Tu sabes do que estou a falar. Aquela sensação que aparece quando te deitas e a casa finalmente está em silêncio.',
      corpo: [
        'Começas a contar: o que não fizeste, o que disseste a mais, o que devias ter sido e não foste.',
        'E achas que és a única que sente isto.',
        'Não és. A culpa materna é talvez o sentimento mais universal e mais silenciado da maternidade.',
        'E o mais importante: não nasceu contigo. Herdaste-a.',
      ],
      cta: 'Escrevi sobre isto. Link na bio.',
      musica: 'Piano suave / ambiente intimista',
      duracao: '30-45s',
    },
  },
  {
    dia: 3,
    tipo: 'citacao-visual',
    plataforma: 'instagram',
    mundo: 'freeme',
    titulo: 'Citação: "Ninguém diz"',
    descricao: 'Citação visual do Ebook 1 sobre fundo barro.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#citacao', '#frasesdodia'],
    produtoRelacionado: 'ebook-01-culpa',
    horario: '18:00',
    slides: [
      { tipo: 'citacao', texto: '"Ninguém diz.\nE por isso tu achas\nque és a única."', destaque: '— A culpa não é boa conselheira' },
    ],
  },
  {
    dia: 4,
    tipo: 'carrossel-dica',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: '3 sinais de que a culpa está a decidir por ti',
    descricao: 'Carrossel prático: sinais de que a culpa comanda as tuas decisões. Do Guia 1.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#dicaspraticas', '#limitessaudaveis'],
    produtoRelacionado: 'guia-01-meu',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: '3 sinais de que a culpa\nestá a decidir por ti', destaque: 'a culpa' },
      { tipo: 'conteudo', titulo: 'Sinal 1', texto: 'Dizes SIM\nquando o teu corpo\ngrita NÃO\n\nE depois sentes raiva\nde ti mesma\npor não ter dito a verdade.' },
      { tipo: 'conteudo', titulo: 'Sinal 2', texto: 'Compensas a mais.\n\nPresente a mais.\nDisponível a mais.\nPerfeita a mais.\n\nPorque "o suficiente"\nnunca é suficiente.' },
      { tipo: 'conteudo', titulo: 'Sinal 3', texto: 'Quando algo corre bem,\nprocuras o que correu mal.\n\nA culpa não te deixa\nficar no bom.\nPuxa-te sempre de volta\npara o que "devias ter feito".' },
      { tipo: 'cta', texto: 'No guia "O que é meu, o que não é meu"\nensino um exercício simples\npara separar o que é teu do que carregas.\n\n€5 · Link na bio' },
    ],
  },
  {
    dia: 5,
    tipo: 'reel-bastidores',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'Porque escrevo sobre culpa',
    descricao: 'Reel pessoal: o momento em que percebi que a culpa não era minha. Bastidores da escrita.',
    hashtags: [...HASHTAGS_BASE, '#bastidores', '#escritora', '#vidadeautora', '#vulnerabilidade'],
    horario: '12:00',
    reelScript: {
      gancho: 'Eu escrevi um livro sobre culpa. E o momento mais difícil não foi escrever — foi perceber que a culpa que eu carregava não era minha.',
      corpo: [
        'Durante anos achei que era eu. Que havia algo errado comigo.',
        'Até que comecei a estudar constelação familiar e vi: a culpa tem endereço. Tem origem. E na maioria dos casos, não é da pessoa que a sente.',
        'Escrevi este ebook para a mulher que precisa de ouvir isto.',
      ],
      cta: 'Se te identificas, o ebook está na bio. €7.',
      musica: 'Instrumental calmo / luz natural',
      duracao: '30-45s',
    },
  },
  {
    dia: 6,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: 'O que é meu, o que não é meu: como separar',
    descricao: 'Carrossel educativo sobre o exercício de separação do Guia 1.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#limitesemocionais', '#pesoemocional'],
    produtoRelacionado: 'guia-01-meu',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'O que é meu,\no que não é meu', destaque: 'não é meu' },
      { tipo: 'conteudo', titulo: 'Tu carregas coisas que não são tuas', texto: 'A tristeza da tua mãe.\nA frustração do teu pai.\nO sonho que a tua avó não viveu.\n\nCarregas sem saber.\nE sofres sem perceber porquê.' },
      { tipo: 'conteudo', titulo: 'O exercício das duas colunas', texto: 'Numa folha, divide ao meio:\n\nLado esquerdo: O QUE É MEU\n(os meus sentimentos, as minhas escolhas)\n\nLado direito: O QUE NÃO É MEU\n(dores herdadas, expectativas de outros)' },
      { tipo: 'conteudo', titulo: 'Uma frase para cada item', texto: 'Para o que é teu:\n"Isto é meu. Cuido disto."\n\nPara o que não é teu:\n"Isto não é meu.\nDevolvo com amor."' },
      { tipo: 'citacao', texto: '"Não precisas de largar o amor.\nPrecisas de largar o peso."' },
      { tipo: 'cta', texto: 'O guia completo com exercício guiado\nestá disponível por €5\n\nLink na bio' },
    ],
  },
  {
    dia: 7,
    tipo: 'carrossel-produto',
    plataforma: 'instagram',
    mundo: 'freeme',
    titulo: 'Semana FreeMe: o que encontras nos ebooks e guias',
    descricao: 'Carrossel resumo da semana com os produtos FreeMe.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#recursosterapeuticos', '#ebooksdigitais'],
    produtoRelacionado: 'ebook-01-culpa',
    horario: '10:00',
    slides: [
      { tipo: 'capa', texto: 'Para a mãe que carrega\no que nunca foi seu', destaque: 'nunca foi seu' },
      { tipo: 'conteudo', titulo: 'A culpa não é boa conselheira', texto: 'EBOOK · €7\n\nA culpa materna:\nde onde vem,\no que te impede de fazer,\ne como começar a largar.' },
      { tipo: 'conteudo', titulo: 'O que é meu, o que não é meu', texto: 'GUIA · €5\n\nUm exercício para separar\na tua responsabilidade\ndo que carregas pelos outros.' },
      { tipo: 'conteudo', titulo: '7 frases para dizer não sem culpa', texto: 'GUIA · €5\n\nFrases prontas\npara pôr limites\nquando a culpa aperta.' },
      { tipo: 'cta', texto: 'Todos disponíveis\nem PDF imediato\n\nviviannedossantos.com/loja', destaque: 'Link na bio' },
    ],
  },

  // ═══════════ SEMANA 2: HERANÇA + IDENTIDADE ═══════════
  {
    dia: 8,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: 'Porque repetes o que juraste nunca repetir',
    descricao: 'Carrossel educativo sobre lealdades invisíveis. Baseado no Ebook 2.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#lealdadesinvisiveis', '#padroesfamiliares'],
    produtoRelacionado: 'ebook-02-herdaste',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Porque repetes o que juraste\nnunca repetir', destaque: 'nunca repetir' },
      { tipo: 'conteudo', titulo: 'A frase mais dita', texto: '"Nunca serei como a minha mãe."\n\nÉ talvez a frase mais dita,\nmais sentida, e mais traída\nna história das mulheres.' },
      { tipo: 'conteudo', titulo: 'As lealdades invisíveis', texto: 'Na constelação familiar\nchamamos-lhes lealdades invisíveis.\n\nSão pactos silenciosos com a tua família:\nrepetir o sofrimento deles\npara não os trair.' },
      { tipo: 'conteudo', titulo: 'Como se manifesta', texto: '→ Sabotagem quando começa a correr bem\n→ Sentir que não mereces mais do que tiveram\n→ Repetir relações com a mesma dinâmica\n→ Escolher sempre o difícil\n→ Sentir culpa quando estás feliz' },
      { tipo: 'conteudo', titulo: 'O primeiro passo', texto: 'Não é lutar contra.\nNão é "quebrar o ciclo" com força.\n\nÉ ver. Reconhecer.\nDizer: "vejo o que carrego.\nE devolvendo com amor,\nescolho o meu caminho."' },
      { tipo: 'citacao', texto: '"Abres a boca e sai aquela frase.\nCom aquele tom.\nÉ a voz da tua mãe."' },
      { tipo: 'cta', texto: 'Ebook "O que herdaste sem saber"\n€7 · PDF imediato\n\nLink na bio' },
    ],
  },
  {
    dia: 9,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: '"Abres a boca e sai aquela frase"',
    descricao: 'Reel emocional sobre lealdades invisíveis.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#herancafamiliar', '#reelsportugal'],
    produtoRelacionado: 'ebook-02-herdaste',
    horario: '12:00',
    reelScript: {
      gancho: 'Abres a boca e sai aquela frase. Com aquele tom. E percebes: é a voz da tua mãe.',
      corpo: [
        'Não é coincidência. Chama-se lealdade invisível.',
        'É quando o teu corpo repete o que a tua mente jurou nunca fazer.',
        'Não é fraqueza. É a parte de ti que ainda pertence à tua família de uma forma que tu não escolheste.',
        'E a boa notícia é: quando vês, podes escolher.',
      ],
      cta: 'Escrevi sobre isto. "O que herdaste sem saber." Link na bio.',
      musica: 'Ambiente introspectivo / piano',
      duracao: '30-40s',
    },
  },
  {
    dia: 10,
    tipo: 'citacao-visual',
    plataforma: 'instagram',
    mundo: 'autora',
    titulo: 'Citação do escrito: lealdade invisível',
    descricao: 'Citação do escrito "A lealdade invisível que te tira o que queres".',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#citacao'],
    horario: '18:00',
    slides: [
      { tipo: 'citacao', texto: '"Há partes de ti\nque escolhem ficar pequenas\npara não trair\nquem te formou."', destaque: '— Vivianne dos Santos' },
    ],
  },
  {
    dia: 11,
    tipo: 'carrossel-dica',
    plataforma: 'ambas',
    mundo: 'freeme',
    titulo: '7 frases para dizer não sem culpa',
    descricao: 'Carrossel prático com as frases do Guia 2.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#limites', '#dizernao', '#comunicacaonaoviolenta'],
    produtoRelacionado: 'guia-02-frases',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: '7 frases para dizer NÃO\nsem culpa', destaque: 'NÃO' },
      { tipo: 'conteudo', titulo: 'Frase 1', texto: '"Eu amo-te\ne a resposta é não."\n\nAmar e recusar\nnão são opostos.' },
      { tipo: 'conteudo', titulo: 'Frase 2', texto: '"Não preciso de justificar\no meu não."\n\nO não é uma frase completa.\nNão precisa de explicação.' },
      { tipo: 'conteudo', titulo: 'Frase 3', texto: '"Isto não é para mim\nneste momento."\n\nSem drama.\nSem porta fechada.\nApenas clareza.' },
      { tipo: 'conteudo', titulo: 'Mais 4 frases', texto: '4. "Preciso de pensar antes de responder."\n5. "Posso ajudar de outra forma."\n6. "Respeito o teu pedido e respeito o meu limite."\n7. "Dizer não a isto é dizer sim a mim."' },
      { tipo: 'cta', texto: 'Guia completo com contexto\ne exercícios · €5\n\nLink na bio' },
    ],
  },
  {
    dia: 12,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'escola',
    titulo: '"Houve um momento em que deixaste de saber quem és"',
    descricao: 'Reel sobre perda de identidade. Baseado no Ebook 3.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#identidade', '#escoladosveus'],
    produtoRelacionado: 'ebook-03-quemes',
    horario: '12:00',
    reelScript: {
      gancho: 'Houve um momento em que deixaste de saber quem és. Talvez não consigas apontar para ele no calendário.',
      corpo: [
        'Foi gradual. Foste acumulando papéis — mãe, profissional, filha, mulher — até que um dia percebeste que já não sabias o que querias.',
        'Defines-te pela função. Não por ti.',
        'E quando alguém te pergunta "o que queres?", dá-te branco.',
        'Isso não é um defeito. É um sinal de que estás pronta para te encontrar.',
      ],
      cta: 'Escrevi sobre isto. "Quem és para além do que fazes." Link na bio.',
      musica: 'Ambiente contemplativo',
      duracao: '35-45s',
    },
  },
  {
    dia: 13,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'escola',
    titulo: 'Tu não és os teus papéis',
    descricao: 'Carrossel educativo sobre identidade vs função. Ebook 3.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#identidade', '#papeis'],
    produtoRelacionado: 'ebook-03-quemes',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Tu não és\nos teus papéis', destaque: 'os teus papéis' },
      { tipo: 'conteudo', titulo: 'A armadilha', texto: 'Mãe. Profissional.\nFilha. Mulher. Amiga.\n\nSão funções.\nNão são identidade.\n\nMas quando vives dentro deles\nesqueces quem és fora.' },
      { tipo: 'conteudo', titulo: 'O sinal', texto: 'Quando alguém te pergunta\n"o que queres?"\ne dá-te branco.\n\nÉ porque há muito tempo\nque só sabes o que os outros\nprecisam de ti.' },
      { tipo: 'conteudo', titulo: 'O eu para além do ego', texto: 'A psicologia transpessoal\nchama-lhe o Self:\na parte de ti que existe\npara além de todas as funções.\n\nEstá lá. Só precisa de espaço.' },
      { tipo: 'citacao', texto: '"Defines-te pela função.\nNão por ti."' },
      { tipo: 'cta', texto: 'Ebook "Quem és para além do que fazes"\n€7 · PDF imediato\nLink na bio' },
    ],
  },
  {
    dia: 14,
    tipo: 'carrossel-produto',
    plataforma: 'instagram',
    mundo: 'autora',
    titulo: 'Resumo semana 2: herança e identidade',
    descricao: 'Carrossel resumo da semana 2.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#recursos'],
    horario: '10:00',
    slides: [
      { tipo: 'capa', texto: 'O que exploraste\nesta semana', destaque: 'esta semana' },
      { tipo: 'conteudo', titulo: 'Herança', texto: 'O que herdaste sem saber\n— as lealdades invisíveis\nque te fazem repetir\no que juraste não repetir.\n\nEBOOK · €7' },
      { tipo: 'conteudo', titulo: 'Limites', texto: '7 frases para dizer não\nsem culpa — porque amar\ne recusar não são opostos.\n\nGUIA · €5' },
      { tipo: 'conteudo', titulo: 'Identidade', texto: 'Quem és para além\ndo que fazes —\nquando os papéis acabam,\no que fica?\n\nEBOOK · €7' },
      { tipo: 'cta', texto: 'Tudo disponível\nem PDF imediato\n\nviviannedossantos.com/loja' },
    ],
  },

  // ═══════════ SEMANA 3: SENTIDO + SONHOS + INFONTE ═══════════
  {
    dia: 15,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'Tens tudo e sentes que falta',
    descricao: 'Carrossel educativo sobre vazio existencial. Ebook 4.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#sentido', '#propósito', '#vazioexistencial'],
    produtoRelacionado: 'ebook-04-sentido',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Tens tudo\ne sentes que falta', destaque: 'que falta' },
      { tipo: 'conteudo', titulo: 'É uma terça-feira', texto: 'Um dia qualquer.\nPorque o vazio\nnão escolhe datas especiais\npara aparecer.\n\nChega quando menos esperas.\nNo meio do "correu tudo bem".' },
      { tipo: 'conteudo', titulo: 'A promessa não cumprida', texto: 'Disseram-te:\nestuda, trabalha, conquista.\nE o resto vem.\n\nConquistaste.\nE o resto não veio.' },
      { tipo: 'conteudo', titulo: 'A pergunta', texto: '"É isto?"\n\nNão é um defeito.\nNão é ingratidão.\n\nÉ uma convocação.\nO teu ser a pedir sentido,\nnão só sucesso.' },
      { tipo: 'conteudo', titulo: 'Sentido ≠ Sucesso', texto: 'O sucesso é externo.\nO sentido é interno.\n\nO sucesso é o que alcanças.\nO sentido é o que te preenche.\n\nPodes ter um sem o outro.' },
      { tipo: 'citacao', texto: '"A pergunta \'é isto?\'\nnão é um defeito.\nÉ uma convocação."' },
      { tipo: 'cta', texto: 'Ebook "O sentido que procuras"\n€7 · PDF imediato\nLink na bio' },
    ],
  },
  {
    dia: 16,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'infonte',
    titulo: '"Tu fizeste tudo certo e continuas perdida"',
    descricao: 'Reel sobre a mulher que alcança e não se preenche. Ebook 7.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#infonte', '#sonhos'],
    produtoRelacionado: 'ebook-07-sonho',
    horario: '12:00',
    reelScript: {
      gancho: 'Tu fizeste tudo certo. Estudaste. Trabalhaste. E continuas perdida.',
      corpo: [
        'Não queres a meta. Queres o que ela promete: preencher o vazio.',
        'Mas chega lá e o vazio vem contigo.',
        'E se os sonhos que carregas não forem todos teus? E se estiveres a perseguir o futuro para reparar o passado?',
        'A pergunta não é "o que quero alcançar?" É "de quem é este sonho?"',
      ],
      cta: '"Nem todo o sonho que carregas nasceu em ti." Link na bio.',
      musica: 'Cinematográfica / emocional',
      duracao: '35-45s',
    },
  },
  {
    dia: 17,
    tipo: 'citacao-visual',
    plataforma: 'instagram',
    mundo: 'infonte',
    titulo: 'Citação: talento a mais, clareza a menos',
    descricao: 'Citação visual do Ebook 7.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#citacao'],
    produtoRelacionado: 'ebook-07-sonho',
    horario: '18:00',
    slides: [
      { tipo: 'citacao', texto: '"Tens talento a mais\ne clareza a menos.\nE odeias-te por isso."', destaque: '— Nem todo o sonho que carregas nasceu em ti' },
    ],
  },
  {
    dia: 18,
    tipo: 'carrossel-dica',
    plataforma: 'ambas',
    mundo: 'infonte',
    titulo: 'Esvaziar a mente em 3 passos',
    descricao: 'Carrossel prático do Guia 4.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_PRESENCA, '#mente', '#foco', '#ansiedade'],
    produtoRelacionado: 'guia-04-mente',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Esvaziar a mente\nem 3 passos', destaque: '3 passos' },
      { tipo: 'conteudo', titulo: 'Passo 1: Despejar', texto: 'Escreve tudo.\nSem filtro. Sem ordem.\nTudo o que está na cabeça\nvai para o papel.\n\n5 minutos. Sem parar.' },
      { tipo: 'conteudo', titulo: 'Passo 2: Separar', texto: 'Olha para o que escreveste.\nSepara em 3:\n\n→ O que posso resolver hoje\n→ O que não depende de mim\n→ O que é ruído' },
      { tipo: 'conteudo', titulo: 'Passo 3: Escolher', texto: 'Escolhe UMA coisa.\nApenas uma.\n\nFaz essa.\nO resto pode esperar.\n\nA mente não esvazia\ncom força.\nEsvazia com escolha.' },
      { tipo: 'cta', texto: 'Guia completo "Esvaziar a mente em 3 passos"\n€5 · Link na bio' },
    ],
  },
  {
    dia: 19,
    tipo: 'reel-bastidores',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'A minha rotina de escrita',
    descricao: 'Reel bastidores: como escrevo os ebooks. Humanizar e criar conexão.',
    hashtags: [...HASHTAGS_BASE, '#bastidores', '#escritora', '#rotinadeescrita'],
    horario: '12:00',
    reelScript: {
      gancho: 'Perguntam-me como escrevo. A verdade é: não tenho rotina bonita. Tenho necessidade.',
      corpo: [
        'Escrevo quando me dói. Quando alguma coisa que li nas pós-graduações encaixa numa ferida que já conheço.',
        'Primeiro escrevo para mim. Depois percebo que é para muita gente.',
        'Cada ebook nasce assim: de um nó meu que outros também carregam.',
      ],
      cta: 'Os ebooks estão na bio. São o resultado disso.',
      musica: 'Lo-fi / ambiente de escrita',
      duracao: '25-35s',
    },
  },
  {
    dia: 20,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'infonte',
    titulo: 'De quem é a régua que mede a tua vida?',
    descricao: 'Carrossel educativo sobre vozes internas. Ebook 8.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#autocritica', '#vozinterior'],
    produtoRelacionado: 'ebook-08-voz',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'De quem é a régua\nque mede a tua vida?', destaque: 'a régua' },
      { tipo: 'conteudo', titulo: 'A régua invisível', texto: 'Há uma régua na tua vida.\nMede tudo o que fazes.\nE nunca é suficiente.\n\nMas não foste tu que a criaste.' },
      { tipo: 'conteudo', titulo: 'Quem a pôs lá?', texto: 'O pai que nunca disse "estou orgulhoso".\nA mãe que mediu o amor pelo esforço.\nA escola que te classificou.\nA cultura que te disse o que conta.' },
      { tipo: 'conteudo', titulo: 'A lealdade às ambições', texto: 'Quando persegues algo\nque não te preenche,\npergunta:\n\nÉ meu este objectivo?\nOu estou a realizar\no sonho de outra pessoa?' },
      { tipo: 'citacao', texto: '"Antes de escolher o caminho,\ndescobre quem está a escolher."' },
      { tipo: 'cta', texto: 'Ebook "De quem é esta voz?"\n€7 · PDF imediato\nLink na bio' },
    ],
  },
  {
    dia: 21,
    tipo: 'carrossel-produto',
    plataforma: 'instagram',
    mundo: 'infonte',
    titulo: 'Para quem faz demais e sente que falta',
    descricao: 'Carrossel CTA semana Infonte.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#infonte'],
    horario: '10:00',
    slides: [
      { tipo: 'capa', texto: 'Para quem faz demais\ne sente que falta', destaque: 'que falta' },
      { tipo: 'conteudo', titulo: 'Sonhos', texto: '"Nem todo o sonho\nque carregas nasceu em ti"\n\nPorque alcanças e continuas\na sentir que falta.\n\nEBOOK · €7' },
      { tipo: 'conteudo', titulo: 'Voz', texto: '"De quem é esta voz?"\n\nQuem decidiu o que conta\ncomo sucesso na tua vida?\n\nEBOOK · €7' },
      { tipo: 'conteudo', titulo: 'Mente', texto: '"Esvaziar a mente\nem 3 passos"\n\nDespejar. Separar. Escolher.\n\nGUIA · €5' },
      { tipo: 'cta', texto: 'PDF imediato\nviviannedossantos.com/loja', destaque: 'Link na bio' },
    ],
  },

  // ═══════════ SEMANA 4: CASAL + ESCURO + PRESENÇA ═══════════
  {
    dia: 22,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'synchim',
    titulo: 'A mesma discussão, sempre',
    descricao: 'Carrossel educativo sobre dinâmica de casal. Ebook 6.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CASAL, '#conflitos'],
    produtoRelacionado: 'ebook-06-no-casal',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'A mesma discussão.\nSempre.', destaque: 'Sempre.' },
      { tipo: 'conteudo', titulo: 'Tu sabes qual é', texto: 'Os mesmos gatilhos.\nAs mesmas palavras.\nA mesma frustração.\n\nNenhum dos dois quer isto.\nMas é o que acontece.\nSempre.' },
      { tipo: 'conteudo', titulo: 'O que está por baixo', texto: 'A constelação familiar\nvê o casal como sistema.\n\nCada um traz a sua família.\nOs seus padrões.\nOs seus nós.\n\nE o conflito é o encontro\ndesses dois sistemas.' },
      { tipo: 'conteudo', titulo: 'O dar e o receber', texto: 'Um dos princípios\ndo amor sistémico:\n\nQuando o dar e o receber\nestão desequilibrados,\no ressentimento cresce.\n\nQuem dá demais, cobra.\nQuem recebe demais, afasta-se.' },
      { tipo: 'conteudo', titulo: 'Os lugares', texto: 'Cada um tem o seu lugar.\nQuando um ocupa\no lugar do pai do outro,\nou da mãe, ou do filho,\no amor adoece.\n\nVoltar ao lugar\né o primeiro passo.' },
      { tipo: 'citacao', texto: '"Nenhum dos dois quer isto.\nMas é o que acontece.\nSempre."' },
      { tipo: 'cta', texto: 'Ebook "O nó invisível do casal"\n€7 · PDF imediato\nLink na bio' },
    ],
  },
  {
    dia: 23,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'synchim',
    titulo: '"O que estou a sentir, de verdade?"',
    descricao: 'Reel sobre as 5 perguntas antes de uma discussão. Guia 6.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CASAL, '#comunicacao', '#reelsportugal'],
    produtoRelacionado: 'guia-06-perguntas',
    horario: '12:00',
    reelScript: {
      gancho: 'Antes da próxima discussão com o teu parceiro, faz-te esta pergunta: "O que estou a sentir, de verdade?"',
      corpo: [
        'Não o que estás a pensar. O que estás a SENTIR.',
        'Porque a maioria das discussões não é sobre o assunto. É sobre a ferida por baixo.',
        'São 5 perguntas. Se as fizeres antes de reagir, desarmas metade dos conflitos.',
        'A primeira é esta: "O que estou a sentir, de verdade?"',
      ],
      cta: 'As 5 perguntas completas estão no guia. €5. Link na bio.',
      musica: 'Instrumental suave',
      duracao: '30-40s',
    },
  },
  {
    dia: 24,
    tipo: 'citacao-visual',
    plataforma: 'instagram',
    mundo: 'escola',
    titulo: 'Citação: o escuro não é o fim',
    descricao: 'Citação visual do Ebook 5.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#citacao', '#resiliencia'],
    produtoRelacionado: 'ebook-05-escuro',
    horario: '18:00',
    slides: [
      { tipo: 'citacao', texto: '"O escuro não é o fim.\nParece o fim.\nMas não é."', destaque: '— Atravessar o escuro' },
    ],
  },
  {
    dia: 25,
    tipo: 'carrossel-dica',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: '3 práticas de presença para hoje',
    descricao: 'Carrossel prático do Guia 3.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_PRESENCA, '#praticas', '#pausar'],
    produtoRelacionado: 'guia-03-presenca',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: '3 práticas de presença\npara hoje', destaque: 'para hoje' },
      { tipo: 'conteudo', titulo: 'Prática 1: A pausa dos 3 respiros', texto: 'Antes de começar qualquer coisa:\npára.\n\nTrês respirações longas.\nNão para "relaxar".\nPara chegar ao momento.' },
      { tipo: 'conteudo', titulo: 'Prática 2: Uma coisa de cada vez', texto: 'Escolhe uma tarefa.\nFaz só essa.\n\nSem telefone ao lado.\nSem lista na cabeça.\n\nPresença não é meditação.\nÉ fazer uma coisa\ncomo se só ela existisse.' },
      { tipo: 'conteudo', titulo: 'Prática 3: O chá consciente', texto: 'Prepara uma bebida quente.\nSente o calor na mão.\nO cheiro.\nO primeiro gole.\n\nÉ um minuto.\nMas é um minuto inteiro teu.' },
      { tipo: 'cta', texto: 'Mais 4 práticas no guia\n"Práticas de presença para o dia a dia"\n€5 · Link na bio' },
    ],
  },
  {
    dia: 26,
    tipo: 'reel-bastidores',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'O que estudo nas pós-graduações',
    descricao: 'Reel bastidores: as 3 pós-graduações e como ligam aos produtos.',
    hashtags: [...HASHTAGS_BASE, '#posgraduacao', '#formacao', '#psicologia', '#unyleya'],
    horario: '12:00',
    reelScript: {
      gancho: 'Estou a fazer 3 pós-graduações ao mesmo tempo. Em Psicologia Transpessoal, Psicologia e Espiritualidade, e Constelação Familiar Sistémica.',
      corpo: [
        'Cada área olha para o ser humano de um ângulo diferente.',
        'A constelação vê os nós da família. A transpessoal vê para além do ego. A espiritualidade procura o sentido.',
        'Os meus ebooks e guias são o resultado de estudar estas três lentes e traduzi-las para linguagem de gente.',
      ],
      cta: 'Os livros estão na bio. São a ponte entre o que estudo e o que tu sentes.',
      musica: 'Ambiente de estudo / calmo',
      duracao: '30-40s',
    },
  },
  {
    dia: 27,
    tipo: 'carrossel-educativo',
    plataforma: 'ambas',
    mundo: 'escola',
    titulo: 'Atravessar o escuro: crises como passagem',
    descricao: 'Carrossel educativo sobre crises de transformação. Ebook 5.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#crise', '#transformacao', '#noiteescura'],
    produtoRelacionado: 'ebook-05-escuro',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Atravessar o escuro:\ncrises como passagem', destaque: 'passagem' },
      { tipo: 'conteudo', titulo: 'O lugar onde ninguém quer ir', texto: 'Há um lugar para onde\nninguém quer ir.\nUm lugar que aparece\nquando a vida se parte.\n\nUma perda. Uma ruptura.\nUm colapso.' },
      { tipo: 'conteudo', titulo: 'Duas leituras', texto: 'A leitura convencional:\nalgo está partido, precisa de conserto.\n\nA leitura transpessoal:\nalgo está a morrer\npara algo maior nascer.\n\nAmbas são válidas.\nMas a segunda dá sentido.' },
      { tipo: 'conteudo', titulo: 'O que ajuda a atravessar', texto: '→ Não negar o escuro\n→ Não apressar a luz\n→ Ter testemunhas (não estares sozinha)\n→ Confiar que há chão\nmesmo quando não o vês' },
      { tipo: 'citacao', texto: '"O escuro não é o fim.\nParece o fim.\nMas não é."' },
      { tipo: 'cta', texto: 'Ebook "Atravessar o escuro"\n€7 · PDF imediato\n\nNota: se estás em crise, procura apoio profissional.\nLink na bio' },
    ],
  },
  {
    dia: 28,
    tipo: 'carrossel-dica',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'Ritual para o luto que ninguém vê',
    descricao: 'Carrossel prático sobre luto simbólico. Guia 5.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#luto', '#perdas', '#ritual'],
    produtoRelacionado: 'guia-05-luto',
    horario: '08:30',
    slides: [
      { tipo: 'capa', texto: 'Ritual para o luto\nque ninguém vê', destaque: 'ninguém vê' },
      { tipo: 'conteudo', titulo: 'Há perdas sem funeral', texto: 'Um sonho que morreu.\nUma versão de ti que ficou para trás.\nUma fase que acabou.\nUma relação que mudou.\n\nSão perdas reais.\nMas ninguém envia flores.' },
      { tipo: 'conteudo', titulo: 'O ritual em 3 movimentos', texto: '1. NOMEAR\nDizer o que perdeste, em voz alta.\n\n2. HONRAR\nReconhecer o que essa coisa te deu.\n\n3. LARGAR\nEscrever numa folha e deixar ir\n(queimar, enterrar, soltar).' },
      { tipo: 'conteudo', titulo: 'Nota importante', texto: 'Este ritual é para perdas simbólicas.\n\nSe estás a atravessar um luto profundo,\nprocura apoio profissional.\nEste guia é um primeiro passo,\nnão substitui acompanhamento.' },
      { tipo: 'cta', texto: 'Guia completo "Ritual para o luto que ninguém vê"\n€5 · Link na bio' },
    ],
  },

  // ═══════════ ÚLTIMOS DIAS: SÍNTESE + TRAVESSIAS ═══════════
  {
    dia: 29,
    tipo: 'reel-gancho',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: '"Se tivesse de escolher uma frase para cada livro"',
    descricao: 'Reel síntese: uma frase de cada ebook. Visão geral de toda a obra.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#livros', '#ebooks'],
    horario: '12:00',
    reelScript: {
      gancho: 'Se tivesse de escolher uma frase de cada livro que escrevi, seria isto:',
      corpo: [
        'Culpa: "Ninguém diz. E por isso achas que és a única."',
        'Herança: "Abres a boca e sai a voz da tua mãe."',
        'Identidade: "Defines-te pela função. Não por ti."',
        'Sentido: "A pergunta \'é isto?\' não é um defeito."',
        'Escuro: "O escuro não é o fim. Parece o fim."',
        'Casal: "Nenhum dos dois quer isto. Mas é o que acontece."',
        'Sonhos: "Tens talento a mais e clareza a menos."',
        'Voz: "Antes de escolher o caminho, descobre quem está a escolher."',
      ],
      cta: 'Todos disponíveis na bio. €7 cada.',
      musica: 'Cinematográfica / emocional',
      duracao: '45-60s',
    },
  },
  {
    dia: 30,
    tipo: 'carrossel-produto',
    plataforma: 'ambas',
    mundo: 'autora',
    titulo: 'O mapa completo: todos os livros e guias',
    descricao: 'Carrossel final: mapa visual de todos os produtos e como se ligam.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_CRESCIMENTO, '#recursosterapeuticos', '#loja'],
    horario: '10:00',
    slides: [
      { tipo: 'capa', texto: 'O mapa completo:\ntodos os livros e guias', destaque: 'o mapa completo' },
      { tipo: 'conteudo', titulo: 'Se carregas culpa', texto: '→ "A culpa não é boa conselheira"\n→ "O que é meu, o que não é meu"\n→ "7 frases para dizer não"\n\nMundo FreeMe · A travessia da mãe' },
      { tipo: 'conteudo', titulo: 'Se procuras sentido', texto: '→ "O sentido que procuras"\n→ "Quem és para além do que fazes"\n→ "Atravessar o escuro"\n\nEscola dos Véus · Transformação' },
      { tipo: 'conteudo', titulo: 'Se fazes demais', texto: '→ "Nem todo o sonho nasceu em ti"\n→ "De quem é esta voz?"\n→ "Esvaziar a mente em 3 passos"\n\nInfonte · A fonte interior' },
      { tipo: 'conteudo', titulo: 'Se o casal está preso', texto: '→ "O nó invisível do casal"\n→ "As 5 perguntas antes de uma discussão"\n→ "O que é mesmo teu"\n\nSyncHim · O amor dessincronizado' },
      { tipo: 'conteudo', titulo: 'Presença e luto', texto: '→ "Práticas de presença"\n→ "Ritual para o luto que ninguém vê"\n\nRecursos de autora\npara o dia a dia' },
      { tipo: 'cta', texto: 'Ebooks €7 · Guias €5\nPDF imediato\n\nviviannedossantos.com/loja', destaque: 'Começa por onde te dói' },
    ],
  },
];
