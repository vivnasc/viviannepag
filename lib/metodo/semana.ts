// Método VS · produção semanal (cada dia o seu tipo de post)
//
// Plano fixo da semana, na proporção 60/30/10 (reconhecimento lidera). A escolha
// de cada post roda por semana (offset), para não repetir até esgotar a pool.
// Datas LOCAIS (nunca toISOString). Autónomo: a Vivianne carrega "gerar a
// semana" e o sistema escolhe e gera.

import { ContaId, VeuNome } from './contas';
import { Post, PostTipo, reconhecimentoPosts, revelacaoPosts, manifestoPosts } from './posts';
import { proximaSegunda, dataLocal, horaDoMetodo } from './agenda';

// A semana, de segunda a domingo (wd: getDay, 0=domingo).
export const DIAS_SEMANA: { wd: number; nome: string; tipo: PostTipo }[] = [
  { wd: 1, nome: 'segunda', tipo: 'reconhecimento' },
  { wd: 2, nome: 'terça', tipo: 'revelacao' },
  { wd: 3, nome: 'quarta', tipo: 'reconhecimento' },
  { wd: 4, nome: 'quinta', tipo: 'reconhecimento' },
  { wd: 5, nome: 'sexta', tipo: 'revelacao' },
  { wd: 6, nome: 'sábado', tipo: 'reconhecimento' },
  { wd: 0, nome: 'domingo', tipo: 'manifesto' },
];

export interface DiaSemana {
  wd: number;
  nome: string;
  tipo: PostTipo;
  post: Post;
  data: string; // 'YYYY-MM-DD' local
  hora: string;
}

function pool(conta: ContaId, tipo: PostTipo): Post[] {
  if (tipo === 'reconhecimento') return reconhecimentoPosts(conta);
  if (tipo === 'revelacao') return revelacaoPosts(conta);
  return manifestoPosts(conta);
}

// quantos posts de cada tipo a semana consome (para rodar entre semanas).
const PORtIPO: Record<PostTipo, number> = {
  reconhecimento: DIAS_SEMANA.filter((d) => d.tipo === 'reconhecimento').length,
  revelacao: DIAS_SEMANA.filter((d) => d.tipo === 'revelacao').length,
  manifesto: DIAS_SEMANA.filter((d) => d.tipo === 'manifesto').length,
};

/** O plano de uma semana para uma conta (offset = nº de semanas a partir da
 *  próxima segunda). Roda a biblioteca para não repetir. */
export function planoSemana(conta: ContaId, offset = 0, base: Date = proximaSegunda()): DiaSemana[] {
  const inicio = new Date(base);
  inicio.setDate(inicio.getDate() + offset * 7);
  // índice corrente por tipo, já avançado pelas semanas anteriores
  const idx: Record<PostTipo, number> = {
    reconhecimento: offset * PORtIPO.reconhecimento,
    revelacao: offset * PORtIPO.revelacao,
    manifesto: offset * PORtIPO.manifesto,
  };
  return DIAS_SEMANA.map((d, i) => {
    const p = pool(conta, d.tipo);
    const post = p[idx[d.tipo] % p.length];
    idx[d.tipo] += 1;
    const data = new Date(inicio);
    data.setDate(data.getDate() + i);
    return { wd: d.wd, nome: d.nome, tipo: d.tipo, post, data: dataLocal(data), hora: horaDoMetodo(conta) };
  });
}

// ── MÃE · 1 véu por dia (volta semanal aos 7 véus), cada dia um REEL de 2 FACES ──
// (motion, NÃO carrossel): face 1 = a dor (reconhecimento, gerada por IA na rota,
// do SABER) -> face 2 = a revelação (do cânone). Aqui o plano fixa o VÉU de cada
// dia e a revelação (face 2); a dor (face 1) é gerada na rota com anti-repetição.
export const VEUS_SEMANA_MAE: { wd: number; nome: string; veu: VeuNome }[] = [
  { wd: 1, nome: 'segunda', veu: 'Dualidade' },
  { wd: 2, nome: 'terça', veu: 'Turbilhão' },
  { wd: 3, nome: 'quarta', veu: 'Memória' },
  { wd: 4, nome: 'quinta', veu: 'Esforço' },
  { wd: 5, nome: 'sexta', veu: 'Desolação' },
  { wd: 6, nome: 'sábado', veu: 'Horizonte' },
  { wd: 0, nome: 'domingo', veu: 'Permanência' },
];

export interface DiaSemanaMae {
  wd: number;
  nome: string;
  veu: VeuNome;
  /** A face 2 (revelação, do cânone). A face 1 (dor) é gerada por IA na rota. */
  revelacao: Post;
  data: string; // 'YYYY-MM-DD' local
  hora: string;
}

export function planoSemanaMae(offset = 0, base: Date = proximaSegunda()): DiaSemanaMae[] {
  const inicio = new Date(base);
  inicio.setDate(inicio.getDate() + offset * 7);
  return VEUS_SEMANA_MAE.map((d, i) => {
    // face 2: a revelação do véu, rodando por semana (offset) para não repetir cedo.
    const revs = revelacaoPosts('mae').filter((p) => p.veu === d.veu);
    const revelacao = revs[offset % Math.max(1, revs.length)] ?? revs[0];
    const data = new Date(inicio);
    data.setDate(data.getDate() + i);
    return { wd: d.wd, nome: d.nome, veu: d.veu, revelacao, data: dataLocal(data), hora: horaDoMetodo('mae') };
  });
}

/** O dia da mãe (véu + revelação) de UMA data — para gerar só 1 dia. */
export function diaMaeDaData(dataISO: string): DiaSemanaMae | null {
  const [y, m, dd] = dataISO.split('-').map(Number);
  if (!y || !m || !dd) return null;
  const wd = new Date(y, m - 1, dd).getDay();
  const veuDia = VEUS_SEMANA_MAE.find((v) => v.wd === wd);
  if (!veuDia) return null;
  const revs = revelacaoPosts('mae').filter((p) => p.veu === veuDia.veu);
  return { wd: veuDia.wd, nome: veuDia.nome, veu: veuDia.veu, revelacao: revs[0], data: dataISO, hora: horaDoMetodo('mae') };
}
