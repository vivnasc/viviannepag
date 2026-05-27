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
  licenca: string | null;
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
        <div className="grid gap-4">
          {compras.map((c) => (
            <div key={c.id} className="border border-ocre/15 rounded-[14px] p-5 hover:bg-terra-2/30 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-creme font-serif text-[1.05rem]">{c.produto_titulo || c.produto_slug}</p>
                  <p className="text-creme-2/70 text-[0.82rem] mt-1">{c.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-ambar font-serif text-[1.1rem]">{c.preco}</p>
                  <p className="text-creme-2/50 text-[0.75rem]">{new Date(c.created_at).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {c.licenca && (
                  <span className="text-[0.72rem] font-mono text-ocre bg-terra-2/60 px-3 py-1 rounded-md">
                    {c.licenca}
                  </span>
                )}
                {c.paypal_order_id && (
                  <span className="text-[0.68rem] text-creme-2/40">
                    PayPal: {c.paypal_order_id}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
