'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { jornadaConta, totalTemas, semanaTrimestreAtual } from '@/lib/metodo/planoTrimestral';
import { planoSemanaMae } from '@/lib/metodo/semana';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 meses · Método VS — o MAPA (como o Calendário da veu.a.veu).
// É a FONTE: a jornada trimestral de cada conta. A produção semanal DESCE daqui
// (banner + "ver os 3 meses"), exatamente como o Plano da Semana desce do plano
// editorial da veu.a.veu. Para as PORTAS, cada cartão é um tema (uma semana da
// jornada). Para a MÃE, os temas são DIAS: cada semana mostra os 7 véus, 1 por
// dia (o ritmo que a produção gera).

const SEMANAS_MAE = 13; // 3 meses, como a veu.a.veu
// 'YYYY-MM-DD' -> 'DD/MM' a partir de componentes (nunca Date/UTC, recua um dia).
const dm = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;

  // PORTAS: a jornada de temas (cada cartão = uma semana). "esta semana" mapeia a
  // semana do trimestre ao tema correspondente da jornada.
  const temas = useMemo(() => (sel === 'mae' ? [] : jornadaConta(sel)), [sel]);
  const total = useMemo(() => (sel === 'mae' ? 0 : totalTemas(sel)), [sel]);
  const atualSemana = total ? ((semanaTrimestreAtual() - 1) % total) + 1 : 0;

  // MÃE: os temas são DIAS. 13 semanas, cada uma com os 7 véus (1/dia), direto do
  // motor da produção (planoSemanaMae) — por isso o calendário e a semana batem.
  const semanasMae = useMemo(() => {
    if (sel !== 'mae') return [];
    return Array.from({ length: SEMANAS_MAE }, (_, off) => ({ off, dias: planoSemanaMae(off) }));
  }, [sel]);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-4">O <b>mapa</b> de cada conta. A produção semanal desce daqui (do mais amplo aqui ao mais específico na semana). Para as portas, cada cartão é um <b>tema</b> (uma semana); para a <b>mãe, os temas são dias</b> (os 7 véus, 1 por dia). Escolhe a conta:</p>

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
        <p className="text-[0.74rem] opacity-50 mb-6">{sel === 'mae' ? 'A mãe: 1 véu por DIA (os temas são dias), os 7 véus a alternar ao longo da semana. Reel de 2 faces.' : `Os véus desta porta ALTERNADOS: ${conta.veus.join(' · ')}.`}</p>

        {/* MÃE — os temas são DIAS: 13 semanas, cada uma com os 7 véus (1/dia) */}
        {sel === 'mae' ? (
          <div className="space-y-2.5">
            {semanasMae.map(({ off, dias }) => {
              const cor = conta.cor;
              const ehAtual = off === 0;
              return (
                <div key={off} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>semana {off + 1}</span>
                      <span className="text-[0.7rem] opacity-55">{dm(dias[0].data)} a {dm(dias[dias.length - 1].data)}</span>
                      {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-2.5">
                      {dias.map((d) => (
                        <div key={d.wd} className="flex items-baseline gap-2 text-[0.84rem]">
                          <span className="text-[0.6rem] uppercase tracking-wider opacity-45 w-9 shrink-0">{d.nome.slice(0, 3)}</span>
                          <span className="px-2 py-0.5 rounded-full text-[0.58rem] uppercase tracking-wider shrink-0" style={{ background: cor + '22', color: cor }}>Véu {d.veu}</span>
                          <span className="opacity-60 italic truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{d.revelacao?.texto}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/admin/metodo/semana?conta=mae&off=${off}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // PORTAS — a jornada de temas (cada cartão = uma semana da jornada)
          <div className="space-y-2.5">
            {temas.map((s) => {
              const cor = conta.cor;
              const ehAtual = s.semana === atualSemana;
              const off = s.semana - atualSemana; // semana do cartão relativa a esta
              return (
                <div key={s.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>tema {s.semana}</span>
                      <span className="text-[0.58rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border" style={{ borderColor: cor + '55', color: cor }}>Véu {s.veu}</span>
                      {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                    </div>
                    <p className="leading-tight text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>“{s.mote}”</p>
                    <p className="text-[0.76rem] opacity-60 mb-2.5">{s.nota}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/metodo/semana?conta=${sel}&off=${off}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                      <Link href={`/admin/metodo/${sel}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border no-underline" style={{ borderColor: cor + '55', color: cor }}>@{conta.handle} →</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[0.7rem] opacity-40 mt-4">Os véus alternam (nunca seguidos). Para gerar e agendar, abre a produção semanal — abre já na semana do cartão.</p>
      </div>
    </div>
  );
}
