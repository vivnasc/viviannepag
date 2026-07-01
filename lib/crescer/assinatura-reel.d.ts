// Tipos da assinatura da mae (o motor JS do reel VDS).
export interface ReelOpts {
  tema?: string;
  label?: string;
  capa?: string;
  frase?: string;
  linhas?: string[];
  marca?: string;
  assinatura?: string;
}
export function reelHTML(opts: ReelOpts): string;
export const RECEITAS: Record<string, { motivo: string; label: string }>;
export function receitaDe(tema: string): { motivo: string; label: string };
export function motivoSVG(motivo: string): string;
export const TOK: Record<string, string>;
