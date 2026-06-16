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
      'O corpo em modo ameaça produz pensamento sem parar, como o estômago produz sumo gástrico.',
    ],
    crencas: [
      { pensa: 'Se eu pensar mais, resolvo.', verdade: 'Quando te fundes com o pensamento, perdes a clareza que procuravas.' },
      { pensa: 'Estou a prevenir-me.', verdade: 'Estás a viver o problema antes de ele existir, e a pagá-lo duas vezes.' },
      { pensa: 'Sou ansiosa, é a minha personalidade.', verdade: 'É um padrão aprendido para te protegeres, não a tua natureza.' },
      { pensa: 'Parar é perder tempo.', verdade: 'É no descanso que a clareza volta; a pressa é que te tira tempo.' },
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
};

export const veusComSaber = (): VeuNome[] => Object.keys(SABER) as VeuNome[];
