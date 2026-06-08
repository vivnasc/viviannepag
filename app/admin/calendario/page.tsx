'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CALENDARIO_ANUAL, intervaloDatas, type Estacao } from '@/lib/carrossel/calendario';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário ANUAL temático da Véu a Véu (hemisfério sul). Cada semana é um
// território da alma, alinhado à estação. Tu vês o que já trataste, o que falta,
// e o que assenta à época. Cada semana liga aos geradores com o tema pré-cheio.

const ESTACOES: { id: Estacao | 'todas'; nome: string; cor: string }[] = [
  { id: 'todas', nome: 'ano inteiro', cor: '#C9B6FA' },
  { id: 'verao', nome: 'verão', cor: '#EBAE4A' },
  { id: 'outono', nome: 'outono', cor: '#B05C38' },
  { id: 'inverno', nome: 'inverno', cor: '#8FA7C9' },
  { id: 'primavera', nome: 'primavera', cor: '#7E9B8E' },
];
const COR_EST: Record<Estacao, string> = { verao: '#EBAE4A', outono: '#B05C38', inverno: '#8FA7C9', primavera: '#7E9B8E' };
const NOME_EST: Record<Estacao, string> = { verao: 'verão', outono: 'outono', inverno: 'inverno', primavera: 'primavera' };

function semanaAtual(): number {
  const hoje = new Date();
  const ano = hoje.getUTCFullYear();
  const d = new Date(Date.UTC(ano, 0, 1));
  const dow = d.getUTCDay() || 7;
  if (dow !== 1) d.setUTCDate(d.getUTCDate() + (8 - dow));
  const diff = Math.floor((Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()) - d.getTime()) / (7 * 864e5));
  return Math.min(52, Math.max(1, diff + 1));
}

