// As 7 Colecoes do Universo (Vivianne dos Santos)
// Origem: ebooks-plano/universo/00-MAPA-MESTRE.md
// Cada produto e mapeado a uma colecao via slug, sem precisar de migracao na DB.

export type ColecaoId =
  | 'freeme-mae'
  | 'infonte'
  | 'prosperidade'
  | 'amor'
  | 'pertenca'
  | 'forca'
  | 'trabalho';

export type Colecao = {
  id: ColecaoId;
  romano: string;
  nome: string;
  nome_en: string;
  pitch: string;
  pitch_en: string;
  feridas: string;
  feridas_en: string;
  estado: 'producao' | 'banco' | 'em-breve';
  cor: string;       // border accent
  travessia?: string;
  // Abertura comum a toda a colecao. Aparece na loja como bloco editorial
  // acima dos produtos e tambem em cada ebook como pagina de abertura.
  // Fonte canonica: ebooks-plano/Novos/COLECAO-abertura-comum.md (espelhado aqui).
  abertura?: string;
  aberturaTitulo?: string;
  aberturaAssinatura?: string;
  // Teaser 1-2 frases mostrado por defeito na loja. Foco: convite, nao
  // explicacao. A abertura completa fica em 'ler completa' expansivel.
  aberturaTeaser?: string;
  aberturaTeaser_en?: string;
};

const ABERTURA_FREEME_MAE = `A pergunta desta coleção é uma só: o que estou a carregar que não é meu?

Não sei qual foi a dor que te trouxe até aqui. Talvez a culpa que aparece à noite. Um filho que não larga a tua mão, ou um que largou e não voltou. O cansaço de tentar salvar, de querer unir, de não conseguir dizer basta. Ou o medo de um dia pesares a alguém.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

Durante muito tempo acreditaste que amar era carregar. Que uma boa mãe segura tudo, resolve tudo, sustenta tudo, e nunca pesa, nunca falha, nunca precisa. Que o amor se mede pelo que se aguenta.

Não se mede assim.

Há um momento, em cada uma destas histórias, em que o amor deixa de ser fusão e começa a ser relação. Em que parar de carregar não é abandonar. Unir não é fundir. Amar não é desaparecer dentro de quem se ama.

Estes livros não te vão ensinar a ser melhor mãe. Vão devolver-te a pergunta que ficou por baixo de tudo: o que é que tu andas a carregar que nunca foi teu para carregar?

Não te prometo transformação ao virar a página. O que estas páginas te dão é compreensão, um nome, a certeza de que não estás sozinha nem a falhar. A travessia funda faz-se devagar, e às vezes com quem te acompanhe.

Mas ver já muda alguma coisa. Seja qual for a porta por onde entraste, a saída é a mesma: pousar o que não é teu, e voltar a ti, sem deixares de os amar.`;

const ABERTURA_INFONTE = `A pergunta desta coleção é uma só: o que estou a perseguir que não é meu?

Tu não és daquelas que param. Levantas-te cedo, resolves, entregas, alcanças. E mesmo assim, num lugar fundo, há uma voz que pergunta: quando é que isto vai ser suficiente?

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

Talvez persigas uma meta que está sempre um pouco mais à frente. Talvez já tenhas chegado tantas vezes que perdeste a conta, e nenhuma chegada te deu o que prometia. Talvez te faças pequena para não incomodar, ou trave-te quando podias ter mais. Talvez a vida que segues nem tenha nascido em ti.

Por baixo de tudo, ou persegues no futuro o que te faltou receber no passado, ou não te autorizas a ocupar aquilo que já és.

Estes livros não te vão ensinar a alcançar mais depressa. Vão devolver-te uma pergunta que ninguém te deixou fazer: quem és tu antes de chegares?

Não te prometo que saias diferente ao virar a página. O que estas páginas te dão é clareza, um nome para o cansaço que não passa com o descanso. A travessia funda faz-se ao teu ritmo, e às vezes com quem te acompanhe.

Mas ver já muda alguma coisa. E talvez, pela primeira vez, possas acreditar nisto: não precisas de chegar a lado nenhum para já seres suficiente. Só precisas de voltar.`;

