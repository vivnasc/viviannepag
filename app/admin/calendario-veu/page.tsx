'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { PLANO_EDITORIAL, PARTES, semanaEditorialAtual } from '@/lib/veu/planoEditorial';
import { CURSOS } from '@/lib/infografico/cursos';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário GLOBAL da veu.a.veu: a jornada de 3 meses (13 semanas), as 4
// matérias entrelaçadas como um só caminho. Holístico, sem repetir tema.

const COR_CURSO: Record<string, string> = {
  transpessoal: '#C9B6FA',
  constelacao: '#EBAE4A',
  espiritualidade: '#7E9B8E',
  desenvolvimento: '#B05C38',
};
const nomeCurso = (id: string) => (CURSOS.find((c) => c.id === id) ?? CURSOS[0]).nome;

export default function CalendarioVeuPage() {
  const atual = useMemo(() => semanaEditorialAtual().semana, []);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Calendário · 3 meses · Véu a Véu</h1>
          <Link href="/admin/plano-semana" className="text-[0.7rem] opacity-60 hover:opacity-100">Plano da semana →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">A jornada didática completa: <b>13 semanas</b>, as 4 matérias <b>entrelaçadas como um só caminho</b> — pertencer, a sombra, as heranças, o sentido. Sem repetir tema.</p>
        <p className="text-[0.76rem] opacity-55 mb-6">Não escolhes nada: cada semana avança sozinha. Hoje estás na <b className="text-ambar">semana {atual}</b>. Toca numa semana para a abrir no Plano.</p>

        {/* legenda das matérias */}
        <div className="flex flex-wrap gap-3 mb-7">
          {CURSOS.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5 text-[0.68rem] opacity-75">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COR_CURSO[c.id] }} />{c.nome}
            </span>
          ))}
        </div>

        {PARTES.map((parte) => {
          const semanas = PLANO_EDITORIAL.filter((s) => s.parte === parte.id);
          if (!semanas.length) return null;
          return (
            <div key={parte.id} className="mb-8">
              <h2 className="font-serif text-xl mb-0.5">{parte.nome}</h2>
              <p className="text-[0.78rem] italic opacity-60 mb-3">{parte.descricao}</p>
              <div className="space-y-2.5">
                {semanas.map((s) => {
                  const cor = COR_CURSO[s.curso] ?? '#C9B6FA';
                  const ehAtual = s.semana === atual;
                  return (
                    <div key={s.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-ambar/60' : 'border-ocre/12'}`} style={{ background: `linear-gradient(135deg, ${cor}12, transparent 60%)` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>sem. {s.semana}</span>
                          <span className="text-[0.62rem] opacity-55">{nomeCurso(s.curso)}</span>
                          {ehAtual && <span className="ml-auto text-[0.58rem] px-2 py-0.5 rounded-full bg-ambar/20 text-ambar">esta semana</span>}
                        </div>
                        <p className="font-serif text-lg leading-tight" style={{ color: cor }}>“{s.mote}”</p>
                        <p className="text-[0.76rem] opacity-65 mb-2">{s.tema}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href="/admin/plano-semana" className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">abrir no Plano →</Link>
                          <Link href={`/admin/heroi?tema=${encodeURIComponent(s.heroi)}`} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10 no-underline" title={s.heroi}>🌅 I am a Hero</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-[0.7rem] opacity-40 text-center mt-2">Ao fim das 13 semanas a jornada recomeça. Podes sempre trocar o tema no Plano da Semana.</p>
      </div>
    </div>
  );
}
