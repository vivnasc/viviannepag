// Visão global do Método VS — calcula só a SEMANA atual no horizonte de 3 meses.
//
// IMPORTANTE: a estrutura temática de cada conta NÃO se define aqui. Vive nos
// motores que já existem (lib/metodo/semana.ts: planoSemanaMae = 1 véu/dia na
// mãe; lib/metodo/contas.ts: os véus de cada porta). Esta visão é uma VISTA por
// cima desses motores — nunca uma estrutura paralela que os contradiga.

export const SEMANAS_TRIMESTRE = 12; // ~3 meses (janela contínua, não fechada)

const INICIO = Date.UTC(2026, 5, 15); // 2.ª-feira da semana 1. Fuso: LOCAL, nunca UTC.

export function semanaTrimestreAtual(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const passadas = Math.floor((hojeUTC - INICIO) / (7 * 864e5));
  return (((passadas % SEMANAS_TRIMESTRE) + SEMANAS_TRIMESTRE) % SEMANAS_TRIMESTRE) + 1;
}