const ABERTURA_PROSPERIDADE = `A pergunta desta coleção é uma só: o que me impede de receber o que é meu?

Esta coleção parece falar de dinheiro. Não fala. Fala das muitas formas como uma mulher impede o valor de circular na própria vida.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

Talvez dês sempre mais do que recebes, e te sintas em dívida quando alguém te dá algo. Talvez baixes o preço, ofereças, descontes, porque cobrar te aperta a garganta. Talvez travas quando podias ter mais, como se prosperar fosse trair quem teve menos. Talvez recebas um elogio e o devolvas antes de o sentir.

Em todas, a ferida é a mesma: algures aprendeste que não tens autorização para receber valor. Que o teu lugar tem de ser pago. Que ter é tirar a alguém.

Estes livros não te vão ensinar a faturar mais. Vão devolver-te uma pergunta que poucas se atrevem a fazer: e se eu tivesse direito a receber, sem pagar, sem culpa, sem pedir desculpa?

Não te prometo abundância ao virar a página. O que estas páginas te dão é clareza sobre o sítio exato onde fechas a torneira. A travessia funda faz-se ao teu ritmo, e às vezes com quem te acompanhe.

Mas ver onde se trava já é meio caminho para deixar passar. O valor que é teu não se conquista. Só precisa que pares de o barrar, e voltes a deixar-te receber.`;

const ABERTURA_SYNCHIM = `A pergunta desta coleção é uma só: o que me faz perder-me quando amo?

Tu não és má a amar. Amas de mais, talvez. Ou amas o que foge, ou desapareces dentro de quem amas, ou esperas sentada que te escolham, ou confundes a tempestade com paixão. Mas má, não és.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

O problema não começou neste homem. Começou atrás, num amor de origem que te ensinou o que esperar, o que pedir, o que aguentar, o que valer. Aprendeste se o amor se persegue ou se recebe, se tens de te tornar útil para ficar, se baixar a guarda é perigo. E levas isso, sem saber, para dentro de cada relação.

Estes livros não são sobre relacionamentos. São sobre a ferida que levas para dentro do amor antes de o amor sequer começar.

Cada um mostra-te uma forma de fusão. Fundir-te com a ausência, com a utilidade, com o potencial dele, com o drama, com o outro até desapareceres. E a travessia, em todos, é a mesma: o amor deixar de ser fusão e voltar a ser relação. Dois que se veem, e não dois que se completam por falta.

Não te prometo o amor certo ao virar a página. O que estas páginas te dão é o nome do teu padrão. Compreender essa ferida é a primeira metade. A outra metade faz-se a dois, e isso é onde a SyncHim entra.

Mas primeiro, tu. Porque antes de o amor poder ser relação, tens de voltar a existir dentro dele.`;

const ABERTURA_PERTENCA = `A pergunta desta coleção é uma só: qual é o meu lugar entre os outros?

Olha para a tua vida e repara. És tu que seguras. Que fazes a ponte entre os que não se falam. Que nunca dás trabalho. Que ficas para o fim, que cedes o lugar, que organizas tudo para que ninguém se afaste.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

Algures, muito cedo, aprendeste como ter direito a um lugar entre as pessoas. Aprendeste se para pertencer tinhas de ser útil, de desaparecer, de segurar, de esperar a tua vez, de nunca incomodar. Algumas de vós ficaram responsáveis cedo demais, foram adultas antes de tempo, e dessa ferida nasceram quase todas as outras.

Estes livros não te vão ensinar a cortar com a tua família nem a deixar de te importares. O contrário disso. Vão devolver-te o teu lugar, aquele que cedeste para caber, para servir, para não pesar.

Não te prometo pertença ao virar a página. O que estas páginas te dão é a clareza de ver o lugar que ocupaste, e o que te custou ocupá-lo. A travessia funda faz-se ao teu ritmo, e às vezes com quem te acompanhe.

Mas reparar onde te apagaste já é começar a aparecer. E pertencer a sério só é possível quando há ali alguém inteiro, no seu lugar, para pertencer.`;

