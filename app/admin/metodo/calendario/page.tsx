'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { SEMANAS_TRIMESTRE, semanaTrimestreAtual } from '@/lib/metodo/planoTrimestral';
import { getConta, type ContaId, type VeuNome } from '@/lib/metodo/contas';
import { VEUS_SEMANA_MAE } from '@/lib/metodo/semana';
import { SABER } from '@/lib/metodo/saber';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Visão GLOBAL do Método VS. É uma VISTA por cima dos motores que já existem
// (não uma estrutura nova): a mãe = 1 véu por dia (planoSemanaMae); cada porta
// = os seus véus. A estrutura é estável semana a semana; o que roda é o conteúdo
// e, depois, o que rende mais. Não inventa nada por cima do já definido.

const ORDEM: ContaId[] = ['ver', 'vir', 'viver', 'mae'];

function essenciaCurta(veu: VeuNome): string {
  const e = SABER[veu]?.essencia ?? '';
  const p = e.split('.')[0].trim();
  return p ? `${p}.` : '';
}

export default function MetodoCalendarioPage() {
  const atual = useMemo(() => semanaTrimestreAtual(), []);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Visão global · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Onde estamos e como cada conta cobre os temas. Cada conta tem a <b>sua estrutura semanal</b> (a que já está definida nos motores): a estrutura é <b>estável</b>; o que roda é o <b>conteúdo</b> (os ângulos) e, depois, <b>o que rende mais</b>.</p>
        <p className="text-[0.76rem] opacity-55 mb-6">Janela de 3 meses (~12 semanas), contínua. Hoje estás na <b style={{ color: '#EBAE4A' }}>semana {atual} de {SEMANAS_TRIMESTRE}</b>.</p>

        <div className="grid gap-4 md:grid-cols-2">
          {ORDEM.map((id) => {
            const conta = getConta(id)!;
            const cor = conta.cor;
            const ehMae = id === 'mae';
            return (
              <section key={id} className="rounded-2xl border border-white/10 p-4" style={{ background: `linear-gradient(135deg, ${cor}10, transparent 70%)` }}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <Link href={`/admin/metodo/${id}`} className="no-underline text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>@{conta.handle}</Link>
                  <span className="text-[0.62rem] uppercase tracking-wider opacity-55">{conta.movimento} · {conta.essencia}</span>
                </div>

                {ehMae ? (
                  <>
                    <p className="text-[0.72rem] opacity-65 mb-2">1 véu por <b>dia</b> (reel de 2 faces): os 7 véus ao longo da semana.</p>
                    <div className="space-y-1">
                      {VEUS_SEMANA_MAE.map((d) => (
                        <div key={d.wd} className="flex items-center gap-2 text-[0.74rem]">
                          <span className="w-9 text-[0.6rem] uppercase tracking-wider opacity-50">{d.nome.slice(0, 3)}</span>
                          <span className="text-[0.58rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>{d.veu}</span>
                          <span className="opacity-70 truncate" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{essenciaCurta(d.veu)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[0.72rem] opacity-65 mb-2">Os véus desta porta, ao longo da semana (60/30/10):</p>
                    <div className="space-y-2">
                      {conta.veus.map((veu) => (
                        <div key={veu} className="flex items-start gap-2 text-[0.78rem]">
                          <span className="text-[0.58rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full mt-0.5" style={{ background: cor + '22', color: cor }}>{veu}</span>
                          <span className="opacity-75 leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{essenciaCurta(veu)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-3">
                  <Link href="/admin/metodo/semana" className="text-[0.62rem] px-2.5 py-1 rounded-full border no-underline" style={{ borderColor: cor + '55', color: cor }}>abrir na produção →</Link>
                </div>
              </section>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-5">A estrutura repete-se semana após semana (3 meses); o que muda é o conteúdo. Mais à frente cruzamos isto com o que já foi publicado e com os números, para veres o que rende mais.</p>
      </div>
    </div>
  );
}
