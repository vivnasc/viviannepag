'use client';
/* eslint-disable @next/next/no-img-element */

// TESTADOR DO BARALHO "Sou Aquela" — como o testador de capas dos romances.
// Por personagem: gera FIGURAS candidatas (carta de baralho) e escolhe a DEFINITIVA.
// A escolhida fica fixa (a geração da carta usa-a). A mensagem é gerada à parte.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FAMILIAS } from '@/lib/metodo/personagens';
import { cartaDoBaralho } from '@/lib/metodo/baralho';

const FONTS = 'font-[system-ui]';
const COR = '#d8b25a';

export default function BaralhoPage() {
  const [figuras, setFiguras] = useState<Record<string, string>>({});
  const [cand, setCand] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/baralho-figura').then((r) => (r.ok ? r.json() : { figuras: {} })).then((j) => setFiguras(j.figuras ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async (id: string) => {
    if (busy) return;
    setBusy(id); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/baralho-figura', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personagemId: id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setCand((c) => ({ ...c, [id]: [j.url, ...(c[id] ?? [])].slice(0, 6) }));
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy]);

  const escolher = useCallback(async (id: string, url: string) => {
    if (busy) return;
    setBusy(id); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/baralho-figura', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personagemId: id, url, escolher: true }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setFiguras((f) => ({ ...f, [id]: j.url }));
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy]);

  const totalEscolhidas = Object.keys(figuras).length;

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/metodo/mae-plano" className="text-[0.75rem] opacity-60 hover:opacity-100">← Plano da semana</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: '#1a1726' }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: COR }}>Baralho · testar as figuras</h1>
          <p className="mt-2 text-[0.85rem] opacity-85">Como o testador de capas: por personagem, <b>gera figuras</b> de carta de baralho e <b>escolhe a definitiva</b>. A figura escolhida fica fixa dessa carta; a mensagem é gerada à parte (da semente). Figuras escolhidas: <b style={{ color: COR }}>{totalEscolhidas}</b>.</p>
          {erro && <p className="mt-2 text-[0.8rem] text-rose-300">{erro}</p>}
        </header>

        {FAMILIAS.map((f) => (
          <section key={f.id} className="mb-8">
            <h2 className="text-[0.78rem] uppercase tracking-widest mb-3" style={{ color: COR }}>{f.nome}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {f.personagens.map((p) => {
                const escolhida = figuras[p.id];
                const candidatas = cand[p.id] ?? [];
                const semente = cartaDoBaralho(p.id);
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[0.85rem]" style={{ color: COR }}>{p.nome}</span>
                      {escolhida && <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200">✓ definitiva</span>}
                    </div>
                    <div className="flex gap-2 mb-2">
                      {/* a definitiva (grande) */}
                      <div className="w-[96px] shrink-0">
                        {escolhida
                          ? <img src={escolhida} alt={p.nome} className="w-full aspect-[9/16] object-cover rounded-lg border border-emerald-400/40" />
                          : <div className="w-full aspect-[9/16] rounded-lg border border-dashed border-white/15 grid place-items-center text-[0.55rem] opacity-40 text-center px-1">sem figura definitiva</div>}
                      </div>
                      {/* candidatas geradas nesta sessão */}
                      <div className="flex-1 grid grid-cols-3 gap-1.5 content-start">
                        {candidatas.map((u, i) => (
                          <button key={i} onClick={() => escolher(p.id, u)} title="escolher esta como definitiva" className="block">
                            <img src={u} alt="candidata" className="w-full aspect-[9/16] object-cover rounded-md border border-white/15 hover:border-[#d8b25a]" />
                            <span className="block text-center text-[0.5rem] opacity-50 mt-0.5">escolher</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => gerar(p.id)} disabled={busy === p.id} className="w-full px-2.5 py-1.5 rounded-lg border border-white/25 text-[0.72rem] disabled:opacity-40">{busy === p.id ? 'a gerar…' : '+ gerar figura'}</button>
                    {semente.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[0.6rem] opacity-50 cursor-pointer">ver a semente (a voz dela)</summary>
                        <div className="mt-1 text-[0.72rem] opacity-70 leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                          {semente.map((l, i) => <div key={i} className={i === semente.length - 1 ? 'italic' : ''}>{l}</div>)}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
