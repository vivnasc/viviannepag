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
export function slideHTML(opts: { tema?: string; label?: string; texto?: string; idx?: number; total?: number; seed?: string; txtY?: number; txtSize?: number; geoTop?: number; geoW?: number }): string;
export const RECEITAS: Record<string, { motivo: string; label: string }>;
export function receitaDe(tema: string): { motivo: string; label: string };
export function motivosDoTema(tema: string): string[];
export function motivoSVG(motivo: string): string;
export function segmentar(texto: string): string[];
export const TOK: Record<string, string>;
