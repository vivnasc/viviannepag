// Método VS · SABER por véu — o substrato de conhecimento que torna o conteúdo
// "infinito" (como a veu.a.veu vive do seu campo de estudo).
//
// FONTE: a ÁREA DE ESTUDO da Vivianne (Psicologia Transpessoal · Constelação
// Familiar Sistémica · Psicologia e Espiritualidade · Desenvolvimento Pessoal),
// lida pelas LENTES de cada véu. NÃO toca em lib/veu/* nem na conta veu.a.veu:
// os motores ficam separados, partilham só o SABER (o vocabulário/campo, como o
// próprio CLAUDE.md diz: "cruzam-se no vocabulário, a área de estudo dela").
//
// Cada dimensão alimenta um dos formatos da tarde:
//   comportamentos/mecanismos -> "O Mecanismo Invisível"
//   origens                   -> "A Origem"
//   crencas                   -> "O Erro de Interpretação" / "Mito vs Verdade"
//   custos                    -> "O Custo Escondido"
//   cenas                     -> "Cena do dia-a-dia"
//   subtipos                  -> "O Véu de…"
//   mapa                      -> "O Mapa do Véu"
//
// A IA gera DENTRO da estrutura de cada formato, puxando deste substrato + a
// memória anti-repetição -> ângulos novos sem repetir o tema.

import { VeuNome } from './contas';

export interface SaberVeu {
  essencia: string;
  /** Como cada disciplina lê este véu (a fonte da profundidade). */
  lentes: { transpessoal: string; constelacao: string; espiritualidade: string; desenvolvimento: string };
  comportamentos: string[];   // observáveis, em 1.ª/2.ª pessoa concreta
  origens: string[];          // de onde o padrão veio (infância, heranças)
  mecanismos: string[];       // como funciona psicologicamente
  crencas: { pensa: string; verdade: string }[]; // erro de interpretação / mito vs verdade
  custos: string[];           // o preço invisível
  cenas: string[];            // momentos concretos e sensoriais do dia a dia
  subtipos: string[];         // "O Véu de…" (identificação rápida)
  mapa: { pensa: string; sente: string; faz: string; paga: string };
}

