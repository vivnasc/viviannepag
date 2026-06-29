'use client';

import { useState } from 'react';

// Upload da capa que a Vivianne fez FORA do site (imagem final, já com título).
// Sobe para o Supabase como a capa do livro (capa-composta). A home, a loja e o
// render do PDF passam a usar esta imagem.
const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const capaUrl = (en?: boolean) =>
  `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-pilar/os-7-sinais/capa-composta${en ? '-en' : ''}.png`;

function Slot({ lang, titulo }: { lang: 'pt' | 'en'; titulo: string }) {
  const [preview, setPreview] = useState(`${capaUrl(lang === 'en')}?t=1`);
  const [estado, setEstado] = useState('');
  const [a, setA] = useState(false);

  async function enviar(file: File) {
    setA(true); setEstado('a enviar…');
    setPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append('ficheiro', file);
      fd.append('lang', lang);
      const res = await fetch('/api/admin/capa-sinais-upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (res.ok) { setEstado('capa guardada ✓'); setPreview(j.url); }
      else setEstado(`erro: ${j.erro ?? res.status}`);
    } catch (e) {
      setEstado(`erro: ${(e as Error).message}`);
    } finally { setA(false); }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre">{titulo}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt={`Capa ${lang.toUpperCase()}`}
        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.25'; }}
        className="w-[200px] h-[267px] object-cover rounded-[10px] border border-ocre/30 bg-creme/[0.03]"
      />
      <label className={`rounded-full px-5 py-2 text-[0.82rem] font-sans text-center cursor-pointer transition-colors ${a ? 'opacity-50' : 'bg-ambar text-[#2A1C12] hover:bg-ocre'}`}>
        {a ? 'a enviar…' : 'escolher imagem…'}
        <input type="file" accept="image/*" className="hidden" disabled={a}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); }} />
      </label>
      {estado && <p className="text-salvia text-[0.78rem]">{estado}</p>}
    </div>
  );
}

export function CapaSinaisUpload() {
  return (
    <section>
      <p className="text-creme-2/75 text-[0.9rem] leading-[1.7] mb-5 max-w-[60ch]">
        Carrega a tua imagem da capa (a que fizeste fora do site, já com o título). Fica logo a capa na home e na loja. Para o PDF, carrega depois &quot;renderizar livro + publicar&quot;.
      </p>
      <div className="flex gap-8 flex-wrap">
        <Slot lang="pt" titulo="capa · PT" />
        <Slot lang="en" titulo="capa · EN (opcional)" />
      </div>
    </section>
  );
}
