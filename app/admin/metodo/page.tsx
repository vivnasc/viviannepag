'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA } from '@/lib/metodo/contas';
import { postsDaConta } from '@/lib/metodo/posts';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

type EstadoReel = { slug: string; videoUrl: string | null; agendadoEm: string | null; publicado: boolean };

export default function MetodoPage() {
  const [estado, setEstado] = useState<Record<string, EstadoReel>>({});
  useEffect(() => {
    fetch('/api/admin/metodo/list').then((r) => (r.ok ? r.json() : { estado: {} })).then((j) => setEstado(j.estado ?? {})).catch(() => {});
  }, []);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Método VS · as 3 portas</h1>
        <p className="mt-2 text-[0.9rem] opacity-80 max-w-2xl">
          Ver, Vir, Viver: os três movimentos da mesma travessia. Cada porta vive de reels que entram pela dor (1.ª pessoa) e fecham pela revelação. Pipeline separado da veu.a.veu. O conteúdo flui para Publicar (theme.marca próprio) e exporta para o Metricool.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {CONTAS_LISTA.map((c) => {
            const posts = postsDaConta(c.id);
            const total = posts.length;
            const gerados = posts.filter((p) => estado[p.id]).length;
            return (
              <Link key={c.id} href={`/admin/metodo/${c.id}`} className="block rounded-2xl border border-white/10 p-5 hover:border-white/25 transition-colors" style={{ background: `${c.cor}22` }}>
                <div className="text-xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{c.emoji} {c.handle}</div>
                <div className="text-[0.75rem] opacity-60 mt-0.5">{c.movimento} · {c.essencia}</div>
                <p className="mt-2 text-[0.78rem] opacity-80">{c.depois}</p>
                <div className="mt-3 text-[0.72rem] opacity-60">
                  Símbolo: {c.simbolo}<br />
                  Véus: {c.veus.join(' + ')}<br />
                  Manual: {c.manualNome} (€{c.manualPrecoEur})
                </div>
                <div className="mt-3 text-[0.72rem]">
                  <span className="text-[#EBAE4A]">{gerados}</span><span className="opacity-50">/{total} gerados</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 p-5 text-[0.82rem] opacity-85">
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-2">Como funciona</h2>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Entra numa porta, vê os reels (porta → sala, garimpados dos manuais) e carrega <em>gerar</em>.</li>
            <li>O gerador monta o cinético (frase com motion) com fundo próprio e música Ancient Ground, e grava com a marca da conta.</li>
            <li>Em <Link href="/admin/publicar" className="underline">Publicar</Link>, filtra pela conta, agenda, renderiza o MP4 e exporta o CSV do Metricool.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
