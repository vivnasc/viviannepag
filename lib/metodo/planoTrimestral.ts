// PLANO TRIMESTRAL do Método VS, POR CONTA — o equivalente ao PLANO_EDITORIAL da
// veu.a.veu (lib/veu/planoEditorial.ts), mas separado por conta e SEM tocar nele.
//
// Fonte única do "do mais amplo ao mais específico": o Calendário mostra esta
// jornada em cartões; a produção semanal desce ao detalhe. Cada conta percorre
// os SEUS véus (partes); cada véu tem os seus temas (cartões), que são as
// crenças/verdades REAIS do SABER (não inventadas). A mãe percorre os 7.

import { VeuNome, ContaId, CONTAS } from './contas';
import { SABER } from './saber';

export const SEMANAS_TRIMESTRE = 12; // ~3 meses (janela contínua)

const INICIO = Date.UTC(2026, 5, 15); // 2.ª-feira da semana 1. Fuso: LOCAL, nunca UTC.

export function semanaTrimestreAtual(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const passadas = Math.floor((hojeUTC - INICIO) / (7 * 864e5));
  return (((passadas % SEMANAS_TRIMESTRE) + SEMANAS_TRIMESTRE) % SEMANAS_TRIMESTRE) + 1;
}

// os véus que cada conta percorre. A mãe é transversal: os 7.
const VEUS_CONTA: Record<ContaId, VeuNome[]> = {
  ver: CONTAS.ver.veus,
  vir: CONTAS.vir.veus,
  viver: CONTAS.viver.veus,
  mae: ['Dualidade', 'Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência'],
};

export type TemaSemana = { semana: number; veu: VeuNome; nota: string; mote: string };

// os temas de UM véu, de TODO o seu SABER (não só crenças): a verdade (com a dor
// reconhecida), as cenas do dia a dia e os custos escondidos. Muito conteúdo por
// véu — nenhuma conta fica curta. Tipos intercalados dentro do véu.
function temasDoVeu(veu: VeuNome): { veu: VeuNome; nota: string; mote: string }[] {
  const k = SABER[veu];
  if (!k) return [];
  const cr = k.crencas ?? [], ce = k.cenas ?? [], cu = k.custos ?? [];
  const out: { veu: VeuNome; nota: string; mote: string }[] = [];
  const m = Math.max(cr.length, ce.length, cu.length);
  for (let i = 0; i < m; i++) {
    if (cr[i]) out.push({ veu, mote: cr[i].verdade, nota: `Pensas: «${cr[i].pensa}»` });
    if (ce[i]) out.push({ veu, mote: ce[i], nota: 'Cena do dia a dia' });
    if (cu[i]) out.push({ veu, mote: cu[i], nota: 'O custo escondido' });
  }
  return out;
}

// a jornada trimestral de uma conta: os véus da conta ALTERNADOS (nunca o mesmo
// véu seguido, nunca um mês no mesmo). Round-robin: tema 0 de cada véu, depois
// tema 1 de cada véu, etc. A mãe alterna os 7; as portas os seus.
export function jornadaConta(conta: ContaId): TemaSemana[] {
  const veus = VEUS_CONTA[conta] ?? [];
  const listas = veus.map(temasDoVeu);
  const max = Math.max(0, ...listas.map((l) => l.length));
  const out: TemaSemana[] = [];
  let n = 1;
  for (let i = 0; i < max; i++) {
    for (const l of listas) {
      if (l[i]) out.push({ semana: n++, veu: l[i].veu, nota: l[i].nota, mote: l[i].mote });
    }
  }
  return out;
}

// quantos temas tem a jornada de uma conta (para mapear "esta semana").
export function totalTemas(conta: ContaId): number {
  return jornadaConta(conta).length;
}

// ── PERCURSO da MÃE · a VISÃO de 3 meses (o equivalente às PARTES da veu.a.veu) ──
//
// A mãe executa, no semanal, 1 véu por DIA (7 véus completam a semana). Mas isso,
// sozinho, é repetição: faltava o PERCURSO. Aqui o trimestral dá a DIREÇÃO de
// longo prazo: cada SEMANA é uma TEMÁTICA (um ângulo do método sobre os 7 véus),
// e as temáticas avançam num caminho Ver -> Compreender -> O custo -> Soltar (o
// próprio método: não há soltar sem ver). O semanal DESCE daqui: nessa semana, os
// 7 véus (1/dia) são vistos por esse ângulo. Assim o planeado no trimestral é
// EXECUTADO no semanal. Cada ângulo é uma DIMENSÃO real do SABER (não inventado).

/** A dimensão do SABER que a semana ilumina (o ângulo da dor desse véu). */
export type DimensaoVeu = 'comportamentos' | 'cenas' | 'subtipos' | 'origens' | 'mecanismos' | 'custos' | 'crencas' | 'verdades' | 'mapa';

export interface ParteMae { id: string; nome: string; descricao: string }
export interface SemanaMae {
  semana: number;      // 1..N (a posição no percurso)
  parte: string;       // movimento do percurso
  dimensao: DimensaoVeu;
  tema: string;        // o foco da semana (o que liga os 7 véus)
  mote: string;        // a frase-âncora da semana
  /** instrução curta do ângulo, para a geração escrever a dor a partir dele. */
  foco: string;
}

