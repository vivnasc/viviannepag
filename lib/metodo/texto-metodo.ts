// Método VS · helpers de texto NEUTROS (sem depender do motor antigo).
//
// Abrigam o que o motor novo (peça = família × véu × conta) precisa e que vivia
// em reels.ts/posts.ts: o nome do véu e o realce automático de uma frase. Assim o
// motor novo não importa nada do motor antigo (reels/posts), que será retirado.

import type { VeuNome } from './contas';

const ARTIGO: Record<VeuNome, string> = {
  Turbilhão: 'do', Esforço: 'do', Horizonte: 'do',
  Memória: 'da', Desolação: 'da', Permanência: 'da', Dualidade: 'da',
};
export const nomeVeu = (veu: VeuNome) => `Véu ${ARTIGO[veu]} ${veu}`;

// palavras-função (não se realçam): o realce cai sobre a palavra "cheia" do fim.
const PALAVRAS_FUNCAO = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'e', 'ou', 'que', 'se', 'me', 'te', 'lhe', 'nos',
  'por', 'para', 'com', 'sem', 'ao', 'aos', 'à', 'às', 'mais', 'já', 'mas', 'como',
  'eu', 'tu', 'ela', 'ele', 'minha', 'meu', 'tua', 'teu', 'sua', 'seu', 'isto', 'isso',
]);

/** A expressão (1-3 palavras) a realçar a ouro: a última palavra cheia da frase. */
export function realceAuto(texto: string): string[] {
  const limpo = texto.replace(/[«»"“”]/g, '').trim();
  const tokens = limpo.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const ehFuncao = (w: string) => PALAVRAS_FUNCAO.has(w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''));
  let fim = tokens.length - 1;
  while (fim > 0 && ehFuncao(tokens[fim].replace(/[.,;:!?]+$/, ''))) fim -= 1;
  let ini = fim;
  while (ini > 0 && fim - ini < 2 && !ehFuncao(tokens[ini - 1].replace(/[.,;:!?]+$/, '')) && !/[.,;:!?]$/.test(tokens[ini - 1])) ini -= 1;
  const frase = tokens.slice(ini, fim + 1).join(' ').replace(/[.,;:!?]+$/, '');
  return frase ? [frase] : [];
}
