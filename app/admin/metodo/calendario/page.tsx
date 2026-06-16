'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { jornadaConta, totalTemas, semanaTrimestreAtual } from '@/lib/metodo/planoTrimestral';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 meses · Método VS — réplica do calendário da veu.a.veu, POR
// CONTA. Barra de separadores (as 4 contas) -> a jornada trimestral da conta em
// cartões (partes = véus; cada cartão = um tema real do SABER). Do mais amplo
// (aqui) ao mais específico (produção semanal -> agenda). Tudo ligado.

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;
  const partes = useMemo(() => jornadaConta(sel), [sel]);
  // "esta semana": mapeia a semana do trimestre ao tema correspondente da jornada.
  const total = useMemo(() => totalTemas(sel), [sel]);
  const atualSemana = total ? ((semanaTrimestreAtual() - 1) % total) + 1 : 0;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-4">A jornada de cada conta pelos seus véus: cada véu uma <b>parte</b>, cada tema uma <b>verdade</b> do teu campo. Do mais amplo (aqui) ao mais específico (produção semanal). Escolhe a conta:</p>

        {/* barra horizontal de contas (separadores, como na página Publicar) */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        <p className="text-[0.78rem] opacity-65 mb-1">{conta.movimento} · {conta.essencia}</p>
        <p className="text-[0.74rem] opacity-50 mb-6">{sel === 'mae' ? 'Na publicação, 1 véu por dia (reel 2 faces). Aqui é a jornada dos temas.' : `Véus desta porta: ${conta.veus.join(' · ')}.`}</p>

        {partes.map((parte) => {
          if (!parte.semanas.length) return null;
          const cor = conta.cor;
          return (
            <div key={parte.veu} className="mb-8">
              <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>Véu {parte.veu}</h2>
              <p className="text-[0.78rem] italic opacity-60 mb-3">{parte.essencia}.</p>
              <div className="space-y-2.5">
                {parte.semanas.map((s) => {
                  const ehAtual = s.semana === atualSemana;
                  return (
                    <div key={s.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>tema {s.semana}</span>
                          <span className="text-[0.62rem] opacity-55">Véu {parte.veu}</span>
                          {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                        </div>
                        <p className="leading-tight text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>“{s.mote}”</p>
                        <p className="text-[0.76rem] opacity-60 mb-2.5">Pensas: «{s.pensa}»</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href="/admin/metodo/semana" className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                          <Link href={`/admin/metodo/${sel}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border no-underline" style={{ borderColor: cor + '55', color: cor }}>@{conta.handle} →</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-[0.7rem] opacity-40 mt-2">Os temas vêm do teu campo de estudo (SABER), por véu. À medida que trazes mais cadeiras, a jornada enriquece. Para gerar e agendar, abre a produção semanal.</p>
      </div>
    </div>
  );
}