const ABERTURA_TRABALHO = `A pergunta desta coleção é uma só: quem sou eu sem aquilo que faço?

Esta coleção parece falar do teu trabalho. Não fala. Fala de uma coisa que aprendeste muito antes do primeiro emprego: que o teu lugar no mundo se ganha. Que tens de provar, produzir, aguentar, ser útil, para teres direito a estar.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia.

Talvez te tenhas tornado aquela sem quem nada anda. Talvez tenhas o lugar e não te sentes nele. Talvez carregues a empresa que criaste como se fosse o teu corpo. Talvez fujas quando o reconhecimento se aproxima, ou midas o teu valor pelo teu cansaço.

Por baixo de todas, a mesma ferida: o trabalho deixou de ser uma expressão de quem és e tornou-se a prova de que mereces existir.

Estes livros não te vão ensinar a produzir mais, a liderar melhor, a gerir o tempo. Vão devolver-te uma pergunta que o desempenho te fez esquecer: tens valor mesmo quando não produzes, mesmo quando descansas, mesmo quando ninguém precisa de ti?

Tens. Sempre tiveste. O teu valor não se conquista com trabalho nenhum, porque vem antes de tudo o que fazes.

Não te prometo essa certeza ao virar a página. O que estas páginas te dão é ver onde confundiste o que fazes com o que vales. A travessia funda faz-se ao teu ritmo, e às vezes com quem te acompanhe.

Mas reparar nessa confusão já é o princípio de a desfazer. E talvez, pela primeira vez, possas pousar a prova e voltar a existir, sem a merecer.`;

const ABERTURA_FORCA = `A pergunta desta coleção é uma só: o que tive de me tornar para sobreviver?

Toda a gente te acha forte. És tu que aguentas, que resolves, que não cais, que não pedes, que não incomodas. O que ninguém vê é o que essa força te custa, nem de onde veio.

Cada livro nasceu de uma dor diferente. Mas todos contam a mesma travessia. E estas são diferentes das outras deste universo, por isso preciso de te dizer uma coisa logo no início.

Aqui não há propriamente um padrão errado a corrigir. Há uma adaptação que um dia te manteve viva. Tornaste-te impecável porque falhar custava. Deixaste de pedir porque ninguém vinha. Fizeste-te pequena porque ocupar espaço trazia consequências. Endureceste porque não houve ninguém forte por ti. Nada disto é defeito. Tudo isto foi inteligência de sobrevivência.

Por isso, com estas feridas, às vezes compreender não chega. Algumas pedem apoio, tempo, e por vezes alguém preparado para te acompanhar de perto. Procurar esse apoio não é fraqueza. É a forma mais corajosa de força que existe.

Estes livros vão mostrar-te o que a tua força protegeu, e o que continua a guardar muito depois de o perigo ter passado. Não te vão pedir que deixes de ser forte. Vão perguntar-te, com cuidado, se podes pousar a armadura quando estás em segurança.

Porque já não estás naquele perigo. E talvez, pela primeira vez, possas voltar a viver para além dele.`;

