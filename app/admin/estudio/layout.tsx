'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/estudio', label: 'Painel', desc: 'workflow 30 dias' },
  { href: '/admin/estudio/renderizados', label: 'Renderizados', desc: 'PNGs finais' },
  { href: '/admin/estudio/biblioteca', label: 'Biblioteca', desc: 'fontes + jobs' },
  { href: '/admin/carrossel', label: 'Carrosséis 7 Véus', desc: 'tema semanal + loja' },
];

export default function EstudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex">
      <aside className="w-[180px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-ocre/10 bg-terra-2/30 py-8 px-3 flex flex-col gap-1">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-creme-2/30 mb-3 px-2">ESTÚDIO</p>
        {NAV.map(n => {
          const ativo = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block py-2 px-3 rounded-[10px] no-underline transition-colors ${
                ativo
                  ? 'bg-ambar/10 border border-ambar/30'
                  : 'border border-transparent hover:bg-terra-2/50'
              }`}
            >
              <span className={`block text-[0.82rem] ${ativo ? 'text-ambar' : 'text-creme-2/85'}`}>
                {n.label}
              </span>
              <span className="block text-[0.6rem] text-creme-2/40 mt-0.5">{n.desc}</span>
            </Link>
          );
        })}
        <div className="flex-1" />
        <p className="text-[0.55rem] tracking-[0.2em] uppercase text-creme-2/20 px-2 mt-4">
          conteúdo · render · export
        </p>
      </aside>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
