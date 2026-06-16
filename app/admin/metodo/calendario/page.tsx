'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { MOVIMENTOS, PLANO_TRIMESTRAL, semanaMetodoAtual } from '@/lib/metodo/planoTrimestral';
import { getConta } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 meses · Método VS: o MAPA por cima da produção semanal (como
// na veu.a.veu). A jornada Ver -> Vir -> Viver -> a travessia (Dualidade), os 7
// véus, cada um com os seus dois tempos: VER (reconhecer) e SOLTAR (largar).

const corConta = (id: string) => getConta(id)?.cor ?? '#d8b25a';

export default function MetodoCalendarioPage() {
  const atual = useMemo(() => semanaMetodoAtual().semana, []);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">A jornada do método: <b>Ver → Vir → Viver</b>, e a <b>Dualidade</b> a atravessar tudo. Os 7 véus, cada um com os seus dois tempos — <b>Ver</b> (reconhecer a dor) e <b>Soltar</b> (largar). Não há soltar sem ver.</p>
        <p className="text-[0.76rem] opacity-55 mb-6">Não escolhes nada: cada semana avança sozinha. Hoje estás na <b style={{ color: '#EBAE4A' }}>semana {atual}</b>. Toca para abrir na produção semanal.</p>

        {/* legenda: as 4 portas/movimentos */}
        <div className="flex flex-wrap gap-3 mb-7">
          {MOVIMENTOS.map((m) => {
            const cor = corConta(m.conta);
            return (
              <span key={m.id} className="flex items-center gap-1.5 text-[0.68rem] opacity-80">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: cor }} />@{getConta(m.conta)?.handle ?? m.conta}
              </span>
            );
          })}
        </div>

        {MOVIMENTOS.map((mov) => {
          const semanas = PLANO_TRIMESTRAL.filter((s) => s.movimento === mov.id);
          if (!semanas.length) return null;
          const corMov = corConta(mov.conta);
          return (
            <div key={mov.id} className="mb-8">
              <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: corMov }}>{mov.nome}</h2>
              <p className="text-[0.78rem] italic opacity-60 mb-3">{mov.descricao}</p>
              <div className="space-y-2.5">
                {semanas.map((s) => {
                  const cor = corConta(s.conta);
                  const ehAtual = s.semana === atual;
                  return (
                    <div key={s.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>sem. {s.semana}</span>
                          <span className="text-[0.58rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border" style={{ borderColor: cor + '55', color: cor }}>Véu {s.veu}</span>
                          <span className="text-[0.6rem] opacity-55 italic">{s.beat}</span>
                          {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                        </div>
                        <p className="leading-tight text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>“{s.mote}”</p>
                        <p className="text-[0.76rem] opacity-65 mb-2">{s.tema}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href="/admin/metodo/semana" className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                          <Link href={`/admin/metodo/${s.conta}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border no-underline" style={{ borderColor: cor + '55', color: cor }}>@{getConta(s.conta)?.handle ?? s.conta} →</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-[0.7rem] opacity-40 text-center mt-2">Ao fim da jornada, recomeça. A produção semanal e a frase rápida vivem por baixo deste mapa.</p>
      </div>
    </div>
  );
}
