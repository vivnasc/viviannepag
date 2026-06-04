// Faixas Ancient Ground + ALOCACAO automatica por carrossel.
// No escola-veus a faixa era escolhida a mao; aqui cada carrossel do calendario
// recebe automaticamente uma faixa, de forma deterministica (estavel) e variada,
// alinhada ao mood da estacao.
//
// >>> EDITA AQUI: substitui titulo/url pelas tuas faixas reais Ancient Ground.
//     (url = link publico do mp3; fica vazio ate o preencheres.)

import type { Estacao } from './calendario';

export type Faixa = { id: string; titulo: string; mood: Estacao | 'neutro'; url?: string };

export const FAIXAS_ANCIENT_GROUND: Faixa[] = [
  // verão — amplo, luminoso
  { id: 'ag-verao-1', titulo: 'Maré Longa', mood: 'verao', url: '' },
  { id: 'ag-verao-2', titulo: 'Luz Inteira', mood: 'verao', url: '' },
  { id: 'ag-verao-3', titulo: 'Águas Claras', mood: 'verao', url: '' },
  // outono — dourado, nostálgico
  { id: 'ag-outono-1', titulo: 'Colheita', mood: 'outono', url: '' },
  { id: 'ag-outono-2', titulo: 'Folha Solta', mood: 'outono', url: '' },
  { id: 'ag-outono-3', titulo: 'Dourado Lento', mood: 'outono', url: '' },
  // inverno — piano só, contemplativo
  { id: 'ag-inverno-1', titulo: 'Recolhimento', mood: 'inverno', url: '' },
  { id: 'ag-inverno-2', titulo: 'Noite Longa', mood: 'inverno', url: '' },
  { id: 'ag-inverno-3', titulo: 'Raiz', mood: 'inverno', url: '' },
  // primavera — luz crescente, esperança
  { id: 'ag-primavera-1', titulo: 'Primeiro Broto', mood: 'primavera', url: '' },
  { id: 'ag-primavera-2', titulo: 'Despertar', mood: 'primavera', url: '' },
  { id: 'ag-primavera-3', titulo: 'Abertura', mood: 'primavera', url: '' },
  // neutras — servem qualquer estação
  { id: 'ag-neutro-1', titulo: 'Presença', mood: 'neutro', url: '' },
  { id: 'ag-neutro-2', titulo: 'Travessia', mood: 'neutro', url: '' },
];

// Aloca uma faixa a um carrossel (semana+dia). Determinístico: o mesmo dia dá
// sempre a mesma faixa; varia ao longo do ano; prefere o mood da estação.
export function faixaParaCarrossel(semana: number, dia: number, estacao: Estacao): Faixa {
  const pool = FAIXAS_ANCIENT_GROUND.filter((f) => f.mood === estacao || f.mood === 'neutro');
  const lista = pool.length ? pool : FAIXAS_ANCIENT_GROUND;
  const idx = ((Math.max(1, semana) - 1) * 7 + (Math.max(1, dia) - 1)) % lista.length;
  return lista[idx];
}

// Texto de música pronto a mostrar/exportar para um carrossel.
export function musicaDoCarrossel(semana: number, dia: number, estacao: Estacao): string {
  const f = faixaParaCarrossel(semana, dia, estacao);
  return `Ancient Ground · ${f.titulo}`;
}
