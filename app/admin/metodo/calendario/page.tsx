'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { VEU_FACES } from '@/lib/metodo/veu-faces';
import { VEU_LENTE, PORTA_ENQUADRAMENTO, PERGUNTA_MESTRA, CADEIA } from '@/lib/metodo/lentes';
import { REFERENCIAS } from '@/lib/metodo/referencias';
import { getFormatoConta } from '@/lib/metodo/formatos-conta';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário trimestral · Método VS — o MAPA / a LENTE (não o mecanismo abstrato).
// Mostra, POR CONTA, de onde nasce cada peça: a teoria "Estratégias de
// Sobrevivência" (UNIVERSO-VS.md) -> a LENTE de cada véu (foi assim que sobrevivi)
// -> a VERDADE que o desfaz e a DOR concreta (veu-faces.ts) -> a FONTE académica
// por baixo (referencias.ts) -> o FORMATO desta conta que o carrega.
// As 4 contas NÃO são iguais: cada PORTA mostra só os SEUS 2 véus (o cacho) e a sua
// voz; a MÃE mostra os 7, com a Dualidade como raiz. A produção semanal desce daqui.

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const conta = getConta(sel)!;
  const ehPorta = sel === 'ver' || sel === 'vir' || sel === 'viver';
  const fmtManha = getFormatoConta(sel, 'descoberta');
  const fmtTarde = getFormatoConta(sel, 'profundidade');

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário trimestral · Método VS</h1>
          <Link href="/admin/metodo/mae-plano" className="text-[0.7rem] opacity-60 hover:opacity-100">Plano da semana →</Link>
        </div>

        {/* A LENTE do método inteiro: de onde nasce TODO o conteúdo. */}
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 mb-6">
          <p className="text-[0.6rem] uppercase tracking-[0.16em] opacity-50 mb-1">a teoria por baixo de tudo · estratégias de sobrevivência</p>
          <p className="text-[1.05rem] leading-snug mb-1.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Cada véu foi, na origem, uma estratégia que te protegeu. {CADEIA}.</p>
          <p className="text-[0.8rem] opacity-75 italic">A pergunta-mestra (faz o ver virar soltar): «{PERGUNTA_MESTRA}»</p>
        </div>

        {/* separadores das contas */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        {/* A VOZ E O ÂNGULO desta conta (o que a torna diferente das outras) */}
        <div className="mb-6">
          <p className="text-[0.78rem] opacity-65 mb-1">{conta.movimento} · {conta.essencia} · símbolo: {conta.simbolo}</p>
          {ehPorta ? (
            <>
              <p className="text-[1.02rem] leading-snug mb-1.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>{PORTA_ENQUADRAMENTO[sel as 'ver' | 'vir' | 'viver']}</p>
              {conta.fraseMae && <p className="text-[0.82rem] opacity-80">A confissão que se sente em qualquer post: «{conta.fraseMae}»</p>}
              {conta.chegada && <p className="text-[0.76rem] opacity-55 mt-0.5">Chega a: {conta.chegada}.</p>}
            </>
          ) : (
            <p className="text-[1.02rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>A vista panorâmica do método inteiro. Os 7 véus, 1 por dia; a Dualidade é a raiz de todos.</p>
          )}
          <p className="text-[0.74rem] opacity-55 mt-2">Os véus saem nestes formatos: <b>manhã</b> {fmtManha.nome.split(' · ')[0]} · <b>tarde</b> {fmtTarde.nome.split(' (')[0]}.</p>
        </div>

        {/* OS VÉUS DESTA CONTA: portas = os seus 2 (o cacho); mãe = os 7. */}
        <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{ehPorta ? `Os ${conta.veus.length} véus desta porta` : 'Os 7 véus'}</h2>
        <p className="text-[0.78rem] italic opacity-60 mb-3">{ehPorta ? 'Alternados ao longo da semana. Cada peça nasce da lente de um véu, na voz desta porta.' : 'Um por dia. A matéria de cada peça é a verdade do véu, dita na linguagem da vida.'}</p>

        <div className="space-y-3">
          {conta.veus.map((veu) => {
            const lente = VEU_LENTE[veu];
            const faces = VEU_FACES[veu];
            const ref = REFERENCIAS[veu];
            const cor = conta.cor;
            const raiz = veu === 'Dualidade';
            return (
              <div key={veu} className={`rounded-xl border overflow-hidden ${raiz ? 'border-[#EBAE4A]/50' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                    <span className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>{veu}</span>
                    <span className="text-[0.78rem] opacity-60 italic">{lente?.frase}</span>
                    {raiz && <span className="ml-auto text-[0.56rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">a raiz</span>}
                  </div>

                  {/* A LENTE: foi assim que sobrevivi -> expira quando */}
                  <p className="text-[0.84rem] leading-snug mb-1.5">
                    <span className="opacity-50 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">lente</span>
                    Foi assim que {lente?.estrategia}. <span className="opacity-60">Expira quando {lente?.expira}.</span>
                  </p>

                  {/* A VERDADE que o desfaz (a revelação) */}
                  {faces?.revelacao && (
                    <p className="text-[0.86rem] leading-snug mb-1.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>
                      {faces.revelacao.split('. ')[0]}.
                    </p>
                  )}

                  {/* A DOR concreta (a cena que para o scroll) -> a SAÍDA (o gesto) */}
                  {faces?.dor && <p className="text-[0.78rem] opacity-75 leading-snug mb-1"><span className="opacity-50 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">dor</span>{faces.dor.split('. ').slice(0, 2).join('. ')}.</p>}
                  {faces?.saida && <p className="text-[0.78rem] opacity-75 leading-snug mb-2"><span className="opacity-50 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">saída</span>{faces.saida.split('. ')[0]}.</p>}

                  {/* A FONTE académica (por baixo, só para ti, NUNCA no público) */}
                  {ref?.conceitos?.length ? <p className="text-[0.68rem] opacity-40 mb-2">fonte (só por baixo, nunca na peça): {ref.conceitos.slice(0, 4).join(' · ')}</p> : null}

                  <Link href={`/admin/metodo/${sel}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">produzir nesta conta →</Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">O mapa dá a lente e a direção; o retrato (veu-faces) e as personagens dão o conteúdo sem fim. Cada peça é rastreável até aqui: véu → lente → verdade → dor → formato.</p>
      </div>
    </div>
  );
}
