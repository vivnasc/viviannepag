'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// MÉTODO VS · NOVO (do zero, simples como o laboratório do Soulab). Sem 4 contas,
// sem semanas, sem 8 formatos. Carregas "gerar", sai uma peça na VOZ DA REVELAÇÃO
// (chamam-lhe X… é Y) com imagem clara, e vês o cartão. Agendar/publicar no Publicar.

type Peca = {
  slug: string; veu: string | null; momentos: string[]; conceito: string;
  imageUrl: string | null; videoUrl: string | null; legenda: string | null;
  agendadoEm: string | null; publicado: boolean;
};

const VEUS = ['Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência', 'Dualidade'];

function Cartao({ p, onApagar }: { p: Peca; onApagar: (slug: string) => void }) {
  const [i, setI] = useState(0);
  const n = Math.max(1, p.momentos.length);
  useEffect(() => { if (n <= 1) return; const t = setInterval(() => setI((x) => (x + 1) % n), 2400); return () => clearInterval(t); }, [n]);
  const linha = p.momentos[Math.min(i, n - 1)] ?? p.momentos[0] ?? '';
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#15131F' }}>
      <div className="relative" style={{ aspectRatio: '1080 / 1920', background: '#0E0B16' }}>
        {p.imageUrl && <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.78)' }} />}
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.35rem', lineHeight: 1.3, color: '#F4ECDD', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>{linha}</p>
        </div>
        {n > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {p.momentos.map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: k === Math.min(i, n - 1) ? '#EBAE4A' : 'rgba(255,255,255,0.35)' }} />)}
          </div>
        )}
        {p.videoUrl && <span className="absolute top-2 right-2 text-[0.55rem] bg-emerald-600/85 text-white rounded px-1.5 py-0.5">MP4</span>}
      </div>
      <div className="p-2.5 flex items-center gap-2 flex-wrap text-[0.66rem]">
        <span className="opacity-60">véu {p.veu ?? '—'}</span>
        {p.publicado ? <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[#0F0F1A]">✓ publicada</span>
          : p.agendadoEm ? <span className="px-1.5 py-0.5 rounded bg-[#C9B6FA]/80 text-[#0F0F1A]">📅 {p.agendadoEm.slice(5)}</span>
            : <span className="px-1.5 py-0.5 rounded bg-white/10">✎ por agendar</span>}
        <div className="ml-auto flex gap-1.5">
          <Link href="/admin/publicar?conta=metodovs&vista=semana" className="px-2 py-0.5 rounded border border-white/20 hover:border-ambar">agendar →</Link>
          {!p.publicado && <button onClick={() => onApagar(p.slug)} className="px-2 py-0.5 rounded border border-rose-400/40 text-rose-300">✕</button>}
        </div>
      </div>
    </div>
  );
}

export default function MetodoVSPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo-vs/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async (veu?: string) => {
    if (busy) return;
    setBusy(true); setErro(null); setMsg(veu ? `A revelar o véu ${veu}…` : 'A revelar (véu à sorte)…');
    try {
      const r = await fetch('/api/admin/metodo-vs/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(veu ? { veu } : {}) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Peça gerada. Vê em baixo.'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setBusy(false); }
  }, [busy, recarregar]);

  const apagar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar esta peça?')) return;
    try { const r = await fetch('/api/admin/metodo-vs/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (r.ok) recarregar(); } catch { /* */ }
  }, [recarregar]);

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-[0.75rem] opacity-60 hover:opacity-100">← admin</Link>
        <h1 className="text-2xl mt-3 mb-1" style={{ fontFamily: 'var(--font-serif), serif', color: '#EBAE4A' }}>Método VS · a revelação</h1>
        <p className="text-[0.84rem] opacity-75 mb-1">Uma voz só: revelar um padrão invisível e mudar o significado da história (chamam-lhe X… mas é Y). Carrega e sai uma peça com imagem clara. Sem contas, sem semanas, sem formatos.</p>
        <p className="text-[0.7rem] opacity-45 mb-5">Lê do teu SABER (as lentes da constelação e transpessoal). Agendar/publicar é no Publicar.</p>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button onClick={() => gerar()} disabled={busy} className="px-4 py-2 rounded-lg font-medium disabled:opacity-50" style={{ background: '#EBAE4A', color: '#0F0F1A' }}>{busy ? 'a revelar…' : '✦ surpreende-me'}</button>
          <span className="opacity-40 text-[0.7rem]">ou um véu:</span>
          {VEUS.map((v) => (
            <button key={v} onClick={() => gerar(v)} disabled={busy} className="px-2.5 py-1.5 rounded-lg border border-white/15 text-[0.74rem] hover:border-ambar disabled:opacity-40">{v}</button>
          ))}
        </div>

        {erro && <p className="mb-3 text-[0.82rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.82rem] text-emerald-300">{msg}</p>}

        {pecas.length === 0 ? (
          <p className="text-center text-[0.78rem] opacity-50 py-10">Ainda não há peças. Carrega «✦ surpreende-me» ou escolhe um véu.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pecas.map((p) => <Cartao key={p.slug} p={p} onApagar={apagar} />)}
          </div>
        )}
      </div>
    </main>
  );
}
