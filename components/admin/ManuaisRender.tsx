'use client';

import { useState } from 'react';

// Botão para renderizar os 3 manuais (ver/vir/viver) com o bónus e publicá-los,
// para a venda/download ficar ativa. Sem mexer no GitHub.
export function ManuaisRender() {
  const [aRender, setARender] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function renderizar() {
    setErro(null); setMsg(null); setARender(true);
    try {
      const res = await fetch('/api/admin/manuais/render-dispatch', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      setMsg('Render dos manuais disparado (≈3 min). Quando terminar, os 3 PDFs (com bónus) ficam prontos para venda em /ver-soltar, /vir-soltar e /viver-soltar.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally { setARender(false); }
  }

  return (
    <section className="border border-ocre/15 rounded-[14px] p-6 mt-8">
      <h3 className="font-serif text-creme text-[1.05rem] mb-1">Manuais · ver / vir / viver</h3>
      <p className="text-creme-2/60 text-[0.82rem] mb-4 font-serif italic">
        Renderiza os 3 manuais (PT e EN) com o rascunho de bolso anexado como bónus e publica-os, para a compra ficar ativa. Depois, faz "seed catálogo" em produtos.
      </p>
      <button
        onClick={renderizar}
        disabled={aRender}
        className="rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-5 py-2 text-[0.82rem] hover:bg-ambar/20 transition-colors disabled:opacity-50"
      >
        {aRender ? 'a disparar…' : 'renderizar manuais (com bónus)'}
      </button>
      {msg && <p className="text-salvia text-[0.82rem] mt-3">{msg}</p>}
      {erro && <p className="text-rosa/90 text-[0.82rem] mt-3">{erro}</p>}
    </section>
  );
}
