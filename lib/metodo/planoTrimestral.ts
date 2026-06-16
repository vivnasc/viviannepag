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
