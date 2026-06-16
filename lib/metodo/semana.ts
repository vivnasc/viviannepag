// Método VS · produção semanal (cada dia o seu tipo de post)
//
// Plano fixo da semana, na proporção 60/30/10 (reconhecimento lidera). A escolha
// de cada post roda por semana (offset), para não repetir até esgotar a pool.
// Datas LOCAIS (nunca toISOString). Autónomo: a Vivianne carrega "gerar a
// semana" e o sistema escolhe e gera.

import { ContaId, VeuNome } from './contas';
import { Post, PostTipo, reconhecimentoPosts, revelacaoPosts, manifestoPosts } from './posts';
import { segundaDestaSemana, dataLocal, horaDoMetodo } from './agenda';

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

// módulo SEMPRE positivo (offset pode ser negativo = semana atual/passada).
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** O plano de uma semana para uma conta (offset = nº de semanas a partir de
 *  ESTA semana; 0 = atual, +1 = próxima, -1 = passada). Roda a biblioteca. */
export function planoSemana(conta: ContaId, offset = 0, base: Date = segundaDestaSemana()): DiaSemana[] {
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
    const post = p[mod(idx[d.tipo], p.length)];
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

export function planoSemanaMae(offset = 0, base: Date = segundaDestaSemana()): DiaSemanaMae[] {
  const inicio = new Date(base);
  inicio.setDate(inicio.getDate() + offset * 7);
  return VEUS_SEMANA_MAE.map((d, i) => {
    // face 2: a revelação do véu, rodando por semana (offset) para não repetir cedo.
    const revs = revelacaoPosts('mae').filter((p) => p.veu === d.veu);
    const revelacao = revs[mod(offset, Math.max(1, revs.length))] ?? revs[0];
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

// ── CALENDÁRIO · 3 meses (vista por cima do MESMO motor da produção semanal) ──
// O calendário NÃO é uma estrutura à parte: é planoSemana/planoSemanaMae visto a
// 13 semanas. Por isso "esta semana" do calendário casa SEMPRE com a produção
// (mesma base segundaDestaSemana, mesmo offset). Para a MÃE cada dia é 1 véu (os
// "temas" são DIAS); para as portas cada dia é o seu tipo 60/30/10.

export const SEMANAS_CALENDARIO = 13; // 3 meses, como a veu.a.veu

const TIPO_NOME: Record<PostTipo, string> = {
  reconhecimento: 'Reconhecimento',
  revelacao: 'Revelação',
  manifesto: 'Manifesto',
};

/** Um dia do calendário, derivado do plano da semana (1 cartão = 1 post real). */
export interface DiaCalendario {
  wd: number;
  nome: string;
  data: string; // 'YYYY-MM-DD' local
  hora: string;
  /** etiqueta curta: "Véu X" (mãe) ou o tipo 60/30/10 (portas). */
  etiqueta: string;
  veu?: VeuNome;
  tipo?: PostTipo;
  /** a linha mostrada no cartão: revelação (mãe) ou texto do post (portas). */
  texto: string;
  /** true quando a linha sai gerada por IA na rota (a dor de reconhecimento). */
  ia: boolean;
}

/** Uma semana do calendário (os 7 dias do plano, seg→dom). */
export interface SemanaCalendario {
  offset: number; // 0 = ESTA semana (casa com a produção)
  inicio: string; // segunda 'YYYY-MM-DD'
  fim: string; // domingo 'YYYY-MM-DD'
  atual: boolean;
  dias: DiaCalendario[];
}

/** O calendário de 3 meses de uma conta, DERIVADO do motor da produção semanal.
 *  offset 0 = esta semana; cada cartão é exatamente o post que a produção gera. */
export function calendarioMetodo(conta: ContaId, semanas = SEMANAS_CALENDARIO, base: Date = segundaDestaSemana()): SemanaCalendario[] {
  const out: SemanaCalendario[] = [];
  for (let off = 0; off < semanas; off++) {
    const dias: DiaCalendario[] = conta === 'mae'
      ? planoSemanaMae(off, base).map((d) => ({
          wd: d.wd, nome: d.nome, data: d.data, hora: d.hora,
          etiqueta: `Véu ${d.veu}`, veu: d.veu,
          texto: d.revelacao?.texto ?? '', ia: false,
        }))
      : planoSemana(conta, off, base).map((d) => ({
          wd: d.wd, nome: d.nome, data: d.data, hora: d.hora,
          etiqueta: TIPO_NOME[d.tipo], tipo: d.tipo,
          texto: d.tipo === 'reconhecimento' ? d.post.conceito : d.post.texto,
          ia: d.tipo === 'reconhecimento',
        }));
    out.push({ offset: off, inicio: dias[0]?.data ?? '', fim: dias[dias.length - 1]?.data ?? '', atual: off === 0, dias });
  }
  return out;
}
