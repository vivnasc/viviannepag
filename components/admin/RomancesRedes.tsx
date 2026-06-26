'use client';

import { useState } from 'react';

type Item = { slug: string; titulo: string; estante: string; capa: string | null; link: string; gratis?: boolean };

// Grelha das capas + links dos romances, para a Vivianne usar nos Stories/anéis sem
// copiar URLs: vê a capa, faz long-press para guardar (telemóvel) ou "descarregar",
// e copia o link do livro com um botão. As capas vêm direto do Storage (o browser
// dela acede; não passa pelo proxy do ambiente).
export function RomancesRedes({ itens }: { itens: Item[] }) {
  const [copiado, setCopiado] = useState<string | null>(null);
  async function copiar(link: string, slug: string) {
    try { await navigator.clipboard.writeText(link); setCopiado(slug); setTimeout(() => setCopiado(null), 1500); } catch { /* */ }
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {itens.map((it) => (
        <div key={it.slug} className="rounded-[12px] border border-ocre/20 p-3">
          {it.capa ? (
            <a href={it.capa} target="_blank" rel="noreferrer" title="abrir/guardar a capa">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.capa} alt={it.titulo} className="w-full rounded-[8px] border border-ocre/15 aspect-[3/4] object-cover bg-black/20" />
            </a>
          ) : (
            <div className="aspect-[3/4] rounded-[8px] border border-dashed border-ocre/25 grid place-items-center text-creme-2/30 text-[0.7rem]">sem capa ainda</div>
          )}
          <p className="text-creme text-[0.82rem] mt-2 leading-tight">{it.titulo}{it.gratis && <span className="text-salvia"> · grátis</span>}</p>
          <p className="text-creme-2/40 text-[0.66rem] mb-2">{it.estante}</p>
          <div className="flex items-center gap-3">
            {it.capa && <a href={it.capa} download target="_blank" rel="noreferrer" className="text-ambar text-[0.72rem] no-underline hover:opacity-80">descarregar capa</a>}
            <button onClick={() => copiar(it.link, it.slug)} className="text-salvia text-[0.72rem] hover:opacity-80">{copiado === it.slug ? 'copiado ✓' : 'copiar link'}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
