// Método VS · CAMADA 2 — o PLANO da tarde (organização por CONTA e por DIA).
//
// Espelha o plano da manhã (planoSemanaMae): as mesmas datas da semana, mas cada
// dia leva um MOTOR diferente (rotação dos 8) e o véu da conta nesse dia. Assim a
// tarde fica organizada por conta e por dia da semana, como a manhã — não um
// laboratório solto. O motor roda por dia E por semana (offset), por isso não se
// repete cedo e cobre os 8 ao longo do tempo.

import type { FormatoId } from './formatos';
import type { ContaId, VeuNome } from './contas';
import { CONTAS } from './contas';
import { planoSemanaMae } from './semana';

// ordem de rotação dos motores ao longo dos dias (varia o registo de dia para dia:
// reconhecimento -> mecanismo -> origem -> custo -> ...). Cobre os 8.
export const MOTORES_ORDEM: FormatoId[] = ['cena', 'mecanismo', 'origem', 'erro', 'custo', 'mapa', 'mito', 'veude'];

export interface DiaTarde {
  data: string;   // 'YYYY-MM-DD' local
  hora: string;   // tarde (17h)
  veu: VeuNome;
  formato: FormatoId;
}

// O plano da tarde de uma conta para a semana `offset` (0 = esta semana). Usa as
// datas do plano da manhã (mesma semana), o véu da conta nesse dia, e o motor da
// rotação. Para a mãe, o véu é o do dia (planoSemanaMae); para as portas, alterna
// os véus próprios da conta.
export function planoTardeSemana(contaId: ContaId, offset = 0): DiaTarde[] {
  const conta = CONTAS[contaId];
  const dias = planoSemanaMae(offset); // só para as DATAS da semana (e o véu da mãe)
  const nDias = dias.length;
  return dias.map((d, i) => {
    const veu: VeuNome = contaId === 'mae' ? d.veu : conta.veus[i % conta.veus.length];
    const formato = MOTORES_ORDEM[(offset * nDias + i) % MOTORES_ORDEM.length];
    return { data: d.data, hora: '17:00', veu, formato };
  });
}