// Começa só com UM véu a fundo (Turbilhão), para mostrar a profundidade antes de
// fazer os 7. Partial de propósito: os outros entram um a um.
export const SABER: Partial<Record<VeuNome, SaberVeu>> = {
  Turbilhão: {
    essencia: 'A cabeça que não pára. Pensar de mais para não sentir, viver em alerta, confundir ruminar com resolver.',
    lentes: {
      transpessoal:
        'A pessoa identifica-se com o pensamento, como se fosse a dona da casa quando é só um inquilino barulhento. Há um observador por trás do ruído, e a cura começa quando ela aprende a ver os pensamentos passar em vez de ser arrastada por eles.',
      constelacao:
        'A hipervigilância é muitas vezes herdada: a criança que tinha de adivinhar o humor dos adultos, ou uma linhagem que viveu em sobrevivência. Estar em alerta era lealdade e segurança. O sistema continua a pedir vigilância num presente que já é seguro.',
      espiritualidade:
        'A paz não é a mente em silêncio, é deixar de te agarrar ao barulho. Render-se ao presente, confiar que nem tudo precisa de ser resolvido pela cabeça.',
      desenvolvimento:
        'A ruminação é uma tentativa de controlo: ensaiar o futuro para o domesticar. Dá a ilusão de estar a fazer algo, quando na verdade só desgasta.',
    },
    comportamentos: [
      'Verificas o telemóvel sem motivo, várias vezes seguidas.',
      'Reles uma mensagem à procura de um tom escondido que talvez não exista.',
      'Ensaias conversas que talvez nunca aconteçam.',
      'Antes de dormir, planeias cenários de catástrofe que ainda não chegaram.',
      'Precisas de ter sempre algo a fazer; o silêncio incomoda.',
      'Acordas já com a lista toda a correr na cabeça.',
      'Resolves dez vezes um problema que ainda nem existe.',
    ],
    origens: [
      'Um lar imprevisível, onde era preciso adivinhar o humor de quem mandava.',
      'Foste a criança que tratava de tudo e aprendeu que baixar a guarda era perigoso.',
      'Amor que vinha com o desempenho: pensar e prever era a forma de seres aceite.',
      'Uma linhagem que viveu em alerta; herdaste a vigilância sem teres escolhido.',
    ],
    mecanismos: [
      'A mente confunde pensar com agir: ruminar dá a sensação de estar a resolver.',
      'Fusão cognitiva: acreditas que cada pensamento é verdade e uma ordem a cumprir.',
      'Um alarme antigo continua ligado, num presente que já não é a ameaça de então.',
      'Em modo de alerta, a mente fabrica pensamento sem parar, à procura de uma ameaça para resolver.',
    ],
    crencas: [
      { pensa: 'Se eu pensar mais, resolvo.', verdade: 'Pensar de mais não resolve nada. Só te tira o sono.' },
      { pensa: 'Estou a prevenir-me.', verdade: 'Estás a sofrer por coisas que ainda não aconteceram, e quase nunca acontecem.' },
      { pensa: 'Sou ansiosa, é a minha personalidade.', verdade: 'Não nasceste ansiosa. Aprendeste a estar em alerta, e isso desaprende-se.' },
      { pensa: 'Parar é perder tempo.', verdade: 'Descansar não é preguiça. É quando a cabeça finalmente assenta.' },
    ],
    custos: [
      'Noites de sono trocadas por simulações que nunca aconteceram.',
      'A presença roubada a quem está mesmo à tua frente.',
      'Decisões adiadas por excesso de análise.',
      'Um corpo sempre tenso, um cansaço que dorme oito horas e acorda igual.',
    ],
    cenas: [
      'A mensagem tinha três palavras. O filme que fizeste dela tinha vinte cenas.',
      'Deitaste-te às onze. Adormeceste a resolver uma conversa de há três anos.',
      'O café arrefeceu enquanto planeavas um dia que ainda nem tinha começado.',
      'Ninguém respondeu em dez minutos e já tinhas escrito o fim da história.',
    ],
    subtipos: [
      'O Véu da Que Prevê Tudo',
      'O Véu da Mente que Não Desliga',
      'O Véu da Que Ensaia Conversas',
      'O Véu da Vigilante',
    ],
    mapa: {
      pensa: 'E se correr mal? Tenho de estar preparada para tudo.',
      sente: 'Um aperto no peito, um alerta que nunca baixa.',
      faz: 'Controla, verifica, antecipa, nunca pousa.',
      paga: 'O sono, a presença e a paz.',
    },
  },

  Memória: {
    essencia: 'Viver preso a uma história antiga. Reagir ao presente com uma dor de outro tempo, como se o passado ainda estivesse a acontecer.',
    lentes: {
      transpessoal: 'A identidade construída à volta de uma ferida ("eu sou assim desde sempre"). O trabalho é ver que a história não é a pessoa, é um guião que pode ser largado.',
      constelacao: 'Lealdade a uma dor da linhagem: repetir o destino de quem veio antes é uma forma de pertencer. Reconhecer a origem devolve o peso a quem ele pertence.',
      espiritualidade: 'O perdão não é esquecer, é soltar o peso. Libertar-se do que já passou para voltar ao presente.',
      desenvolvimento: 'O cérebro lê o presente com o mapa do passado. Reconhecer o gatilho é o primeiro passo para responder em vez de reagir.',
    },
    comportamentos: [
      'Alguém demora a responder e tu já montaste a história toda.',
      'Fechas portas antes mesmo de te aproximares delas.',
      'Dizes "comigo é sempre a mesma coisa" antes de tentar.',
      'Reages a uma frase de hoje com a mágoa de há vinte anos.',
      'Antecipas o abandono e sais primeiro, para não doer.',
    ],
    origens: [
      'Uma ferida antiga que ninguém viu nem nomeou, e que ficou a decidir por ti.',
      'Aprendeste cedo que as pessoas magoam, e levaste essa lente para todas as relações.',
      'Uma história de família que se repete de geração em geração.',
    ],
    mecanismos: [
      'O presente é lido com o mapa do passado: o cérebro assume que vai repetir.',
      'A memória emocional dispara antes da razão; sentes primeiro, percebes depois.',
      'Repetir o conhecido, mesmo doloroso, parece mais seguro do que o desconhecido.',
    ],
    crencas: [
      { pensa: 'Eu sou assim desde sempre.', verdade: 'Aquilo já passou. Não tens de reagir hoje à dor de antes.' },
      { pensa: 'Já sei como isto acaba.', verdade: 'Não sabes como acaba. Estás só à espera do mesmo de sempre.' },
      { pensa: 'Se me protejo, não me magoam.', verdade: 'Fechares-te não te protege. Só te deixa mais sozinha.' },
    ],
    custos: [
      'Relações que terminam antes de começarem.',
      'Oportunidades recusadas por medo de repetir.',
      'O presente vivido como reposição de um filme antigo.',
    ],
    cenas: [
      'Ele atrasou-se cinco minutos. Tu já tinhas revivido todos os que te deixaram.',
      'A porta nem se abriu e tu já sabias, de cor, como ias ser deixada.',
      'Disseram "precisamos de falar" e o teu corpo respondeu a uma conversa de há vinte anos.',
    ],
    subtipos: ['O Véu da Que Já Sabe Como Acaba', 'O Véu da Que Sai Primeiro', 'O Véu da Ferida Antiga', 'O Véu da Que Repete o Destino'],
    mapa: {
      pensa: 'Vai acabar como sempre acaba.',
      sente: 'Uma mágoa antiga que volta inteira.',
      faz: 'Protege-se, antecipa, foge antes do fim.',
      paga: 'O presente, e as relações que nunca deixou nascer.',
    },
  },

  Esforço: {
    essencia: 'Fazer tudo por todos para ser amada. Esforçar-se sem parar, sentir culpa ao descansar, e não saber receber.',
    lentes: {
      transpessoal: 'O valor confundido com utilidade ("valho pelo que faço"). O caminho é descobrir que mereces existir sem te justificares.',
      constelacao: 'Muitas vezes foste parentificada: a criança que cuidou dos pais. Carregaste um lugar que não era teu; podes devolvê-lo e voltar a ser filha.',
      espiritualidade: 'Receber é uma entrega, não uma dívida. Deixares-te segurar é confiança, não fraqueza.',
      desenvolvimento: 'O excesso de dar é controlo da relação: se sou indispensável, não me deixam. Pôr limites quebra o ciclo.',
    },
    comportamentos: [
      'Fazes tudo por toda a gente e ninguém faz por ti.',
      'Se paras, sobe-te uma culpa que não sabes explicar.',
      'Dizes sim com a boca enquanto o corpo grita não.',
      'Custa-te pedir ajuda ou aceitar um presente.',
      'Tratas de todos e esqueces-te de ti no fim da lista.',
    ],
    origens: [
      'Aprendeste que o amor se ganhava sendo útil, nunca por seres quem és.',
      'Foste a criança forte, a que aguentava, a que não dava trabalho.',
      'Numa casa onde alguém tinha de cuidar, esse alguém foste tu.',
    ],
    mecanismos: [
      'O valor próprio ficou colado ao desempenho: parar é sentir que não vales.',
      'Dar demais compra segurança: se sou indispensável, não me abandonam.',
      'Receber dói porque te coloca em dívida, e só sabes estar do lado de quem dá.',
    ],
    crencas: [
      { pensa: 'Se eu não fizer, ninguém faz.', verdade: 'Fazeres tudo por todos não te faz mais amada. Faz-te mais cansada.' },
      { pensa: 'Descansar é egoísmo.', verdade: 'Descansar não é egoísmo. Mereces o mesmo cuidado que dás aos outros.' },
      { pensa: 'O amor prova-se com sacrifício.', verdade: 'Se te esgotas para te quererem, isso não é amor. É medo de seres deixada.' },
    ],
    custos: [
      'Um cansaço que dorme oito horas e acorda igual.',
      'Relações desequilibradas onde dás sempre e recebes pouco.',
      'A tua própria vida sempre no fim da lista.',
    ],
    cenas: [
      'Perguntaram como estavas. Respondeste com a lista do que faltava fazer.',
      'Sentaste-te um minuto e já estavas de pé a tratar de outra coisa.',
      'Ofereceram-te ajuda e disseste "não é preciso", de mão a tremer.',
    ],
    subtipos: ['O Véu da Mulher Forte', 'O Véu da Que Trata de Tudo', 'O Véu da Que Não Sabe Receber', 'O Véu da Salvadora'],
    mapa: {
      pensa: 'Tenho de dar conta de tudo, senão falho.',
      sente: 'Culpa ao parar, medo de não chegar.',
      faz: 'Dá, resolve, carrega, nunca pede.',
      paga: 'O corpo, o descanso e o seu lugar.',
    },
  },

  Desolação: {
    essencia: 'Medo do vazio e da solidão. Preencher cada silêncio para não sentir o que mora por baixo.',
    lentes: {
      transpessoal: 'O vazio temido é, muitas vezes, a porta para o encontro contigo. Ficar no silêncio sem fugir é onde te reencontras.',
      constelacao: 'Uma falta antiga de colo e presença: faltou quem ficasse. O preenchimento de hoje tenta tapar um vazio que vem de longe.',
      espiritualidade: 'O silêncio não é ausência, é presença. No vazio cabe o que é maior do que o ruído.',
      desenvolvimento: 'A distração compulsiva é evitamento: encher para não contactar o que dói. Tolerar o vazio em pequenas doses devolve-te a ti.',
    },
    comportamentos: [
      'Ligas a televisão mal entras em casa.',
      'Mal o silêncio chega, corres a tapá-lo.',
      'Enches a agenda para não teres um buraco vazio.',
      'Pegas no telemóvel no segundo em que ficas sozinha.',
      'Tens medo de parar e não encontrar nada cá dentro.',
    ],
    origens: [
      'Faltou quem ficasse contigo no silêncio quando eras pequena.',
      'Aprendeste que estar só era estar em perigo ou em falta.',
      'Um vazio de presença que nunca foi nomeado, e que ainda assusta.',
    ],
    mecanismos: [
      'O preenchimento é um anestésico: tapa o sinal sem tratar a ferida.',
      'O vazio dispara o alarme antigo de abandono, e foges antes de sentir.',
      'Quanto mais enches, menos te ouves, e mais estranho fica o silêncio.',
    ],
    crencas: [
      { pensa: 'Se parar, vou afundar.', verdade: 'Não tens medo do silêncio. Tens medo do que sentes quando ele chega.' },
      { pensa: 'Estar só é estar em falta.', verdade: 'Estar sozinha não é estar em falta. Dá para aprender a gostar da tua companhia.' },
      { pensa: 'Preciso de barulho para estar bem.', verdade: 'Não precisas de encher tudo. O sossego que procuras está na pausa que evitas.' },
    ],
    custos: [
      'Nunca saberes do que tu, só tu, gostas.',
      'Uma vida cheia por fora e oca por dentro.',
      'O reencontro contigo sempre adiado.',
    ],
    cenas: [
      'A casa ficou em silêncio. Em três segundos já tinhas a televisão ligada.',
      'Ficaste sozinha cinco minutos e já tinhas o telemóvel na mão.',
      'Enchaste o fim de semana todo, para não ouvir o domingo à tarde.',
    ],
    subtipos: ['O Véu da Que Tapa o Silêncio', 'O Véu da Agenda Cheia', 'O Véu da Que Tem Medo de Parar', 'O Véu da Que Foge do Vazio'],
    mapa: {
      pensa: 'Não posso ficar parada com isto.',
      sente: 'Um vazio que assusta, uma inquietação surda.',
      faz: 'Enche, distrai, ocupa, nunca para.',
      paga: 'O autoconhecimento e a paz do silêncio.',
    },
  },

  Horizonte: {
    essencia: 'Viver à espera de um quando. Adiar a vida para depois e nunca chegar, porque a meta foge sempre.',
    lentes: {
      transpessoal: 'A vida real é agora, não no destino imaginado. Trazer a presença para o instante, em vez de a projetar no futuro.',
      constelacao: 'Às vezes herdou-se um "primeiro o dever, depois a vida": uma linhagem que nunca se deu licença de viver. Podes ser a que quebra isso.',
      espiritualidade: 'O depois é uma ilusão; só existe o presente. Render-se ao agora é entrar finalmente na própria vida.',
      desenvolvimento: 'Adiar a vida para uma condição ("quando X") é defesa contra o risco de viver agora. Dar o primeiro passo pequeno fura a espera.',
    },
    comportamentos: [
      'A tua vida está sempre para depois.',
      'Dizes "vou ser feliz quando isto passar".',
      'Bebes o café já a pensar no que vais fazer a seguir.',
      'Chegas à meta e já só pensas na próxima.',
      'Adias o que te faz bem para quando "tiveres tempo".',
    ],
    origens: [
      'Aprendeste que primeiro vem o dever e a vida fica para depois.',
      'Cresceste a ouvir que descansar e gozar era para quem podia.',
      'Uma linhagem que nunca se deu licença de simplesmente viver.',
    ],
    mecanismos: [
      'O "quando" é uma defesa: enquanto a vida é no futuro, não a arriscas hoje.',
      'A meta seguinte tapa o vazio de chegar; por isso a chegada nunca chega.',
      'Viver no depois evita o luto de aceitar a vida possível agora.',
    ],
    crencas: [
      { pensa: 'Quando conseguir X, aí sim começo a viver.', verdade: 'A tua vida não começa depois. É esta, agora.' },
      { pensa: 'Estou atrasada, tenho de apanhar o comboio.', verdade: 'Não estás atrasada para nada. Não há prazo nenhum a correr.' },
      { pensa: 'Primeiro o dever, depois a vida.', verdade: 'A vida não fica à espera de estares pronta. Passa enquanto adias.' },
    ],
    custos: [
      'Anos inteiros vividos em sala de espera.',
      'O presente sempre sacrificado a um futuro que não chega.',
      'A sensação de correr muito e nunca chegar a casa.',
    ],
    cenas: [
      'Disseste "quando emagrecer". Depois "quando mudar de casa". A vida ficou toda em "quando".',
      'Chegaste à meta que querias há anos. Em dez minutos já tinhas a meta seguinte.',
      'O fim de semana chegou. Passaste-o a preparar a semana seguinte.',
    ],
    subtipos: ['O Véu da Que Vive no Quando', 'O Véu da Sala de Espera', 'O Véu da Próxima Meta', 'O Véu da Que Adia a Vida'],
    mapa: {
      pensa: 'Ainda não é a altura, primeiro tenho de...',
      sente: 'Uma pressa sem chegada, uma vida em pausa.',
      faz: 'Adia, prepara, persegue a meta seguinte.',
      paga: 'O presente e a vida que está a acontecer agora.',
    },
  },

  Permanência: {
    essencia: 'Defender quem já não se é. Ter medo de mudar e deixar de ser quem se foi, mesmo que o papel já aperte.',
    lentes: {
      transpessoal: 'A identidade agarrada a um papel ("a forte", "a que aguenta"). O crescimento pede largar a máscara para descobrir quem és por baixo dela.',
      constelacao: 'Mudar pode sentir-se como trair o sistema que te fez assim. Mas honrar a origem não é repetir-se para sempre; é seguir, levando o que ficou bom.',
      espiritualidade: 'Tudo flui; agarrar-se ao que já foi é resistir à vida. Soltar a forma antiga é deixar nascer a nova.',
      desenvolvimento: 'O medo de mudar protege de desiludir quem conta contigo. Mas a fidelidade a um papel velho custa a tua verdade de agora.',
    },
    comportamentos: [
      'És a forte, a que aguenta sempre, mesmo quando já não aguentas.',
      'Perguntas "quem seria eu sem este papel?".',
      'Custa-te pedir ajuda ou mostrar fragilidade.',
      'Tens medo de mudar e desiludir quem conta contigo.',
      'Defendes uma versão tua que já não te serve.',
    ],
    origens: [
      'Um papel que te deu lugar e amor, e que agora tens medo de largar.',
      'Aprendeste que mudar era trair quem te fez assim.',
      'Foste premiada por seres a forte; deixar de o ser parece perder o teu lugar.',
    ],
    mecanismos: [
      'A identidade fixa dá segurança: saber quem sou poupa-me ao desconhecido.',
      'Mudar ameaça os laços construídos sobre o papel antigo.',
      'Defender quem já não és é mais fácil do que enfrentar o luto de mudar.',
    ],
    crencas: [
      { pensa: 'Se eu mudar, deixo de ser eu.', verdade: 'Mudar não é deixares de ser tu. É parar de te forçar a ser quem já não és.' },
      { pensa: 'Não posso desiludir quem conta comigo.', verdade: 'Manteres-te igual para não desiludir os outros desilude-te a ti.' },
      { pensa: 'Mostrar fraqueza é perigoso.', verdade: 'Seres sempre a forte afasta-te. Ninguém te ajuda se nunca te vê precisar.' },
    ],
    custos: [
      'Uma vida a sustentar uma versão que já não te cabe.',
      'A exaustão de ser forte mesmo quando precisas de colo.',
      'A pessoa que poderias ser, presa atrás do papel.',
    ],
    cenas: [
      'Perguntaram se estavas bem. Sorriste e disseste "sempre", de novo.',
      'Precisavas de ajuda. Disseste "eu trato", como há vinte anos.',
      'Mudou tudo à tua volta. Tu continuaste a vestir a mesma armadura.',
    ],
    subtipos: ['O Véu da Mulher Forte', 'O Véu da Que Aguenta Sempre', 'O Véu da Que Tem Medo de Mudar', 'O Véu da Máscara que Já Aperta'],
    mapa: {
      pensa: 'Tenho de continuar a ser quem sempre fui.',
      sente: 'Medo de mudar, o peso de uma armadura.',
      faz: 'Aguenta, defende o papel, esconde a fragilidade.',
      paga: 'A sua verdade e a pessoa que podia tornar-se.',
    },
  },

  Dualidade: {
    essencia: 'A separação de fundo. Sentir-se só no meio de tudo, do lado de fora de um vidro, com uma falta que nenhuma companhia cura.',
    lentes: {
      transpessoal: 'A separação é o véu mais fundo: a ilusão de estar apartada do todo. O reencontro é lembrar que nunca estiveste verdadeiramente só.',
      constelacao: 'Quem não se sentiu pertencente ao sistema carrega esta solidão de raiz. Voltar a ocupar o teu lugar na ordem cura a sensação de exílio.',
      espiritualidade: 'A solidão essencial dissolve-se na ligação ao maior do que tu; não estás fora do todo, és parte dele.',
      desenvolvimento: 'A sensação de não pertencer leva a relações onde te sentes sempre meio de fora; nomeá-la é o primeiro passo para a intimidade real.',
    },
    comportamentos: [
      'Estás rodeada de gente e, mesmo assim, sentes-te só.',
      'Sentes o mundo sempre do outro lado de um vidro.',
      'Falta-te sempre qualquer coisa que não sabes nomear.',
      'No fundo de tudo, sentes-te sozinha contra a vida.',
      'Sorris para todos e, por dentro, choras sozinha.',
    ],
    origens: [
      'Uma sensação antiga de não pertencer, de chegar e nunca caber.',
      'Faltou o lugar reconhecido, o sentires-te parte de algo.',
      'Uma raiz comum a todos os véus: a separação que ficou por curar.',
    ],
    mecanismos: [
      'A mente acredita na separação e procura provas dela em todo o lado.',
      'A falta de pertença leva-te a manter a distância, e a distância confirma a falta.',
      'Nenhuma companhia cura porque a falta é de ligação contigo e com o todo, não de gente à volta.',
    ],
    crencas: [
      { pensa: 'Ninguém me entende verdadeiramente.', verdade: 'Sentires-te de fora não quer dizer que estejas. Muita gente sente isto e não diz.' },
      { pensa: 'Estou sozinha contra a vida.', verdade: 'Não estás sozinha nisto. Só ninguém fala sobre o assunto.' },
      { pensa: 'Falta-me algo que os outros têm.', verdade: 'Não te falta nada que os outros têm. Falta-te dares-te a atenção que pedes a eles.' },
    ],
    custos: [
      'A intimidade adiada por te manteres sempre meio de fora.',
      'A beleza da vida vivida atrás de um vidro.',
      'Uma solidão que nenhuma companhia consegue tocar.',
    ],
    cenas: [
      'A sala estava cheia de gente que gosta de ti. Sentiste-te só na mesma.',
      'Riste com todos à mesa. Por dentro, estavas do outro lado do vidro.',
      'Disseram que te adoram. E faltou-te, na mesma, qualquer coisa sem nome.',
    ],
    subtipos: ['O Véu da Que Está Só no Meio de Todos', 'O Véu do Vidro', 'O Véu da Falta sem Nome', 'O Véu da Que Não Pertence'],
    mapa: {
      pensa: 'No fundo, estou só, e ninguém alcança.',
      sente: 'Uma separação surda, uma falta sem nome.',
      faz: 'Mantém-se à distância, sorri por fora.',
      paga: 'A intimidade e o sentir-se parte.',
    },
  },
};

