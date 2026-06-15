'use client';

// Navegação do admin com secções RECOLHÍVEIS (a sidebar tinha categorias a mais
// e ficava enorme). Por defeito recolhidas; abre-se a secção da página atual e
// guarda-se a escolha em localStorage. Reduz a sidebar sem perder nada.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type Sec = { titulo: string; cor: string; itens: { href: string; label: string }[] };

const naSecao = (sec: Sec, path: string | null) => sec.itens.some((i) => path === i.href || (path?.startsWith(i.href + '/') ?? false));

export function AdminNav({ secoes }: { secoes: Sec[] }) {
  const path = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try { saved = JSON.parse(localStorage.getItem('admin-nav-open') || '{}'); } catch { /* ignore */ }
    const atual = secoes.find((s) => naSecao(s, path));
    if (atual) saved[atual.titulo] = true; // abre sempre a secção onde estás
    setOpen(saved);
  }, [path, secoes]);

  const toggle = (t: string) => setOpen((o) => {
    const n = { ...o, [t]: !o[t] };
    try { localStorage.setItem('admin-nav-open', JSON.stringify(n)); } catch { /* ignore */ }
    return n;
  });

  return (
    <>
      {secoes.map((sec) => {
        const aberto = !!open[sec.titulo];
        return (
          <div key={sec.titulo} className="mb-1">
            <button onClick={() => toggle(sec.titulo)} className="w-full text-[0.58rem] tracking-[0.22em] uppercase mb-0.5 flex items-center gap-1.5 py-0.5" style={{ color: sec.cor }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: sec.cor }} />
              <span className="flex-1 text-left">{sec.titulo}</span>
              <span className="opacity-50 text-[0.7rem]">{aberto ? '−' : '+'}</span>
            </button>
            {aberto && sec.itens.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`block py-1 px-3 rounded-[10px] text-[0.82rem] no-underline transition-colors ${path === n.href ? 'text-ambar bg-terra-2/40' : 'text-creme-2/80 hover:bg-terra-2/50 hover:text-ambar'}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        );
      })}
    </>
  );
}
