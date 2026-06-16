'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { getConta, type ContaId } from '@/lib/metodo/contas';
import { planoSemana, planoSemanaMae } from '@/lib/metodo/semana';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Visão GLOBAL do Método VS, SEPARADA por conta: cada conta tem a sua BARRA
// HORIZONTAL com os itens que publica na semana (a vista por cima dos motores —
// mãe = 1 véu/dia; portas = o seu plano 60/30/10). Separar por conta dá espaço
// ao conceito, em vez de espremer tudo em 4 colunas.

const ORDEM: ContaId[] = ['ver', 'vir', 'viver', 'mae'];
const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };
const dm = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

export default function MetodoCalendarioPage() {
  // a semana atual de cada conta (offset 0 = esta semana), já dos motores reais.
  const lanes = useMemo(() => ORDEM.map((id) => {
    const conta = getConta(id)!;
    if (id === 'mae') {
      const dias = planoSemanaMae(0).map((d) => ({ nome: d.nome, data: d.data, veu: d.veu, etiqueta: 'reel 2 faces' }));
      return { conta, dias };
    }
    const dias = planoSemana(id, 0).map((d) => ({ nome: d.nome, data: d.data, veu: d.post.veu ?? d.post.conceito, etiqueta: TIPO_LABEL[d.tipo] ?? d.tipo }));
    return { conta, dias };
  }), []);

  const semana = lanes[0]?.dias;
  const intervalo = semana?.length ? `${dm(semana[0].data)} a ${dm(semana[semana.length - 1].data)}` : '';

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Visão global · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Cada conta com a sua <b>barra de publicação</b>: os itens que sai em cada dia, na estrutura já definida (mãe = 1 véu por dia; portas = o seu plano).</p>
        <p className="text-[0.76rem] opacity-55 mb-6">Esta semana · {intervalo}. A estrutura é estável; o que roda é o conteúdo.</p>

        <div className="space-y-5">
          {lanes.map(({ conta, dias }) => (
            <section key={conta.id} className="rounded-2xl border border-white/10 p-4" style={{ background: `linear-gradient(135deg, ${conta.cor}10, transparent 75%)` }}>
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <Link href={`/admin/metodo/${conta.id}`} className="no-underline text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</Link>
                <span className="text-[0.62rem] uppercase tracking-wider opacity-55">{conta.movimento} · {conta.essencia}</span>
              </div>
              {/* barra horizontal dos itens da semana */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dias.map((d) => (
                  <div key={d.data} className="shrink-0 w-[132px] rounded-xl border border-white/10 bg-black/20 p-2.5">
                    <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-wider opacity-55 mb-1.5">
                      <span>{d.nome.slice(0, 3)}</span><span>{dm(d.data)}</span>
                    </div>
                    <span className="inline-block text-[0.58rem] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full mb-1.5" style={{ background: conta.cor + '22', color: conta.cor }}>{d.veu}</span>
                    <p className="text-[0.62rem] opacity-60">{d.etiqueta}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-5">A barra mostra o que cada conta publica na semana (vinda dos motores). Para gerar e agendar, abre a produção semanal. Mais à frente cruzamos com o que já foi publicado e os números.</p>
      </div>
    </div>
  );
}