// Abertura mestra do universo inteiro (mostrada uma vez no topo da loja).
// Origem: ebooks-plano/universo/ABERTURAS/00-ABERTURA-DO-UNIVERSO.md
export const ABERTURA_UNIVERSO = {
  titulo: 'Uma só pergunta, em sete roupas',
  subtitulo: 'Abertura do universo inteiro',
  teaser: 'Sete coleções. Sete portas. A mesma travessia: voltares a ti.',
  teaser_en: 'Seven collections. Seven doors. The same crossing: returning to yourself.',
  texto: `Se tens mais do que um destes livros na mão, talvez já tenhas reparado numa coisa estranha.

Parecem falar de assuntos diferentes. Maternidade. Propósito. Dinheiro. Amor. Família. Sobrevivência. Trabalho. Mas, à medida que os lês, vai-se tornando claro que não são sete assuntos. São uma só pergunta, a vestir sete roupas.

No FreeMe ela pergunta: o que estou a carregar que não é meu?
No Infonte: o que estou a perseguir que não é meu?
Na Prosperidade: o que me impede de receber o que é meu?
Na SyncHim: o que me faz perder-me quando amo?
Na Pertença: qual é o meu lugar entre os outros?
Na Força: o que tive de me tornar para sobreviver?
No Trabalho: quem sou eu sem aquilo que faço?

E todas, sem exceção, desembocam no mesmo sítio:

Posso ocupar o meu lugar sem carregar, sem provar, sem salvar, sem perseguir e sem desaparecer?

Estes livros não são sobre emoções. Repara nos seus títulos. A mãe que quis unir. A que ficou responsável cedo demais. A que paga para pertencer. A que ama a ausência. A que trabalha para merecer. Não são sentimentos. São papéis. Personagens interiores que uma pessoa habita durante vinte, trinta anos, sem nunca lhes ter dado um nome.

E é isso que aqui te ofereço, antes de qualquer outra coisa: um nome. Porque no dia em que encontras o nome daquilo que vives há tanto tempo, acontece algo que muda tudo. Deixas de achar que és um defeito, e percebes que estás dentro de um padrão. E um padrão, ao contrário de um defeito, pode mudar.

No fundo, isto não é uma coleção de livros. É um mapa das formas mais comuns de uma pessoa se afastar de si própria. Cada livro é um caminho de regresso.

E há uma coisa que talvez só notes no fim, quando vires os verbos todos lado a lado. Devolver. Confiar. Recuar. Regressar. Ocupar. Receber. Pousar. Descansar. Distinguir. Escolher. Nenhum deles te manda conquistar mais. Nenhum te manda longe. Todos, sem exceção, te mandam voltar.

Porque o lugar que procuras nunca esteve à frente. Esteve sempre aqui, à tua espera, por baixo de tudo o que carregaste, perseguiste, provaste e seguraste para não o sentires vazio.

Escolhe a porta que for a tua. A travessia, em todas, é a mesma.`,
  assinatura: 'Com toda a minha ternura, Vivianne',
};

