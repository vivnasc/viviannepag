'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { KineticSlide } from '@/components/admin/KineticSlide';
import { getConta } from '@/lib/metodo/contas';
import { Reel, reelsDaConta, fraseDoReel, destaqueDe, fundoPrompt } from '@/lib/metodo/reels';
import { legendaDoReel, hashtagsDoReel } from '@/lib/metodo/legenda';
import { aberturaDaConta, ehManifesto, legendaManifesto } from '@/lib/metodo/abertura';
import { agendarAbertura } from '@/lib/metodo/agenda';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type EstadoReel = { slug: string; videoUrl: string | null; agendadoEm: string | null; publicado: boolean; criadoEm: string | null };

// Pré-visualização animada do cinético (loop suave), paleta do método (autora).
function KineticPreview({ texto, destaque, imageUrl }: { texto: string; destaque?: string[]; imageUrl?: string }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    let raf = 0; let t0 = 0; const CICLO = 7000;
    const tick = (t: number) => { if (!t0) t0 = t; const e = ((t - t0) % CICLO) / CICLO; setProg(Math.min(1, e / 0.78)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, []);
  return <KineticSlide texto={texto} destaque={destaque} imageUrl={imageUrl} mundo="autora" prog={prog} />;
}

export default function MetodoContaPage() {
  const params = useParams<{ conta: string }>();
  const conta = getConta(params.conta);
  const [estado, setEstado] = useState<Record<string, EstadoReel>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/list').then((r) => (r.ok ? r.json() : { estado: {} })).then((j) => setEstado(j.estado ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async (reelId: string) => {
    setBusy(reelId); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reelId }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg(`Gerado: ${j.slug}. Vai a Publicar para agendar, renderizar o MP4 e exportar.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [recarregar]);

  const gerarTudo = useCallback(async (reels: Reel[]) => {
    for (const r of reels) { await gerar(r.id); }
  }, [gerar]);

  if (!conta) {
    return <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-8`}>
      <p>Conta desconhecida. <Link className="underline" href="/admin/metodo">Voltar</Link></p>
    </main>;
  }

  const sequencia = aberturaDaConta(conta.id);
  const seqIds = new Set(sequencia.map((r) => r.id));
  const resto = reelsDaConta(conta.id).filter((r) => !seqIds.has(r.id));
  const agenda = agendarAbertura(conta.id);
  const agendaPorReel = Object.fromEntries(agenda.map((a) => [a.reel.id, a]));

  const fraseDe = (r: Reel) => fraseDoReel(r);
  const legendaDe = (r: Reel) => (ehManifesto(r.id) ? legendaManifesto(conta.id) : legendaDoReel(r, conta));

  const ReelCard = ({ r, ordem }: { r: Reel; ordem?: number }) => {
    const st = estado[r.id];
    const ag = agendaPorReel[r.id];
    const gerado = Boolean(st);
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col md:flex-row gap-4 p-4">
        <div className="w-full md:w-[210px] shrink-0">
          <KineticPreview texto={fraseDe(r)} destaque={destaqueDe(r)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-[0.68rem] uppercase tracking-wider opacity-70">
            {ehManifesto(r.id) ? <span className="px-2 py-0.5 rounded-full" style={{ background: conta.cor }}>Manifesto</span> : <span className="px-2 py-0.5 rounded-full bg-white/10">Véu d{r.veu === 'Esforço' || r.veu === 'Horizonte' || r.veu === 'Turbilhão' ? 'o' : 'a'} {r.veu}</span>}
            {typeof ordem === 'number' && <span className="opacity-50">#{ordem + 1}</span>}
            <span className="opacity-40 normal-case tracking-normal">{r.fonte}</span>
          </div>
          <p className="mt-2 text-[1.05rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            <span className="opacity-95">{r.porta}</span>{' '}
            <span style={{ color: '#EBAE4A' }} className="italic">{r.sala}</span>
          </p>
          <details className="mt-2 text-[0.78rem] opacity-80">
            <summary className="cursor-pointer opacity-70">legenda + hashtags + fundo</summary>
            <pre className="whitespace-pre-wrap mt-1 text-[0.74rem] opacity-90">{legendaDe(r)}</pre>
            <p className="mt-1 text-[0.72rem] opacity-70">{hashtagsDoReel(r).join(' ')}</p>
            <p className="mt-2 text-[0.7rem] opacity-50">fundo: {fundoPrompt(r)}</p>
          </details>
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[0.72rem]">
            <button
              onClick={() => gerar(r.id)}
              disabled={busy === r.id}
              className="px-3 py-1.5 rounded-lg border border-[#EBAE4A]/50 text-[#EBAE4A] disabled:opacity-40"
            >
              {busy === r.id ? 'a gerar…' : gerado ? 'regenerar' : 'gerar'}
            </button>
            {gerado && <span className="text-emerald-300/80">gerado{st?.videoUrl ? ' · MP4 pronto' : ' · falta render'}</span>}
            {ag && <span className="opacity-60">agenda: {ag.data} {ag.hora}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: `${conta.cor}22` }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            {conta.emoji} {conta.handle} <span className="opacity-60 text-base">· {conta.movimento}, {conta.essencia}</span>
          </h1>
          <p className="mt-2 text-[0.9rem] opacity-85">{conta.depois}</p>
          <p className="mt-1 text-[0.78rem] opacity-60">Símbolo: {conta.simbolo} · Véus: {conta.veus.join(' + ')} · Vende: {conta.manualNome} (€{conta.manualPrecoEur})</p>
          <p className="mt-2 text-[0.78rem] opacity-70 italic">{conta.bioPT}</p>
          <div className="mt-3 flex gap-2 flex-wrap text-[0.72rem]">
            <button onClick={() => gerarTudo(sequencia)} className="px-3 py-1.5 rounded-lg border border-[#EBAE4A]/50 text-[#EBAE4A]">gerar toda a abertura ({sequencia.length})</button>
            <Link href="/admin/publicar" className="px-3 py-1.5 rounded-lg border border-white/20">abrir no Publicar →</Link>
          </div>
        </header>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">Sequência de abertura</h2>
        <div className="space-y-3">
          {sequencia.map((r, i) => <ReelCard key={r.id} r={r} ordem={i} />)}
        </div>

        {resto.length > 0 && <>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mt-8 mb-3">Biblioteca (mais reels desta porta)</h2>
          <div className="space-y-3">
            {resto.map((r) => <ReelCard key={r.id} r={r} />)}
          </div>
        </>}
      </div>
    </main>
  );
}
