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
import { Post, nomeVeu } from './posts';
import { legendaManifesto } from './abertura';

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

// ── Posts tipados (o motor editorial) ──────────────────────────────────────

export function hashtagsDoPost(post: Post): string[] {
  const veu = post.veu ? HASHTAGS_VEU[post.veu] : [];
  return Array.from(new Set<string>([...veu, ...HASHTAGS_BASE])).slice(0, 12);
}

/** Legenda de um post, conforme o tipo (a dor lidera; a revelação recompensa). */
export function legendaDoPost(post: Post): string {
  const c = CONTAS[post.conta];
  const cta = `${c.ctaPT} O manual ${c.manualNome} está na bio.`;
  const guardar = 'Guarda esta publicação para o dia em que precisares.';

  let paras: string[];
  if (post.tipo === 'manifesto') {
    return legendaManifesto(post.conta);
  } else if (post.tipo === 'revelacao') {
    paras = [
      post.bridge ? `Talvez te soe: «${post.bridge}»` : post.texto,
      post.veu ? `Isto, no Método VS, tem um nome: o ${nomeVeu(post.veu)}.` : '',
      cta,
      guardar,
    ].filter(Boolean);
  } else {
    // reconhecimento: a dor (no ecrã) entra; a revelação chega como recompensa.
    paras = [
      post.texto,
      post.payoff ?? '',
      post.veu ? `No Método VS, isto tem um nome: o ${nomeVeu(post.veu)}.` : '',
      cta,
      guardar,
    ].filter(Boolean);
  }
  return paras.join('\n\n');
}
