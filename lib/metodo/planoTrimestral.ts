// PLANO GLOBAL · 3 meses do Método VS — NÃO é uma travessia que acaba nem faz as
// contas "fecharem". É uma VISÃO: onde estamos e para onde vamos, em TEMAS
// abordados, nas 4 contas ao mesmo tempo. Um painel de planeamento, contínuo.
//
// NÃO toca em lib/veu/*: motor do método, separado. Os temas saem do SABER
// (a área de estudo lida por véu), sem inventar.

import { VeuNome, ContaId, CONTAS } from './contas';
import { SABER } from './saber';

export const SEMANAS_TRIMESTRE = 12; // ~3 meses

// os véus que cada conta aborda. A mãe é transversal: atravessa os 7.
const VEUS_CONTA: Record<ContaId, VeuNome[]> = {
  ver: CONTAS.ver.veus,
  vir: CONTAS.vir.veus,
  viver: CONTAS.viver.veus,
  mae: ['Dualidade', 'Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência'],
};

export type CelulaTema = { semana: number; veu: VeuNome; tema: string; mote: string };

function essenciaCurta(veu: VeuNome): string {
  const e = SABER[veu]?.essencia ?? '';
  const primeira = e.split('.')[0].trim();
  return primeira ? `${primeira}.` : '';
}
function verdade(veu: VeuNome, i: number): string {
  const cs = SABER[veu]?.crencas ?? [];
  if (!cs.length) return '';
  return cs[((i % cs.length) + cs.length) % cs.length].verdade;
}

// as 12 semanas de UMA conta: roda os véus da conta, cada semana com um ângulo
// (verdade) diferente do SABER. É a visão dos temas, não uma sequência fechada.
export function planoTrimestralConta(conta: ContaId): CelulaTema[] {
  const veus = VEUS_CONTA[conta] ?? [];
  if (!veus.length) return [];
  const out: CelulaTema[] = [];
  for (let i = 0; i < SEMANAS_TRIMESTRE; i++) {
    const veu = veus[i % veus.length];
    const angulo = Math.floor(i / veus.length); // avança o ângulo a cada volta
    out.push({ semana: i + 1, veu, tema: essenciaCurta(veu), mote: verdade(veu, angulo) });
  }
  return out;
}

// ARRANQUE: 2.ª-feira da semana 1 (15 jun 2026). A semana atual conta-se sozinha
// e dá a volta às 12. Fuso: componentes LOCAIS, nunca UTC.
const INICIO = Date.UTC(2026, 5, 15);

export function semanaTrimestreAtual(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const passadas = Math.floor((hojeUTC - INICIO) / (7 * 864e5));
  return (((passadas % SEMANAS_TRIMESTRE) + SEMANAS_TRIMESTRE) % SEMANAS_TRIMESTRE) + 1;
}
