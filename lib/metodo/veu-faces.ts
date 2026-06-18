// Método VS · O RETRATO COMPLETO de cada véu (as 6 faces).
//
// O que separa o método do mercado: o mercado fala do COMPORTAMENTO; este fala do
// MOTIVO. A mesma procrastinação tem 7 motivos diferentes (um por véu). Por isso
// cada véu tem um retrato inteiro, não fuga/culpa "soltas".
//
// As 6 faces: Dor · Fuga · Culpa · Custo · Revelação · Saída (movimento).
//   - Dor, Custo, Revelação já vivem no SABER (saber.ts) e nos manuais.
//   - Fuga, Culpa, Saída são as que FALTAM e se acrescentam aqui.
// NÃO toca no saber.ts de propósito (a outra sessão edita-o). Esta camada é só o
// retrato, derivado dos manuais da Vivianne (não inventado), para validação.
//
// Princípio que guia os exemplos (a mulher de 2026, não a de 2000): a forma mudou,
// a hierarquia não. A mulher de 2000 sacrificava o CORPO (comia de pé enquanto os
// outros comiam sentados). A de 2026 sacrifica a ATENÇÃO (sentada à mesa, mas a
// gerir tudo na cabeça enquanto os outros estão presentes). O mesmo padrão, numa
// tradução moderna. Os exemplos da dor falam à mulher de hoje.

import type { VeuNome } from './contas';
import type { DimensaoVeu } from './planoTrimestral';
import { exemplosDimensao } from './saber';

export interface FacesVeu {
  dor: string;        // o que se sente / faz (do SABER + biblioteca de reconhecimentos)
  fuga: string;       // como foge desse véu (NOVO)
  culpa: string;      // a culpa que o véu gera (NOVO)
  custo: string;      // o preço invisível (do SABER.custos)
  revelacao: string;  // a verdade que o desfaz (do SABER.crencas.verdade)
  saida: string;      // o movimento concreto de sair (NOVO)
}

