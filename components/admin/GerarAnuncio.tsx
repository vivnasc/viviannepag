'use client';

import { useState } from 'react';

export function GerarAnuncio() {
  const [estado, setEstado] = useState<'inicio' | 'a-gerar' | 'pronto' | 'erro'>('inicio');
  const [msg, setMsg] = useState('');

  async function gerar(variante: 'A' | 'B') {
    setEstado('a-gerar');
    setMsg(variante);
    try {
      const r = await fetch('/api/admin/anuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variante }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setEstado('pronto');
    } catch (e) {
      setEstado('erro');
      setMsg((e as Error).message);
    }
  }

  return (
    <div className="rounded-[14px] border border-ocre/25 p-6 mb-10">
      <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre/80 mb-3">gerar um anúncio novo</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => gerar('A')}
          disabled={estado === 'a-gerar'}
          className="rounded-full bg-ambar text-[#2A1C12] px-6 py-3 text-[0.9rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Gerar · A (a ferida)
        </button>
        <button
          onClick={() => gerar('B')}
          disabled={estado === 'a-gerar'}
          className="rounded-full border border-ambar/60 text-ambar px-6 py-3 text-[0.9rem] hover:bg-ambar/10 transition-colors disabled:opacity-50"
        >
          Gerar · B (reconhecimento)
        </button>
      </div>
      {estado === 'a-gerar' && (
        <p className="text-creme-2/70 text-[0.85rem] mt-4 font-serif italic">
          A gerar o anúncio {msg}… leva alguns minutos. Atualiza esta página daqui a pouco e ele aparece aqui em baixo.
        </p>
      )}
      {estado === 'pronto' && (
        <p className="text-salvia text-[0.85rem] mt-4 font-serif italic">
          Pedido enviado. O vídeo está a ser gerado; aparece aqui em baixo em ~5-10 min (atualiza a página).
        </p>
      )}
      {estado === 'erro' && (
        <p className="text-rosa/90 text-[0.82rem] mt-4">Algo correu mal: {msg}</p>
      )}
    </div>
  );
}
