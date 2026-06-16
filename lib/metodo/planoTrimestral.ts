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

export type TemaSemana = { semana: number; veu: VeuNome; pensa: string; mote: string };
export type ParteConta = { veu: VeuNome; essencia: string; semanas: TemaSemana[] };

// a jornada trimestral de uma conta: cada véu é uma PARTE; cada crença do SABER
// é um tema (a dor reconhecida -> a verdade). Numeração corrida, como na veu.a.veu.
export function jornadaConta(conta: ContaId): ParteConta[] {
  const veus = VEUS_CONTA[conta] ?? [];
  let n = 1;
  return veus.map((veu) => {
    const k = SABER[veu];
    const essencia = (k?.essencia ?? '').split('.')[0];
    const semanas: TemaSemana[] = (k?.crencas ?? []).map((c) => ({ semana: n++, veu, pensa: c.pensa, mote: c.verdade }));
    return { veu, essencia, semanas };
  });
}

// quantos temas tem a jornada de uma conta (para mapear "esta semana").
export function totalTemas(conta: ContaId): number {
  return jornadaConta(conta).reduce((s, p) => s + p.semanas.length, 0);
}
