'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FORMATOS_LISTA, CALENDARIO } from '@/lib/metodo-vs/formatos';

// MÉTODO VS · do zero, simples como o laboratório do Soulab — mas com VÁRIOS FORMATOS
// (ângulos de revelação) e um CALENDÁRIO (vários posts/dia, planeados). Sem 4 contas,
// sem o motor velho. A voz é uma só: revelar (chamam-lhe X… mas é Y).

type Peca = {
  slug: string; veu: string | null; formato: string | null; hora: string | null;
  momentos: string[]; conceito: string; imageUrl: string | null; videoUrl: string | null;
  legenda: string | null; agendadoEm: string | null; publicado: boolean;
};

const NOME_FORMATO: Record<string, string> = Object.fromEntries(FORMATOS_LISTA.map((f) => [f.id, `${f.emoji} ${f.nome}`]));

function Cartao({ p, onApagar }: { p: Peca; onApagar: (slug: string) => void }) {
  const [i, setI] = useState(0);
  const n = Math.max(1, p.momentos.length);
  useEffect(() => { if (n <= 1) return; const t = setInterval(() => setI((x) => (x + 1) % n), 2400); return () => clearInterval(t); }, [n]);
  const idx = Math.min(i, n - 1);
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#15131F' }}>
      <div className="relative" style={{ aspectRatio: '1080 / 1920', background: '#0E0B16' }}>
        {p.imageUrl && <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.8)' }} />}
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.3rem', lineHeight: 1.3, color: '#F4ECDD', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>{p.momentos[idx] ?? p.momentos[0] ?? ''}</p>
        </div>
        {n > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {p.momentos.map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: k === idx ? '#EBAE4A' : 'rgba(255,255,255,0.35)' }} />)}
          </div>
        )}
        {p.videoUrl && <span className="absolute top-2 right-2 text-[0.55rem] bg-emerald-600/85 text-white rounded px-1.5 py-0.5">MP4</span>}
      </div>
      <div className="p-2.5 text-[0.64rem]">
        <p className="opacity-70 mb-1">{NOME_FORMATO[p.formato ?? ''] ?? p.formato ?? 'revelação'} · véu {p.veu ?? '—'}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {p.publicado ? <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[#0F0F1A]">✓ publicada</span>
            : p.agendadoEm ? <span className="px-1.5 py-0.5 rounded bg-[#C9B6FA]/80 text-[#0F0F1A]">📅 {p.agendadoEm.slice(5)} {(p.hora ?? '').slice(0, 5)}</span>
              : <span className="px-1.5 py-0.5 rounded bg-white/10">✎ por agendar</span>}
          <div className="ml-auto flex gap-1.5">
            <Link href="/admin/publicar?conta=metodovs&vista=semana" className="px-2 py-0.5 rounded border border-white/20 hover:border-ambar">agendar →</Link>
            {!p.publicado && <button onClick={() => onApagar(p.slug)} className="px-2 py-0.5 rounded border border-rose-400/40 text-rose-300">✕</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetodoVSPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo-vs/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const chamar = useCallback(async (corpo: Record<string, unknown>, etiqueta: string) => {
    if (busy) return;
    setBusy(etiqueta); setErro(null); setMsg('A revelar…');
    try {
      const r = await fetch('/api/admin/metodo-vs/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else if (!j.gerados) setMsg('Nada novo (já existiam). Apaga para refazer.');
      else setMsg(`${j.gerados} peça(s) gerada(s).`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, recarregar]);

  const apagar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar esta peça?')) return;
    try { const r = await fetch('/api/admin/metodo-vs/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (r.ok) recarregar(); } catch { /* */ }
  }, [recarregar]);

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-[0.75rem] opacity-60 hover:opacity-100">← admin</Link>
        <h1 className="text-2xl mt-3 mb-1" style={{ fontFamily: 'var(--font-serif), serif', color: '#EBAE4A' }}>Método VS · a conta mãe</h1>
        <p className="text-[0.84rem] opacity-75 mb-1">Vários posts diferentes, voz de autoridade (revelar, não explicar), por um calendário. Cada formato é um ângulo do mesmo véu, na voz da revelação. Lê do teu SABER.</p>
        <p className="text-[0.7rem] opacity-45 mb-5">Agendar/publicar é no Publicar.</p>

        {/* CALENDÁRIO · a semana toda de uma vez */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <p className="text-[0.66rem] uppercase tracking-widest opacity-50">o calendário da semana · {CALENDARIO.length} posts</p>
            <button onClick={() => chamar({ semana: true, offset: 0 }, 'semana')} disabled={!!busy} className="px-3 py-1.5 rounded-lg font-medium text-[0.78rem] disabled:opacity-50" style={{ background: '#EBAE4A', color: '#0F0F1A' }}>{busy === 'semana' ? 'a produzir a semana…' : '✦ produzir a semana toda'}</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CALENDARIO.map((s, i) => (
              <span key={i} className="text-[0.6rem] px-2 py-1 rounded-lg border border-white/12 opacity-75" title={`${s.nome} · ${s.hora}`}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.wd]} {s.hora.slice(0, 5)} · {NOME_FORMATO[s.formato] ?? s.formato}</span>
            ))}
          </div>
        </div>

        {/* VÁRIOS FORMATOS · gera um de qualquer ângulo (como os tipos do Soulab) */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button onClick={() => chamar({}, 'sorte')} disabled={!!busy} className="px-3 py-2 rounded-lg border border-white/20 text-[0.78rem] hover:border-ambar disabled:opacity-40">{busy === 'sorte' ? '…' : '✦ surpreende-me'}</button>
          <span className="opacity-40 text-[0.7rem]">ou um formato:</span>
          {FORMATOS_LISTA.map((f) => (
            <button key={f.id} onClick={() => chamar({ formato: f.id }, f.id)} disabled={!!busy} className="px-2.5 py-1.5 rounded-lg border border-white/15 text-[0.74rem] hover:border-ambar disabled:opacity-40">{busy === f.id ? '…' : `${f.emoji} ${f.nome}`}</button>
          ))}
        </div>

        {erro && <p className="mb-3 text-[0.82rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.82rem] text-emerald-300">{msg}</p>}

        {pecas.length === 0 ? (
          <p className="text-center text-[0.78rem] opacity-50 py-10">Ainda não há peças. Carrega «✦ produzir a semana toda» ou um formato.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pecas.map((p) => <Cartao key={p.slug} p={p} onApagar={apagar} />)}
          </div>
        )}
      </div>
    </main>
  );
}
