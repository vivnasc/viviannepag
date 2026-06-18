// Universo VS · o macro que desce à semana — o calendário 1 véu/dia (o teu, fechado)
// e o GESTO de cada conta (como cada uma fecha o reel). Sem metáforas: o gesto é
// uma direção concreta. veu.a.veu está FORA deste escopo (só as 4 do Método).

import type { ContaId, VeuNome } from './contas';

// A ordem da semana (arco emocional do "carregar" ao "pertencer"), fechada.
export const CALENDARIO_UNIVERSO: { wd: number; nome: string; veu: VeuNome }[] = [
  { wd: 1, nome: 'segunda', veu: 'Esforço' },
  { wd: 2, nome: 'terça', veu: 'Turbilhão' },
  { wd: 3, nome: 'quarta', veu: 'Horizonte' },
  { wd: 4, nome: 'quinta', veu: 'Memória' },
  { wd: 5, nome: 'sexta', veu: 'Desolação' },
  { wd: 6, nome: 'sábado', veu: 'Permanência' },
  { wd: 0, nome: 'domingo', veu: 'Dualidade' },
];

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
