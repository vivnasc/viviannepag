'use client';

import { useLocale } from 'next-intl';
import { useCart, type CartItem } from '@/lib/cart';

// Barra fixa em baixo, so no telemovel (sm:hidden). Preco sempre a vista +
// adicionar ao carrinho (abre o drawer -> checkout). Reduz a friccao no movel.
export function BarraCompraMobile({ item, precoOriginal }: { item: CartItem; precoOriginal?: string | null }) {
  const { add, has, abrir } = useCart();
  const locale = useLocale();
  const isPt = locale !== 'en';
  const dentro = has(item.slug);

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-terra/95 backdrop-blur border-t border-ocre/30 px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-ambar font-serif text-[1.4rem] leading-none">{item.preco}</span>
        {precoOriginal && <span className="text-creme-2/40 text-[0.85rem] line-through">{precoOriginal}</span>}
      </div>
      <button
        onClick={() => { if (!dentro) add(item); abrir(); }}
        className={`flex-1 max-w-[220px] text-center font-sans text-[0.9rem] font-medium rounded-[12px] px-5 py-3 transition-colors ${
          dentro ? 'bg-ambar/20 text-ambar border border-ambar/50' : 'bg-ambar text-terra hover:bg-ocre'
        }`}
      >
        {dentro ? (isPt ? 'No carrinho · ver →' : 'In cart · view →') : (isPt ? 'Adicionar ao carrinho' : 'Add to cart')}
      </button>
    </div>
  );
}
