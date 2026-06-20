'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, getConta, type ContaId } from '@/lib/metodo/contas';
import { CALENDARIO_UNIVERSO } from '@/lib/metodo/universo';
import { VEU_FACES, FACES_ORDEM } from '@/lib/metodo/veu-faces';
import { VEU_LENTE, PORTA_ENQUADRAMENTO, PERGUNTA_MESTRA, CADEIA } from '@/lib/metodo/lentes';
import { REFERENCIAS } from '@/lib/metodo/referencias';
import { getFormatoConta } from '@/lib/metodo/formatos-conta';
import { semanasDesdeInicio } from '@/lib/metodo/peca';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário TRIMESTRAL · Método VS — o MAPA. Três eixos (decisão final da Vivianne):
//  1) O DNA (o que se repete): os 7 véus, 1 por dia, IGUAIS para as 4 contas. O véu
//     NÃO é por conta (abolido). A lente de cada véu é fixa (é a sua identidade).
//  2) A ESPIRAL (o que avança = o trimestre): a cada SEMANA, o mesmo véu sai por uma
//     FACE diferente do retrato (dor → fuga → culpa → custo → revelação → saída) e
//     depois mais fundo. Por isso a "dor" é só a semana 1. 13 semanas = o trimestre.
//  3) O TRATAMENTO (o que distingue as contas): NÃO é o véu nem a cor, é o FORMATO +
//     a VOZ + o ÂNGULO. O mesmo véu+face VIRA coisas diferentes em cada conta.
// A fonte (referencias) fica por baixo, nunca no público. A produção desce daqui.

const SEMANAS_TRIMESTRE = 13;

// Como cada conta REFRATA o mesmo véu (formatos-conta.ts + a voz de cada porta).
const CONTA_TRATAMENTO: Record<ContaId, string> = {
  mae: 'vira a carta «Sou aquela» (a personagem do véu, de manhã) e um «Não normalizes» (a assimetria que a cultura tornou normal, à tarde).',
  ver: 'vira «O Espelho»: a pessoa concreta que, por causa deste véu, fica a viver-te na cabeça. Abre para fora, vira para dentro.',
  vir: 'vira uma «Carta de renomear»: dá um nome novo ao que este véu te fez carregar a vida toda. Não consola, renomeia.',
  viver: 'vira um «Repara»: a vida que este véu te faz adiar e que já está aqui, agora. A imagem manda, a palavra serve.',
};

const FACE_DESC: Record<string, string> = {
  dor: 'o que se sente e se faz (a cena que para o scroll)',
  fuga: 'como cada véu foge e procrastina à sua maneira',
  culpa: 'a culpa própria do véu (o que o prende)',
  custo: 'o preço invisível que o padrão cobra',
  revelacao: 'a verdade que desfaz o véu',
  saida: 'o movimento concreto de soltar',
};

const fmtDM = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

