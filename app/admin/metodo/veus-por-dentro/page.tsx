'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { VEU_FACES, VEU_DOR, LIGACOES, RAIZ, FACES_ORDEM } from '@/lib/metodo/veu-faces';
import type { VeuNome } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

const VEUS: VeuNome[] = ['Esforço', 'Desolação', 'Horizonte', 'Permanência', 'Memória', 'Turbilhão', 'Dualidade'];

export default function VeusPorDentroPage() {
  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Os véus por dentro</h1>
          <Link href="/admin/metodo" className="text-[0.7rem] opacity-60 hover:opacity-100">← Método VS</Link>
        </div>
        <p className="text-[0.84rem] opacity-80 mb-1">O retrato completo de cada véu: <b>Dor · Fuga · Culpa · Custo · Revelação · Saída</b>.</p>
        <p className="text-[0.74rem] opacity-55 mb-6">O mercado fala do comportamento. Aqui fala-se do motivo. A mesma procrastinação tem 7 motivos diferentes. <b>Dor, Custo e Revelação</b> já vivem no SABER; <b>Fuga, Culpa e Saída</b> são as que se acrescentam (a verde).</p>

        {/* Esforço — retrato completo para validares */}
        <div className="rounded-2xl border border-[#EBAE4A]/30 bg-[#EBAE4A]/[0.05] p-4 mb-6">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-[#EBAE4A] mb-3">Retrato completo (para validares) · véu Esforço</p>
          <div className="space-y-3">
            {FACES_ORDEM.map((f) => {
              const txt = VEU_FACES.Esforço?.[f.chave];
              if (!txt) return null;
              return (
                <div key={f.chave}>
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] mb-0.5" style={{ color: f.nova ? '#7ee0a0' : '#9fb4c4' }}>{f.titulo}{f.nova ? ' · nova' : ''}</p>
                  <p className="leading-snug text-[1.0rem]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{txt}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Os outros 6 — só a dor, à espera da tua matéria */}
        <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Os outros véus (a preencher com a tua matéria, depois de validares o Esforço)</p>
        <div className="space-y-2 mb-6">
          {VEUS.filter((v) => !VEU_FACES[v]).map((v) => (
            <div key={v} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[0.78rem]"><b style={{ fontFamily: 'var(--font-cormorant), serif' }}>{v}</b> <span className="opacity-45 text-[0.66rem]">· dor:</span> <span className="opacity-80 text-[0.84rem]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{VEU_DOR[v]}</span></p>
              <p className="text-[0.6rem] opacity-40 mt-1">falta: fuga · culpa · saída</p>
            </div>
          ))}
        </div>

        {/* As ligações entre véus */}
        <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">As ligações (a teia)</p>
        {LIGACOES.map((l, i) => (
          <div key={i} className="rounded-xl border border-sky-400/25 bg-sky-400/[0.05] p-3 mb-2">
            <p className="text-[0.78rem]"><b className="text-sky-300">{l.nome}</b>{l.nova && <span className="ml-1.5 text-[0.55rem] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">nova</span>} <span className="opacity-50 text-[0.66rem]">· {l.de} → {l.para}</span></p>
            <p className="leading-snug text-[0.92rem] mt-1" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{l.texto}</p>
          </div>
        ))}

        {/* A raiz comum (Dualidade) — não é ponte, é o que está por baixo de todos */}
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-3 mt-2">
          <p className="text-[0.78rem]"><b className="text-amber-300">A raiz de todos</b> <span className="opacity-50 text-[0.66rem]">· {RAIZ.veu}</span></p>
          <p className="leading-snug text-[0.92rem] mt-1" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{RAIZ.texto}</p>
        </div>

        <p className="text-[0.7rem] opacity-45 mt-6">Valida o retrato do Esforço. Se for assim, preencho os outros 6 da mesma matéria (dos teus manuais), um a um, com o teu sim.</p>
      </div>
    </div>
  );
}
