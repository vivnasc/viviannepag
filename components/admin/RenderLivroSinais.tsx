'use client';

import { useState } from 'react';

// Render + publicação do livro Os 7 Sinais de Desencaixe: dispara o workflow que
// gera o PDF (PT e EN) e o sobe para a entrega da loja. Depois, seed em produtos.
const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const pdfUrl = (en?: boolean) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/produtos/os-7-sinais${en ? '-en' : ''}.pdf`;

export function RenderLivroSinais() {
  const [estado, setEstado] = useState('');
  const [a, setA] = useState(false);

  async function render() {
    setA(true); setEstado('a disparar…');
    try {
      const res = await fetch('/api/admin/livro-sinais/render-dispatch', { method: 'POST' });
      const j = await res.json();
      setEstado(res.ok ? 'disparado (≈3 min). Gera o PDF e publica na entrega. Recarrega depois e testa.' : `erro: ${j.erro || res.status}`);
    } catch (e) {
      setEstado(`erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally { setA(false); }
  }

  return (
    <section className="border border-ocre/15 rounded-[14px] p-6 mt-10 space-y-4">
      <h3 className="font-serif text-creme text-[1.05rem]">Render e entrega · o livro</h3>
      <p className="text-creme-2/60 text-[0.82rem] font-serif italic">
        Gera o PDF do livro (PT e EN, já com os respiros) e publica-o na entrega da loja (o ficheiro que o comprador descarrega). Depois, faz seed em produtos. Sequência: renderizar → seed → vender.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={render} disabled={a} className="rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-5 py-2 text-[0.82rem] hover:bg-ambar/20 transition-colors disabled:opacity-50">
          renderizar livro + publicar
        </button>
        <a href={`${pdfUrl()}?v=${Date.now()}`} target="_blank" rel="noreferrer" className="text-salvia text-[0.82rem] underline">descarregar teste · PT</a>
        <a href={`${pdfUrl(true)}?v=${Date.now()}`} target="_blank" rel="noreferrer" className="text-salvia text-[0.82rem] underline">EN</a>
      </div>
      {estado && <p className="text-salvia text-[0.8rem]">{estado}</p>}
    </section>
  );
}
