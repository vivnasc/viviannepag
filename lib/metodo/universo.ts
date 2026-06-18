// Universo VS · o macro que desce à semana — o calendário 1 véu/dia (o teu, fechado)
// e o GESTO de cada conta (como cada uma fecha o reel). Sem metáforas: o gesto é
// uma direção concreta. veu.a.veu está FORA deste escopo (só as 4 do Método).

import type { ContaId, VeuNome } from './contas';

// Arranque do plano: 22 jun 2026 (2.ª-feira) = semana 1. A semana de 15-21 jun foi
// de TESTES; todo o plano empurra +1 semana a partir daqui. Fuso: LOCAL, nunca UTC.
export const INICIO_UNIVERSO = Date.UTC(2026, 5, 22);

// A ordem da semana (1 véu por dia), fechada no DOCUMENTO MESTRE (UNIVERSO-VS.md).
export const CALENDARIO_UNIVERSO: { wd: number; nome: string; veu: VeuNome }[] = [
  { wd: 1, nome: 'segunda', veu: 'Esforço' },
  { wd: 2, nome: 'terça', veu: 'Desolação' },
  { wd: 3, nome: 'quarta', veu: 'Memória' },
  { wd: 4, nome: 'quinta', veu: 'Turbilhão' },
  { wd: 5, nome: 'sexta', veu: 'Horizonte' },
  { wd: 6, nome: 'sábado', veu: 'Permanência' },
  { wd: 0, nome: 'domingo', veu: 'Dualidade' },
];

/** Semanas inteiras desde o arranque (22 jun 2026); a espiral conta a partir daqui. */
export function semanaUniversoAtual(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.max(0, Math.floor((hojeUTC - INICIO_UNIVERSO) / (7 * 864e5)));
}

// As 4 contas do Método (a mãe é a voz). veu.a.veu fora.
export const CONTAS_UNIVERSO: ContaId[] = ['mae', 'ver', 'vir', 'viver'];

// O GESTO de cada conta = COMO o reel fecha (a "volta"), em linguagem concreta,
// sem metáfora. É o 3.º eixo (personagem=quem · véu=porquê · conta=como).
export const GESTO_CONTA: Record<ContaId, { etiqueta: string; volta: string }> = {
  mae: { etiqueta: 'vivianne.dos.santos · a voz que nomeia', volta: 'nomeia o padrão com clareza e dá uma direção concreta, sem rodeios' },
  ver: { etiqueta: 'ver.soltar · ver de fora', volta: 'mostra o padrão visto de fora, com clareza e sem julgamento' },
  vir: { etiqueta: 'vir.soltar · parar e receber', volta: 'um passo concreto de parar, receber ajuda ou deixar de carregar tudo' },
  viver: { etiqueta: 'viver.soltar · um gesto hoje', volta: 'um gesto pequeno, concreto e presente para fazer hoje' },
};
