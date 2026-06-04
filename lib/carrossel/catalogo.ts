// Catalogo de produtos auto-derivado para o gerador de carrosseis.
// Fonte unica: tabela `produtos` (publicados) + universos (colecoes.ts) +
// packs (packs.ts). Produtos novos entram sozinhos, sem manutencao manual.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { COLECOES, slugToColecao, getColecao, type ColecaoId } from '@/lib/colecoes';
import { PACKS } from '@/lib/packs';
import { QUANDO_USAR_UNIVERSO, OVERRIDES_PRODUTO } from './overrides';

export type ItemCatalogo = {
  id: string;                 // slug
  tipo: 'produto' | 'pack' | 'universo';
  nome: string;
  universo: ColecaoId | 'all';
  categoria: string;          // badge/tipo legivel
  descricao: string;
  quandoUsar: string;
  url: string;                // caminho relativo no site
  preco?: string;
};

// Constroi o catalogo completo a partir do que ja existe no repo/DB.
export async function getCatalogoProdutos(): Promise<ItemCatalogo[]> {
  const supabase = getSupabaseAdmin();
  const { data: produtos } = await supabase
    .from('produtos')
    .select('slug, titulo, subtitulo, preco, badge')
    .eq('publicado', true);

  const itens: ItemCatalogo[] = [];

  // 1. Produtos individuais (os 70+ ebooks/guias)
  for (const p of produtos ?? []) {
    const universo = slugToColecao(p.slug);
    const ov = OVERRIDES_PRODUTO[p.slug] ?? {};
    itens.push({
      id: p.slug,
      tipo: 'produto',
      nome: ov.nome ?? p.titulo,
      universo,
      categoria: p.badge ?? 'ebook',
      descricao: p.subtitulo ?? getColecao(universo).pitch,
      quandoUsar: ov.quandoUsar ?? QUANDO_USAR_UNIVERSO[universo] ?? '',
      url: `/loja/${p.slug}`,
      preco: p.preco ?? undefined,
    });
  }

  // 2. Packs (bundles por universo + biblioteca completa)
  for (const pk of PACKS) {
    const universo = pk.colecao;
    itens.push({
      id: pk.slug,
      tipo: 'pack',
      nome: pk.titulo,
      universo,
      categoria: 'pack',
      descricao: pk.subtitulo,
      quandoUsar:
        universo === 'all'
          ? 'tema transversal a varios universos, ou quem quer a biblioteca toda'
          : QUANDO_USAR_UNIVERSO[universo] ?? '',
      url: `/loja/${pk.slug}`,
      preco: pk.preco,
    });
  }

  // 3. Universos (para CTAs que apontam a uma colecao inteira)
  for (const c of COLECOES) {
    itens.push({
      id: c.id,
      tipo: 'universo',
      nome: c.nome,
      universo: c.id,
      categoria: 'universo',
      descricao: c.pitch,
      quandoUsar: QUANDO_USAR_UNIVERSO[c.id] ?? '',
      url: `/loja#colecao-${c.id}`,
    });
  }

  return itens;
}

// Selecciona os itens mais relevantes para um brief/universo, para nao encher
// o prompt com 70+ fichas. Prioriza o universo do dia, depois sobreposicao de
// palavras do brief com nome/descricao/quandoUsar.
export function produtosRelevantes(
  catalogo: ItemCatalogo[],
  opts: { universo: ColecaoId; brief: string; n?: number },
): ItemCatalogo[] {
  const n = opts.n ?? 14;
  const semAcento = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const palavras = new Set(
    semAcento(opts.brief || '')
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3),
  );

  const score = (it: ItemCatalogo): number => {
    let s = 0;
    if (it.universo === opts.universo) s += 100;
    if (it.universo === 'all') s += 20;
    const txt = semAcento(`${it.nome} ${it.descricao} ${it.quandoUsar}`);
    for (const w of palavras) if (txt.includes(w)) s += 6;
    // garante presenca dos packs do universo e do universo em si
    if (it.tipo === 'pack' && it.universo === opts.universo) s += 30;
    if (it.tipo === 'universo' && it.universo === opts.universo) s += 25;
    return s;
  };

  return [...catalogo]
    .map((it) => ({ it, s: score(it) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.it);
}

// Amostra do ecossistema para o gerador: destaca o universo da semana mas
// inclui produtos de TODOS os 7 universos (alguns por universo) + packs, para o
// CTA de cada dia poder explorar universos diferentes ao longo da semana.
export function amostraEcossistema(
  catalogo: ItemCatalogo[],
  universoFoco: ColecaoId,
  perOutro = 2,
): ItemCatalogo[] {
  const foco = catalogo.filter((i) => i.universo === universoFoco && i.tipo === 'produto').slice(0, 8);
  const packs = catalogo.filter((i) => i.tipo === 'pack');
  const universos = [...new Set(catalogo.map((i) => i.universo))].filter(
    (u) => u !== universoFoco && u !== 'all',
  ) as ColecaoId[];
  const outros: ItemCatalogo[] = [];
  for (const u of universos) {
    outros.push(...catalogo.filter((i) => i.universo === u && i.tipo === 'produto').slice(0, perOutro));
  }
  const seen = new Set<string>();
  return [...foco, ...packs, ...outros].filter((i) => (seen.has(i.id) ? false : seen.add(i.id)));
}
export function ecossistemaPrompt(itens: ItemCatalogo[]): string {
  const linhas = itens.map((it) => {
    const preco = it.preco ? ` · ${it.preco}` : '';
    return `- [${it.tipo}] ${it.nome}${preco} — ${it.descricao}. Quando usar: ${it.quandoUsar}. Link: ${it.url}`;
  });
  return `ECOSSISTEMA DE PRODUTOS (escolhe UM para o CTA, usando nome e link exactos):\n${linhas.join('\n')}`;
}
