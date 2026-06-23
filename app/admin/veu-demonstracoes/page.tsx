'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DEMONSTRACOES } from '@/lib/veu/demonstracoes';

// veu.a.veu · DEMONSTRAÇÕES FÍSICAS — clica "gerar" e o Runway (via Replicate) cria o
// vídeo do fenómeno; aparece aqui. O texto/legenda sobrepõe-se na fase 2 (já está
// guardado). Primeiro confirma-se que o VÍDEO sai lindo; depois compõe-se o reel.
export default function VeuDemonstracoesPage() {
  const [feitos, setFeitos] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/veu/demonstracao').then((r) => (r.ok ? r.json() : { feitos: {} })).then((j) => setFeitos(j.feitos ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async (semana: number) => {
    if (busy) return;
    setBusy(semana); setErro(null); setMsg(`A gerar a demonstração da semana ${semana} (Runway, ~1-3 min)… não feches.`);
    try {
      const r = await fetch('/api/admin/veu/demonstracao', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ semana, duracao: 8 }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg(`Semana ${semana} gerada. Vê em baixo.`); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, recarregar]);

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="text-[0.75rem] opacity-60 hover:opacity-100">← admin</Link>
        <h1 className="text-2xl mt-3 mb-1" style={{ fontFamily: 'serif' }}>veu.a.veu · Demonstrações físicas</h1>
        <p className="text-[0.82rem] opacity-70 mb-1">Cada semana, um fenómeno físico real em que a surpresa é a verdade. O vídeo gera-se pelo Runway (Gen-4.5, via Replicate, pay-per-use); o texto sobrepõe-se depois.</p>
        <p className="text-[0.7rem] opacity-45 mb-5">1.ª geração = teste da ligação. Se um campo estiver errado, vem erro 422 (não gasta créditos) e eu afino uma linha.</p>

        {erro && <p className="mb-3 text-[0.82rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.82rem] text-emerald-300">{msg}</p>}

        <div className="space-y-4">
          {DEMONSTRACOES.map((d) => (
            <div key={d.semana} className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[0.62rem] uppercase tracking-widest opacity-45">semana {d.semana} · {d.materia}</span>
                  <h2 className="text-lg" style={{ fontFamily: 'serif' }}>{d.tema}</h2>
                  <p className="text-[0.78rem] opacity-70 italic">{d.objeto}</p>
                </div>
                <button onClick={() => gerar(d.semana)} disabled={busy !== null}
                  className="text-[0.78rem] px-3 py-1.5 rounded-lg border disabled:opacity-40"
                  style={{ borderColor: '#C9B6FA', background: feitos[d.semana] ? 'transparent' : '#C9B6FA', color: feitos[d.semana] ? '#C9B6FA' : '#0F0F1A' }}>
                  {busy === d.semana ? 'a gerar…' : feitos[d.semana] ? '↻ gerar de novo' : '🎬 gerar vídeo'}
                </button>
              </div>

              {feitos[d.semana] && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={feitos[d.semana]} controls loop playsInline className="w-full mt-3 rounded-lg border border-white/10" style={{ maxWidth: 320 }} />
              )}

              <div className="mt-3 text-[0.74rem] opacity-80 leading-relaxed">
                {d.beats.map((b, i) => <p key={i} className={i === 0 ? 'font-semibold' : ''}>{b}</p>)}
                <p className="mt-1 opacity-60">{d.envio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