export default function MetodoCalendarioPage() {
  const [sel, setSel] = useState<ContaId>('mae');
  const [semana, setSemana] = useState(0); // 0 = esta semana … 12 = fim do trimestre
  const conta = getConta(sel)!;
  const ehPorta = sel === 'ver' || sel === 'vir' || sel === 'viver';
  const fmtManha = getFormatoConta(sel, 'descoberta');
  const fmtTarde = getFormatoConta(sel, 'profundidade');

  // a ESPIRAL: a face avança por semana (determinística, ancorada ao arranque do
  // trimestre = 22 jun 2026). Antes do arranque, semanasDesdeInicio é negativo, por
  // isso clampa-se a 0 (a semana 1 do trimestre) e usa-se módulo SEGURO.
  const semBase = Math.max(0, semanasDesdeInicio());
  const len = FACES_ORDEM.length;
  const faceDaSemana = (i: number) => FACES_ORDEM[(semBase + i) % len];
  const voltaDaSemana = (i: number) => Math.floor((semBase + i) / len) + 1;
  const inicioLocal = new Date(2026, 5, 22); // 2.ª-feira da semana 1 (arranque)
  const mondayDe = (i: number) => { const d = new Date(inicioLocal); d.setDate(d.getDate() + (semBase + i) * 7); return d; };

  const face = faceDaSemana(semana);

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

        {/* O TRIMESTRE · 13 semanas (a espiral): a face que avança */}
        <h2 className="text-xl mb-0.5" style={{ fontFamily: 'var(--font-cormorant), serif' }}>O trimestre · 13 semanas</h2>
        <p className="text-[0.78rem] italic opacity-60 mb-3">Os 7 véus repetem-se todas as semanas (o DNA). O que AVANÇA é a <b>face</b> por onde o véu sai: a dor é só a semana 1.</p>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 mb-6">
          {Array.from({ length: SEMANAS_TRIMESTRE }, (_, i) => {
            const f = faceDaSemana(i);
            const ativo = i === semana;
            return (
              <button key={i} onClick={() => setSemana(i)} className="rounded-lg border p-1.5 text-center" style={{ borderColor: ativo ? '#EBAE4A' : 'rgba(255,255,255,0.12)', background: ativo ? '#EBAE4A18' : 'transparent' }}>
                <span className="block text-[0.55rem] uppercase tracking-[0.12em] opacity-50">sem {i + 1} · {fmtDM(mondayDe(i))}</span>
                <span className="block text-[0.8rem]" style={{ fontFamily: 'var(--font-cormorant), serif', color: ativo ? '#EBAE4A' : '#F2E8DC' }}>{f.titulo}</span>
                <span className="block text-[0.5rem] opacity-40">volta {voltaDaSemana(i)}</span>
              </button>
            );
          })}
        </div>

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
        <div className="rounded-xl border p-4 mb-3" style={{ borderColor: conta.cor + '40', background: `linear-gradient(135deg, ${conta.cor}10, transparent 70%)` }}>
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

        {/* O QUE ESTA SEMANA APROFUNDA (a face) */}
        <div className="rounded-xl border border-[#EBAE4A]/40 bg-[#EBAE4A]/[0.06] p-3 mb-4">
          <p className="text-[0.82rem]"><b style={{ color: '#EBAE4A' }}>Semana {semana + 1} · {face.titulo}</b> <span className="opacity-70">— {FACE_DESC[face.chave]}. Os 7 véus saem por esta face, na voz da @{conta.handle}.</span></p>
        </div>

        {/* OS 7 VÉUS (DNA), cada um pela FACE da semana, e como ESTA conta o trata */}
        <div className="space-y-3">
          {CALENDARIO_UNIVERSO.map((d) => {
            const veu = d.veu;
            const lente = VEU_LENTE[veu];
            const faces = VEU_FACES[veu];
            const ref = REFERENCIAS[veu];
            const cor = conta.cor;
            const raiz = veu === 'Dualidade';
            const textoFace = faces?.[face.chave] ?? '';
            return (
              <div key={d.wd} className={`rounded-xl border overflow-hidden ${raiz ? 'border-[#EBAE4A]/50' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${cor}10, transparent 60%)` }}>
                <div className="p-4">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                    <span className="text-[0.58rem] uppercase tracking-[0.14em] opacity-55">{d.nome.slice(0, 3)}</span>
                    <span className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>{veu}</span>
                    <span className="text-[0.78rem] opacity-60 italic">{lente?.frase}</span>
                    {raiz && <span className="ml-auto text-[0.56rem] px-2 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">a raiz</span>}
                  </div>

                  {/* A LENTE (fixa, a identidade do véu): foi assim que sobrevivi */}
                  <p className="text-[0.78rem] opacity-65 leading-snug mb-1.5">
                    <span className="opacity-50 text-[0.58rem] uppercase tracking-[0.14em] mr-1.5">lente</span>
                    Foi assim que {lente?.estrategia}. Expira quando {lente?.expira}.
                  </p>

                  {/* A FACE DA SEMANA (o que muda de semana para semana) */}
                  <p className="text-[0.86rem] leading-snug mb-2" style={{ fontFamily: 'var(--font-cormorant), serif', color: cor }}>
                    <span className="opacity-50 text-[0.58rem] uppercase tracking-[0.14em] mr-1.5" style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#F2E8DC' }}>{face.titulo}</span>
                    {textoFace.split('. ').slice(0, 2).join('. ')}.
                  </p>

                  {/* COMO ESTA CONTA O TRATA (o ângulo/formato) */}
                  <p className="text-[0.76rem] opacity-75 leading-snug mb-1.5">
                    <span className="opacity-50 text-[0.58rem] uppercase tracking-[0.14em] mr-1.5">@{conta.handle}</span>
                    {CONTA_TRATAMENTO[sel]}
                  </p>

                  {/* A FONTE académica (por baixo, só para ti, NUNCA no público) */}
                  {ref?.conceitos?.length ? <p className="text-[0.66rem] opacity-40 mb-2">fonte (só por baixo, nunca na peça): {ref.conceitos.slice(0, 4).join(' · ')}</p> : null}

                  <Link href={`/admin/metodo/${sel}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-white/20 hover:border-[#EBAE4A] hover:text-[#EBAE4A] no-underline">produzir nesta conta →</Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">Ao fim das 6 faces a espiral recomeça, mais fundo (volta 2, 3…). Cada peça é rastreável: véu (DNA) → face (a semana) → tratamento (a conta) → fonte.</p>
      </div>
    </div>
  );
}