// Estado: 'completo' = retrato validável; 'rascunho' = só a dor, à espera da
// matéria da Vivianne (preenche-se véu a véu, depois de validar o primeiro).
// O retrato completo dos 7 véus, derivado dos manuais e do pilar da Vivianne
// (não inventado). NÃO toca no saber.ts (a outra sessão edita-o).
export const VEU_FACES: Record<VeuNome, FacesVeu> = {
  Permanência: {
    dor: 'Apresentas-te sempre pela mesma frase. És a forte, a responsável, a que aguenta. E há silêncios em que essa frase te aperta como roupa de um corpo que já mudou.',
    fuga: 'Manténs-te igual a todo o custo e chamas-lhe carácter. Definires-te por um papel é a tua maneira de nunca enfrentar a pergunta de quem serias sem ele. Adias o que muda porque começar obrigava-te a tornar-te alguém novo.',
    culpa: 'Mudar de rumo soa a traição. Se largas o papel da forte, sentes que desiludes quem conta contigo, e que atraiçoas as mulheres de quem herdaste a dureza.',
    custo: 'Vives em guarda permanente, sem direito a errar nem a não saber. E morres um bocadinho de cada vez que um papel teu muda, acaba ou te é tirado.',
    revelacao: 'Não és a forma, és o que permanece quando as folhas caem. A identidade é roupa, não pele. O que não pode ser perdido não precisa de defesa.',
    saida: 'Pousar o papel por um dia e ver que não desabas. Baixar os braços. Dizer às que vieram antes: vi o que aguentaram, honro-vos, e a partir de mim posso pousar o que já não é preciso.',
  },
  Memória: {
    dor: 'Dizes "comigo é sempre assim" com a naturalidade de quem afirma a cor dos olhos. Vives a olhar pelo retrovisor, a confirmar quem és pelo que já te aconteceu.',
    fuga: 'Refugias-te na tua história, como prova e como sentença. Repetir quem sempre foste poupa-te ao risco de descobrir quem ainda podes ser. Sais primeiro, fechas portas antes de te aproximares, e adias o que é novo porque falhar dói demais.',
    culpa: 'Ser feliz parece abandonar quem sofreu antes de ti. Sabotas o que te corre bem por lealdade a um destino familiar que confundiste com identidade.',
    custo: 'Reages ao presente com uma dor que pertence a outro tempo. Fechas portas antes de te aproximares. Vives tardes inteiras dentro de filmes antigos.',
    revelacao: 'A memória não guarda o passado, reconta-o. Não te lembras do que aconteceu, lembras-te da última vez que te lembraste. Não és a tua narrativa, és o agora que a está a contar.',
    saida: 'Pegar numa frase de "eu sempre" ou "eu nunca" e perguntar: de quem é esta voz? Quase sempre não é tua. Reconhecê-la, e devolvê-la a quem a disse primeiro.',
  },
  Turbilhão: {
    dor: 'A cabeça não para. Ensaias discussões que não vão acontecer, levas tudo para a cama, acordas já a fazer a lista. Não tens medo, és o medo de uma ponta à outra.',
    fuga: 'Chamas responsabilidade ao que é fuga. Pensar, prever, resolver de antemão, tudo serve para não ficares quieta com o que sentes. E adias decidir porque precisas sempre de pensar só mais um bocado primeiro.',
    culpa: 'Confundes preocupação com amor. Achas que, se deixasses de te ralar, estarias a ser negligente, e por isso não te dás licença para parar a roda. E ainda te culpas por estares ao jantar com a cabeça na conversa da manhã.',
    custo: 'Noites roubadas a uma discussão que durou dois minutos e correu bem. Sofres tudo, menos o que de facto acontece. E nunca estás inteira no momento bom.',
    revelacao: 'Se consegues ver um pensamento, há em ti algo que não é esse pensamento. Tu não és a tempestade. És o céu por onde ela passa, e nenhum céu foi alguma vez rasgado por uma nuvem.',
    saida: 'Quando a cabeça acelerar, dizer por dentro: estou a reparar que estou a pensar isto. Isso já te tira da onda para a margem. Depois, três respirações, e sentir quem respira.',
  },
  Esforço: {
    dor: 'Agendas os exames de toda a gente e adias os teus. Sentas-te à mesa, mas continuas a gerir tudo na cabeça enquanto os outros estão simplesmente presentes. Respondes a todos em minutos, e a ti não chegas há meses.',
    fuga: 'A gestão é a tua fuga mais aplaudida. Enquanto organizas a vida de todos, não tens de parar com a tua. Estar sempre ocupada com os outros parece cuidado, mas é também não teres de estar contigo. Tornas-te indispensável e adias o que é teu porque estás exausta e nem a ti o admites.',
    culpa: 'Descansar custa-te como uma dívida. Se paras, sentes que deixas alguém em falta. A culpa não vem de teres feito mal. Vem de teres parado.',
    custo: 'Conheces as alergias de todos e ignoras os sinais do teu corpo. As relações onde só dás. A atenção sempre noutro lado, nunca em ti. E uma vida inteira a provar que mereces ficar.',
    revelacao: 'Aprendeste que o amor se ganha a fazer. Não se ganha. O que se ganha a fazer não é amor, é dependência da tua entrega. Tu bastas antes de produzires seja o que for.',
    saida: 'Parar de empurrar. Largar uma coisa, só uma, e ver que o chão continua lá. Marcar a tua consulta antes da dos outros. Deixares-te segurar, em vez de seres sempre tu a segurar.',
  },
  Desolação: {
    dor: 'Ligas a TV mal entras, pegas no telemóvel sem razão, inventas uma tarefa quando ninguém precisa de ti. Mal o silêncio se instala, corres a preenchê-lo antes de o sentires.',
    fuga: 'É sempre o mesmo gesto em mil formas: a TV ligada mal entras, o scroll, as compras, o copo, o trabalho a mais, a relação que não acaba. E quando não anestesias, procuras sentido sem fim. Tudo para não chegares ao quarto escuro.',
    culpa: 'Receber custa-te como uma dívida, e a paz parece um luxo que não mereces. Sentes culpa quando descansas, como se parar fosse falhar com alguém.',
    custo: 'Manténs compromissos que já não te alimentam só para não enfrentar o vazio depois deles. E raramente sabes responder do que é que tu, só tu, gostas.',
    revelacao: 'O vazio não é ausência, é o campo onde a alma germina. Quando ficas nele sem fugir, ele não te engole. Por baixo da angústia aparece uma paz esquecida, e a pergunta: e eu, do que é que eu preciso?',
    saida: 'Ficar no silêncio o tempo suficiente para a angústia assentar como pó que pousa. Não encher. Esperar para ver se há mesmo ali um abismo, ou só uma voz tua à espera de ser ouvida.',
  },
  Horizonte: {
    dor: 'Vives num "quando". Quando os filhos crescerem, quando me reformar, quando tiver tempo, quando emagrecer. Alcanças a meta e em poucos dias já queres a próxima.',
    fuga: 'O "lá" luminoso é a tua forma de não estar aqui. Procurar sempre o passo seguinte poupa-te de habitar o presente, que te parece sempre pouco. Adias a vida para um "quando" porque o momento certo está sempre mais à frente.',
    culpa: 'Achas que ainda não tens direito a viver, que primeiro tens de cumprir a condição. Descansar antes de chegares soa a preguiça, a estares a desistir.',
    custo: 'A vida passa-te ao lado enquanto a preparas para começar. Estás meia ausente de quem amas, projetada no próximo passo. Vives de mala feita à porta de um comboio que nunca chega.',
    revelacao: 'O "lá" é, por natureza, um lugar onde não se chega, feito para recuar a cada passo. Não estás atrasada para nada. Não há comboio a partir sem ti. A estreia é hoje. Sempre foi.',
    saida: 'Hoje, uma coisa pequena e presente: o calor da chávena nas mãos, três respirações. Era para isto que esperavas. Chegar onde já estás.',
  },
  Dualidade: {
    dor: 'Fazes as contas das relações. Sentes o mundo sempre do outro lado de um vidro. Há uma saudade de fundo, de uma pertença que não sabes nomear.',
    fuga: 'Todas as outras fugas nascem desta. Agarras-te à identidade, prendes-te à história, enches o vazio, corres para o horizonte, esforças-te para seres amada, tudo para não sentires a separação primeira.',
    culpa: 'No fundo sentes que és tu o problema, que há em ti algo a mais ou a menos que te deixa sempre de fora. Carregas a solidão como se a culpa fosse tua.',
    custo: 'Uma solidão de fundo que nenhuma companhia cura. O frio antigo que bate à porta mesmo rodeada de gente. E o medo de que, no fim, estás sozinha contra a vida.',
    revelacao: 'A separação é a crença mais fina e mais antiga, e é mentira. Nunca estiveste separada. Como diz o Ubuntu, eu sou porque nós somos. A casa que procuraste sete véus a fio era o chão onde sempre pisaste.',
    saida: 'Escolher um único ser vivo, uma árvore, um pássaro, alguém ao longe, e deixar subir devagar: somos do mesmo. O mesmo ar, a mesma vida a atravessar formas diferentes. Três respirações dentro dessa pertença.',
  },
};

