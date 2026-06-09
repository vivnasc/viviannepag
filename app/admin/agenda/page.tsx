'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Agenda da "Véu a Véu" = o ÚNICO sítio de agendamento. Em cada dia pões um post
// JÁ gerado (escolhido da biblioteca Conteúdos), baixas e marcas publicado.
// Geras nos geradores → aparece em Conteúdos → agendas aqui → publicas.

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[] };
type Theme = { formato?: string; agendadoEm?: string | null; publicado?: boolean };
type Item = { slug: string; title: string; dias: Dia[]; theme: Theme };

const FMT: Record<string, { emoji: string; label: string; href: string }> = {
  banda: { emoji: '🎭', label: 'Cá em Casa', href: '/admin/banda' },
  heroi: { emoji: '🌅', label: 'I am a Hero', href: '/admin/heroi' },
  infografico: { emoji: '📊', label: 'Infográfico', href: '/admin/infografico' },
  reel: { emoji: '🎬', label: 'Reel', href: '/admin/reels' },
  aneis: { emoji: '🎞️', label: 'Carrossel', href: '/admin/carrossel-veu' },
};
const fmtDe = (it: Item) => FMT[it.theme?.formato ?? ''] ?? { emoji: '•', label: it.theme?.formato ?? 'outro', href: '#' };
const capaDe = (it: Item) => (it.dias?.[0]?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? null;
// sugestão de formato por dia (só dica, não obriga)
const SUG: Record<number, string> = { 1: '✨ frase', 2: '💡 o que ninguém explica', 3: '🎭 Cá em Casa', 4: '🔎 sinais de que…', 5: '🌅 I am a Hero', 6: '📊 infográfico', 0: '' };
const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const HORA = '20:00';

export default function AgendaPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [picker, setPicker] = useState<string | null>(null); // iso do dia a preencher

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list');
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function patch(slug: string, p: { agendadoEm?: string | null; publicado?: boolean }) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, ...p } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...p }) }).catch(() => {});
  }

  // próximos 7 dias a partir de AMANHÃ
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dias = Array.from({ length: 7 }).map((_, i) => { const d = new Date(hoje); d.setDate(d.getDate() + 1 + i); return d; });

  const porAgendar = itens.filter((it) => !it.theme?.agendadoEm); // disponíveis para pôr num dia
  const totalAgendados = itens.filter((it) => it.theme?.agendadoEm).length;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Agenda · Véu a Véu</h1>
          <Link href="/admin/conteudos" className="text-[0.7rem] opacity-60 hover:opacity-100">Biblioteca →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1"><b>1 post por dia</b> (~20h). Domingo descansas. Aqui pões os posts que <b>já geraste</b>, baixas e marcas publicado.</p>
        <p className="text-[0.74rem] opacity-50 mb-6">Fluxo: geras (cá em casa, i am a hero, reels…) → aparece em <Link href="/admin/conteudos" className="text-[#C9B6FA] underline">Conteúdos</Link> → <b>escolhes o dia aqui</b> → publicas e marcas ✓. {porAgendar.length} por agendar · {totalAgendados} agendados.</p>

        <div className="space-y-3">
          {dias.map((d) => {
            const wd = d.getDay();
            const iso = isoLocal(d);
            const doDia = itens.filter((it) => it.theme?.agendadoEm === iso);
            const dataLabel = `${DIAS_PT[wd]} · ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            const descanso = wd === 0;
            return (
              <div key={iso} className="rounded-xl border border-ocre/12 bg-terra/15 overflow-hidden">
                <div className="px-4 py-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#C9B6FA] border-b border-ocre/10">
                  {dataLabel}
                  {!descanso && <span className="ml-auto normal-case tracking-normal text-[0.62rem] opacity-40">{SUG[wd]}</span>}
                </div>

                {descanso ? (
                  <div className="flex items-center gap-3 px-4 py-3 opacity-60"><span className="text-xl">🌙</span><span className="text-[0.92rem]">Descanso</span></div>
                ) : (
                  <div className="p-3 space-y-2">
                    {doDia.map((it) => {
                      const m = fmtDe(it); const capa = capaDe(it);
                      return (
                        <div key={it.slug} className="flex items-center gap-3 rounded-lg bg-black/20 border border-white/5 p-2">
                          <span className="text-[0.66rem] font-mono opacity-50 w-10 shrink-0">{HORA}</span>
                          <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                          <span className={`flex-1 min-w-0 truncate text-[0.88rem] ${it.theme?.publicado ? 'line-through opacity-50' : ''}`} title={it.title}>{it.title}</span>
                          {m.href !== '#' && <Link href={m.href} className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-ocre/25 text-creme-2/65 hover:border-ambar hover:text-ambar no-underline">baixar</Link>}
                          <button onClick={() => patch(it.slug, { publicado: !it.theme?.publicado })} className={`shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border ${it.theme?.publicado ? 'border-salvia/50 bg-salvia/15 text-salvia' : 'border-ocre/25 text-creme-2/60 hover:border-salvia'}`}>{it.theme?.publicado ? '✓ publicado' : 'marcar'}</button>
                          <button onClick={() => patch(it.slug, { agendadoEm: null })} className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-rosa/25 text-rosa/70 hover:bg-rosa/10" title="tirar deste dia">✕</button>
                        </div>
                      );
                    })}
                    <button onClick={() => setPicker(iso)} className="w-full text-[0.7rem] py-2 rounded-lg border border-dashed border-ambar/40 text-ambar/90 hover:bg-ambar/10">+ escolher post para este dia</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-45 mt-6 text-center">Os posts vêm da biblioteca Conteúdos. Sem nada para agendar? Gera primeiro nos formatos.</p>
      </div>

      {/* seletor de post para um dia */}
      {picker && (
        <div onClick={() => setPicker(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-5 ${cormorant.variable} ${inter.variable}`}>
            <p className="text-[0.8rem] mb-3">Escolhe um post para <b>{picker.split('-').reverse().join('/')}</b> <span className="opacity-50">(só os ainda não agendados)</span></p>
            <div className="space-y-2">
              {porAgendar.length === 0 && <p className="text-[0.78rem] opacity-55 py-6 text-center">Não há posts por agendar. Gera nos formatos e volta aqui.</p>}
              {porAgendar.map((it) => {
                const m = fmtDe(it); const capa = capaDe(it);
                return (
                  <button key={it.slug} onClick={() => { patch(it.slug, { agendadoEm: picker }); setPicker(null); }} className="w-full flex items-center gap-3 rounded-lg border border-white/8 hover:border-ambar/50 bg-black/20 p-2 text-left">
                    <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                    <span className="text-[0.56rem] uppercase tracking-[0.12em] opacity-60 shrink-0">{m.emoji} {m.label}</span>
                    <span className="flex-1 min-w-0 truncate text-[0.84rem]">{it.title}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPicker(null)} className="mt-4 text-[0.7rem] px-3 py-1.5 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
