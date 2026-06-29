'use client';

// MÉTODO VS · A HISTÓRIA ANTIGA (mãe) — PROTÓTIPO. Lê as histórias bíblicas (a
// curadoria da Vivianne) e gera UMA peça a partir da leitura dela, na voz da mãe.
// Mostra o texto que sai aqui mesmo (para julgar rápido); a peça fica no estúdio.

import { useState, useEffect } from 'react';

type Historia = { id: string; historia: string; veu: string; leitura: string; referencia?: string };
type Resultado = { momentos: string[]; slug: string };

export default function BibliaPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [out, setOut] = useState<Record<string, Resultado>>({});

  useEffect(() => {
    fetch('/api/admin/metodo-vs/historia').then((r) => (r.ok ? r.json() : null)).then((j) => setHistorias(j?.historias ?? [])).catch(() => {});
  }, []);

  async function gerar(id: string) {
    setBusy(id); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo-vs/historia', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setOut((o) => ({ ...o, [id]: { momentos: j.momentos ?? [], slug: j.slug } }));
    } catch (e) { setErro(String(e)); } finally { setBusy(null); }
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-medium mb-1">A história antiga · mãe</h1>
      <p className="text-[0.8rem] opacity-60 mb-1">Reler as histórias mais antigas pela lente dos véus. Não é uma conta cristã: é o mecanismo humano que já lá estava.</p>
      <p className="text-[0.7rem] opacity-45 mb-5">As leituras são tuas (em <code>lib/metodo-vs/historias-biblicas.ts</code>). Carrega «gerar» e vê o texto que sai. A peça fica no estúdio da mãe.</p>

      {erro && <p className="mb-3 text-[0.82rem] text-rose-300">{erro}</p>}

      <div className="space-y-3">
        {historias.map((h) => (
          <div key={h.id} className="rounded-xl border border-white/12 p-3 bg-white/[0.03]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[0.95rem]">{h.historia} <span className="text-[0.7rem] opacity-50">· véu {h.veu}{h.referencia ? ` · ${h.referencia}` : ''}</span></p>
                <p className="text-[0.78rem] opacity-70 mt-0.5">{h.leitura}</p>
              </div>
              <button onClick={() => gerar(h.id)} disabled={!!busy}
                className="shrink-0 text-[0.78rem] px-3 py-1.5 rounded-lg border border-amber-300/50 text-amber-200 hover:bg-amber-300/10 disabled:opacity-40">
                {busy === h.id ? 'a gerar…' : '✨ gerar'}
              </button>
            </div>
            {out[h.id] && (
              <div className="mt-3 rounded-lg bg-black/30 border border-white/10 p-3 space-y-1.5">
                {out[h.id].momentos.map((m, i) => (
                  <p key={i} className="text-[0.92rem] leading-snug">{i === 0 ? <b>{m}</b> : m}</p>
                ))}
                <p className="text-[0.6rem] opacity-40 pt-1">guardada no estúdio · {out[h.id].slug}</p>
              </div>
            )}
          </div>
        ))}
        {!historias.length && <p className="text-[0.8rem] opacity-50">a carregar…</p>}
      </div>
    </div>
  );
}
