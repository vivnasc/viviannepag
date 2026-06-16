// PLANO TRIMESTRAL do Método VS — o MAPA por cima da produção semanal (como o
// Calendário · 3 meses é o início da organização da veu.a.veu). NÃO toca em
// lib/veu/*: é o motor do método, separado.
//
// A jornada segue o método: VER (reconhecer o padrão) -> VIR (regressar a si) ->
// VIVER (entrar na própria vida) -> e a DUALIDADE atravessa tudo (a conta-mãe).
// Cada véu tem DOIS tempos, que são o mecanismo do método: VER (reconhecer a dor)
// e SOLTAR (largar). Os motes são VERDADES reais do SABER (não inventadas).

import { VeuNome, ContaId } from './contas';
import { SABER } from './saber';

export type Movimento = { id: string; nome: string; descricao: string; conta: ContaId };

export const MOVIMENTOS: Movimento[] = [
  { id: 'ver', nome: 'I · Ver — a consciência', descricao: 'Sair de dentro da cabeça e ver o padrão passar, de fora.', conta: 'ver' },
  { id: 'vir', nome: 'II · Vir — o regresso', descricao: 'Parar de empurrar, regressar a ti, deixar-te segurar e descansar.', conta: 'vir' },
  { id: 'viver', nome: 'III · Viver — a integração', descricao: 'Sair da sala de espera e entrar na tua vida, agora.', conta: 'viver' },
  { id: 'inteiro', nome: 'IV · Ver e Soltar — a travessia', descricao: 'A separação de fundo, e o método inteiro que a atravessa.', conta: 'mae' },
];

export type SemanaMetodo = {
  semana: number;
  movimento: string; // id do movimento
  veu: VeuNome;
  conta: ContaId;    // dá a cor e o link da conta
  beat: 'Ver' | 'Soltar' | 'A travessia';
  tema: string;      // a essência do véu (curta)
  mote: string;      // a verdade (aforismo real do SABER)
};

// a ordem da jornada: cada véu na sua porta; dois tempos (Ver/Soltar) por véu,
// porque é o mecanismo do método (não há soltar sem ver). Dualidade fecha.
const JORNADA: { veu: VeuNome; movimento: string; conta: ContaId; doisTempos: boolean }[] = [
  { veu: 'Turbilhão', movimento: 'ver', conta: 'ver', doisTempos: true },
  { veu: 'Memória', movimento: 'ver', conta: 'ver', doisTempos: true },
  { veu: 'Esforço', movimento: 'vir', conta: 'vir', doisTempos: true },
  { veu: 'Desolação', movimento: 'vir', conta: 'vir', doisTempos: true },
  { veu: 'Horizonte', movimento: 'viver', conta: 'viver', doisTempos: true },
  { veu: 'Permanência', movimento: 'viver', conta: 'viver', doisTempos: true },
  { veu: 'Dualidade', movimento: 'inteiro', conta: 'mae', doisTempos: false },
];

function essenciaCurta(veu: VeuNome): string {
  const e = SABER[veu]?.essencia ?? '';
  const primeira = e.split('.')[0].trim();
  return primeira ? `${primeira}.` : '';
}
function verdade(veu: VeuNome, i: number): string {
  const cs = SABER[veu]?.crencas ?? [];
  return (cs[i] ?? cs[0])?.verdade ?? '';
}

export const PLANO_TRIMESTRAL: SemanaMetodo[] = (() => {
  const out: SemanaMetodo[] = [];
  let n = 1;
  for (const j of JORNADA) {
    if (j.doisTempos) {
      out.push({ semana: n++, movimento: j.movimento, veu: j.veu, conta: j.conta, beat: 'Ver', tema: essenciaCurta(j.veu), mote: verdade(j.veu, 0) });
      out.push({ semana: n++, movimento: j.movimento, veu: j.veu, conta: j.conta, beat: 'Soltar', tema: essenciaCurta(j.veu), mote: verdade(j.veu, 1) });
    } else {
      out.push({ semana: n++, movimento: j.movimento, veu: j.veu, conta: j.conta, beat: 'A travessia', tema: essenciaCurta(j.veu), mote: verdade(j.veu, 0) });
    }
  }
  return out;
})();

// ARRANQUE: a 2.ª-feira em que a jornada começa = semana 1 (15 jun 2026).
// A partir daqui conta-se sozinha e dá a volta ao fim das semanas do plano.
// Fuso: componentes LOCAIS da data, nunca UTC (em PT recua um dia).
const INICIO = Date.UTC(2026, 5, 15);

export function semanaMetodoAtual(hoje = new Date()): SemanaMetodo {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const passadas = Math.floor((hojeUTC - INICIO) / (7 * 864e5));
  const idx = ((passadas % PLANO_TRIMESTRAL.length) + PLANO_TRIMESTRAL.length) % PLANO_TRIMESTRAL.length;
  return PLANO_TRIMESTRAL[Math.max(0, idx)];
}
