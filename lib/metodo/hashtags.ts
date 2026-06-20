// Método VS · HASHTAGS das legendas (caption), não do texto-na-imagem.
//
// REGRA: o TEXTO na imagem é SEM hashtags (a voz é limpa); mas a LEGENDA do
// Instagram leva hashtags para alcance. Conjunto curado para o universo dela
// (autoconhecimento / carga mental / padrões, mulher de 2026), + 1-2 por véu.
// A Vivianne pode afinar: diz quais tirar/pôr.

import type { VeuNome } from './contas';

const BASE = [
  'autoconhecimento', 'desenvolvimentopessoal', 'saudemental', 'psicologia',
  'cargamental', 'mulheres', 'terapia', 'padroesemocionais', 'presenca',
];

const POR_VEU: Record<VeuNome, string[]> = {
  Esforço: ['exaustao', 'pessoasque'],
  Desolação: ['vazio', 'solidao'],
  Memória: ['feridasdeinfancia', 'constelacaofamiliar'],
  Turbilhão: ['ansiedade', 'mentequenaopara'],
  Horizonte: ['viveromomento', 'procrastinacao'],
  Permanência: ['identidade', 'mudanca'],
  Dualidade: ['pertenca', 'conexao'],
};

/** Hashtags da legenda de uma peça (base + as do véu do dia), sem repetir. */
export function hashtagsMetodo(veu: VeuNome): string[] {
  return Array.from(new Set([...BASE, ...(POR_VEU[veu] ?? [])]));
}

/** A linha de hashtags pronta para colar na legenda. */
export function linhaHashtags(veu: VeuNome): string {
  return hashtagsMetodo(veu).map((t) => `#${t}`).join(' ');
}
