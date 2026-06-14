// Método VS · construtor de legendas dos reels (porta → sala → nome → CTA)
//
// Ao contrário da veu.a.veu (didática, não vende), as portas VENDEM o manual.
// Estrutura (parágrafos separados por linha em branco, \n\n):
//   1. gancho: a dor na 1.ª pessoa (a porta).
//   2. a revelação (a sala), em palavras simples.
//   3. nomear o véu: "isto tem um nome" (a recompensa do método).
//   4. CTA: comenta a palavra, recebe o 1.º passo, vai ao manual.
// Travessões BANIDOS. Português europeu, sereno.

import { Conta, CONTAS, VeuNome } from './contas';
import { Reel } from './reels';

// Hashtags por véu (a língua da dor) + base do método.
const HASHTAGS_BASE = [
  '#metodovs',
  '#veresoltar',
  '#ossetevéus',
  '#psicologiatranspessoal',
  '#constelacaofamiliar',
  '#autoconhecimento',
];

const HASHTAGS_VEU: Record<VeuNome, string[]> = {
  Turbilhão: ['#ansiedade', '#ruminação', '#mentequenãopára', '#pensamentosintrusivos'],
  Memória: ['#feridasdeinfância', '#padrõesquerepetem', '#heranças', '#psicologia'],
  Esforço: ['#cansaço', '#culpa', '#mulherquecarregatudo', '#descansarsemculpa'],
  Desolação: ['#solidão', '#medodovazio', '#estarsó', '#presença'],
  Horizonte: ['#viverodepois', '#ansiedadedefuturo', '#aquiagora', '#viveropresente'],
  Permanência: ['#medodemudar', '#identidade', '#reinventar', '#deixarir'],
};

// "isto tem um nome": a frase que entrega o conceito como recompensa.
const NOME_DO_VEU: Record<VeuNome, string> = {
  Turbilhão: 'No Método VS, isto tem um nome: é o Véu do Turbilhão.',
  Memória: 'No Método VS, isto tem um nome: é o Véu da Memória.',
  Esforço: 'No Método VS, isto tem um nome: é o Véu do Esforço.',
  Desolação: 'No Método VS, isto tem um nome: é o Véu da Desolação.',
  Horizonte: 'No Método VS, isto tem um nome: é o Véu do Horizonte.',
  Permanência: 'No Método VS, isto tem um nome: é o Véu da Permanência.',
};

export function hashtagsDoReel(reel: Reel): string[] {
  const set = new Set<string>([...HASHTAGS_VEU[reel.veu], ...HASHTAGS_BASE]);
  return Array.from(set).slice(0, 12);
}

/** Legenda completa de um reel de porta (a dor entra, o conceito fica). */
export function legendaDoReel(reel: Reel, conta: Conta = CONTAS[reel.conta]): string {
  const paras = [
    reel.porta,
    reel.sala,
    NOME_DO_VEU[reel.veu],
    `${conta.ctaPT} O manual ${conta.manualNome} está na bio.`,
    'Guarda esta publicação para o dia em que precisares.',
  ];
  return paras.join('\n\n');
}

/** Legenda + hashtags prontas (o que vai para o Instagram). */
export function legendaCompleta(reel: Reel, conta: Conta = CONTAS[reel.conta]): string {
  return `${legendaDoReel(reel, conta)}\n\n${hashtagsDoReel(reel).join(' ')}`;
}
