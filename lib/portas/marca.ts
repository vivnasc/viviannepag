// PORTAS · as tres contas novas (livros) como marcas de conteudo.
//
// Motor no MOLDE da Soulab (lib/soulab/marca.ts): uma config de marca + os ANGULOS
// de exploracao (TIPOS). O gerador (lib/portas/gerar-ia.ts) le esta config e produz
// uma peca; o conteudo vive na MESMA tabela (carousel_collections) com theme.marca
// = id da porta, por isso aparece no Publicar sem tocar nos outros motores.
//
// O Metodo VS foi abolido: estas tres portas substituem ver/vir/viver no Publicar.
// Cada porta tem o SEU motor proprio (as 7 faces / os 7 sinais / as tensoes), que
// NAO sao os 7 veus. Fonte de verdade: as fichas e constituicoes em
// FICHAS-BRANDING-FACES-MEDO-EMERGENTE/ e a identidade visual em identidade-portas/.
//
// Ortografia: texto de marca (nomes, frases) em portugues pre-AO90; infra tecnica
// (ids, campos, comentarios) pos-AO90 e ingles. Sem travessoes em lado nenhum.

export type PortaId = 'medo' | 'sinais' | 'transicao';

export interface TipoPorta {
  id: string;
  label: string;
  emoji: string;
  descricao: string;
  /** a instrucao de geracao propria deste angulo (alimenta o prompt da IA). */
  angulo: string;
}

export interface PortaMarca {
  id: PortaId;
  handle: string;
  nome: string;
  emoji: string;
  /** a pergunta central da porta. */
  pergunta: string;
  /** posicionamento (o guarda-chuva conceptual). */
  posicionamento: string;
  /** a tese/missao da porta. */
  tese: string;
  /** a VOZ propria da porta (regra inviolavel, das constituicoes). */
  voz: string;
  /** a temperatura emocional (o que sentir nos primeiros segundos). */
  emocao: string;
  /** o tom (a regua de cada peca). */
  tom: string[];
  /** regras de voz duras (alem das comuns: pre-AO90, sem travessoes, sem tiques). */
  regrasVoz: string[];
  /** a assinatura visual da porta (entra em TODA a imagem). */
  assinaturaVisual: string;
  /** o que a imagem NUNCA mostra. */
  proibidoImg: string[];
  /** paleta propria (identidade distinta; alimenta o estudio e o render). */
  paleta: { bg: string; bg2: string; texto: string; destaque: string; nome: string };
  hashtagsBase: string[];
  /** a frase de identidade (fecho). */
  fraseIdentidade: string;
  /** bio de Instagram (pronta a colar). */
  bioPT: string;
  /** os angulos de exploracao (o MOTOR proprio da porta). */
  tipos: TipoPorta[];
}

// regras comuns a todas as portas (voz da autora, ver as constituicoes).
const VOZ_COMUM = [
  'Portugues europeu pre-AO90 (direccao, projecto, exacto), elegante e limpido.',
  'SEM travessoes (nem em texto nem em codigo): virgulas, dois pontos, parenteses, ponto final.',
  'Autoridade com calor: vejo-te, e ha mais para ti. Densidade que deixa respirar.',
  'Tocar a pessoa ANTES de explicar o sistema. Se a peca explica o motor em vez de tocar, esta errada.',
  'Sem os tiques da revisao: nao abrir com E ou Mas; sem regra de tres; sem contraste "nao X e Y"; sem "talvez" repetido; sem anafora automatica; sem perguntas retoricas em cascata; sem revelar por dois pontos; sem metacomentario; sem pares de adjectivos; sem metaforas infladas (tapecaria, sinfonia, danca, tecer); sem fechar sempre em callback; sem "Imagina..." repetido.',
  'Nunca inventar biografia, marcos nem clientes. A autoridade vem do caminho.',
];

