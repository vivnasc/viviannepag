'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Agenda da conta "Véu a Véu". O teu planeador interno: 1 post/dia (~20h),
// gestão MANUAL (geras aqui, publicas à mão), marca como publicado. Sem custos.

type Tipo = { emoji: string; nome: string; href: string };
const T = {
  motion: { emoji: '✨', nome: 'Frase com motion', href: '/admin/reels' },
  sinais: { emoji: '🔎', nome: 'Sinais de que…', href: '/admin/reels' },
  ninguem: { emoji: '💡', nome: 'O que ninguém te explica', href: '/admin/reels' },
  glossario: { emoji: '📖', nome: 'Glossário / Padrões', href: '/admin/carrossel-veu' },
  pensador: { emoji: '🕯️', nome: 'Uma ideia de…', href: '/admin/reels' },
  pergunta: { emoji: '💬', nome: 'Pergunta', href: '/admin/reels' },
  banda: { emoji: '🎭', nome: 'Cá em Casa', href: '/admin/banda' },
  info: { emoji: '📊', nome: 'Infográfico', href: '/admin/infografico' },
} as const satisfies Record<string, Tipo>;

// 1 post por dia. Os tipos rodam ao longo da semana (o ✨ que mais rende repete).
const RITMO: Record<number, Tipo | null> = {
  1: T.motion,    // 2ª
  2: T.ninguem,   // 3ª
  3: T.banda,     // 4ª
  4: T.sinais,    // 5ª
  5: T.motion,    // 6ª (repete, é o que mais rende)
  6: T.info,      // sáb
  0: null,        // dom — descanso
};
const HORA = '20:00';
const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export default function AgendaPage() {
  const [feitos, setFeitos] = useState<Record<string, boolean>>({});
  useEffect(() => { try { const s = localStorage.getItem('veu-agenda-feitos'); if (s) setFeitos(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('veu-agenda-feitos', JSON.stringify(feitos)); } catch {} }, [feitos]);

  // próximos 7 dias a partir de AMANHÃ
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dias = Array.from({ length: 7 }).map((_, i) => { const d = new Date(hoje); d.setDate(d.getDate() + 1 + i); return d; });

  const toggle = (k: string) => setFeitos((p) => ({ ...p, [k]: !p[k] }));
  const totalFeitos = Object.values(feitos).filter(Boolean).length;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Agenda · Véu a Véu</h1>
          <Link href="/admin/plano-semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Ver as frases da semana →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1"><b>1 post por dia</b> (~20h, sempre à mesma hora). Domingo descansas.</p>
        <p className="text-[0.74rem] opacity-60 mb-1">Queres ver o que vai sair? Abre o <Link href="/admin/plano-semana" className="text-[#C9B6FA] underline">Plano da Semana</Link> e lê as 6 frases reais antes de gerar.</p>
        <p className="text-[0.74rem] opacity-50 mb-6">Geras aqui → descarregas → publicas no Instagram → marcas ✓. Próximos 7 dias a partir de amanhã.</p>

        <div className="space-y-3">
          {dias.map((d) => {
            const wd = d.getDay();
            const t = RITMO[wd];
            const iso = d.toISOString().slice(0, 10);
            const k = iso; const feito = !!feitos[k];
            const dataLabel = `${DIAS_PT[wd]} · ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            return (
              <div key={iso} className={`rounded-xl border border-ocre/12 bg-terra/15 overflow-hidden ${feito ? 'opacity-45' : ''}`}>
                <div className="px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#C9B6FA] border-b border-ocre/10">{dataLabel}</div>
                {t ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-[0.72rem] font-mono opacity-60 w-12 shrink-0">{HORA}</span>
                    <span className="text-xl shrink-0">{t.emoji}</span>
                    <span className={`flex-1 text-[0.92rem] ${feito ? 'line-through' : ''}`}>{t.nome}</span>
                    <Link href={t.href} className="shrink-0 text-[0.64rem] px-2.5 py-1 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10 no-underline">gerar →</Link>
                    <button onClick={() => toggle(k)} className={`shrink-0 text-[0.64rem] px-2.5 py-1 rounded-full border ${feito ? 'border-salvia/50 bg-salvia/15 text-salvia' : 'border-ocre/25 text-creme-2/60 hover:border-salvia'}`}>{feito ? '✓ publicado' : 'marcar'}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 opacity-60">
                    <span className="text-xl shrink-0">🌙</span>
                    <span className="flex-1 text-[0.92rem]">Descanso</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-45 mt-6 text-center">{totalFeitos} publicados marcados · a agenda repete-se todas as semanas</p>

        <div className="rounded-xl border border-ambar/20 bg-ambar/5 p-4 mt-6">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ambar mb-2">Ritmo</p>
          <p className="text-[0.8rem] leading-relaxed opacity-85"><b>1 post por dia</b> é o sustentável para uma conta nova feita por ti. Os 5 tipos rodam ao longo da semana, não publicas todos no mesmo dia. Falhar é pior do que postar menos: melhor 1 por dia sempre do que 2 e desistir.</p>
        </div>
      </div>
    </div>
  );
}
