'use client';

import { useState, useMemo, useEffect } from 'react';

type SidebarItem = {
  id: string;
  romano: string;
  nome: string;
  count: number;
  ativo: boolean;
};

type ProdutoLite = {
  slug: string;
  titulo: string;
  subtitulo: string;
  badge: string | null;
};

export function LojaSidebar({
  itens,
  produtos,
  locale,
}: {
  itens: SidebarItem[];
  produtos: ProdutoLite[];
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const isPt = locale === 'pt';
  const prefix = locale === 'en' ? '/en' : '';

  // Search local-side, simples (15 produtos)
  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return produtos.filter(p =>
      p.slug.toLowerCase().includes(q) ||
      p.titulo.toLowerCase().includes(q) ||
      (p.subtitulo ?? '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, produtos]);

  // Esconder sidebar em mobile (nav ancora top ja existe)
  return (
    <aside className="hidden lg:block lg:w-[240px] lg:shrink-0">
      <div className="lg:sticky lg:top-24">
        {/* SEARCH */}
        <div className="mb-7">
          <label className="text-[0.65rem] tracking-[0.22em] uppercase text-ocre/60 block mb-2">
            {isPt ? 'procurar' : 'search'}
          </label>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isPt ? 'culpa, casal, ...' : 'guilt, couple, ...'}
            className="w-full bg-transparent border border-ocre/30 focus:border-ambar outline-none rounded-[10px] px-3 py-2 text-[0.85rem] text-creme placeholder:text-creme-2/30 transition-colors"
          />

          {/* Resultados da pesquisa */}
          {query.trim() && (
            <div className="mt-3 rounded-[10px] bg-terra-2/60 border border-ocre/15 max-h-[280px] overflow-y-auto">
              {resultados.length === 0 ? (
                <p className="text-[0.78rem] text-creme-2/50 italic p-3">
                  {isPt ? 'sem resultados' : 'no results'}
                </p>
              ) : (
                <ul className="divide-y divide-ocre/10">
                  {resultados.map(p => (
                    <li key={p.slug}>
                      <a
                        href={`${prefix}/loja/${p.slug}`}
                        className="block px-3 py-2.5 hover:bg-ocre/10 no-underline transition-colors"
                      >
                        <p className="font-serif text-creme text-[0.86rem] leading-tight line-clamp-1">
                          {p.titulo}
                        </p>
                        <p className="text-[0.7rem] text-creme-2/55 mt-0.5 line-clamp-1">
                          {p.subtitulo}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* NAV DAS COLECOES */}
        <div>
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-ocre/60 mb-3">
            {isPt ? 'coleções' : 'collections'}
          </p>
          <ul className="space-y-1">
            {itens.map(it => (
              <li key={it.id}>
                <a
                  href={`#colecao-${it.id}`}
                  className={`group flex items-baseline gap-2 px-2 py-1.5 rounded-[8px] no-underline transition-colors ${
                    it.ativo
                      ? 'text-creme hover:text-ambar hover:bg-ocre/10'
                      : 'text-creme-2/40 hover:text-creme-2/70'
                  }`}
                >
                  <span className="font-serif text-ocre/50 text-[0.78rem] w-[18px] shrink-0">
                    {it.romano}
                  </span>
                  <span className="text-[0.85rem] flex-1">{it.nome}</span>
                  {it.count > 0 && (
                    <span className="text-[0.68rem] text-ocre/50 tabular-nums">
                      {it.count}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Voltar ao topo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="mt-7 text-[0.7rem] text-creme-2/40 hover:text-ambar block transition-colors no-underline"
        >
          ↑ {isPt ? 'voltar ao topo' : 'back to top'}
        </a>
      </div>
    </aside>
  );
}
