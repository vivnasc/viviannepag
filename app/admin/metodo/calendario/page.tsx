'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { CALENDARIO_UNIVERSO } from '@/lib/metodo/universo';
import { FACES_ORDEM } from '@/lib/metodo/veu-faces';
import { faceDaEspiral, semanasDesdeInicio, gestoDaConta } from '@/lib/metodo/peca';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário trimestral · Método VS — o MAPA / a VISÃO. Duas leis:
//  1) A SEMANA são os 7 véus, 1 por dia (CALENDARIO_UNIVERSO). Repete-se sempre.
//  2) A ESPIRAL: a cada volta da semana, aprofunda-se UMA face do retrato
//     (dor → fuga → culpa → custo → revelação → saída). Não é escada, é espiral:
//     os mesmos 7 véus, voltas mais finas. 6 faces = um ciclo, depois recomeça
//     mais fundo. A produção semanal desce daqui.

const FACE_DESC: Record<string, string> = {
  dor: 'o que se sente e se faz (a cena que para o scroll).',
  fuga: 'como cada véu foge, e como procrastina à sua maneira.',
  culpa: 'a culpa própria de cada véu (o que a prende).',
  custo: 'o preço invisível que o padrão cobra.',
  revelacao: 'a verdade que desfaz o véu.',
  saida: 'o movimento concreto de soltar.',
};

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;
  const faceAtual = faceDaEspiral(0);
  const n = semanasDesdeInicio();
  const idxAtual = ((n % FACES_ORDEM.length) + FACES_ORDEM.length) % FACES_ORDEM.length;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário trimestral · Método VS</h1>
          <Link href="/admin/metodo/mae-plano" className="text-[0.7rem] opacity-60 hover:opacity-100">Plano da semana →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-5">O <b>mapa</b>. A semana são os 7 véus (1 por dia). Ao longo das semanas, a <b>espiral</b> aprofunda uma face do retrato de cada vez. A produção semanal desce daqui.</p>

        {/* separadores das contas */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        <p className="text-[0.78rem] opacity-65 mb-1">{conta.movimento} · {conta.essencia}</p>
        <p className="text-[0.74rem] opacity-50 mb-6">A voz desta conta (sente-se em qualquer post): {gestoDaConta(sel).volta}.</p>

        {/* A SEMANA · os 7 véus, 1 por dia (o esqueleto que se repete) */}
        <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>A semana · os 7 véus</h2>
        <p className="text-[0.78rem] italic opacity-60 mb-3">Um véu por dia. Repete-se todas as semanas; o que muda é a face que a espiral aprofunda.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
          {CALENDARIO_UNIVERSO.map((d) => (
            <div key={d.wd} className="rounded-xl border border-white/10 p-3 text-center" style={{ background: `${conta.cor}10` }}>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] opacity-55">{d.nome.slice(0, 3)}</p>
              <p className="text-[0.95rem] mt-0.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>{d.veu}</p>
            </div>
          ))}
        </div>

        {/* A ESPIRAL · as 6 faces do retrato, uma por volta */}
        <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>A espiral · as 6 faces</h2>
        <p className="text-[0.78rem] italic opacity-60 mb-3">A cada volta da semana, aprofunda-se uma face. Estamos na {faceAtual.volta}.ª volta.</p>
        <div className="space-y-2.5">
          {FACES_ORDEM.map((f, i) => {
            const ehAtual = i === idxAtual;
            const off = ((i - idxAtual) % FACES_ORDEM.length + FACES_ORDEM.length) % FACES_ORDEM.length;
            const cor = conta.cor;
            return (
              <div key={f.chave} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#EBAE4A]/60' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>volta {i + 1}</span>
                    <span className="text-[0.58rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border" style={{ borderColor: cor + '55', color: cor }}>{f.titulo}{f.nova ? ' · nova' : ''}</span>
                    {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">esta semana</span>}
                  </div>
                  <p className="leading-tight text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>{f.titulo}</p>
                  <p className="text-[0.76rem] opacity-60 mb-2.5">{FACE_DESC[f.chave] ?? ''} Os 7 véus saem por esta face.</p>
                  <Link href={`/admin/metodo/${sel}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">abrir na conta →</Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">Ao fim das 6 faces a espiral recomeça, mais fundo. O mapa dá a direção; o retrato e as personagens dão o conteúdo sem fim.</p>
      </div>
    </div>
  );
}
