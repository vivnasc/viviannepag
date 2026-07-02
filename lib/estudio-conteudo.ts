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
  bold?: string[];
  notaVisual?: string;
  fundoClaro?: boolean;
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
  musicaSugerida?: string;
};

// Indexável por string: além dos 5 mundos, há paletas extra (carvao, creme) só
// para séries de reels, sem entrarem no tipo Mundo (export/hashtags ficam iguais).
export const PALETAS: Record<string, { bg: string; bg2: string; texto: string; destaque: string; nome: string }> = {
  freeme: { bg: '#8C4A36', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'FreeMe' },
  infonte: { bg: '#B8843D', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'Infonte' },
  synchim: { bg: '#5A1A2A', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#E08496', nome: 'SyncHim' },
  escola: { bg: '#1A1A2E', bg2: '#0F0F1A', texto: '#F2E8DC', destaque: '#C9B6FA', nome: 'Escola dos Véus' },
  autora: { bg: '#3A2818', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A', nome: 'Vivianne' },
  // carvão (escuro, neutro — sem dourado nem roxo) e creme (claro, minimalista)
  carvao: { bg: '#2A2825', bg2: '#141312', texto: '#EDE8DE', destaque: '#B9B2A6', nome: 'Carvão' },
  creme: { bg: '#F3ECE0', bg2: '#E7DCC9', texto: '#2C2622', destaque: '#6E5A44', nome: 'Creme' },
  // Soulab · escuro, elegante, lunar (identidade própria; ver lib/soulab/marca.ts)
  soulab: { bg: '#1B1726', bg2: '#0E0B16', texto: '#ECE6F2', destaque: '#C9A2E6', nome: 'Soulab' },
  // Crescer · terra e luz, quente e vivo (ver lib/crescer/marca.ts)
  crescer: { bg: '#171310', bg2: '#0C0A08', texto: '#F4ECDD', destaque: '#E0B15A', nome: 'Crescer' },
  // As 3 portas novas (livros) · motor proprio, ver lib/portas/marca.ts
  medo: { bg: '#161518', bg2: '#0F0F10', texto: '#EAE4D8', destaque: '#C8A86B', nome: 'Faces of Fear' },
  sinais: { bg: '#EFE7DA', bg2: '#F4EFE8', texto: '#5A4E42', destaque: '#A67C52', nome: 'Signs of Not Belonging' },
  transicao: { bg: '#EBE4D8', bg2: '#F5F1EA', texto: '#4D433A', destaque: '#9B866C', nome: 'The Great Transition' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Tu sabes do que estou a falar. Aquela culpa que aparece quando a casa finalmente está em silêncio. E ninguém te disse de onde vem.', bold: ['ninguém te disse', 'de onde vem'], notaVisual: 'Warm close-up portrait of a real woman, soft gaze, golden hour light, intimate editorial style, natural beauty' },
      { tipo: 'conteudo', texto: 'A culpa que sentes não nasceu contigo. Herdaste-a. E carrega-la como se fosse tua.', bold: ['não nasceu contigo', 'Herdaste-a'], notaVisual: 'Dark moody bedroom scene at night, single lamp light, unmade bed, contemplative atmosphere' },
      { tipo: 'conteudo', texto: 'A tua mãe sentiu-a. A mãe da tua mãe sentiu-a. Passou de geração em geração. Como uma mala que ninguém abriu.', bold: ['geração em geração', 'ninguém abriu'], notaVisual: 'Old family photo album open on wooden table, sepia tones, soft light' },
      { tipo: 'conteudo', texto: 'Na constelação familiar chamamos-lhe lealdade invisível. Tu conheces-lhe outro nome: "sou uma má mãe."', bold: ['lealdade invisível', 'má mãe'], notaVisual: 'Woman hands holding warm coffee cup, seen from above, kitchen table, morning light' },
      { tipo: 'conteudo', texto: 'Compensas a mais. Dizes sim quando o corpo grita não. Colocas-te sempre em último. E achas que és a única.', bold: ['a única'] },
      { tipo: 'conteudo', texto: 'Não és. E a culpa não é tua. Quando vi isto, mudou tudo para mim.', bold: ['não é tua', 'mudou tudo para mim'] },
      { tipo: 'cta', texto: 'Escrevi sobre isto. 40 paginas. Para a mulher que precisa de ouvir que a culpa tem origem. PDF imediato no link da bio.', bold: ['a culpa tem origem', 'PDF imediato'], destaque: 'A culpa não é boa conselheira', fundoClaro: true },
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
    horario: '20:00',
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
    horario: '14:00',
    musicaSugerida: 'Piano contemplativo (Ólafur Arnalds · Re:member, ou similar). Trending no IG: search "soft piano emotional"',
    slides: [
      { tipo: 'citacao', texto: '"Ninguém diz.\nE por isso tu achas\nque és a única."', destaque: 'A culpa não é boa conselheira' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Reconheces-te nisto? 3 sinais de que a culpa está a tomar decisões por ti. E tu nem dás por isso.', bold: ['3 sinais', 'decisões por ti'], notaVisual: 'Thoughtful woman sitting on sofa, knees drawn up, soft warm blanket, golden hour window light, intimate' },
      { tipo: 'conteudo', titulo: '1.', texto: 'Dizes sim quando o teu corpo pede não. E depois ficas com raiva de ti mesma por não teres sido honesta.', bold: ['sim', 'não', 'raiva de ti mesma'] },
      { tipo: 'conteudo', titulo: '2.', texto: 'Compensas. Presente a mais. Disponível a mais. Perfeita a mais. Porque para ti, suficiente nunca é suficiente.', bold: ['a mais', 'nunca é suficiente'] },
      { tipo: 'conteudo', titulo: '3.', texto: 'Quando corre bem, procuras o que correu mal. A culpa não te deixa ficar no bom. Puxa-te sempre de volta.', bold: ['ficar no bom', 'Puxa-te sempre de volta'] },
      { tipo: 'cta', texto: 'Há um exercício que te ajuda a separar o que é teu do que carregas pelos outros. 10 minutos. Está no guia.', bold: ['10 minutos'], destaque: 'O que é meu, o que não é meu', fundoClaro: true },
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
    horario: '20:00',
    reelScript: {
      gancho: 'Eu escrevi um livro sobre culpa. O momento mais difícil não foi escrever. Foi perceber que a culpa que eu carregava não era minha.',
      corpo: [
        'Durante anos achei que era eu. Que havia algo errado comigo.',
        'Até que comecei a estudar constelação familiar e vi: a culpa tem endereço. Tem origem. E na maioria dos casos, não é da pessoa que a sente.',
        'Escrevi este ebook para a mulher que precisa de ouvir isto.',
      ],
      cta: 'Se te identificas, o ebook está na bio.',
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Tu carregas coisas que não são tuas. E quando percebes quais são, o alívio é imediato.', bold: ['não são tuas', 'alívio é imediato'], notaVisual: 'Woman hands writing in leather journal on warm wooden table, soft morning light, contemplative' },
      { tipo: 'conteudo', texto: 'A tristeza da tua mãe. A frustração do teu pai. O sonho que a tua avó não viveu. Carregas tudo. Sem saber.', bold: ['Sem saber'] },
      { tipo: 'conteudo', texto: 'Uma folha. Dois lados. Lado esquerdo: o que é MEU. Lado direito: o que NÃO É MEU.', bold: ['MEU', 'NÃO É MEU'] },
      { tipo: 'conteudo', texto: 'Para o que é teu: "Cuido disto." Para o que não é teu: "Devolvo com amor."', bold: ['Cuido disto', 'Devolvo com amor'] },
      { tipo: 'citacao', texto: 'Não precisas de largar o amor. Precisas de largar o peso.', bold: ['o peso'] },
      { tipo: 'cta', texto: 'Guia completo com exercício passo a passo. PDF imediato no link da bio.', bold: ['passo a passo', 'PDF imediato'], destaque: 'O que é meu, o que não é meu', fundoClaro: true },
    ],
  },
  {
    dia: 7,
    tipo: 'carrossel-produto',
    plataforma: 'instagram',
    mundo: 'freeme',
    titulo: 'Semana 1: o que encontras nos ebooks e guias',
    descricao: 'Carrossel resumo da semana com os produtos para mães.',
    hashtags: [...HASHTAGS_BASE, ...HASHTAGS_MAE, '#recursosterapeuticos', '#ebooksdigitais'],
    produtoRelacionado: 'ebook-01-culpa',
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Se esta semana te tocou, estes recursos foram escritos para ti. Começa por onde te dói.', bold: ['escritos para ti', 'onde te dói'], notaVisual: 'Soft golden light through window curtains, books and dried flowers on table, warm feminine space' },
      { tipo: 'conteudo', texto: 'A culpa. De onde vem. O que te faz. Como começas a largar. 40 páginas. Ebook.', bold: ['A culpa'], destaque: 'A culpa não é boa conselheira' },
      { tipo: 'conteudo', texto: 'O peso. Exercício para separar o que é teu do que herdaste. 10 minutos que mudam tudo. Guia.', bold: ['O peso', '10 minutos'], destaque: 'O que é meu, o que não é meu' },
      { tipo: 'conteudo', texto: 'Os limites. 7 frases para dizeres não com amor e firmeza. Guia.', bold: ['Os limites'], destaque: '7 frases para dizer não sem culpa' },
      { tipo: 'cta', texto: 'PDF imediato. Ao teu ritmo. No teu tempo.', bold: ['PDF imediato', 'teu ritmo'], destaque: 'viviannedossantos.com/loja', fundoClaro: true },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: '"Nunca serei como a minha mãe." Já disseste isto? Eu também. E depois percebi porque é que não funciona.', bold: ['Eu também', 'não funciona'], notaVisual: 'Two women, mother and daughter, backs turned, warm light between them, emotional intimate editorial style' },
      { tipo: 'conteudo', texto: 'Abres a boca e sai aquela frase. Com aquele tom. E reconheces: é a voz dela dentro de ti.', bold: ['a voz dela dentro de ti'] },
      { tipo: 'conteudo', texto: 'Na constelação familiar chama-se lealdade invisível. Um pacto que nunca fizeste: repetir o que elas viveram para não as trair.', bold: ['lealdade invisível', 'nunca fizeste'] },
      { tipo: 'conteudo', texto: 'Sabotagem quando corre bem. Sentir que não mereces. Escolher sempre o difícil. Culpa quando estás feliz.', bold: ['não mereces', 'Culpa quando estás feliz'] },
      { tipo: 'conteudo', texto: 'Não se parte à força. Parte quando se vê. E quando vi, disse: "Devolvo com amor. E escolho o meu caminho."', bold: ['quando se vê', 'o meu caminho'] },
      { tipo: 'citacao', texto: 'O que herdaste não te define. Mas enquanto não o vires, vai decidir por ti.', bold: ['não te define', 'decidir por ti'] },
      { tipo: 'cta', texto: 'Escrevi este ebook para ti. Para a mulher que repete o que jurou não repetir. E quer perceber porquê. Link na bio.', bold: ['para ti', 'Link na bio'], destaque: 'O que herdaste sem saber', fundoClaro: true },
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
    horario: '20:00',
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
    horario: '14:00',
    musicaSugerida: 'Cinematic ambient (Max Richter · On the Nature of Daylight). Trending no IG: "emotional cinematic"',
    slides: [
      { tipo: 'citacao', texto: '"Há partes de ti\nque escolhem ficar pequenas\npara não trair\nquem te formou."', destaque: 'Vivianne dos Santos' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: '7 frases para dizer NÃO\nsem culpa', destaque: 'NÃO' },
      { tipo: 'conteudo', titulo: 'Frase 1', texto: '"Eu amo-te\ne a resposta é não."\n\nAmar e recusar\nnão são opostos.' },
      { tipo: 'conteudo', titulo: 'Frase 2', texto: '"Não preciso de justificar\no meu não."\n\nO não é uma frase completa.\nNão precisa de explicação.' },
      { tipo: 'conteudo', titulo: 'Frase 3', texto: '"Isto não é para mim\nneste momento."\n\nSem drama.\nSem porta fechada.\nApenas clareza.' },
      { tipo: 'conteudo', titulo: 'Mais 4 frases', texto: '4. "Preciso de pensar antes de responder."\n5. "Posso ajudar de outra forma."\n6. "Respeito o teu pedido e respeito o meu limite."\n7. "Dizer não a isto é dizer sim a mim."' },
      { tipo: 'cta', texto: 'Guia completo com contexto\ne exercícios\n\nLink na bio' },
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
    horario: '20:00',
    reelScript: {
      gancho: 'Houve um momento em que deixaste de saber quem és. Talvez não consigas apontar para ele no calendário.',
      corpo: [
        'Foi gradual. Foste acumulando papéis. Mãe, profissional, filha, mulher. Até que um dia percebeste que já não sabias o que querias.',
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Tu não és\nos teus papéis', destaque: 'os teus papéis' },
      { tipo: 'conteudo', titulo: 'A armadilha', texto: 'Mãe. Profissional.\nFilha. Mulher. Amiga.\n\nSão funções.\nNão são identidade.\n\nMas quando vives dentro deles\nesqueces quem és fora.' },
      { tipo: 'conteudo', titulo: 'O sinal', texto: 'Quando alguém te pergunta\n"o que queres?"\ne dá-te branco.\n\nÉ porque há muito tempo\nque só sabes o que os outros\nprecisam de ti.' },
      { tipo: 'conteudo', titulo: 'O eu para além do ego', texto: 'A psicologia transpessoal\nchama-lhe o Self:\na parte de ti que existe\npara além de todas as funções.\n\nEstá lá. Só precisa de espaço.' },
      { tipo: 'citacao', texto: '"Defines-te pela função.\nNão por ti."' },
      { tipo: 'cta', texto: 'Ebook "Quem és para além do que fazes"\nPDF imediato\nLink na bio' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'O que exploraste\nesta semana', destaque: 'esta semana' },
      { tipo: 'conteudo', titulo: 'Herança', texto: 'O que herdaste sem saber.\nAs lealdades invisíveis\nque te fazem repetir\no que juraste não repetir.\n\nEBOOK' },
      { tipo: 'conteudo', titulo: 'Limites', texto: '7 frases para dizer não\nsem culpa. Porque amar\ne recusar não são opostos.\n\nGUIA' },
      { tipo: 'conteudo', titulo: 'Identidade', texto: 'Quem és para além\ndo que fazes.\nQuando os papéis acabam,\no que fica?\n\nEBOOK' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Tens tudo\ne sentes que falta', destaque: 'que falta' },
      { tipo: 'conteudo', titulo: 'É uma terça-feira', texto: 'Um dia qualquer.\nPorque o vazio\nnão escolhe datas especiais\npara aparecer.\n\nChega quando menos esperas.\nNo meio do "correu tudo bem".' },
      { tipo: 'conteudo', titulo: 'A promessa não cumprida', texto: 'Disseram-te:\nestuda, trabalha, conquista.\nE o resto vem.\n\nConquistaste.\nE o resto não veio.' },
      { tipo: 'conteudo', titulo: 'A pergunta', texto: '"É isto?"\n\nNão é um defeito.\nNão é ingratidão.\n\nÉ uma convocação.\nO teu ser a pedir sentido,\nnão só sucesso.' },
      { tipo: 'conteudo', titulo: 'Sentido ≠ Sucesso', texto: 'O sucesso é externo.\nO sentido é interno.\n\nO sucesso é o que alcanças.\nO sentido é o que te preenche.\n\nPodes ter um sem o outro.' },
      { tipo: 'citacao', texto: '"A pergunta \'é isto?\'\nnão é um defeito.\nÉ uma convocação."' },
      { tipo: 'cta', texto: 'Ebook "O sentido que procuras"\nPDF imediato\nLink na bio' },
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
    horario: '20:00',
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
    horario: '14:00',
    musicaSugerida: 'Slow piano melancólico (Joep Beving · Solipsism). Trending no IG: "introspective piano"',
    slides: [
      { tipo: 'citacao', texto: '"Tens talento a mais\ne clareza a menos.\nE odeias-te por isso."', destaque: 'Nem todo o sonho que carregas nasceu em ti' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Esvaziar a mente\nem 3 passos', destaque: '3 passos' },
      { tipo: 'conteudo', titulo: 'Passo 1: Despejar', texto: 'Escreve tudo.\nSem filtro. Sem ordem.\nTudo o que está na cabeça\nvai para o papel.\n\n5 minutos. Sem parar.' },
      { tipo: 'conteudo', titulo: 'Passo 2: Separar', texto: 'Olha para o que escreveste.\nSepara em 3:\n\n→ O que posso resolver hoje\n→ O que não depende de mim\n→ O que é ruído' },
      { tipo: 'conteudo', titulo: 'Passo 3: Escolher', texto: 'Escolhe UMA coisa.\nApenas uma.\n\nFaz essa.\nO resto pode esperar.\n\nA mente não esvazia\ncom força.\nEsvazia com escolha.' },
      { tipo: 'cta', texto: 'Guia completo "Esvaziar a mente em 3 passos"\nLink na bio' },
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
    horario: '20:00',
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'De quem é a régua\nque mede a tua vida?', destaque: 'a régua' },
      { tipo: 'conteudo', titulo: 'A régua invisível', texto: 'Há uma régua na tua vida.\nMede tudo o que fazes.\nE nunca é suficiente.\n\nMas não foste tu que a criaste.' },
      { tipo: 'conteudo', titulo: 'Quem a pôs lá?', texto: 'O pai que nunca disse "estou orgulhoso".\nA mãe que mediu o amor pelo esforço.\nA escola que te classificou.\nA cultura que te disse o que conta.' },
      { tipo: 'conteudo', titulo: 'A lealdade às ambições', texto: 'Quando persegues algo\nque não te preenche,\npergunta:\n\nÉ meu este objectivo?\nOu estou a realizar\no sonho de outra pessoa?' },
      { tipo: 'citacao', texto: '"Antes de escolher o caminho,\ndescobre quem está a escolher."' },
      { tipo: 'cta', texto: 'Ebook "De quem é esta voz?"\nPDF imediato\nLink na bio' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Para quem faz demais\ne sente que falta', destaque: 'que falta' },
      { tipo: 'conteudo', titulo: 'Sonhos', texto: '"Nem todo o sonho\nque carregas nasceu em ti"\n\nPorque alcanças e continuas\na sentir que falta.\n\nEBOOK' },
      { tipo: 'conteudo', titulo: 'Voz', texto: '"De quem é esta voz?"\n\nQuem decidiu o que conta\ncomo sucesso na tua vida?\n\nEBOOK' },
      { tipo: 'conteudo', titulo: 'Mente', texto: '"Esvaziar a mente\nem 3 passos"\n\nDespejar. Separar. Escolher.\n\nGUIA' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'A mesma discussão.\nSempre.', destaque: 'Sempre.' },
      { tipo: 'conteudo', titulo: 'Tu sabes qual é', texto: 'Os mesmos gatilhos.\nAs mesmas palavras.\nA mesma frustração.\n\nNenhum dos dois quer isto.\nMas é o que acontece.\nSempre.' },
      { tipo: 'conteudo', titulo: 'O que está por baixo', texto: 'A constelação familiar\nvê o casal como sistema.\n\nCada um traz a sua família.\nOs seus padrões.\nOs seus nós.\n\nE o conflito é o encontro\ndesses dois sistemas.' },
      { tipo: 'conteudo', titulo: 'O dar e o receber', texto: 'Um dos princípios\ndo amor sistémico:\n\nQuando o dar e o receber\nestão desequilibrados,\no ressentimento cresce.\n\nQuem dá demais, cobra.\nQuem recebe demais, afasta-se.' },
      { tipo: 'conteudo', titulo: 'Os lugares', texto: 'Cada um tem o seu lugar.\nQuando um ocupa\no lugar do pai do outro,\nou da mãe, ou do filho,\no amor adoece.\n\nVoltar ao lugar\né o primeiro passo.' },
      { tipo: 'citacao', texto: '"Nenhum dos dois quer isto.\nMas é o que acontece.\nSempre."' },
      { tipo: 'cta', texto: 'Ebook "O nó invisível do casal"\nPDF imediato\nLink na bio' },
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
    horario: '20:00',
    reelScript: {
      gancho: 'Antes da próxima discussão com o teu parceiro, faz-te esta pergunta: "O que estou a sentir, de verdade?"',
      corpo: [
        'Não o que estás a pensar. O que estás a SENTIR.',
        'Porque a maioria das discussões não é sobre o assunto. É sobre a ferida por baixo.',
        'São 5 perguntas. Se as fizeres antes de reagir, desarmas metade dos conflitos.',
        'A primeira é esta: "O que estou a sentir, de verdade?"',
      ],
      cta: 'As 5 perguntas completas estão no guia. Link na bio.',
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
    horario: '14:00',
    musicaSugerida: 'Ambient cinematic emotional (Nils Frahm · Says). Trending no IG: "deep emotional"',
    slides: [
      { tipo: 'citacao', texto: '"O escuro não é o fim.\nParece o fim.\nMas não é."', destaque: 'Atravessar o escuro' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: '3 práticas de presença\npara hoje', destaque: 'para hoje' },
      { tipo: 'conteudo', titulo: 'Prática 1: A pausa dos 3 respiros', texto: 'Antes de começar qualquer coisa:\npára.\n\nTrês respirações longas.\nNão para "relaxar".\nPara chegar ao momento.' },
      { tipo: 'conteudo', titulo: 'Prática 2: Uma coisa de cada vez', texto: 'Escolhe uma tarefa.\nFaz só essa.\n\nSem telefone ao lado.\nSem lista na cabeça.\n\nPresença não é meditação.\nÉ fazer uma coisa\ncomo se só ela existisse.' },
      { tipo: 'conteudo', titulo: 'Prática 3: O chá consciente', texto: 'Prepara uma bebida quente.\nSente o calor na mão.\nO cheiro.\nO primeiro gole.\n\nÉ um minuto.\nMas é um minuto inteiro teu.' },
      { tipo: 'cta', texto: 'Mais 4 práticas no guia\n"Práticas de presença para o dia a dia"\nLink na bio' },
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
    horario: '20:00',
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Atravessar o escuro:\ncrises como passagem', destaque: 'passagem' },
      { tipo: 'conteudo', titulo: 'O lugar onde ninguém quer ir', texto: 'Há um lugar para onde\nninguém quer ir.\nUm lugar que aparece\nquando a vida se parte.\n\nUma perda. Uma ruptura.\nUm colapso.' },
      { tipo: 'conteudo', titulo: 'Duas leituras', texto: 'A leitura convencional:\nalgo está partido, precisa de conserto.\n\nA leitura transpessoal:\nalgo está a morrer\npara algo maior nascer.\n\nAmbas são válidas.\nMas a segunda dá sentido.' },
      { tipo: 'conteudo', titulo: 'O que ajuda a atravessar', texto: '→ Não negar o escuro\n→ Não apressar a luz\n→ Ter testemunhas (não estares sozinha)\n→ Confiar que há chão\nmesmo quando não o vês' },
      { tipo: 'citacao', texto: '"O escuro não é o fim.\nParece o fim.\nMas não é."' },
      { tipo: 'cta', texto: 'Ebook "Atravessar o escuro"\nPDF imediato\n\nNota: se estás em crise, procura apoio profissional.\nLink na bio' },
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'Ritual para o luto\nque ninguém vê', destaque: 'ninguém vê' },
      { tipo: 'conteudo', titulo: 'Há perdas sem funeral', texto: 'Um sonho que morreu.\nUma versão de ti que ficou para trás.\nUma fase que acabou.\nUma relação que mudou.\n\nSão perdas reais.\nMas ninguém envia flores.' },
      { tipo: 'conteudo', titulo: 'O ritual em 3 movimentos', texto: '1. NOMEAR\nDizer o que perdeste, em voz alta.\n\n2. HONRAR\nReconhecer o que essa coisa te deu.\n\n3. LARGAR\nEscrever numa folha e deixar ir\n(queimar, enterrar, soltar).' },
      { tipo: 'conteudo', titulo: 'Nota importante', texto: 'Este ritual é para perdas simbólicas.\n\nSe estás a atravessar um luto profundo,\nprocura apoio profissional.\nEste guia é um primeiro passo,\nnão substitui acompanhamento.' },
      { tipo: 'cta', texto: 'Guia completo "Ritual para o luto que ninguém vê"\nLink na bio' },
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
    horario: '20:00',
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
      cta: 'Todos disponíveis na bio.',
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
    horario: '11:30',
    slides: [
      { tipo: 'capa', texto: 'O mapa completo:\ntodos os livros e guias', destaque: 'o mapa completo' },
      { tipo: 'conteudo', titulo: 'Se carregas culpa', texto: '→ "A culpa não é boa conselheira"\n→ "O que é meu, o que não é meu"\n→ "7 frases para dizer não"\n\nPara a mãe que carrega.' },
      { tipo: 'conteudo', titulo: 'Se procuras sentido', texto: '→ "O sentido que procuras"\n→ "Quem és para além do que fazes"\n→ "Atravessar o escuro"\n\nPara quem perdeu o fio.' },
      { tipo: 'conteudo', titulo: 'Se fazes demais', texto: '→ "Nem todo o sonho nasceu em ti"\n→ "De quem é esta voz?"\n→ "Esvaziar a mente em 3 passos"\n\nPara quem nunca pára.' },
      { tipo: 'conteudo', titulo: 'Se o casal está preso', texto: '→ "O nó invisível do casal"\n→ "As 5 perguntas antes de uma discussão"\n→ "O que é mesmo teu"\n\nPara quem repete o conflito.' },
      { tipo: 'conteudo', titulo: 'Presença e luto', texto: '→ "Práticas de presença"\n→ "Ritual para o luto que ninguém vê"\n\nRecursos de autora\npara o dia a dia' },
      { tipo: 'cta', texto: 'Ebooks e Guias\nPDF imediato\n\nviviannedossantos.com/loja', destaque: 'Começa por onde te dói' },
    ],
  },
];
