'use client';
/* eslint-disable @next/next/no-img-element */

// TESTADOR DO BARALHO "Sou Aquela" — como o testador de capas dos romances.
// Por personagem: gera FIGURAS candidatas (carta de baralho) e escolhe a DEFINITIVA.
// A escolhida fica fixa (a geração da carta usa-a). A mensagem é gerada à parte.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FAMILIAS } from '@/lib/metodo/personagens';
import { cartaDoBaralho, CARTAS_ESPECIAIS } from '@/lib/metodo/baralho';

const FONTS = 'font-[system-ui]';
const COR = '#d8b25a';

// O NOME da carta é escrito pela APP por cima da figura (tipografia fixa) — nunca
// pelo Flux (que o escreve com erros e estilo variável). Lookup id -> nome.
const NOMES: Record<string, string> = {
  ...Object.fromEntries(FAMILIAS.flatMap((f) => f.personagens).map((p) => [p.id, p.nome])),
  ...Object.fromEntries(CARTAS_ESPECIAIS.map((c) => [c.id, c.nome])),
};
function CardNome({ nome }: { nome: string }) {
  return (
    <span className="absolute left-1/2 -translate-x-1/2 bottom-[6%] px-2 py-0.5 rounded-sm text-center leading-tight pointer-events-none" style={{ background: 'rgba(15,15,26,0.92)', border: `1px solid ${COR}`, color: COR, fontFamily: 'var(--font-cormorant), serif', fontSize: '0.62rem', maxWidth: '84%' }}>{nome}</span>
  );
}

