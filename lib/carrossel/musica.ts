// Faixas Ancient Ground (Supabase publico) + ALOCACAO automatica por carrossel.
// Os mp3 vivem em: audios/albums/ancient-ground/faixa-NN.mp3
// Cada carrossel recebe uma faixa de forma deterministica (estavel) e variada.
// >>> Se o album tiver mais/menos faixas, ajusta NUM_FAIXAS.

const BASE_AUDIO = 'https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground';

export const NUM_FAIXAS = 7; // nº de faixas no album (faixa-01.mp3 ... faixa-0N.mp3)

export type Faixa = { numero: number; titulo: string; url: string };

export function faixaUrl(n: number): string {
  return `${BASE_AUDIO}/faixa-${String(n).padStart(2, '0')}.mp3`;
}

// Aloca uma faixa a um carrossel (semana+dia). Determinístico e variado ao longo
// do ano. (estacao aceite por compatibilidade, não usada na alocação.)
export function faixaParaCarrossel(semana: number, dia: number, _estacao?: unknown): Faixa {
  const idx = ((Math.max(1, semana) - 1) * 7 + (Math.max(1, dia) - 1)) % NUM_FAIXAS;
  const numero = idx + 1;
  return { numero, titulo: `Faixa ${String(numero).padStart(2, '0')}`, url: faixaUrl(numero) };
}

export function musicaDoCarrossel(semana: number, dia: number): string {
  return `Ancient Ground · ${faixaParaCarrossel(semana, dia).titulo}`;
}
