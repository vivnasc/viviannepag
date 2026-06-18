'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

// Os 4 níveis, do mais amplo ao mais específico. Um de cada vez, com calma.
const NIVEIS = [
  { n: 1, titulo: 'Calendário trimestral', href: '/admin/metodo/calendario', desc: 'O mapa. A semana são os 7 véus (1/dia); a espiral aprofunda uma face do retrato de cada vez (dor → … → saída). Só de vez em quando.' },
  { n: 2, titulo: 'Calendário semanal', href: '/admin/metodo/semana', desc: 'A semana que desce do trimestral: cada dia uma família × véu × conta. Gerar e rever.' },
  { n: 3, titulo: 'Agenda diária', href: '/admin/publicar', desc: 'O dia a dia: o que sai, a que hora. Agendar, renderizar e publicar.' },
];

export default function MetodoPage() {
  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Método VS</h1>
        <p className="mt-2 text-[0.86rem] opacity-70">Do mais amplo ao mais específico. Quatro níveis, por esta ordem.</p>

        <div className="mt-7 space-y-3">
          {NIVEIS.map((nv) => (
            <Link key={nv.n} href={nv.href} className="flex gap-4 items-start rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#C8A24A]/45 transition-colors">
              <span className="text-2xl font-light tabular-nums opacity-35 leading-none mt-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{nv.n}</span>
              <span>
                <span className="block text-lg" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{nv.titulo}</span>
                <span className="block text-[0.8rem] opacity-65 mt-0.5">{nv.desc}</span>
              </span>
            </Link>
          ))}

          {/* Nível 4 · agenda por conta — cada conta tem o seu cacho */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex gap-4 items-start">
              <span className="text-2xl font-light tabular-nums opacity-35 leading-none mt-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>4</span>
              <span>
                <span className="block text-lg" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Agenda por conta</span>
                <span className="block text-[0.8rem] opacity-65 mt-0.5">Cada conta, o que é dela: gerar e rever.</span>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONTAS_LISTA.map((c) => (
                <Link key={c.id} href={`/admin/metodo/${c.id}`} className="rounded-xl border border-white/10 px-3 py-2.5 text-center hover:border-white/30 transition-colors" style={{ background: `${c.cor}1c` }}>
                  <span className="block text-base leading-none">{c.emoji}</span>
                  <span className="block text-[0.72rem] opacity-80 mt-1.5">{c.handle}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
