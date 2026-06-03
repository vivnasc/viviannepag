'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Carrinho de compras. Itens digitais → quantidade e sempre 1 por slug.
// Persiste em localStorage para sobreviver a navegacao e refresh.
export type CartItem = {
  slug: string;
  titulo: string;
  preco: string;
  capa?: string | null;
  badge?: string | null;
  // Pack personalizado ('monta o teu pack'): livros escolhidos pela pessoa.
  // Presente => a entrega usa esta lista (em vez de um pack nomeado).
  incluidos?: { slug: string; titulo: string }[];
};

type CartCtx = {
  itens: CartItem[];
  add: (i: CartItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  count: number;
  total: number;
  aberto: boolean;
  abrir: () => void;
  fechar: () => void;
  hidratado: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'vds_carrinho_v1';

export function precoNum(p?: string | null): number {
  if (!p) return 0;
  const n = parseFloat(p.replace(/[^0-9.,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);
  const [aberto, setAberto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItens(JSON.parse(raw));
    } catch {}
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try { localStorage.setItem(KEY, JSON.stringify(itens)); } catch {}
  }, [itens, hidratado]);

  const add = useCallback((i: CartItem) => {
    setItens(prev => (prev.some(x => x.slug === i.slug) ? prev : [...prev, i]));
  }, []);
  const remove = useCallback((slug: string) => {
    setItens(prev => prev.filter(x => x.slug !== slug));
  }, []);
  const clear = useCallback(() => setItens([]), []);
  const has = useCallback((slug: string) => itens.some(x => x.slug === slug), [itens]);

  const count = itens.length;
  const total = itens.reduce((s, i) => s + precoNum(i.preco), 0);

  return (
    <Ctx.Provider value={{ itens, add, remove, clear, has, count, total, aberto, abrir: () => setAberto(true), fechar: () => setAberto(false), hidratado }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart fora do CartProvider');
  return c;
}
