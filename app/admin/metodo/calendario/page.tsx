'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { getConta, type ContaId } from '@/lib/metodo/contas';
import { planoSemana, planoSemanaMae } from '@/lib/metodo/semana';
import { SEMANAS_TRIMESTRE } from '@/lib/metodo/planoTrimestral';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 MESES · Método VS, separado por conta. Cada conta tem a sua
// BARRA HORIZONTAL a percorrer as 12 semanas (offset 0 = esta semana). Os itens
// vêm dos motores reais (mãe = 1 véu/dia; portas = o seu plano). A semana atual
// realçada. Vista por cima dos motores, não estrutura paralela.

const ORDEM: ContaId[] = ['ver', 'vir', 'viver', 'mae'];
const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };
const dm = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

type Dia = { nome: string; data: string; veu: string; etiqueta: string };
type Semana = { offset: number; dias: Dia[] };

export default function MetodoCalendarioPage() {
  const lanes = useMemo(() => ORDEM.map((id) => {
    const conta = getConta(id)!;
    const semanas: Semana[] = [];
    for (let w = 0; w < SEMANAS_TRIMESTRE; w++) {
      const dias: Dia[] = id === 'mae'
        ? planoSemanaMae(w).map((d) => ({ nome: d.nome, data: d.data, veu: d.veu, etiqueta: 'reel 2 faces' }))
        : planoSemana(id, w).map((d) => ({ nome: d.nome, data: d.data, veu: d.post.veu ?? d.post.conceito, etiqueta: TIPO_LABEL[d.tipo] ?? d.tipo }));
      semanas.push({ offset: w, dias });
    }
    return { conta, semanas };
  }), []);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-none mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Cada conta com a sua <b>barra de publicação</b> a percorrer as <b>12 semanas</b> (3 meses). Os itens de cada dia vêm da estrutura já definida (mãe = 1 véu/dia; portas = o seu plano).</p>
        <p className="text-[0.76rem] opacity-55 mb-6">Arranca em <b style={{ color: '#EBAE4A' }}>esta semana</b> e vai 3 meses para a frente. A estrutura é estável; o que roda é o conteúdo. Arrasta para o lado para veres as semanas.</p>

        <div className="space-y-5">
          {lanes.map(({ conta, semanas }) => (
            <section key={conta.id} className="rounded-2xl border border-white/10 p-4" style={{ background: `linear-gradient(135deg, ${conta.cor}10, transparent 80%)` }}>
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <Link href={`/admin/metodo/${conta.id}`} className="no-underline text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</Link>
                <span className="text-[0.62rem] uppercase tracking-wider opacity-55">{conta.movimento} · {conta.essencia}</span>
              </div>
              {/* barra horizontal: 12 semanas lado a lado */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {semanas.map((s) => {
                  const ehAtual = s.offset === 0;
                  return (
                    <div key={s.offset} className={`shrink-0 w-[150px] rounded-xl border p-2 ${ehAtual ? 'border-[#EBAE4A]/60 bg-[#EBAE4A]/[0.04]' : 'border-white/10 bg-black/15'}`}>
                      <div className="flex items-center justify-between text-[0.56rem] uppercase tracking-wider mb-1.5">
                        <span className={ehAtual ? 'text-[#EBAE4A]' : 'opacity-50'}>{ehAtual ? 'esta semana' : `sem. ${s.offset + 1}`}</span>
                        <span className="opacity-45">{dm(s.dias[0]?.data ?? '')}</span>
                      </div>
                      <div className="space-y-1">
                        {s.dias.map((d) => (
                          <div key={d.data} className="flex items-center gap-1.5 text-[0.6rem]">
                            <span className="w-6 opacity-45 uppercase">{d.nome.slice(0, 3)}</span>
                            <span className="truncate px-1 py-0.5 rounded" style={{ background: conta.cor + '1f', color: conta.cor }}>{d.veu}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-5">3 meses a partir desta semana. Para gerar e agendar uma semana, abre a produção semanal. Mais à frente cruzamos a barra com o que já foi publicado e os números.</p>
      </div>
    </div>
  );
}
