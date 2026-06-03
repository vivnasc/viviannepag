'use client';

import { useLocale } from 'next-intl';
import { useCart, type CartItem } from '@/lib/cart';

export function AdicionarCarrinho({ item, variante = 'overlay' }: { item: CartItem; variante?: 'overlay' | 'inline' }) {
  const { add, has, abrir } = useCart();
  const locale = useLocale();
  const isPt = locale !== 'en';
  const dentro = has(item.slug);

  function aoClicar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!dentro) add(item);
    abrir();
  }

  if (variante === 'overlay') {
    return (
      <button
        onClick={aoClicar}
        aria-label={dentro ? (isPt ? 'No carrinho' : 'In cart') : (isPt ? 'Adicionar ao carrinho' : 'Add to cart')}
        title={dentro ? (isPt ? 'No carrinho' : 'In cart') : (isPt ? 'Adicionar ao carrinho' : 'Add to cart')}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${
          dentro ? 'bg-ambar text-terra' : 'bg-terra/80 text-creme border border-ocre/40 hover:bg-ambar hover:text-terra'
        }`}
      >
        {dentro ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={aoClicar}
      className={`inline-flex items-center gap-2 font-sans text-[0.92rem] font-medium tracking-[0.03em] rounded-[14px] px-7 py-4 transition-colors no-underline ${
        dentro ? 'bg-ambar/20 text-ambar border border-ambar/50' : 'border border-ocre/50 text-creme hover:border-ambar hover:text-ambar'
      }`}
    >
      {dentro ? (isPt ? 'No carrinho ✓' : 'In cart ✓') : (isPt ? '+ Adicionar ao carrinho' : '+ Add to cart')}
    </button>
  );
}