export const COLECOES: Colecao[] = [
  {
    id: 'freeme-mae',
    romano: 'I',
    nome: 'FreeMe Mãe',
    nome_en: 'FreeMe Mother',
    pitch: 'As feridas da maternidade. Para a mãe que carrega o que nunca foi seu para carregar.',
    pitch_en: 'The wounds of motherhood. For the mother who carries what was never hers to carry.',
    feridas: 'culpa · herança invisível · limites · salvar · dizer basta',
    feridas_en: 'guilt · invisible inheritance · boundaries · saving · saying enough',
    estado: 'producao',
    cor: 'border-bordeaux/40 hover:border-bordeaux',
    travessia: 'https://freeme.viviannedossantos.com',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_FREEME_MAE,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para a mãe que carrega o que nunca foi seu. Pousa o peso, e volta a ti, sem deixares de os amar.',
    aberturaTeaser_en: 'For the mother who carries what was never hers. Put down the weight and return to yourself, without ceasing to love them.',
  },
  {
    id: 'infonte',
    romano: 'II',
    nome: 'Infonte',
    nome_en: 'Infonte',
    pitch: 'As feridas da identidade e do propósito. Para quem persegue o que não é seu.',
    pitch_en: 'The wounds of identity and purpose. For those chasing what isn\'t theirs.',
    feridas: 'substituição · quem és · sentido · voz própria · mente cheia',
    feridas_en: 'substitution · who you are · meaning · own voice · busy mind',
    estado: 'producao',
    cor: 'border-ocre/40 hover:border-ambar',
    travessia: 'https://infonte.viviannedossantos.com',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_INFONTE,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem persegue o que não é seu. Distingue o que é teu antes da próxima chegada.',
    aberturaTeaser_en: 'For those chasing what isn\'t theirs. Distinguish what is yours before the next arrival.',
  },
  {
    id: 'amor',
    romano: 'IV',
    nome: 'SyncHim',
    nome_en: 'SyncHim',
    pitch: 'As feridas da vinculação amorosa. Para casais e para quem ama demais ou de menos.',
    pitch_en: 'The wounds of romantic attachment. For couples and for those who love too much or too little.',
    feridas: 'nó do casal · perguntas antes da discussão · desaparecer no amor',
    feridas_en: 'couple\'s knot · questions before the argument · disappearing in love',
    estado: 'producao',
    cor: 'border-rosa/40 hover:border-rosa',
    travessia: 'https://synchim.viviannedossantos.com',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_SYNCHIM,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem se perde quando ama. Vê o padrão que levas para dentro antes do amor sequer começar.',
    aberturaTeaser_en: 'For those who lose themselves when they love. See the pattern you carry before love even begins.',
  },
  {
    id: 'forca',
    romano: 'VI',
    nome: 'Força',
    nome_en: 'Strength',
    pitch: 'As feridas da sobrevivência. Para quem atravessa o escuro ou o luto que ninguém viu.',
    pitch_en: 'The wounds of survival. For those crossing the dark or the grief nobody saw.',
    feridas: 'atravessar o escuro · luto invisível · esgotamento · descansar',
    feridas_en: 'crossing the dark · invisible grief · exhaustion · resting',
    estado: 'producao',
    cor: 'border-lila/40 hover:border-lila',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_FORCA,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem aguentou tudo sozinha. Reconhece o que a tua armadura protegeu, e quando podes finalmente pousá-la.',
    aberturaTeaser_en: 'For those who endured it all alone. Recognize what your armor protected, and when you can finally put it down.',
  },
  {
    id: 'prosperidade',
    romano: 'III',
    nome: 'Prosperidade',
    nome_en: 'Prosperity',
    pitch: 'As feridas da relação com o valor. Para quem paga para pertencer ou tem medo de receber.',
    pitch_en: 'The wounds of the relationship with value. For those who pay to belong or fear receiving.',
    feridas: 'escassez herdada · medo de receber · pagar para pertencer',
    feridas_en: 'inherited scarcity · fear of receiving · paying to belong',
    estado: 'producao',
    cor: 'border-ouro/40 hover:border-ouro',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_PROSPERIDADE,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem trava antes de receber. Reconhece onde fechas a torneira do teu valor.',
    aberturaTeaser_en: 'For those who hold back before receiving. Recognize where you close the tap of your worth.',
  },
  {
    id: 'pertenca',
    romano: 'V',
    nome: 'Pertença',
    nome_en: 'Belonging',
    pitch: 'As feridas da família, amizade e lugar. Para quem nunca é escolhida primeiro.',
    pitch_en: 'The wounds of family, friendship, and place. For those never chosen first.',
    feridas: 'carregar a família · nunca escolhida · sentir-se de fora',
    feridas_en: 'carrying family · never chosen · feeling outside',
    estado: 'producao',
    cor: 'border-salvia/40 hover:border-salvia',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_PERTENCA,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem segura todos para ninguém se afastar. Recupera o lugar que cedeste para caber.',
    aberturaTeaser_en: 'For those who hold everyone so no one drifts away. Recover the place you gave up to fit in.',
  },
  {
    id: 'trabalho',
    romano: 'VII',
    nome: 'Trabalho e Vocação',
    nome_en: 'Work & Vocation',
    pitch: 'As feridas da vida profissional. Para quem habita ou ocupa o seu tamanho profissional.',
    pitch_en: 'The wounds of professional life. For those who don\'t inhabit or occupy their full size.',
    feridas: 'não ocupar a cadeira · exaustão como mérito · não cobrar',
    feridas_en: 'not occupying the chair · exhaustion as merit · not charging',
    estado: 'producao',
    cor: 'border-creme-2/30 hover:border-ocre',
    aberturaTitulo: 'A mesma travessia',
    abertura: ABERTURA_TRABALHO,
    aberturaAssinatura: 'Com toda a minha ternura, Vivianne',
    aberturaTeaser: 'Para quem confundiu o que faz com o que vale. Volta a existir sem ter de merecer.',
    aberturaTeaser_en: 'For those who confused what they do with what they\'re worth. Return to existing without having to earn it.',
  },
];

