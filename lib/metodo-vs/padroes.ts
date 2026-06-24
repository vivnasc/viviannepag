// MÉTODO VS · PADRÕES GLOBAIS (o estúdio como SISTEMA, não post-a-post).
// A Vivianne define UMA vez, por conta, e aplica a centenas de peças: a transição,
// o ritmo, a tipografia/cor, o motion automático e a voz (emoção + voz automática nas
// tardes). As peças NOVAS herdam estes padrões ao serem geradas; as já existentes
// recebem-nos com "aplicar a esta semana / esta conta / todas".
//
// Guardado numa única linha de config (slug 'vs-padroes-config', theme.padroes), um
// registo por conta. NÃO é por post — é o padrão de onde os posts partem.

import type { ContaId } from '@/lib/metodo/contas';
import { CONTAS } from '@/lib/metodo/contas';
import type { Transicao, FonteTexto } from '@/components/admin/KineticSlide';

// a marcação emocional da voz (ver lib/metodo/voz.ts · modo expressivo, eleven_v3).
export type EmocaoVoz = 'serena' | 'intima' | 'firme' | 'calorosa' | 'sussurro';
export const EMOCOES_VOZ: { id: EmocaoVoz; label: string }[] = [
  { id: 'serena', label: 'serena' },
  { id: 'intima', label: 'íntima' },
  { id: 'calorosa', label: 'calorosa' },
  { id: 'firme', label: 'firme' },
  { id: 'sussurro', label: 'sussurro' },
];

export interface PadroesVS {
  // movimento
  transicao: Transicao;
  segPorMomento: number;
  motionAuto: boolean;        // as imagens nascem com motion (câmara/respiração) no render
  // texto
  fonte: FonteTexto;
  tamanho: number;
  cor: string;               // a frase
  corDestaque: string;       // o realce (por defeito a cor da conta)
  // voz
  vozExpressiva: boolean;    // eleven_v3 com marcação emocional (vs v2 estável e plano)
  vozEmocao: EmocaoVoz;
  vozTardeAuto: boolean;     // gerar voz automaticamente nos posts da tarde (revelação)
}

export const SLUG_PADROES = 'vs-padroes-config';

// o padrão de fábrica de uma conta (a cor de realce = a cor da conta).
export function padroesDefault(conta: ContaId): PadroesVS {
  return {
    transicao: 'deslizar',
    segPorMomento: 7, // 5.5s era rápido demais para ler cada momento; 7s dá tempo.
    motionAuto: true,
    fonte: 'serif',
    tamanho: 92,
    cor: '#F4ECDD',
    corDestaque: CONTAS[conta]?.cor ?? '#EBAE4A',
    vozExpressiva: false, // PURO por defeito (v3 sem nada) — é a voz natural da Vivianne.
    vozEmocao: 'serena',
    vozTardeAuto: false,
  };
}

// junta o que está guardado por cima do default (resiliente a campos em falta).
export function mergePadroes(conta: ContaId, guardado?: Partial<PadroesVS> | null): PadroesVS {
  return { ...padroesDefault(conta), ...(guardado ?? {}) };
}

export type PadroesPorConta = Partial<Record<ContaId, Partial<PadroesVS>>>;
