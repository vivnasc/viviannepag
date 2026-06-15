// Método VS · produção semanal (cada dia o seu tipo de post)
//
// Plano fixo da semana, na proporção 60/30/10 (reconhecimento lidera). A escolha
// de cada post roda por semana (offset), para não repetir até esgotar a pool.
// Datas LOCAIS (nunca toISOString). Autónomo: a Vivianne carrega "gerar a
// semana" e o sistema escolhe e gera.

import { ContaId } from './contas';
import { Post, PostTipo, reconhecimentoPosts, revelacaoPosts, manifestoPosts } from './posts';
import { proximaSegunda, dataLocal, HORA_POST } from './agenda';

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
    return { wd: d.wd, nome: d.nome, tipo: d.tipo, post, data: dataLocal(data), hora: HORA_POST };
  });
}