export const PORTAS: Record<PortaId, PortaMarca> = {
  // ── AS SETE FACES DO MEDO ────────────────────────────────────────────────
  medo: {
    id: 'medo',
    handle: 'assetefacesdomedo',
    nome: 'As Sete Faces do Medo',
    emoji: '🕯️',
    pergunta: 'o que estou a proteger?',
    posicionamento:
      'As Sete Faces do Medo: as sete formas que o medo veste para nao ser reconhecido como medo. Nao mostra monstros, mostra as fracturas por onde o medo se disfarca de vida normal.',
    tese:
      'Nao e que tudo seja medo. E que estas sete faces partilham uma raiz, a separacao. Seis faces visiveis e uma setima que as gera.',
    voz: 'reconhecimento sem envergonhar: baixo julgamento, alta compaixao, vergonha quase nula. O tom de quem ve a mascara sem a envergonhar, nunca acusar a pessoa do seu medo.',
    emocao: 'reconhecimento, depois curiosidade, depois inquietacao suave. Nunca medo, ameaca, angustia ou choque. O leitor pensa "isto e sobre mim", nunca "isto parece um filme de terror".',
    tom: ['gravidade contemplativa', 'mineral e sobrio', 'museu, filosofia, psicologia existencial', 'nunca terror, nunca sobrenatural'],
    regrasVoz: [
      ...VOZ_COMUM,
      'Comeca SEMPRE por um comportamento quotidiano; o medo entra por baixo e NUNCA e nomeado a cabeca.',
      'Mostra o limiar, nunca a chegada. A promessa e reconhecimento, nunca terror nem solucao em passos.',
      'A raiz (a Separacao, o Abismo) mantem-se humana e relacional, nunca metafisica nem vazio cosmico.',
      'De vez em quando, a aresta: mostrar onde o medo NAO e a resposta (isto separa a marca do tom de guru).',
      'Reconhecer o medo como uma inteligencia antiga que ja protegeu, nunca como defeito.',
    ],
    assinaturaVisual:
      'uma fissura na cena com luz a vir de dentro da fractura (kintsugi): a fissura e o medo, a luz e o "ha mais para ti"; a luz nunca ilumina a cena, vem de dentro da racha',
    proibidoImg: ['terror', 'sobrenatural', 'sangue', 'corvos', 'gotico', 'olhos vazios', 'nevoa pesada', 'correntes', 'jaulas', 'iconografia de prisao', 'monstros', 'caveiras', 'mascaras de teatro', 'relogios derretidos', 'olhos gigantes', 'corredores escuros', 'floresta nocturna', 'arvores mortas', 'horror corporal'],
    paleta: { bg: '#161518', bg2: '#0F0F10', texto: '#EAE4D8', destaque: '#C8A86B', nome: 'Faces do Medo' },
    hashtagsBase: ['#medo', '#autoconhecimento', '#psicologia', '#padroesemocionais', '#presenca', '#saudemental', '#viviannedossantos'],
    fraseIdentidade: 'As Sete Faces do Medo nao mostram monstros. Mostram as pequenas fracturas por onde o medo aprendeu a vestir-se de vida normal.',
    bioPT: 'As sete formas que o medo veste para nao ser reconhecido.\nO que estas a proteger?\nUma porta de Vivianne dos Santos',
    tipos: [
      { id: 'espelho', label: 'O Espelho', emoji: '🪞', descricao: 'A Rejeicao. O medo da separacao do pertencer, disfarcado de aprovacao.',
        angulo: 'Face: O Espelho, a Rejeicao. Teme a separacao do pertencer. Disfarca-se de aprovacao, conformismo, incapacidade de dizer nao. Mundo simbolico: espelhos, reflexos, salas, olhares, retratos. Comeca por uma cena quotidiana de quem concorda para nao ficar de fora, e deixa por baixo o medo de desagradar. Pergunta possivel: de quantos dos teus sim gostas mesmo?' },
      { id: 'punho', label: 'O Punho', emoji: '✊', descricao: 'A Perda. O medo da separacao de quem se ama, disfarcado de amor.',
        angulo: 'Face: O Punho, a Perda. Teme a separacao de quem se ama. Disfarca-se de apego, controlo, ciume. Mundo simbolico: maos, fios, objectos a escapar, portas, agua a correr. Comeca por uma cena de quem segura com forca a mais, e deixa por baixo o medo de perder. Pergunta possivel: onde o teu amor virou vigilancia?' },
      { id: 'inverno', label: 'O Inverno', emoji: '❄️', descricao: 'A Escassez. O medo da separacao do sustento, disfarcado de prudencia.',
        angulo: 'Face: O Inverno, a Escassez. Teme a separacao do sustento. Disfarca-se de acumulacao, competicao, ansiedade material. Mundo simbolico: reservas, despensas, luz fria, maos cheias, contas. Comeca por uma cena de quem guarda e nunca chega, e deixa por baixo o medo da falta. Pergunta possivel: de que inverno antigo ainda te proteges?' },
      { id: 'fortaleza', label: 'A Fortaleza', emoji: '🏰', descricao: 'A Incerteza. O medo da separacao do chao previsivel, disfarcado de controlo.',
        angulo: 'Face: A Fortaleza, a Incerteza. Teme a separacao do chao, do previsivel. Disfarca-se de controlo, rigidez, planeamento ansioso. Mundo simbolico: muros, mapas, planos, fechaduras, linhas rectas. Comeca por uma cena de quem organiza tudo para nao sentir o imprevisto. Pergunta possivel: confundes controlo com seguranca?' },
      { id: 'luz', label: 'A Luz', emoji: '💡', descricao: 'A Exposicao. O medo de ser vista e avaliada, disfarcado de perfeccionismo.',
        angulo: 'Face: A Luz, a Exposicao (funde o medo de falhar e o de vencer). Disfarca-se de perfeccionismo, procrastinacao, invisibilidade voluntaria. Mundo simbolico: palcos, luz forte, cortinas, folha em branco, sombra escolhida. Comeca por uma cena de quem recua da luz. Pergunta possivel: de qual das duas luzes foges mais, a de falhar ou a de vencer?' },
      { id: 'apagamento', label: 'O Apagamento', emoji: '🕯️', descricao: 'A Insignificancia. O medo da morte social, disfarcado de ambicao.',
        angulo: 'Face: O Apagamento, a Insignificancia. Teme a separacao pelo apagamento, a morte social. Disfarca-se de necessidade de importancia, estatuto, legado ansioso. Mundo simbolico: nomes gravados, monumentos, rastos na areia, arquivos, ecos. Comeca por uma cena de quem faz para nao desaparecer. Pergunta possivel: de quem precisas que se lembre de ti?' },
      { id: 'abismo', label: 'O Abismo', emoji: '🌑', descricao: 'A Separacao, a raiz das outras seis. Relacional, nunca metafisica. Material de fecho.',
        angulo: 'Face: O Abismo, a Separacao (a raiz). No fundo, o receio de deixar de ser tida, de deixar de pertencer, de que no limite nao haja onde te segures. E a raiz de que as outras seis sao versoes mais pequenas. Mundo simbolico: margens, limiares, o intervalo entre dois corpos, a mao que quase toca outra, o fio de luz entre dois pontos. MANTEM relacional, nunca vazio cosmico. Guarda para momentos de sintese. Pergunta possivel: quantas das tuas proteccoes ainda seriam precisas se a pertenca nao estivesse em risco?' },
      { id: 'aresta', label: 'A Aresta', emoji: '🔦', descricao: 'A regua contra o tom de guru: onde o medo NAO e a resposta.',
        angulo: 'A ARESTA (nao e uma face, e a regua da marca): mostra, sem cinismo, um lugar onde o medo nao explica tudo, onde a generosidade e mesmo generosidade e o amor nao e gestao de medo. Da arestas a lente, para a marca nao soar a guru que ve medo em tudo. Termina aberto, com honestidade, nunca com licao.' },
    ],
  },

  // ── OS 7 SINAIS DE DESENCAIXE ────────────────────────────────────────────
  sinais: {
    id: 'sinais',
    handle: 'os7sinaisdedesencaixe',
    nome: 'Os 7 Sinais de Desencaixe',
    emoji: '🚪',
    pergunta: 'onde fica casa agora?',
    posicionamento:
      'Os 7 Sinais de Desencaixe: a unica porta que cheira a casa (a casa interior, nao a fisica). Fala do lugar para onde regressas quando deixas de te proteger.',
    tese:
      'Ha uma travessia silenciosa entre ja nao caber no sistema antigo e ainda nao ter encontrado o novo. Sete sinais marcam-na.',
    voz: 'suave, domestica, humana. A saudade existe mas nao comanda. A emocao que define tudo: ainda nao estou totalmente do outro lado, mas ja nao estou exactamente aqui.',
    emocao: 'transicao, pertenca, serenidade, saudade (por esta ordem). Nunca nostalgia dramatica, nunca ruptura.',
    tom: ['suave e domestica', 'lenta, literaria, madura', 'luz de fim de tarde', 'transicao serena'],
    regrasVoz: [
      ...VOZ_COMUM,
      'NUNCA ilustrar nem nomear literalmente o conceito. Casa e pertenca interior, nunca so o espaco fisico.',
      'A saudade nao comanda (senao arrasta para a nostalgia). Transicao serena, nunca ruptura dramatica.',
      'Fecho variado: cerca de metade em pergunta, um pouco em cena aberta sem texto, um pouco em frase.',
      'Falar do desencaixe pela subtileza (um lugar afastado a mesa), nunca pelo drama.',
    ],
    assinaturaVisual:
      'o Limiar: porta, janela, escada, varanda, soleira, corredor, entardecer, luz que atravessa um vazio; sempre travessia, nunca chegada nem partida',
    proibidoImg: ['partida', 'ruptura', 'malas', 'comboios', 'aeroportos', 'estradas infinitas', 'passaros a voar', 'silhuetas sozinhas em penhascos', 'pecas de puzzle', 'borboletas', 'asas', 'bussolas partidas', 'tempestade dramatica', 'ilustracao literal', 'cidades futuristas', 'neon', 'tecnologia visivel'],
    paleta: { bg: '#EFE7DA', bg2: '#F4EFE8', texto: '#5A4E42', destaque: '#A67C52', nome: 'Sinais de Desencaixe' },
    hashtagsBase: ['#pertenca', '#desencaixe', '#casa', '#autoconhecimento', '#presenca', '#transicao', '#viviannedossantos'],
    fraseIdentidade: 'Os Sinais sao a unica porta que cheira a casa. Falam do lugar para onde regressas quando deixas de te proteger.',
    bioPT: 'Continuar a amar um lugar enquanto deixas de morar nele.\nOnde fica casa agora?\nUma porta de Vivianne dos Santos',
    tipos: [
      { id: 'mesa', label: 'A Mesa', emoji: '🍽️', descricao: 'Presenca sem pertenca: estou aqui mas nao estou em casa.',
        angulo: 'Sinal: A Mesa. Reconhecimento: estou aqui mas nao estou em casa. Tema: presenca sem pertenca. Motivo (nunca literal): cadeiras, lugares vazios, cozinhas, um lugar ligeiramente afastado da mesa. Uma cena domestica onde alguem esta presente e ausente ao mesmo tempo.' },
      { id: 'mascara', label: 'A Mascara', emoji: '🪞', descricao: 'Autoabandono funcional: estou a ficar mais pequena para caber.',
        angulo: 'Sinal: A Mascara. Reconhecimento: estou a ficar mais pequena para caber. Tema: autoabandono funcional. Motivo: espelhos, reflexos, vidros, uma versao mais contida de si. Uma cena de quem se encolhe para nao incomodar.' },
      { id: 'horizonte', label: 'O Horizonte', emoji: '🌅', descricao: 'O chamamento: tenho saudades de algo que nunca vivi.',
        angulo: 'Sinal: O Horizonte. Reconhecimento: tenho saudades de algo que nunca vivi. Tema: o chamamento. Motivo: janelas, mar, distancia, amanhecer, o azul residual do entardecer. Uma cena a janela, a saudade de um lugar que ainda nao tem nome.' },
      { id: 'eremita', label: 'O Eremita', emoji: '🌫️', descricao: 'O isolamento como defesa: ou pertenco ou sou eu.',
        angulo: 'Sinal: O Eremita. Reconhecimento: ou pertenco ou sou eu. Tema: o isolamento como defesa. Motivo: portas fechadas, nevoeiro. Uma cena de quem se recolhe sem saber se se protege ou se esconde.' },
      { id: 'corpo', label: 'O Corpo', emoji: '🫁', descricao: 'O corpo sabe primeiro: ja nao consigo.',
        angulo: 'Sinal: O Corpo. Reconhecimento: ja nao consigo. Tema: o corpo sabe antes da mente. Motivo: tecidos, pele, respiracao, ombros descaidos ao fim do dia. Uma cena onde o corpo diz o que a pessoa ainda nao admitiu.' },
      { id: 'refugio', label: 'O Refugio', emoji: '☕', descricao: 'O conforto que se torna prisao: talvez seja melhor sozinha.',
        angulo: 'Sinal: O Refugio. Reconhecimento: talvez seja melhor sozinha. Tema: o conforto que comeca a fechar-se demais. Motivo: mantas, chavenas, chuva na janela. Uma cena de abrigo que aperta um pouco de mais.' },
      { id: 'casa', label: 'A Casa', emoji: '🏡', descricao: 'Pertenca consciente: o problema nunca foi pertencer, era o preco.',
        angulo: 'Sinal: A Casa. Reconhecimento: o problema nunca foi pertencer, era o preco da pertenca. Tema: pertenca consciente. Motivo: portas abertas, jardins, luz quente a atravessar a soleira. Uma cena de regresso a um lugar que nao exige desaparecimento.' },
    ],
  },

  // ── A GRANDE TRANSICAO ───────────────────────────────────────────────────
  transicao: {
    id: 'transicao',
    handle: 'agrandetransicao',
    nome: 'A Grande Transicao',
    emoji: '🌗',
    pergunta: 'que mundo esta a nascer?',
    posicionamento:
      'A Grande Transicao: antropologia do presente, nao ficcao cientifica. O futuro escondido dentro do presente, nunca o futuro longinquo. Organiza a epoca a volta da pessoa.',
    tese:
      'Vivemos entre dois sistemas operativos civilizacionais: o da sobrevivencia e o da emergencia. A transicao acontece primeiro nas pessoas, so depois nas culturas.',
    voz: 'lucidez. Nao esperanca, nao entusiasmo tecnologico. Algo como "estou a perceber o que esta a acontecer". A seguir, reconhecimento, vertigem, alivio, curiosidade.',
    emocao: 'lucidez, o futuro escondido dentro do presente. A sensacao: isto pertence a hoje e a amanha ao mesmo tempo.',
    tom: ['lucida e do presente', 'editorial, serena, madura', 'antropologia, nunca sci-fi', 'sem nostalgia'],
    regrasVoz: [
      ...VOZ_COMUM,
      'NUNCA nomear a tensao ao leitor. O motor e interno: mostra a tensao atraves de uma cena humana reconhecivel.',
      'Comecar SEMPRE numa cena quotidiana concreta (uma cozinha, um telemovel, uma crianca, um corpo cansado).',
      'Nunca demonizar o sistema antigo: mostra o esforco e o controlo como tecnologias que ja foram sabias.',
      'Mostrar a friccao entre os dois sistemas, nunca vencedores e vencidos. Terminar em reconhecimento, nunca em prescricao.',
      'Antropologia do presente, nunca ficcao cientifica. Evitar a nostalgia: o antigo nao era melhor, era outro.',
    ],
    assinaturaVisual:
      'duas temporalidades na mesma imagem, o hoje e o que esta a nascer (uma mesa com caderno e um ecra aceso, um relogio e uma planta, uma lista e uma pausa); registo A, objectos de hoje',
    proibidoImg: ['robos', 'cidades futuristas', 'naves', 'hologramas', 'cyberpunk', 'interfaces holograficas', 'pessoas a tocar no ar', 'fatos futuristas', 'IA antropomorfica', 'cerebros digitais', 'ADN luminoso', 'olhos com circuitos', 'laboratorio de ficcao cientifica', 'estetica de startup futurista', 'estetica de singularidade'],
    paleta: { bg: '#EBE4D8', bg2: '#F5F1EA', texto: '#4D433A', destaque: '#9B866C', nome: 'Grande Transicao' },
    hashtagsBase: ['#grandetransicao', '#presenca', '#epoca', '#antropologia', '#lucidez', '#consciencia', '#viviannedossantos'],
    fraseIdentidade: 'A Grande Transicao nao mostra o futuro ao longe. Mostra o futuro ja escondido dentro de uma cozinha de hoje, a espera de nome.',
    bioPT: 'O futuro ja esta aqui, escondido numa cozinha de hoje.\nO que estas a viver que ainda nao recebeu nome?\nUma porta de Vivianne dos Santos',
    tipos: [
      { id: 'esforco', label: 'Esforco e Energia', emoji: '🔋', descricao: 'A tensao entre empurrar e fluir, numa cena de hoje.',
        angulo: 'Tensao (nunca nomeada ao leitor): O Esforco vs A Energia. Mostra-a por uma cena quotidiana num dominio (corpo, trabalho, tempo): alguem que so sabe avancar a empurrar e sente que parar e cair. Duas temporalidades na cena. Termina em reconhecimento.' },
      { id: 'acumulacao', label: 'Acumulacao e Suficiencia', emoji: '📦', descricao: 'A tensao entre juntar e bastar, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): A Acumulacao vs A Suficiencia. Cena quotidiana (consumo, casa, dinheiro): alguem que junta para se sentir seguro e nunca sente que chega. Mostra a friccao, sem vencedor. Termina em reconhecimento.' },
      { id: 'controlo', label: 'Controlo e Confianca', emoji: '🧷', descricao: 'A tensao entre prever tudo e confiar, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): O Controlo vs A Confianca. Cena quotidiana (maternidade, trabalho, familia): hipervigilancia, incapacidade de delegar, culpa ao descansar, antecipar tudo. Mostra a cena humana, nao a tensao. Termina em reconhecimento.' },
      { id: 'escassez', label: 'Escassez e Abundancia', emoji: '⏳', descricao: 'A tensao entre a falta e o que basta, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): A Escassez vs A Abundancia. Cena quotidiana (tempo, dinheiro, afecto): a sensacao de que nunca ha tempo, de que e sempre pouco. Mostra a friccao, nunca a solucao. Termina em reconhecimento.' },
      { id: 'identidade', label: 'Identidade e Processo', emoji: '🪪', descricao: 'A tensao entre ser um nome fixo e estar em processo.',
        angulo: 'Tensao (nao nomear): A Identidade vs O Processo. Cena quotidiana (proposito, trabalho, papeis): nao saber quem se e sem o cargo, o papel, a etiqueta. Mostra a cena, deixa a tensao por baixo. Termina em reconhecimento.' },
      { id: 'producao', label: 'Producao e Presenca', emoji: '📵', descricao: 'A tensao entre produzir e estar, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): A Producao vs A Presenca. Cena quotidiana (trabalho, tecnologia, familia): responder a tudo na hora, o telemovel entre a pessoa e o instante. Mostra duas temporalidades. Termina em reconhecimento.' },
      { id: 'hierarquia', label: 'Hierarquia e Rede', emoji: '🕸️', descricao: 'A tensao entre a ordem vertical e a rede, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): A Hierarquia vs A Rede. Cena quotidiana (trabalho, lideranca, comunidade): esperar permissao, procurar quem manda, nao se autorizar. Mostra a cena humana. Termina em reconhecimento.' },
      { id: 'competicao', label: 'Competicao e Cooperacao', emoji: '🤝', descricao: 'A tensao entre disputar e colaborar, numa cena de hoje.',
        angulo: 'Tensao (nao nomear): A Competicao vs A Cooperacao. Cena quotidiana (comunidade, trabalho, amizade): ver o outro como ameaca, o cansaco de estar sempre a comparar. Mostra a friccao, sem vencedor. Termina em reconhecimento.' },
    ],
  },
};

export const PORTAS_LISTA: PortaMarca[] = [PORTAS.medo, PORTAS.sinais, PORTAS.transicao];

export const getPorta = (id: string): PortaMarca | undefined => (PORTAS as Record<string, PortaMarca>)[id];
export const getTipoPorta = (portaId: string, tipoId: string): TipoPorta | undefined =>
  getPorta(portaId)?.tipos.find((t) => t.id === tipoId);

/** dominios da epoca (so para A Grande Transicao, dao variedade a geracao). */
export const DOMINIOS_TRANSICAO = [
  'Trabalho', 'Educacao', 'Amor', 'Familia', 'Comunidade', 'Corpo', 'Espiritualidade',
  'Tecnologia', 'IA', 'Proposito', 'Tempo', 'Consumo', 'Lideranca', 'Identidade', 'Maternidade', 'Envelhecimento',
];
