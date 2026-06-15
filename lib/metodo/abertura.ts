// Método VS · conteúdo de ABERTURA das 3 contas
//
// A sequência de lançamento de cada porta: um post de apresentação (o
// manifesto, que diz a quem a conta serve e o que muda) seguido dos primeiros
// reels, alternando os dois véus do movimento para criar ritmo.
//
// Travessões BANIDOS. Voz serena, sem hype.

import { ContaId, CONTAS } from './contas';
import { Reel, getReel } from './reels';

/** O manifesto de cada conta: o primeiro post, a porta da própria conta. */
type Porta = 'ver' | 'vir' | 'viver';
export const MANIFESTOS: Record<Porta, Reel> = {
  ver: {
    id: 'ver-00',
    conta: 'ver',
    veu: 'Turbilhão',
    porta: 'Não consigo desligar a cabeça.',
    sala: 'Aqui aprendes a criar distância dos pensamentos sem lutares contra eles. Ver é sair de dentro da tempestade.',
    fundoCena: CONTAS.ver.fundoBase,
    fonte: 'manifesto ver.soltar',
    destaque: ['sem lutares contra eles'],
  },
  vir: {
    id: 'vir-00',
    conta: 'vir',
    veu: 'Esforço',
    porta: 'Faço tudo por toda a gente, e sinto culpa quando penso em mim.',
    sala: 'Aqui aprendes a descansar sem culpa e a deixar-te segurar. Vir é regressar a ti.',
    fundoCena: CONTAS.vir.fundoBase,
    fonte: 'manifesto vir.soltar',
    destaque: ['sem culpa'],
  },
  viver: {
    id: 'viver-00',
    conta: 'viver',
    veu: 'Horizonte',
    porta: 'Estou sempre à espera que a minha vida comece.',
    sala: 'Aqui aprendes a sair do depois e a entrar na tua vida, agora. A estreia é hoje.',
    fundoCena: CONTAS.viver.fundoBase,
    fonte: 'manifesto viver.soltar',
    destaque: ['A estreia é hoje'],
  },
};

/** Legenda do manifesto: apresenta a conta, o método e o convite. */
export function legendaManifesto(conta: ContaId): string {
  const c = CONTAS[conta];
  const m = MANIFESTOS[conta as Porta];
  if (!m) return '';
  const paras = [
    m.porta,
    m.sala,
    `Bem-vinda a ${c.handle}, a porta do ${c.movimento} dentro do Método VS · Ver e Soltar. ${c.depois}`,
    `${c.ctaPT} Caminhamos um véu de cada vez.`,
    'Segue, e guarda esta publicação para o dia em que precisares.',
  ];
  return paras.join('\n\n');
}

// A ordem de lançamento de cada conta: manifesto, depois 6 reels alternando os
// dois véus do movimento (o mais forte primeiro, como âncora).
const SEQUENCIAS: Record<Porta, string[]> = {
  ver: ['ver-00', 'ver-01', 'ver-05', 'ver-04', 'ver-06', 'ver-03', 'ver-07'],
  vir: ['vir-00', 'vir-01', 'vir-05', 'vir-02', 'vir-06', 'vir-04', 'vir-07'],
  viver: ['viver-00', 'viver-01', 'viver-05', 'viver-03', 'viver-06', 'viver-02', 'viver-07'],
};

/** Resolve um id para um Reel (manifesto ou biblioteca). */
export function resolverReel(id: string): Reel | undefined {
  if (id.endsWith('-00')) {
    const conta = id.replace('-00', '') as Porta;
    return MANIFESTOS[conta];
  }
  return getReel(id);
}

/** A sequência de abertura de uma conta, já resolvida em Reels. */
export function aberturaDaConta(conta: ContaId): Reel[] {
  return (SEQUENCIAS[conta as Porta] ?? [])
    .map((id) => resolverReel(id))
    .filter((r): r is Reel => Boolean(r));
}

export function ehManifesto(id: string): boolean {
  return id.endsWith('-00');
}
