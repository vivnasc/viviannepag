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
import { Reel, reelsDaConta, destaqueDe, destaquePortaDe, realceAuto } from './reels';

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
  Memória: 'da', Desolação: 'da', Permanência: 'da', Dualidade: 'da',
};
export const nomeVeu = (veu: VeuNome) => `Véu ${ARTIGO[veu]} ${veu}`;

// prefixo de id: a mãe é transversal e reusa os reels das 3 portas, por isso
// os ids são namespaced ('mae-...') para não colidirem com os das portas.
const pid = (conta: ContaId, id: string) => (conta === 'mae' ? `mae-${id}` : id);

function reconhecimentoDoReel(r: Reel, conta: ContaId): Post {
  return {
    id: pid(conta, r.id),
    conta,
    tipo: 'reconhecimento',
    veu: r.veu,
    texto: r.porta,
    destaque: destaquePortaDe(r), // realce SEMPRE (cai sobre a ferida, não a resposta)
    payoff: r.sala,
    fundoCena: r.fundoCena,
    fonte: r.fonte,
    conceito: nomeVeu(r.veu),
  };
}

function revelacaoDoReel(r: Reel, conta: ContaId): Post {
  return {
    id: pid(conta, `${r.id}-rev`),
    conta,
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
  return reelsDaConta(conta).map((r) => reconhecimentoDoReel(r, conta));
}
// Todas as revelações disponíveis (aforismos), as mais fortes primeiro, para dar
// volume sem repetir tão cedo.
export function revelacaoPosts(conta: ContaId): Post[] {
  const reels = reelsDaConta(conta);
  const porForte = (arr: Reel[]) => [...arr.filter((r) => r.revelacaoForte), ...arr.filter((r) => !r.revelacaoForte)];
  // a mãe lidera pelas revelações da Dualidade (território próprio dela), para
  // não repetir as mesmas revelações das portas na mesma semana.
  const ordenados = conta === 'mae'
    ? [...porForte(reels.filter((r) => r.veu === 'Dualidade')), ...porForte(reels.filter((r) => r.veu !== 'Dualidade'))]
    : porForte(reels);
  return ordenados.map((r) => revelacaoDoReel(r, conta));
}
// Realce curado por linha de manifesto (a palavra que tem de ficar). Fallback
// heurístico garante realce mesmo em linhas novas.
const DESTAQUE_MANIFESTO: Record<string, string[]> = {
  'Nem tudo o que passa pela tua cabeça merece um lugar na tua vida.': ['um lugar na tua vida'],
  'Pensar não é ver.': ['ver'],
  'A paz não é a cabeça em silêncio. É deixares de te agarrar ao barulho.': ['agarrar ao barulho'],
  'Não precisas de carregar tudo para mereceres o teu lugar.': ['o teu lugar'],
  'Descansar não é desistir.': ['desistir'],
  'O amor que se paga com exaustão não era amor, era medo.': ['era medo'],
  'Não estás atrasada para lugar nenhum.': ['lugar nenhum'],
  'A tua vida não começa depois. Já começou.': ['Já começou'],
  'Não há nenhum comboio a partir sem ti.': ['sem ti'],
  'Vê o que te prende. Solta o que te faz repetir.': ['Solta'],
  'Os padrões que te fazem repetir são véus. Aprende a vê-los e a soltá-los.': ['véus'],
  'Não há soltar sem ver.': ['ver'],
  'Nunca, em momento nenhum, caminhaste sozinha.': ['sozinha'],
  'A casa que procuras nunca esteve longe.': ['nunca esteve longe'],
};

export function manifestoPosts(conta: ContaId): Post[] {
  const c = CONTAS[conta];
  return c.manifestoLinhas.map((linha, i) => ({
    id: `${conta}-mani-${i + 1}`,
    conta,
    tipo: 'manifesto' as const,
    texto: linha,
    destaque: DESTAQUE_MANIFESTO[linha] ?? realceAuto(linha),
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
  for (const conta of ['ver', 'vir', 'viver', 'mae'] as ContaId[]) {
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
