'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { SEMANAS_TRIMESTRE, planoTrimestralConta, semanaTrimestreAtual } from '@/lib/metodo/planoTrimestral';
import { getConta, type ContaId } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Visão GLOBAL · 3 meses do Método VS. NÃO é uma travessia com início e fim: é
// um painel para ver ONDE ESTAMOS e PARA ONDE VAMOS nos temas, nas 4 contas ao
// mesmo tempo. Grelha 12 semanas × 4 contas; a semana atual realçada.

const ORDEM: ContaId[] = ['ver', 'vir', 'viver', 'mae'];

export default function MetodoCalendarioPage() {
  const atual = useMemo(() => semanaTrimestreAtual(), []);
  const planos = useMemo(() => ORDEM.map((c) => ({ conta: getConta(c)!, celulas: planoTrimestralConta(c) })), []);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Visão global · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Um <b>plano global</b> para veres <b>onde estamos</b> e <b>para onde vamos</b> nos temas abordados, nas 4 contas ao mesmo tempo. Não é uma jornada com fim: é uma janela contínua.</p>
        <p className="text-[0.76rem] opacity-55 mb-6">3 meses (~12 semanas) para depois analisar que temas e formatos rendem mais. Hoje estás na <b style={{ color: '#EBAE4A' }}>semana {atual}</b>.</p>

        {/* grelha: linhas = semanas, colunas = contas */}
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {/* cabeçalho das contas */}
            <div className="grid items-end gap-2 mb-2" style={{ gridTemplateColumns: '64px repeat(4, 1fr)' }}>
              <div className="text-[0.6rem] uppercase tracking-wider opacity-40">semana</div>
              {planos.map(({ conta }) => (
                <Link key={conta.id} href={`/admin/metodo/${conta.id}`} className="text-[0.78rem] no-underline px-2 py-1 rounded-lg border text-center" style={{ borderColor: conta.cor + '55', color: conta.cor }}>@{conta.handle}</Link>
              ))}
            </div>

            {/* 12 semanas */}
            {Array.from({ length: SEMANAS_TRIMESTRE }).map((_, i) => {
              const semana = i + 1;
              const ehAtual = semana === atual;
              return (
                <div key={semana} className={`grid gap-2 mb-2 rounded-xl ${ehAtual ? 'ring-1 ring-[#EBAE4A]/60 bg-[#EBAE4A]/[0.04]' : ''}`} style={{ gridTemplateColumns: '64px repeat(4, 1fr)' }}>
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-[0.9rem]" style={{ fontFamily: 'var(--font-cormorant), serif', color: ehAtual ? '#EBAE4A' : undefined }}>{semana}</span>
                    {ehAtual && <span className="text-[0.5rem] uppercase tracking-wider text-[#EBAE4A]">agora</span>}
                  </div>
                  {planos.map(({ conta, celulas }) => {
                    const c = celulas[i];
                    const cor = conta.cor;
                    return (
                      <div key={conta.id} className="rounded-lg border p-2.5" style={{ borderColor: 'rgba(255,255,255,0.08)', background: `linear-gradient(135deg, ${cor}10, transparent 70%)` }} title={c?.tema}>
                        <span className="inline-block text-[0.56rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full mb-1" style={{ background: cor + '22', color: cor }}>{c?.veu}</span>
                        <p className="text-[0.72rem] leading-snug opacity-85" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{c?.mote}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[0.7rem] opacity-40 mt-4">Cada célula é o tema (véu + ângulo) que a conta aborda nessa semana, a partir do teu SABER. Clica numa conta para a abrir; abre a produção semanal para gerar.</p>
      </div>
    </div>
  );
}