export default function BaralhoPage() {
  const [figuras, setFiguras] = useState<Record<string, string>>({});
  const [cand, setCand] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [aplicarBusy, setAplicarBusy] = useState(false);
  const [zoom, setZoom] = useState<{ id: string; url: string; def?: boolean } | null>(null);

  const aplicar = useCallback(async () => {
    if (aplicarBusy) return;
    setAplicarBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/aplicar-figuras', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(j.semFiguras ? 'Ainda não há figuras escolhidas.' : `${j.aplicadas ?? 0} carta(s) atualizada(s) com a figura escolhida.`);
    } catch (e) { setErro(String(e)); }
    finally { setAplicarBusy(false); }
  }, [aplicarBusy]);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/baralho-figura').then((r) => (r.ok ? r.json() : { figuras: {}, candidatas: {} })).then((j) => { setFiguras(j.figuras ?? {}); setCand(j.candidatas ?? {}); }).catch(() => {});
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
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[0.75rem]">
            <button onClick={aplicar} disabled={aplicarBusy} title="mete as figuras escolhidas nas cartas que já geraste (sem gerar imagem nova, sem custo)" className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: COR, color: COR }}>{aplicarBusy ? 'a aplicar…' : '↪ aplicar figuras às cartas já geradas'}</button>
            {msg && <span className="text-emerald-300">{msg}</span>}
          </div>
          {erro && <p className="mt-2 text-[0.8rem] text-rose-300">{erro}</p>}
        </header>

        {FAMILIAS.map((f) => (
          <section key={f.id} className="mb-8">
            <h2 className="text-[0.78rem] uppercase tracking-widest mb-3" style={{ color: COR }}>{f.nome}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {f.personagens.map((p) => {
                const escolhida = figuras[p.id];
                const candidatas = cand[p.id] ?? [];
                const semente = cartaDoBaralho(p.id);
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[0.9rem]" style={{ color: COR }}>{p.nome}</span>
                      {escolhida && <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200">✓ definitiva</span>}
                    </div>
                    {/* a DEFINITIVA, grande (clica para ampliar) */}
                    {escolhida
                      ? <button onClick={() => setZoom({ id: p.id, url: escolhida, def: true })} className="block w-[170px] mx-auto"><div className="relative"><img src={escolhida} alt={p.nome} className="w-full aspect-[9/16] object-cover rounded-lg border border-emerald-400/50" /><CardNome nome={p.nome} /></div><span className="block text-center text-[0.55rem] text-emerald-200/80 mt-0.5">definitiva · clica p/ ampliar</span></button>
                      : <div className="w-[170px] mx-auto aspect-[9/16] rounded-lg border border-dashed border-white/15 grid place-items-center text-[0.6rem] opacity-40 text-center px-2">sem figura definitiva ainda</div>}
                    {/* CANDIDATAS geradas (grandes, scroll lateral; clica para ver/escolher) */}
                    {candidatas.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1">candidatas (clica para ver grande)</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {candidatas.map((u, i) => (
                            <button key={i} onClick={() => setZoom({ id: p.id, url: u })} title="ver grande e escolher" className="shrink-0 w-[110px]">
                              <div className="relative"><img src={u} alt="candidata" className="w-full aspect-[9/16] object-cover rounded-md border border-white/15 hover:border-[#d8b25a]" /><CardNome nome={p.nome} /></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => gerar(p.id)} disabled={busy === p.id} className="mt-3 w-full px-2.5 py-1.5 rounded-lg border border-white/25 text-[0.75rem] disabled:opacity-40">{busy === p.id ? 'a gerar…' : '+ gerar figura'}</button>
                    {semente.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[0.6rem] opacity-50 cursor-pointer">ver a semente (a voz dela)</summary>
                        <div className="mt-1 text-[0.75rem] opacity-70 leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
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

        {/* CARTAS DE FECHO (fora do baralho diário): a carta-coração e a carta final.
            Pose travada, figura geram-se/escolhem-se aqui; as linhas escreves tu. */}
        <section className="mb-8">
          <h2 className="text-[0.78rem] uppercase tracking-widest mb-1" style={{ color: COR }}>Cartas de fecho · fora do baralho diário</h2>
          <p className="text-[0.72rem] opacity-60 mb-3">A carta-coração (a viragem) e a carta final (a chegada). Pose travada; as linhas (frente/verso) escreves tu.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CARTAS_ESPECIAIS.map((p) => {
              const escolhida = figuras[p.id];
              const candidatas = cand[p.id] ?? [];
              return (
                <div key={p.id} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(216,178,90,0.05)' }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[0.9rem]" style={{ color: COR }}>{p.nome}</span>
                    {escolhida && <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200">✓ definitiva</span>}
                  </div>
                  <span className="block text-[0.55rem] uppercase tracking-wider opacity-50 mb-2">{p.papel === 'carta-coracao' ? 'carta-coração' : 'carta final'}</span>
                  {escolhida
                    ? <button onClick={() => setZoom({ id: p.id, url: escolhida, def: true })} className="block w-[170px] mx-auto"><div className="relative"><img src={escolhida} alt={p.nome} className="w-full aspect-[9/16] object-cover rounded-lg border border-emerald-400/50" /><CardNome nome={p.nome} /></div><span className="block text-center text-[0.55rem] text-emerald-200/80 mt-0.5">definitiva · clica p/ ampliar</span></button>
                    : <div className="w-[170px] mx-auto aspect-[9/16] rounded-lg border border-dashed border-white/15 grid place-items-center text-[0.6rem] opacity-40 text-center px-2">sem figura definitiva ainda</div>}
                  {candidatas.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1">candidatas (clica para ver grande)</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {candidatas.map((u, i) => (
                          <button key={i} onClick={() => setZoom({ id: p.id, url: u })} title="ver grande e escolher" className="shrink-0 w-[110px]">
                            <div className="relative"><img src={u} alt="candidata" className="w-full aspect-[9/16] object-cover rounded-md border border-white/15 hover:border-[#d8b25a]" /><CardNome nome={p.nome} /></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => gerar(p.id)} disabled={busy === p.id} className="mt-3 w-full px-2.5 py-1.5 rounded-lg border border-white/25 text-[0.75rem] disabled:opacity-40">{busy === p.id ? 'a gerar…' : '+ gerar figura'}</button>
                  <details className="mt-2">
                    <summary className="text-[0.6rem] opacity-50 cursor-pointer">ver a pose travada</summary>
                    <div className="mt-1 text-[0.75rem] opacity-70 leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{p.pose}</div>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* LIGHTBOX: ver a figura GRANDE e escolher (não dá para escolher minúsculo) */}
      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] max-h-[92vh] overflow-y-auto text-center">
            <div className="relative mb-3"><img src={zoom.url} alt="figura" className="w-full rounded-xl border border-white/20" />{NOMES[zoom.id] && <CardNome nome={NOMES[zoom.id]} />}</div>
            <div className="flex items-center justify-center gap-2 text-[0.8rem]">
              {!zoom.def && <button onClick={() => { escolher(zoom.id, zoom.url); setZoom(null); }} disabled={busy === zoom.id} className="px-4 py-2 rounded-lg disabled:opacity-40" style={{ background: COR, color: '#0F0F1A' }}>{busy === zoom.id ? '…' : 'escolher esta como definitiva'}</button>}
              <button onClick={() => setZoom(null)} className="px-4 py-2 rounded-lg border border-white/25">fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
