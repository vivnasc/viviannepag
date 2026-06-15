// Método VS · o motor editorial (posts tipados)
//
// A biblioteca (reels.ts) está ligada aos livros/véus/movimentos. Daqui saem os
// POSTS, cada um de UM tipo, com UMA linha no ecrã (foco), na mistura que a
// Vivianne definiu:
//   60% RECONHECIMENTO  a dor na 1.ª pessoa (toda a gente se reconhece, 3 seg).
//   30% REVELAÇÃO       o aforismo que faz parar (a recompensa).
//   10% MANIFESTO       a declaração da conta.
//
// Regra: o reconhecimento LIDERA; a revelação entra como recompensa (na legenda
// dos posts de reconhecimento, ou como post próprio nos aforismos mais fortes).

import { ContaId, VeuNome, CONTAS } from './contas';
import { Reel, reelsDaConta, destaqueDe } from './reels';

export type PostTipo = 'reconhecimento' | 'revelacao' | 'manifesto';

export interface Post {
  id: string;
  conta: ContaId;
  tipo: PostTipo;
  veu?: VeuNome;
  /** A ÚNICA linha que aparece no ecrã. */
  texto: string;
  /** Palavras a realçar a ouro (vazio nos de reconhecimento: dor limpa). */
  destaque: string[];
  /** (reconhecimento) a revelação a entregar na legenda, como recompensa. */
  payoff?: string;
  /** (revelação) a linha de reconhecimento que faz a ponte, na legenda. */
  bridge?: string;
  fundoCena: string;
  fonte: string;
  /** Selo no topo do reel (a lógica editorial visível). */
  conceito: string;
}

const ARTIGO: Record<VeuNome, string> = {
  Turbilhão: 'do', Esforço: 'do', Horizonte: 'do',
  Memória: 'da', Desolação: 'da', Permanência: 'da',
};
export const nomeVeu = (veu: VeuNome) => `Véu ${ARTIGO[veu]} ${veu}`;

function reconhecimentoDoReel(r: Reel): Post {
  return {
    id: r.id,
    conta: r.conta,
    tipo: 'reconhecimento',
    veu: r.veu,
    texto: r.porta,
    destaque: [],
    payoff: r.sala,
    fundoCena: r.fundoCena,
    fonte: r.fonte,
    conceito: nomeVeu(r.veu),
  };
}

function revelacaoDoReel(r: Reel): Post {
  return {
    id: `${r.id}-rev`,
    conta: r.conta,
    tipo: 'revelacao',
    veu: r.veu,
    texto: r.sala,
    destaque: destaqueDe(r),
    bridge: r.porta,
    fundoCena: r.fundoCena,
    fonte: r.fonte,
    conceito: `Revelação · ${nomeVeu(r.veu)}`,
  };
}

export function reconhecimentoPosts(conta: ContaId): Post[] {
  return reelsDaConta(conta).map(reconhecimentoDoReel);
}
// Todas as revelações disponíveis (aforismos), as mais fortes primeiro, para dar
// volume sem repetir tão cedo.
export function revelacaoPosts(conta: ContaId): Post[] {
  const reels = reelsDaConta(conta);
  return [...reels.filter((r) => r.revelacaoForte), ...reels.filter((r) => !r.revelacaoForte)].map(revelacaoDoReel);
}
export function manifestoPosts(conta: ContaId): Post[] {
  const c = CONTAS[conta];
  return c.manifestoLinhas.map((linha, i) => ({
    id: `${conta}-mani-${i + 1}`,
    conta,
    tipo: 'manifesto' as const,
    texto: linha,
    destaque: [],
    fundoCena: c.fundoBase,
    fonte: `manifesto ${c.handle}`,
    conceito: 'Manifesto',
  }));
}

/** Todos os posts de uma conta, agrupados por tipo (para o admin). */
export function postsDaConta(conta: ContaId): Post[] {
  return [...manifestoPosts(conta), ...reconhecimentoPosts(conta), ...revelacaoPosts(conta)];
}

export function getPost(id: string): Post | undefined {
  for (const conta of ['ver', 'vir', 'viver'] as ContaId[]) {
    const p = postsDaConta(conta).find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}

/** A sequência de lançamento, na mistura 60/30/10: manifesto a abrir, depois
 *  reconhecimento a liderar com a revelação a pontuar. Determinística. */
export function sequenciaMix(conta: ContaId): Post[] {
  const recon = reconhecimentoPosts(conta);
  const rev = revelacaoPosts(conta);
  const mani = manifestoPosts(conta);
  const out: Post[] = [...mani];
  let ri = 0; let vi = 0; let desde = 0;
  while (ri < recon.length || vi < rev.length) {
    // a cada 2 reconhecimentos, 1 revelação (≈ 60/30), com o manifesto já dado.
    if (desde >= 2 && vi < rev.length) {
      out.push(rev[vi++]);
      desde = 0;
    } else if (ri < recon.length) {
      out.push(recon[ri++]);
      desde += 1;
    } else if (vi < rev.length) {
      out.push(rev[vi++]);
    }
  }
  return out;
}
