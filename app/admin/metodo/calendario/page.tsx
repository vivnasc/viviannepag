'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { calendarioMetodo } from '@/lib/metodo/semana';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 meses · Método VS — a vista por cima do MESMO motor da produção
// semanal (planoSemana / planoSemanaMae). NÃO é uma jornada à parte: cada cartão
// é exatamente o post que a produção vai gerar. Por isso "esta semana" do
// calendário casa sempre com a produção. Para a MÃE cada dia é 1 véu (os "temas"
// são DIAS); para as portas cada dia é o seu tipo 60/30/10. Mantém o look de
// cartões da veu.a.veu, agora agrupados por semana (do amplo ao específico).

// 'YYYY-MM-DD' -> 'DD/MM' a partir de componentes (nunca Date/UTC, recua um dia).
const dm = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;
  const semanas = useMemo(() => calendarioMetodo(sel), [sel]);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-4">A vista por cima da produção: <b>13 semanas</b> do plano de cada conta. Cada cartão é <b>o próprio post</b> que a produção gera — o calendário e a semana batem certo. Do mais amplo (aqui) ao mais específico (produção semanal → agenda). Escolhe a conta:</p>

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
        <p className="text-[0.74rem] opacity-50 mb-6">{sel === 'mae' ? 'A mãe: 1 véu por DIA, os 7 véus a alternar ao longo da semana (reel de 2 faces).' : `As portas: cada dia o seu tipo 60/30/10, sobre os véus ${conta.veus.join(' · ')}.`}</p>

        <div className="space-y-7">
          {semanas.map((s) => {
            const cor = conta.cor;
            return (
              <div key={s.offset}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[0.6rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>semana {s.offset + 1}</span>
                  <span className="text-[0.72rem] opacity-60">{dm(s.inicio)} a {dm(s.fim)}</span>
                  {s.atual && <span className="text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                  <Link href={`/admin/metodo/semana?conta=${sel}&off=${s.offset}`} className="ml-auto text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {s.dias.map((d) => (
                    <div key={d.wd} className={`rounded-xl border overflow-hidden ${s.atual ? 'border-[#EBAE4A]/40' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap text-[0.58rem] uppercase tracking-[0.12em]">
                          <span className="font-semibold opacity-75">{d.nome}</span>
                          <span className="opacity-45">{dm(d.data)}</span>
                          <span className="ml-auto opacity-40">{d.hora}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[0.58rem] uppercase tracking-[0.12em] border" style={{ borderColor: cor + '55', color: cor, background: cor + '14' }}>{d.etiqueta}{sel === 'mae' ? ' · reel 2 faces' : ''}</span>
                        {d.ia ? (
                          <p className="mt-2 text-[0.82rem] italic opacity-55" style={{ fontFamily: 'var(--font-cormorant), serif' }}>frase nova (IA) sobre {d.texto}</p>
                        ) : (
                          <p className="mt-2 leading-tight text-[0.95rem]" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>“{d.texto}”</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">As 13 semanas vêm direto do motor da produção (a biblioteca roda para não repetir cedo). Para gerar e agendar, abre a produção semanal numa semana acima.</p>
      </div>
    </div>
  );
}