export const veusComSaber = (): VeuNome[] => Object.keys(SABER) as VeuNome[];

// Os exemplos de UMA dimensão do SABER de um véu (a matéria-prima do ângulo da
// semana no percurso da mãe). Serve ao calendário/semana (pré-visualização) e à
// geração (alimenta a IA com o ângulo certo). DimensaoVeu vive no planoTrimestral;
// aqui o tipo é inline para não criar import circular (planoTrimestral usa SABER).
export function exemplosDimensao(
  veu: VeuNome,
  dim: 'comportamentos' | 'cenas' | 'subtipos' | 'origens' | 'mecanismos' | 'custos' | 'crencas' | 'verdades' | 'mapa',
): string[] {
  const k = SABER[veu];
  if (!k) return [];
  switch (dim) {
    case 'comportamentos': return k.comportamentos;
    case 'cenas': return k.cenas;
    case 'subtipos': return k.subtipos;
    case 'origens': return k.origens;
    case 'mecanismos': return k.mecanismos;
    case 'custos': return k.custos;
    case 'crencas': return k.crencas.map((c) => c.pensa);
    case 'verdades': return k.crencas.map((c) => c.verdade);
    case 'mapa': return [k.mapa.pensa, k.mapa.sente, k.mapa.faz, k.mapa.paga];
  }
}
