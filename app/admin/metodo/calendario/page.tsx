'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { planoSemana, planoSemanaMae } from '@/lib/metodo/semana';
import { SEMANAS_TRIMESTRE } from '@/lib/metodo/planoTrimestral';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 MESES · Método VS. Barra horizontal de SEPARADORES (as 4 contas,
// como na página Publicar): escolhes a conta e vês o PLANO TRIMESTRAL dela (12
// semanas). Os itens vêm dos motores reais (mãe = 1 véu/dia; portas = o plano).

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };
const dm = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

type Dia = { nome: string; data: string; veu: string; etiqueta: string };

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;

  const semanas = useMemo(() => {
    const out: { offset: number; dias: Dia[] }[] = [];
    for (let w = 0; w < SEMANAS_TRIMESTRE; w++) {
      const dias: Dia[] = sel === 'mae'
        ? planoSemanaMae(w).map((d) => ({ nome: d.nome, data: d.data, veu: d.veu, etiqueta: 'reel 2 faces' }))
        : planoSemana(sel, w).map((d) => ({ nome: d.nome, data: d.data, veu: d.post.veu ?? d.post.conceito, etiqueta: TIPO_LABEL[d.tipo] ?? d.tipo }));
      out.push({ offset: w, dias });
    }
    return out;
  }, [sel]);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>

        {/* barra horizontal de contas (separadores, como na página Publicar) */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className={`px-3 py-1.5 rounded-lg border text-[0.82rem] transition`} style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-3">
          <span className="text-[0.78rem] opacity-70">{conta.movimento} · {conta.essencia}</span>
          <span className="text-[0.7rem] opacity-50">{sel === 'mae' ? '1 véu por dia (reel 2 faces)' : 'o plano da semana (60/30/10)'} · 12 semanas</span>
        </div>

        {/* plano trimestral da conta escolhida: 12 semanas, cada uma com os seus dias */}
        <div className="space-y-2.5">
          {semanas.map((s) => {
            const ehAtual = s.offset === 0;
            return (
              <div key={s.offset} className={`rounded-xl border p-3 ${ehAtual ? 'border-[#EBAE4A]/60 bg-[#EBAE4A]/[0.04]' : 'border-white/10 bg-black/15'}`}>
                <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-wider mb-2">
                  <span className={ehAtual ? 'text-[#EBAE4A]' : 'opacity-55'}>{ehAtual ? 'esta semana' : `semana ${s.offset + 1}`}</span>
                  <span className="opacity-40">{dm(s.dias[0]?.data ?? '')} a {dm(s.dias[s.dias.length - 1]?.data ?? '')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {s.dias.map((d) => (
                    <div key={d.data} className="rounded-lg border border-white/10 bg-black/20 p-2">
                      <div className="flex items-center justify-between text-[0.54rem] uppercase tracking-wider opacity-50 mb-1">
                        <span>{d.nome.slice(0, 3)}</span><span>{dm(d.data)}</span>
                      </div>
                      <span className="inline-block text-[0.56rem] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full mb-1" style={{ background: conta.cor + '22', color: conta.cor }}>{d.veu}</span>
                      <p className="text-[0.6rem] opacity-55">{d.etiqueta}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-5">Escolhe a conta na barra de cima para navegar entre os planos trimestrais. A estrutura é estável; o que roda é o conteúdo. Para gerar e agendar, abre a produção semanal.</p>
      </div>
    </div>
  );
}