// Mapeia slug do produto -> colecao. Sem mexer na DB; fica versionado no codigo.
// Adiciona aqui novos produtos a medida que sao criados.
export function slugToColecao(slug: string): ColecaoId {
  // Ebooks novos por prefixo de colecao (1 prefixo = 1 universo).
  if (/^mae-\d/.test(slug)) return 'freeme-mae';
  if (/^inf-\d/.test(slug)) return 'infonte';
  if (/^pros-\d/.test(slug)) return 'prosperidade';
  if (/^syn-\d/.test(slug)) return 'amor';
  if (/^per-\d/.test(slug)) return 'pertenca';
  if (/^for-\d/.test(slug)) return 'forca';
  if (/^tra-\d/.test(slug)) return 'trabalho';

  // FreeMe Mae — maternidade
  if (/^ebook-01-culpa|^ebook-02-herdaste|^guia-01-meu|^guia-02-frases|^guia-08-culpa/.test(slug)) return 'freeme-mae';
  if (/^ebook-(09|10|11|12)|mae-que|mae-arrependida|mae-solo|mae-que-teme/.test(slug)) return 'freeme-mae';

  // Infonte — identidade e proposito
  if (/^ebook-03-quemes|^ebook-04-sentido|^ebook-07-sonho|^ebook-08-voz/.test(slug)) return 'infonte';
  if (/^guia-03-presenca|^guia-04-mente|^guia-07-teu|^guia-09-meta/.test(slug)) return 'infonte';

  // Prosperidade — receber, merecer
  if (/^guia-10-receber/.test(slug)) return 'prosperidade';

  // Amor — casal e vinculacao
  if (/^ebook-06-no-casal|^guia-06-perguntas|^guia-11-intensidade/.test(slug)) return 'amor';

  // Pertenca — lugar, familia
  if (/^guia-12-lugar/.test(slug)) return 'pertenca';

  // Forca — sobrevivencia, atravessar
  if (/^ebook-05-escuro|^guia-05-luto|^guia-13-guarda/.test(slug)) return 'forca';

  // Trabalho e Vocacao — valor e produzir
  if (/^guia-14-parar/.test(slug)) return 'trabalho';

  // Default — fica em FreeMe Mae como entrada principal
  return 'freeme-mae';
}

export function getColecao(id: ColecaoId): Colecao {
  return COLECOES.find(c => c.id === id) ?? COLECOES[0];
}

export const COLECOES_ATIVAS = COLECOES.filter(c => c.estado !== 'em-breve');
export const COLECOES_EM_BREVE = COLECOES.filter(c => c.estado === 'em-breve');

// Ordem de exibicao pelos numerais romanos (I → VII), para a loja e o admin
// mostrarem os universos por ordem e nao pela ordem interna do array.
const _ROMANO_VAL: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
export const COLECOES_ORDENADAS = [...COLECOES].sort(
  (a, b) => (_ROMANO_VAL[a.romano] ?? 99) - (_ROMANO_VAL[b.romano] ?? 99),
);
