'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { CALENDARIO_UNIVERSO } from '@/lib/metodo/universo';
import { VEU_FACES } from '@/lib/metodo/veu-faces';
import { VEU_LENTE, PORTA_ENQUADRAMENTO, PERGUNTA_MESTRA, CADEIA } from '@/lib/metodo/lentes';
import { REFERENCIAS } from '@/lib/metodo/referencias';
import { getFormatoConta } from '@/lib/metodo/formatos-conta';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário trimestral · Método VS — o MAPA / a PONTE entre o DNA e as almas das
// contas. Duas leis (decisão final da Vivianne):
//  1) O VÉU é DNA PARTILHADO: os 7 véus, 1 por dia, IGUAIS para todas as contas
//     (não há "véu por conta" — isso foi abolido). A matéria (a lente, a verdade, a
//     dor) é a mesma para todas, porque é o método.
//  2) O que distingue cada conta NÃO é o véu nem a cor: é o FORMATO + a VOZ + o
//     ÂNGULO. O mesmo véu do dia VIRA coisas diferentes em cada conta (O Espelho ·
//     a Carta · o Repara · a carta "Sou Aquela" + "Não normalizes").
// A fonte (referencias) fica por baixo, nunca no público. A produção desce daqui.

// Como cada conta REFRATA o mesmo véu (o que muda de conta para conta). Fonte: os
// formatos próprios (formatos-conta.ts) e a voz de cada porta (contas.ts).
const CONTA_TRATAMENTO: Record<ContaId, string> = {
  mae: 'vira a carta «Sou aquela» (a personagem do véu, de manhã) e um «Não normalizes» (a assimetria que a cultura tornou normal, à tarde). A voz que nomeia o padrão inteiro.',
  ver: 'vira «O Espelho»: a pessoa concreta que, por causa deste véu, fica a viver-te na cabeça. Abre para fora, vira para dentro. Chega a testemunhar.',
  vir: 'vira uma «Carta de renomear»: dá um nome novo ao que este véu te fez carregar a vida toda. Não consola, renomeia. Chega a regressar.',
  viver: 'vira um «Repara»: a vida que este véu te faz adiar e que já está aqui, agora. A imagem manda, a palavra serve. Chega a participar.',
};

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

        {/* A LENTE do método inteiro: de onde nasce TODO o conteúdo (a fonte). */}
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 mb-6">
          <p className="text-[0.6rem] uppercase tracking-[0.16em] opacity-50 mb-1">a teoria por baixo de tudo · estratégias de sobrevivência</p>
          <p className="text-[1.05rem] leading-snug mb-1.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Cada véu foi, na origem, uma estratégia que te protegeu. {CADEIA}.</p>
          <p className="text-[0.8rem] opacity-75 italic">A pergunta-mestra (faz o ver virar soltar): «{PERGUNTA_MESTRA}»</p>
        </div>

        {/* O DNA: os 7 véus, 1 por dia, IGUAIS para todas as contas */}
        <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>O DNA · os 7 véus, 1 por dia</h2>
        <p className="text-[0.78rem] italic opacity-60 mb-3">A espinha é a mesma para as 4 contas. O que muda de conta para conta não é o véu, é o <b>formato</b>, a <b>voz</b> e o <b>ângulo</b> (escolhe a conta em baixo).</p>

        {/* separadores das contas — escolhem o TRATAMENTO, não o véu */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        {/* A VOZ E O FORMATO da conta escolhida (o que a torna diferente) */}
        <div className="rounded-xl border p-4 mb-6" style={{ borderColor: conta.cor + '40', background: `linear-gradient(135deg, ${conta.cor}10, transparent 70%)` }}>
          <p className="text-[0.78rem] opacity-65 mb-1">@{conta.handle} · {conta.movimento} · {conta.essencia}</p>
          {ehPorta ? (
            <>
              <p className="text-[1.0rem] leading-snug mb-1" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>{PORTA_ENQUADRAMENTO[sel as 'ver' | 'vir' | 'viver']}</p>
              {conta.fraseMae && <p className="text-[0.82rem] opacity-80">A confissão que se sente em qualquer post: «{conta.fraseMae}»{conta.chegada ? ` Chega a ${conta.chegada}.` : ''}</p>}
            </>
          ) : (
            <p className="text-[1.0rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>A vista panorâmica do método inteiro. A Dualidade é a raiz de todos os véus.</p>
          )}
          <p className="text-[0.74rem] opacity-60 mt-2">Formatos: <b>manhã</b> {fmtManha.nome.split(' · ')[0]} · <b>tarde</b> {fmtTarde.nome.split(' (')[0]}.</p>
        </div>

        {/* OS 7 VÉUS (partilhados) — cada um com a lente, a verdade, a dor, e como ESTA conta o trata */}
        <div className="space-y-3">
          {CALENDARIO_UNIVERSO.map((d) => {
            const veu = d.veu;
            const lente = VEU_LENTE[veu];
            const faces = VEU_FACES[veu];
            const ref = REFERENCIAS[veu];
            const cor = conta.cor;
            const raiz = veu === 'Dualidade';
            return (
              <div key={d.wd} className={`rounded-xl border overflow-hidden ${raiz ? 'border-[#EBAE4A]/50' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}10, transparent 60%)` }}>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                    <span className="text-[0.58rem] uppercase tracking-[0.14em] opacity-55">{d.nome.slice(0, 3)}</span>
                    <span className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>{veu}</span>
                    <span className="text-[0.78rem] opacity-60 italic">{lente?.frase}</span>
                    {raiz && <span className="ml-auto text-[0.56rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">a raiz</span>}
                  </div>

                  {/* A LENTE (partilhada): foi assim que sobrevivi -> expira quando */}
                  <p className="text-[0.84rem] leading-snug mb-1.5">
                    <span className="opacity-50 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">lente</span>
                    Foi assim que {lente?.estrategia}. <span className="opacity-60">Expira quando {lente?.expira}.</span>
                  </p>

                  {/* A VERDADE que o desfaz (a revelação) + a DOR concreta */}
                  {faces?.revelacao && <p className="text-[0.86rem] leading-snug mb-1.5" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>{faces.revelacao.split('. ')[0]}.</p>}
                  {faces?.dor && <p className="text-[0.78rem] opacity-75 leading-snug mb-2"><span className="opacity-50 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">dor</span>{faces.dor.split('. ').slice(0, 2).join('. ')}.</p>}

                  {/* COMO ESTA CONTA O TRATA (o que muda de conta para conta) */}
                  <p className="text-[0.78rem] leading-snug rounded-lg px-2.5 py-1.5 mb-2" style={{ background: cor + '14', color: '#F2E8DC' }}>
                    <span className="opacity-60 text-[0.6rem] uppercase tracking-[0.14em] mr-1.5">@{conta.handle}</span>{CONTA_TRATAMENTO[sel]}
                  </p>

                  {/* A FONTE académica (por baixo, só para ti, NUNCA no público) */}
                  {ref?.conceitos?.length ? <p className="text-[0.68rem] opacity-40">fonte (só por baixo, nunca na peça): {ref.conceitos.slice(0, 4).join(' · ')}</p> : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <Link href={`/admin/metodo/${sel}`} className="text-[0.72rem] px-3 py-1.5 rounded-lg border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">produzir em @{conta.handle} →</Link>
          <p className="text-[0.7rem] opacity-40">O véu é partilhado (DNA); a conta dá o formato, a voz e o ângulo. Cada peça é rastreável: véu → lente → verdade → dor → tratamento da conta.</p>
        </div>
      </div>
    </div>
  );
}