// As LIGAÇÕES entre véus (a TEIA). Não há só uma. O pilar já nomeia várias; a
// "Procura sem Chegada" é a NOVA, descoberta na vida. A Dualidade não é uma ponte
// entre dois, é a RAIZ de todos (ver RAIZ).
export interface LigacaoVeu { de: VeuNome; para: VeuNome; nome: string; texto: string; nova?: boolean; }
export const LIGACOES: LigacaoVeu[] = [
  {
    de: 'Esforço', para: 'Desolação',
    nome: 'O mesmo nó',
    texto: 'O esforço é a fuga mais socialmente aplaudida da desolação. Enquanto fazes, não paras. Enquanto não paras, não chegas ao silêncio. E enquanto não chegas ao silêncio, não tens de sentir o vazio.',
  },
  {
    de: 'Desolação', para: 'Horizonte',
    nome: 'A Procura sem Chegada', nova: true,
    texto: 'A Desolação não te empurra só para a fuga. Às vezes empurra-te para a procura. E quando a procura encontra o Horizonte (ainda não, falta mais, continua), transforma-se numa sala de espera sem fim. A Desolação faz a fome, o Horizonte promete a refeição sempre no prato seguinte.',
  },
  {
    de: 'Horizonte', para: 'Permanência',
    nome: 'Os dois ladrões do presente',
    texto: 'O futuro puxa-te (o Horizonte, o "quando serei feliz") e o passado segura-te (a Permanência, quem já foste). Os dois juntos roubam-te o presente por inteiro, um atirando-te para a frente, o outro prendendo-te ao que já foi.',
  },
  {
    de: 'Turbilhão', para: 'Memória',
    nome: 'A cabeça fora do agora',
    texto: 'A cabeça que não para anda quase sempre a remoer o passado ou a ensaiar um futuro à imagem desse passado. Raramente no agora.',
  },
];

// A Dualidade é a RAIZ comum, não uma ponte entre dois véus.
export const RAIZ: { veu: VeuNome; texto: string } = {
  veu: 'Dualidade',
  texto: 'Por baixo de todos vive a Dualidade, a sensação de separação. Foi ela que te fez agarrar à identidade, prender-te à história, encher o vazio, correr para o horizonte, esforçar-te para seres amada. Quando ela afrouxa, todos os outros perdem força ao mesmo tempo, como folhas de um ramo que finalmente se solta.',
};

// Os exemplos do ÂNGULO de uma semana do percurso. Para as faces do retrato
// validado (fuga/culpa/saida) devolve a face na voz dela; para as dimensões do
// SABER delega em exemplosDimensao (sem tocar no saber.ts). É o que liga o
// percurso trimestral expandido às faces validadas.
export function exemplosDoAngulo(veu: VeuNome, dim: DimensaoVeu): string[] {
  const f = VEU_FACES[veu];
  if (f) {
    if (dim === 'fuga') return [f.fuga];
    if (dim === 'culpa') return [f.culpa];
    if (dim === 'saida') return [f.saida];
  }
  return exemplosDimensao(veu, dim as Exclude<DimensaoVeu, 'fuga' | 'culpa' | 'saida'>);
}

export const FACES_ORDEM: { chave: keyof FacesVeu; titulo: string; nova: boolean }[] = [
  { chave: 'dor', titulo: 'A dor', nova: false },
  { chave: 'fuga', titulo: 'A fuga', nova: true },
  { chave: 'culpa', titulo: 'A culpa', nova: true },
  { chave: 'custo', titulo: 'O custo', nova: false },
  { chave: 'revelacao', titulo: 'A revelação', nova: false },
  { chave: 'saida', titulo: 'A saída', nova: true },
];

// PONTES entre véus (compatibilidade com a página Universo do Método): as LIGACOES
// da teia vistas como pontes {de, para, mecanismo}. Inclui a 1.ª descoberta
// (Desolação -> Horizonte) e as restantes ligações que o pilar nomeia.
export const PONTES: { de: VeuNome; para: VeuNome; mecanismo: string }[] =
  LIGACOES.map((l) => ({ de: l.de, para: l.para, mecanismo: l.texto }));
