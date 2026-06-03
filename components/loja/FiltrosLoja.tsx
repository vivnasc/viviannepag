'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function FiltrosLoja({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const isPt = locale !== 'en';
  const tipo = sp.get('tipo') ?? 'todos';
  const ordenar = sp.get('ordenar') ?? 'destaque';

  const setParam = useCallback((chave: string, valor: string, defeito: string) => {
    const params = new URLSearchParams(sp.toString());
    if (valor === defeito) params.delete(chave);
    else params.set(chave, valor);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, sp]);

  const tipos: { v: string; l: string }[] = [
    { v: 'todos', l: isPt ? 'Todos' : 'All' },
    { v: 'ebook', l: 'Ebooks' },
    { v: 'guia', l: isPt ? 'Guias' : 'Guides' },
  ];
  const ordens: { v: string; l: string }[] = [
    { v: 'destaque', l: isPt ? 'Destaque' : 'Featured' },
    { v: 'preco-asc', l: isPt ? 'Preço ↑' : 'Price ↑' },
    { v: 'preco-desc', l: isPt ? 'Preço ↓' : 'Price ↓' },
  ];

  const chip = (ativo: boolean) =>
    `text-[0.76rem] px-3.5 py-1.5 rounded-full border transition-colors no-underline cursor-pointer ${
      ativo ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/35 text-creme-2/80 hover:border-ambar hover:text-ambar'
    }`;

  return (
    <div className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[0.66rem] tracking-[0.16em] uppercase text-ocre/60 mr-1">{isPt ? 'tipo' : 'type'}</span>
        {tipos.map(t => (
          <button key={t.v} onClick={() => setParam('tipo', t.v, 'todos')} className={chip(tipo === t.v)}>{t.l}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[0.66rem] tracking-[0.16em] uppercase text-ocre/60 mr-1">{isPt ? 'ordenar' : 'sort'}</span>
        {ordens.map(o => (
          <button key={o.v} onClick={() => setParam('ordenar', o.v, 'destaque')} className={chip(ordenar === o.v)}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}
