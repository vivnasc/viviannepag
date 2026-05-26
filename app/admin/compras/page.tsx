'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Compra = {
  id: string;
  email: string;
  produto_slug: string;
  produto_titulo: string;
  preco: string;
  paypal_order_id: string | null;
  created_at: string;
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);

  useEffect(() => {
    fetch('/api/admin/compras')
      .then((r) => r.json())
      .then((j) => setCompras(j.compras ?? []));
  }, []);

  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
          <h1 className="font-serif font-light text-creme text-3xl">compras</h1>
          <p className="text-creme-2/60 text-sm mt-1">{compras.length} {compras.length === 1 ? 'compra' : 'compras'}</p>
        </div>
        <Link href="/admin" className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] lowercase no-underline">
          ← voltar
        </Link>
      </header>

      {compras.length === 0 ? (
        <p className="text-creme-2/70 italic font-serif">Sem compras ainda.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[0.7rem] tracking-[0.18em] uppercase text-ocre/70 border-b border-ocre/20">
              <th className="py-3">email</th>
              <th className="py-3">produto</th>
              <th className="py-3">preço</th>
              <th className="py-3">data</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id} className="border-b border-ocre/10">
                <td className="py-3 text-creme text-[0.9rem]">{c.email}</td>
                <td className="py-3 text-creme-2/80 text-[0.85rem]">{c.produto_titulo || c.produto_slug}</td>
                <td className="py-3 text-ambar text-[0.85rem]">{c.preco}</td>
                <td className="py-3 text-creme-2/60 text-[0.8rem]">{new Date(c.created_at).toLocaleDateString('pt-PT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
