// Método VS · O MOTOR NOVO (a arquitetura da Vivianne).
//
// A unidade = uma PEÇA = família × véu × conta, dita pela ANATOMIA do reel.
//   - VÉU   = O QUÊ: 1 véu por DIA (CALENDARIO_UNIVERSO). 7 véus = a semana.
//   - QUEM  = a personagem/família que se reconhece nesse véu (personagensPorVeu).
//   - CONTA = COMO: o gesto/voz de cada conta (GESTO_CONTA).
//   - ESPIRAL = a direção de longo prazo: a cada volta da semana, a espiral
//     aprofunda UMA face do retrato (dor → fuga → culpa → custo → revelação →
//     saída). Não é escada: são os mesmos 7 véus, voltas mais finas.
//
// Funções PURAS (sem IA, sem BD): a página mostra o plano; a rota gera/grava.

import type { ContaId, VeuNome } from './contas';
import { CALENDARIO_UNIVERSO, GESTO_CONTA } from './universo';
import { personagensPorVeu, familiaDaPersonagem, type Personagem, type Familia } from './personagens';
import { FACES_ORDEM, type FacesVeu } from './veu-faces';
import { dataLocal, horaDoMetodo } from './agenda';

// Âncora do método (2.ª-feira da semana 1). Fuso LOCAL, nunca UTC.
const INICIO = Date.UTC(2026, 5, 15);

const SEED_CONTA: Record<ContaId, number> = { mae: 0, ver: 1, vir: 2, viver: 3 };

/** O véu de um dia da semana (1 véu/dia, partilhado pelas contas). */
export function veuDoDia(d: Date): VeuNome {
  const wd = d.getDay();
  return CALENDARIO_UNIVERSO.find((c) => c.wd === wd)?.veu ?? 'Dualidade';
}

/** Semanas inteiras desde o arranque (base da espiral). */
export function semanasDesdeInicio(hoje = new Date()): number {
  const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.floor((hojeUTC - INICIO) / (7 * 864e5));
}

export interface FaceEspiral { chave: keyof FacesVeu; titulo: string; volta: number; nova: boolean }

/** A face do retrato que esta volta da espiral aprofunda (dor → … → saída). */
export function faceDaEspiral(offset = 0): FaceEspiral {
  const n = semanasDesdeInicio() + offset;
  const i = ((n % FACES_ORDEM.length) + FACES_ORDEM.length) % FACES_ORDEM.length;
  const volta = Math.floor((n - i) / FACES_ORDEM.length) + 1; // 1.ª, 2.ª volta…
  const f = FACES_ORDEM[i];
  return { chave: f.chave, titulo: f.titulo, volta, nova: f.nova };
}

/** A 2.ª-feira da semana de um offset (0 = esta semana). */
export function segundaDoOffset(offset = 0): Date {
  const hoje = new Date();
  const wd = hoje.getDay(); // 0=dom..6=sáb
  const recuoSegunda = wd === 0 ? -6 : 1 - wd;
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + recuoSegunda + offset * 7);
}

export interface Peca {
  data: string;        // 'YYYY-MM-DD'
  hora: string;
  veu: VeuNome;
  personagem: Personagem;
  familia: Familia | undefined;
  face: FaceEspiral;   // a face que a espiral aprofunda esta semana
}

/** A personagem (máscara) de um dia, rodada por (semana + dia + conta) para variar. */
export function personagemDoDia(veu: VeuNome, conta: ContaId, d: Date): Personagem | undefined {
  const pool = personagensPorVeu(veu);
  if (!pool.length) return undefined;
  const seed = semanasDesdeInicio(d) + d.getDay() + (SEED_CONTA[conta] ?? 0);
  return pool[((seed % pool.length) + pool.length) % pool.length];
}

/** O plano da semana de uma conta: 7 dias (1 véu/dia), cada um com a sua peça. */
export function planoSemanaPecas(conta: ContaId, offset = 0): Peca[] {
  const face = faceDaEspiral(offset);
  const mon = segundaDoOffset(offset);
  const dias: Peca[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    const veu = veuDoDia(d);
    const personagem = personagemDoDia(veu, conta, d);
    if (!personagem) continue;
    dias.push({ data: dataLocal(d), hora: horaDoMetodo(conta), veu, personagem, familia: familiaDaPersonagem(personagem.id), face });
  }
  return dias;
}

/** O gesto/volta de uma conta (como o reel fecha). */
export const gestoDaConta = (conta: ContaId) => GESTO_CONTA[conta];
