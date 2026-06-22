// Método VS · MÃE como AUTORIDADE — a "biblioteca de formatos da tarde" da
// CONTINUIDADE-VIDEOS.md (A.2), agora o motor da conta-mãe. A mãe deixa de fazer
// "Sou Aquela" + "não normalizes" e passa a uma SEMANA DE AUTORIDADE: 1 véu por
// semana, dissecado pelos 8 ângulos (1 formato por dia, quarta a dobrar). Cada
// formato puxa de UMA dimensão do SABER (lib/metodo/saber.ts) -> conteúdo infinito.
//
// SEPARADO do storyboard-ia.ts (que serve as filhas e os formatos antigos): este
// motor é novo e não mexe nesses. Os 8 formatos = os aprovados (em espírito) por ela.

import { VeuNome } from './contas';
import { segundaDestaSemana, dataLocal } from './agenda';

export type FormatoAutoridadeId =
  | 'veuDe'      // O Véu de…        (identificação rápida)   <- subtipos
  | 'mecanismo'  // O Mecanismo Invisível                     <- comportamentos/mecanismos
  | 'origem'     // A Origem                                  <- origens
  | 'erro'       // O Erro de Interpretação                   <- crencas
  | 'custo'      // O Custo Escondido                         <- custos
  | 'mito'       // Mito vs Verdade                           <- crencas
  | 'mapa'       // O Mapa do Véu                             <- mapa
  | 'cena';      // Cena do dia-a-dia                         <- cenas

export interface FormatoAutoridade {
  id: FormatoAutoridadeId;
  nome: string;
  emoji: string;
}

// metadados (o rótulo/ícone de cada formato; a estrutura vive em autoridade-ia.ts).
export const FORMATOS_AUTORIDADE: Record<FormatoAutoridadeId, FormatoAutoridade> = {
  veuDe: { id: 'veuDe', nome: 'O Véu de…', emoji: '🪞' },
  mecanismo: { id: 'mecanismo', nome: 'O Mecanismo Invisível', emoji: '⚙️' },
  origem: { id: 'origem', nome: 'A Origem', emoji: '🌱' },
  erro: { id: 'erro', nome: 'O Erro de Interpretação', emoji: '🔁' },
  custo: { id: 'custo', nome: 'O Custo Escondido', emoji: '💸' },
  mito: { id: 'mito', nome: 'Mito vs Verdade', emoji: '⚔️' },
  mapa: { id: 'mapa', nome: 'O Mapa do Véu', emoji: '🗺️' },
  cena: { id: 'cena', nome: 'Cena do dia-a-dia', emoji: '🎬' },
};

// A SEMANA da mãe: 1 formato por dia, QUARTA a dobrar (A Origem + O Erro). 8 slots
// = 8 formatos. wd: getDay() (0=domingo). hora: 21h (à noite, depois das séries das
// 7h/13h/19h da conta vivianne.dos.santos); o 2.º de quarta às 17h, para não bater.
export const SEMANA_AUTORIDADE: { wd: number; nome: string; formato: FormatoAutoridadeId; hora: string }[] = [
  { wd: 1, nome: 'segunda', formato: 'veuDe', hora: '21:00' },
  { wd: 2, nome: 'terça', formato: 'mecanismo', hora: '21:00' },
  { wd: 3, nome: 'quarta', formato: 'origem', hora: '21:00' },
  { wd: 3, nome: 'quarta', formato: 'erro', hora: '17:00' }, // quarta a DOBRAR
  { wd: 4, nome: 'quinta', formato: 'custo', hora: '21:00' },
  { wd: 5, nome: 'sexta', formato: 'mito', hora: '21:00' },
  { wd: 6, nome: 'sábado', formato: 'mapa', hora: '21:00' },
  { wd: 0, nome: 'domingo', formato: 'cena', hora: '21:00' },
];

// os 7 véus, na ordem do método (1 por semana, à vez).
export const VEUS_ORDEM: VeuNome[] = ['Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência', 'Dualidade'];

// o VÉU de uma semana (à segunda dessa semana): roda os 7 véus, 1 por semana, de
// forma estável (mesma semana -> sempre o mesmo véu). Componentes LOCAIS, nunca UTC.
export function veuDaSemana(segunda: Date): VeuNome {
  const dias = Math.floor(Date.UTC(segunda.getFullYear(), segunda.getMonth(), segunda.getDate()) / 86400000);
  const semana = Math.floor(dias / 7);
  const i = ((semana % VEUS_ORDEM.length) + VEUS_ORDEM.length) % VEUS_ORDEM.length;
  return VEUS_ORDEM[i];
}

export interface DiaAutoridade {
  wd: number;
  nome: string;
  veu: VeuNome;
  formato: FormatoAutoridadeId;
  data: string; // 'YYYY-MM-DD' local
  hora: string;
}

// O plano de UMA semana da mãe (offset = nº de semanas a partir desta; 0 = esta).
// 1 véu para a semana toda (aprofundado pelos 8 formatos), datas locais.
export function planoSemanaAutoridade(offset = 0, base: Date = segundaDestaSemana()): DiaAutoridade[] {
  const inicio = new Date(base);
  inicio.setDate(inicio.getDate() + offset * 7);
  const veu = veuDaSemana(inicio);
  return SEMANA_AUTORIDADE.map((d) => {
    // o dia da semana a partir da segunda: wd 1..6 = +0..+5; wd 0 (domingo) = +6.
    const desloc = d.wd === 0 ? 6 : d.wd - 1;
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + desloc);
    return { wd: d.wd, nome: d.nome, veu, formato: d.formato, data: dataLocal(data), hora: d.hora };
  });
}

// o(s) formato(s) de uma DATA (para gerar/regenerar só 1 dia). Quarta devolve 2.
export function diasAutoridadeDaData(dataISO: string): DiaAutoridade[] {
  const [y, m, dd] = dataISO.split('-').map(Number);
  if (!y || !m || !dd) return [];
  const dt = new Date(y, m - 1, dd);
  const wd = dt.getDay();
  // a segunda desta semana, para saber o véu.
  const seg = new Date(dt);
  seg.setDate(dt.getDate() + (wd === 0 ? -6 : 1 - wd));
  const veu = veuDaSemana(seg);
  return SEMANA_AUTORIDADE.filter((d) => d.wd === wd).map((d) => ({ wd, nome: d.nome, veu, formato: d.formato, data: dataISO, hora: d.hora }));
}