export default function CalendarioPage() {
  const ano = new Date().getFullYear();
  const atual = useMemo(() => semanaAtual(), []);
  const estacaoAtual = CALENDARIO_ANUAL.find((w) => w.semana === atual)?.estacao ?? 'verao';
  const [filtro, setFiltro] = useState<Estacao | 'todas'>(estacaoAtual);
  const [feitos, setFeitos] = useState<Record<number, boolean>>({});
  useEffect(() => { try { const s = localStorage.getItem('veu-cal-feitos'); if (s) setFeitos(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('veu-cal-feitos', JSON.stringify(feitos)); } catch {} }, [feitos]);

  const toggle = (n: number) => setFeitos((p) => ({ ...p, [n]: !p[n] }));
  const feitosCount = Object.values(feitos).filter(Boolean).length;
  const semanas = CALENDARIO_ANUAL.filter((w) => filtro === 'todas' || w.estacao === filtro);

  // gerar em bulk o pacote da semana (sobre o tema da semana)
  const [bulk, setBulk] = useState<number | null>(null);
  const [bulkMsg, setBulkMsg] = useState<string>('');
  async function gerarSemana(semana: number, tema: string, subtitulo: string) {
    if (bulk !== null) return;
    setBulk(semana); setBulkMsg('');
    const t = `${tema}. ${subtitulo}`;
    const calls = [
      { nome: 'Frase com motion', url: '/api/admin/reels/gerar', body: { tema: t, formato: 'kinetico', curso: 'transpessoal' } },
      { nome: 'Reel', url: '/api/admin/reels/gerar', body: { tema: t, formato: 'ninguem', curso: 'transpessoal' } },
      { nome: 'Cá em Casa', url: '/api/admin/banda/gerar', body: { tema: t } },
      { nome: 'Infográfico', url: '/api/admin/infografico/gerar', body: { tema: t, curso: 'transpessoal' } },
    ];
    let ok = 0; let ultimoErro = '';
    for (const c of calls) {
      setBulkMsg(`a gerar ${c.nome}… (${ok}/${calls.length})`);
      try {
        const r = await fetch(c.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(c.body) });
        if (r.ok) ok++; else { const j = await r.json().catch(() => ({})); ultimoErro = (j.erro ?? r.status) + ''; }
      } catch (e) { ultimoErro = String(e); }
    }
    setBulk(null);
    setBulkMsg(ok === calls.length
      ? `Semana ${semana} gerada: ${ok} peças. Vê em Reels, Cá em Casa e Infográficos para pores as imagens e descarregar.`
      : `Semana ${semana}: ${ok} de ${calls.length} geradas${ultimoErro ? ` (erro: ${ultimoErro})` : ''}.`);
  }

  const link = (base: string, tema: string, extra = '') => `${base}?tema=${encodeURIComponent(tema)}${extra}`;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Calendário · Véu a Véu</h1>
          <Link href="/admin/agenda" className="text-[0.7rem] opacity-60 hover:opacity-100">Agenda da semana →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">A jornada do ano, semana a semana. Cada tema acompanha a <b>estação</b> (hemisfério sul). Tu escolhes o que tratar e marcas o que já fizeste.</p>
        <p className="text-[0.74rem] opacity-50 mb-5">Estamos na <b style={{ color: COR_EST[estacaoAtual] }}>semana {atual} · {NOME_EST[estacaoAtual]}</b>. {feitosCount} de 52 semanas tratadas.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {ESTACOES.map((e) => (
            <button key={e.id} onClick={() => setFiltro(e.id)} className={`text-[0.7rem] px-3 py-1.5 rounded-full border ${filtro === e.id ? 'text-[#0F0F1A]' : 'text-creme-2/70 hover:opacity-100'}`} style={filtro === e.id ? { background: e.cor, borderColor: e.cor } : { borderColor: e.cor + '66' }}>{e.nome}</button>
          ))}
        </div>

        <div className="space-y-3">
          {semanas.map((w) => {
            const feito = !!feitos[w.semana];
            const cor = COR_EST[w.estacao];
            const ehAtual = w.semana === atual;
            return (
              <div key={w.semana} className={`rounded-xl border overflow-hidden ${ehAtual ? 'border-[#C9B6FA]/60' : 'border-ocre/12'} ${feito ? 'opacity-50' : ''}`} style={{ background: `linear-gradient(135deg, ${cor}10, transparent 60%)` }}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full" style={{ background: cor + '22', color: cor }}>sem. {w.semana} · {NOME_EST[w.estacao]}</span>
                    <span className="text-[0.62rem] opacity-45">{intervaloDatas(w.semana, ano)}</span>
                    {ehAtual && <span className="text-[0.58rem] px-2 py-0.5 rounded-full bg-[#C9B6FA]/20 text-[#C9B6FA]">esta semana</span>}
                    <button onClick={() => toggle(w.semana)} className={`ml-auto text-[0.62rem] px-2.5 py-1 rounded-full border ${feito ? 'border-salvia/50 bg-salvia/15 text-salvia' : 'border-ocre/25 text-creme-2/60 hover:border-salvia'}`}>{feito ? '✓ tratada' : 'marcar'}</button>
                  </div>
                  <h3 className="font-serif text-xl leading-tight" style={{ color: cor }}>{w.tema}</h3>
                  <p className="text-[0.85rem] italic opacity-75 mb-3">{w.subtitulo}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => gerarSemana(w.semana, w.tema, w.subtitulo)} disabled={bulk !== null} className="text-[0.66rem] px-3 py-1.5 rounded-full border border-[#C9B6FA] text-[#C9B6FA] bg-[#C9B6FA]/10 hover:bg-[#C9B6FA]/20 disabled:opacity-40">{bulk === w.semana ? 'a gerar a semana…' : '⚡ gerar a semana toda'}</button>
                    {bulkMsg && (bulk === w.semana || bulkMsg.startsWith(`Semana ${w.semana} `) || bulkMsg.startsWith(`Semana ${w.semana}:`)) && <span className="text-[0.62rem] text-salvia">{bulkMsg}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={link('/admin/reels', w.tema, '&formato=kinetico')} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10 no-underline">✨ Frase com motion</Link>
                    <Link href={link('/admin/reels', w.tema)} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">🔎 Reel</Link>
                    <Link href={link('/admin/banda', w.tema)} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">🎭 Cá em Casa</Link>
                    <Link href={link('/admin/carrossel-veu', w.tema)} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">🎞️ Carrossel</Link>
                    <Link href={link('/admin/infografico', w.tema)} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar hover:text-ambar no-underline">📊 Infográfico</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
