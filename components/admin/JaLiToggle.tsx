'use client';

// Marcador pessoal "já li" por livro/guia. Guarda no proprio dispositivo
// (localStorage) — nao publica nada, so sinaliza o que ela ja leu.

import { useEffect, useState } from 'react';

const KEY = (slug: string) => `editora-lido:${slug}`;

export function JaLiToggle({ slug }: { slug: string }) {
  const [lido, setLido] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try { setLido(localStorage.getItem(KEY(slug)) === '1'); } catch {}
    setPronto(true);
  }, [slug]);

  function alternar() {
    const novo = !lido;
    setLido(novo);
    try {
      if (novo) localStorage.setItem(KEY(slug), '1');
      else localStorage.removeItem(KEY(slug));
    } catch {}
  }

  return (
    <button
      onClick={alternar}
      aria-pressed={lido}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] tracking-wide transition-colors ${
        lido
          ? 'border-salvia/40 bg-salvia/10 text-salvia'
          : 'border-ocre/25 text-creme-2/55 hover:border-ambar/50 hover:text-ambar'
      } ${pronto ? '' : 'opacity-0'}`}
    >
      <span aria-hidden>{lido ? '✓' : '○'}</span>
      {lido ? 'já li' : 'marcar lido'}
    </button>
  );
}
