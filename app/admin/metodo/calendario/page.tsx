'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { jornadaConta, totalTemas, semanaTrimestreAtual, PARTES_MAE, PERCURSO_MAE, indiceMaeAtual, parteMae } from '@/lib/metodo/planoTrimestral';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário · 3 meses · Método VS — o MAPA / a VISÃO (como o Calendário da
// veu.a.veu). É a FONTE: a produção semanal DESCE daqui. Para a MÃE é um PERCURSO
// (4 partes: Ver -> Compreender -> O custo -> Soltar; cada semana uma temática,
// um ângulo do método sobre os 7 véus). O semanal executa: 7 véus (1/dia) por
// esse ângulo. Para as PORTAS, cada cartão é um tema da jornada. Não é aleatório:
// tem direção, e ao fim recomeça com conteúdo novo (do SABER, com anti-repetição).

const DIM_LABEL: Record<string, string> = {
  comportamentos: 'comportamentos', cenas: 'cenas do dia a dia', subtipos: 'o teu tipo',
  origens: 'a origem', mecanismos: 'o mecanismo', custos: 'o custo', crencas: 'o erro',
  verdades: 'a verdade', mapa: 'o mapa',
};

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;

  // PORTAS: a jornada de temas (cada cartão = uma semana da jornada).
  const temas = useMemo(() => (sel === 'mae' ? [] : jornadaConta(sel)), [sel]);
  const total = useMemo(() => (sel === 'mae' ? 0 : totalTemas(sel)), [sel]);
  const atualSemana = total ? ((semanaTrimestreAtual() - 1) % total) + 1 : 0;

  // MÃE: o PERCURSO trimestral (a visão). qual é a semana atual do percurso.
  const idxMae = useMemo(() => (sel === 'mae' ? indiceMaeAtual() : 0), [sel]);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário · 3 meses · Método VS</h1>
          <Link href="/admin/metodo/semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Produção semanal →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-4">O <b>mapa</b> de cada conta. A produção semanal desce daqui. Para a <b>mãe</b> é um <b>percurso</b> (uma direção de 3 meses); cada semana uma temática, e o semanal executa os 7 véus (1/dia) por esse ângulo. Escolhe a conta:</p>

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
        <p className="text-[0.74rem] opacity-50 mb-6">{sel === 'mae' ? 'Um percurso Ver → Compreender → O custo → Soltar. Cada semana uma temática; o semanal executa 1 véu/dia por esse ângulo. Ao fim, recomeça com conteúdo novo.' : `Os véus desta porta ALTERNADOS: ${conta.veus.join(' · ')}.`}</p>

        {/* MÃE — o PERCURSO em PARTES (como as PARTES da veu.a.veu) */}
        {sel === 'mae' ? (
          PARTES_MAE.map((parte) => {
            const semanas = PERCURSO_MAE.filter((s) => s.parte === parte.id);
            if (!semanas.length) return null;
            const cor = conta.cor;
            return (
              <div key={parte.id} className="mb-8">
                <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{parte.nome}</h2>
                <p className="text-[0.78rem] italic opacity-60 mb-3">{parte.descricao}</p>
                <div className="space-y-2.5">
                  {semanas.map((s) => {
                    const ehAtual = s.semana - 1 === idxMae;
                    const off = ((s.semana - 1 - idxMae) % PERCURSO_MAE.length + PERCURSO_MAE.length) % PERCURSO_MAE.length;
                    return (
                      <div key={s.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>semana {s.semana}</span>
                            <span className="text-[0.58rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border" style={{ borderColor: cor + '55', color: cor }}>{DIM_LABEL[s.dimensao] ?? s.dimensao}</span>
                            {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                          </div>
                          <p className="leading-tight text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>“{s.mote}”</p>
                          <p className="text-[0.76rem] opacity-60 mb-2.5">{s.tema} · executa os 7 véus (1/dia) por este ângulo</p>
                          <Link href={`/admin/metodo/semana?conta=mae&off=${off}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na produção →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // PORTAS — a jornada de temas (cada cartão = uma semana da jornada)
          <div className="space-y-2.5">
            {temas.map((s) => {
              const cor = conta.cor;
              const ehAtual = s.semana === atualSemana;
              const off = s.semana - atualSemana;
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

        <p className="text-[0.7rem] opacity-40 mt-4">{sel === 'mae' ? 'Ao fim do percurso recomeça, com conteúdo novo (a IA puxa do SABER, com anti-repetição). O percurso dá a direção; o SABER dá o conteúdo sem fim.' : 'Os véus alternam (nunca seguidos). Para gerar e agendar, abre a produção semanal.'}</p>
      </div>
    </div>
  );
}