// As 4 partes = o arco do método (Ver e Soltar). É o percurso, a vista por cima.
export const PARTES_MAE: ParteMae[] = [
  { id: 'I', nome: 'I · Ver', descricao: 'Reconhecer o padrão em ti, sem te julgares.' },
  { id: 'II', nome: 'II · Compreender', descricao: 'Ver de onde vem e como funciona por dentro.' },
  { id: 'III', nome: 'III · O custo', descricao: 'Sentir o que te tira, e o erro que o sustenta.' },
  { id: 'IV', nome: 'IV · Soltar', descricao: 'A verdade que liberta, e o primeiro passo.' },
];

// 12 semanas = um trimestre inteiro (3 por parte). Avança e, ao fim, recomeça com
// outros ângulos (como as 13 da veu.a.veu). NUNCA é aleatório: tem direção.
export const PERCURSO_MAE: SemanaMae[] = [
  { semana: 1, parte: 'I', dimensao: 'comportamentos', tema: 'Os sinais que te denunciam', mote: 'O padrão mostra-se primeiro no que fazes sem pensar.', foco: 'um comportamento observável do dia a dia' },
  { semana: 2, parte: 'I', dimensao: 'cenas', tema: 'Cenas do dia a dia', mote: 'Reconheces-te numa cena pequena, daquelas de todos os dias.', foco: 'uma cena concreta e sensorial de um dia normal' },
  { semana: 3, parte: 'I', dimensao: 'subtipos', tema: 'Reconhece o teu véu', mote: 'Pôr um nome ao que sentes é o princípio de o veres.', foco: 'a identificação (o tipo) em que a pessoa se reconhece' },
  { semana: 4, parte: 'II', dimensao: 'origens', tema: 'De onde isto vem', mote: 'Nada disto começou em ti. Foi aprendido.', foco: 'a origem do padrão (infância, o que se aprendeu cedo), sem culpa' },
  { semana: 5, parte: 'II', dimensao: 'mecanismos', tema: 'Como funciona por dentro', mote: 'O que parece defeito é um mecanismo que um dia te protegeu.', foco: 'o que o padrão faz por dentro (como se mantém)' },
  { semana: 6, parte: 'II', dimensao: 'origens', tema: 'A herança que não escolheste', mote: 'Há pesos que carregas e que nunca foram teus.', foco: 'a lealdade/herança de família por trás do padrão' },
  { semana: 7, parte: 'III', dimensao: 'custos', tema: 'O custo escondido', mote: 'O padrão cobra um preço que quase nunca somas.', foco: 'o preço invisível que o padrão te cobra' },
  { semana: 8, parte: 'III', dimensao: 'crencas', tema: 'O erro de interpretação', mote: 'Acreditas numa coisa que te prende. E nem sequer é verdade.', foco: 'a crença errada (o que a pessoa pensa) que sustenta o padrão' },
  { semana: 9, parte: 'III', dimensao: 'custos', tema: 'O que isto já te tirou', mote: 'Soma o que ficou pelo caminho. É mais do que parece.', foco: 'o que a pessoa já perdeu por causa do padrão' },
  { semana: 10, parte: 'IV', dimensao: 'verdades', tema: 'A verdade que liberta', mote: 'Ver a verdade por baixo do medo é onde o soltar começa.', foco: 'a dor de quem ainda não viu a verdade que a liberta' },
  { semana: 11, parte: 'IV', dimensao: 'mapa', tema: 'O mapa do véu', mote: 'Pensa, sente, faz, paga. Ver o mapa inteiro é poder mudá-lo.', foco: 'o que a pessoa pensa e faz quando o padrão a comanda' },
  { semana: 12, parte: 'IV', dimensao: 'verdades', tema: 'O primeiro passo para soltar', mote: 'Soltar não é força. É deixares de te agarrar.', foco: 'a dor de continuar agarrada ao que já podias largar' },
];

export const SEMANAS_PERCURSO_MAE = PERCURSO_MAE.length;

/** Semanas inteiras desde o arranque do plano (pode ser grande; base do percurso). */
export function semanasDesdeInicio(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.floor((hojeUTC - INICIO) / (7 * 864e5));
}

/** A semana do percurso da mãe para um offset a partir desta semana (0 = esta).
 *  Dá a volta ao fim do percurso (recomeça), como a veu.a.veu. */
export function semanaMaeDoOffset(offset = 0): SemanaMae {
  const n = semanasDesdeInicio() + offset;
  const i = ((n % SEMANAS_PERCURSO_MAE) + SEMANAS_PERCURSO_MAE) % SEMANAS_PERCURSO_MAE;
  return PERCURSO_MAE[i];
}

/** O índice 0-based da semana atual do percurso da mãe (para o calendário). */
export function indiceMaeAtual(): number {
  const n = semanasDesdeInicio();
  return ((n % SEMANAS_PERCURSO_MAE) + SEMANAS_PERCURSO_MAE) % SEMANAS_PERCURSO_MAE;
}

/** A semana do percurso da mãe a que pertence uma DATA (para a geração saber o
 *  ângulo de cada dia, mesmo gerando 1 dia só). */
export function semanaMaeDaData(dataISO: string): SemanaMae {
  const [y, m, d] = dataISO.split('-').map(Number);
  const n = semanasDesdeInicio(new Date(y, (m ?? 1) - 1, d ?? 1));
  const i = ((n % SEMANAS_PERCURSO_MAE) + SEMANAS_PERCURSO_MAE) % SEMANAS_PERCURSO_MAE;
  return PERCURSO_MAE[i];
}

export const parteMae = (id: string): ParteMae => PARTES_MAE.find((p) => p.id === id) ?? PARTES_MAE[0];
