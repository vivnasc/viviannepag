'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Biblioteca ÚNICA de conteúdos: tudo o que geraste num só sítio, com estado
// (gerado → agendado → publicado) e agendamento manual para uma data.

type Slide = { imageUrl?: string | null; gancho?: string; texto?: string; licao?: string };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string };
type Theme = { formato?: string; subtipo?: string; agendadoEm?: string | null; publicado?: boolean };
type Item = { slug: string; title: string; brief?: string; dias: Dia[]; theme: Theme; created_at: string };

// Cada série tem o seu NOME (os reels têm subtipos com nome próprio).
const FMT: Record<string, { emoji: string; label: string; href: string; cor: string }> = {
  banda: { emoji: '🎭', label: 'Cá em Casa', href: '/admin/banda', cor: '#E08496' },
  heroi: { emoji: '🌅', label: 'I am a Hero', href: '/admin/heroi', cor: '#EBAE4A' },
  infografico: { emoji: '📊', label: 'Infográfico', href: '/admin/infografico', cor: '#7E9B8E' },
  aneis: { emoji: '🎞️', label: 'Carrossel', href: '/admin/carrossel-veu', cor: '#B8843D' },
  // reels (por subtipo, cada um com o seu nome)
  kinetico: { emoji: '✨', label: 'Frase com motion', href: '/admin/reels', cor: '#EBAE4A' },
  sinais: { emoji: '🔎', label: 'Sinais de que…', href: '/admin/reels', cor: '#C9B6FA' },
  ninguem: { emoji: '🏮', label: 'O que ninguém te explica', href: '/admin/reels', cor: '#D9CBB4' },
  pergunta: { emoji: '💬', label: 'Pergunta', href: '/admin/reels', cor: '#7E9B8E' },
  glossario: { emoji: '📖', label: 'Glossário da Alma', href: '/admin/reels', cor: '#C9B6FA' },
  pensador: { emoji: '🕯️', label: 'Uma ideia de…', href: '/admin/reels', cor: '#EBAE4A' },
  domingo: { emoji: '🕊️', label: 'Domingo de Luz', href: '/admin/reels', cor: '#EBB7CE' },
  reel: { emoji: '🎬', label: 'Reel', href: '/admin/reels', cor: '#C9B6FA' },
};
// dia da semana de cada tipo (o plano editorial) — para a Vivianne não andar perdida
const DIA_SERIE: Record<string, string> = { kinetico: 'Seg', sinais: 'Ter', ninguem: 'Qua', banda: 'Qui', heroi: 'Sex', infografico: 'Sáb', domingo: 'Dom' };
// ordem canónica do plano (mostra-se SEMPRE, mesmo a zero); extras (Uma ideia…, carrossel) entram depois se existirem
const ORDEM_PLANO = ['kinetico', 'sinais', 'ninguem', 'banda', 'heroi', 'infografico', 'domingo'];
// chave da série: nos reels é o subtipo (o nome real); nos outros, o formato
const tipoChave = (it: Item) => (it.theme?.formato === 'reel' ? (it.theme?.subtipo ?? 'reel') : (it.theme?.formato ?? ''));
const fmtDe = (it: Item) => FMT[tipoChave(it)] ?? { emoji: '•', label: tipoChave(it) || 'outro', href: '#', cor: '#9aa39a' };
const capaDe = (it: Item, capas: Record<string, string> = {}) => (it.dias?.[0]?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? capas[it.theme?.subtipo ?? ''] ?? null;
const estadoDe = (it: Item): 'gerado' | 'agendado' | 'publicado' => it.theme?.publicado ? 'publicado' : it.theme?.agendadoEm ? 'agendado' : 'gerado';
const COR_ESTADO = { gerado: '#9aa39a', agendado: '#EBAE4A', publicado: '#7E9B8E' } as const;

export default function ConteudosPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [fFormato, setFFormato] = useState<string>('todos');
  const [fEstado, setFEstado] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list');
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  const [capasSerie, setCapasSerie] = useState<Record<string, string>>({});
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapasSerie(j.capas ?? {})).catch(() => {}); }, []);

  async function apagar(slug: string) {
    if (!confirm('Apagar este conteúdo? Não dá para desfazer.')) return;
    setItens((prev) => prev.filter((it) => it.slug !== slug));
    await fetch('/api/admin/conteudos/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }).catch(() => {});
  }

  const porFormato = useCallback((k: string) => itens.filter((it) => tipoChave(it) === k).length, [itens]);
  // mostra SEMPRE os 7 do plano (na ordem) + quaisquer extras já gerados (Uma ideia…, carrossel)
  const formatos = useMemo(() => {
    const presentes = Array.from(new Set(itens.map((it) => tipoChave(it)).filter(Boolean))) as string[];
    const extras = presentes.filter((f) => !ORDEM_PLANO.includes(f));
    return [...ORDEM_PLANO, ...extras];
  }, [itens]);
  const filtrados = itens.filter((it) =>
    (fFormato === 'todos' || tipoChave(it) === fFormato) &&
    (fEstado === 'todos' || estadoDe(it) === fEstado) &&
    (!busca.trim() || it.title.toLowerCase().includes(busca.trim().toLowerCase())),
  );

  const cont = { gerado: 0, agendado: 0, publicado: 0 } as Record<string, number>;
  itens.forEach((it) => { cont[estadoDe(it)]++; });

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Conteúdos · Véu a Véu</h1>
          <Link href="/admin/agenda" className="text-[0.7rem] opacity-60 hover:opacity-100">Agenda →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Tudo o que já geraste, num só sítio. Já não anda nada solto. <b>7 tipos no plano da semana</b> (Seg→Dom), cada um com o seu dia.</p>
        <p className="text-[0.74rem] opacity-50 mb-5">{itens.length} conteúdos · {cont.gerado} por agendar · {cont.agendado} agendados · {cont.publicado} publicados. Aqui acedes e baixas; o <Link href="/admin/agenda" className="text-[#C9B6FA] underline">agendamento é na Agenda</Link>.</p>

        {/* filtros */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button onClick={() => setFFormato('todos')} className={`text-[0.7rem] px-3 py-1.5 rounded-full border ${fFormato === 'todos' ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>todos</button>
          {formatos.map((f) => {
            const m = FMT[f] ?? { emoji: '•', label: f };
            const dia = DIA_SERIE[f]; const n = porFormato(f);
            return <button key={f} onClick={() => setFFormato(f)} className={`text-[0.7rem] px-3 py-1.5 rounded-full border ${fFormato === f ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'} ${n === 0 ? 'opacity-45' : ''}`}>{m.emoji} {m.label}{dia ? <span className="opacity-60"> · {dia}</span> : null} <span className="opacity-50">({n})</span></button>;
          })}
          <span className="mx-1 opacity-20">|</span>
          {(['todos', 'gerado', 'agendado', 'publicado'] as const).map((e) => (
            <button key={e} onClick={() => setFEstado(e)} className={`text-[0.66rem] px-2.5 py-1 rounded-full border ${fEstado === e ? 'border-[#C9B6FA] text-[#C9B6FA] bg-[#C9B6FA]/10' : 'border-ocre/20 text-creme-2/60 hover:border-[#C9B6FA]'}`}>{e}</button>
          ))}
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="procurar…" className="ml-auto bg-black/30 border border-ocre/25 rounded-lg px-3 py-1 text-[0.75rem] outline-none focus:border-ambar" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtrados.map((it) => {
            const m = fmtDe(it);
            const capa = capaDe(it, capasSerie);
            const estado = estadoDe(it);
            const d = it.dias?.[0];
            return (
              <div key={it.slug} className="rounded-xl border border-ocre/12 bg-terra/15 p-4 flex gap-4">
                <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-black/30 border border-white/5 grid place-items-center">
                  {capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl opacity-50">{m.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.56rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full" style={{ background: m.cor + '22', color: m.cor }}>{m.emoji} {m.label}{DIA_SERIE[tipoChave(it)] ? ` · ${DIA_SERIE[tipoChave(it)]}` : ''}</span>
                    <span className="text-[0.56rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full" style={{ background: COR_ESTADO[estado] + '22', color: COR_ESTADO[estado] }}>{estado}</span>
                  </div>
                  <h3 className="font-serif text-base leading-tight truncate" title={it.title}>{it.title}</h3>
                  <p className="text-[0.66rem] opacity-45 mb-2">{new Date(it.created_at).toLocaleDateString('pt-PT')}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {capa && <a href={capa} download target="_blank" rel="noopener" className="text-[0.62rem] px-2.5 py-1 rounded-full border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 no-underline">⬇ imagem</a>}
                    {m.href !== '#' && <Link href={m.href} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">abrir →</Link>}
                    {d?.legenda && <button onClick={() => { navigator.clipboard?.writeText([d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n')); }} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar">📋 legenda</button>}
                    <button onClick={() => apagar(it.slug)} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-rosa/30 text-rosa/80 hover:bg-rosa/10">remover</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!filtrados.length && <p className="text-[0.8rem] opacity-50 text-center py-12">Nada aqui ainda. Gera conteúdo nos formatos (cá em casa, i am a hero, reels…) e aparece tudo aqui.</p>}
      </div>
    </div>
  );
}
