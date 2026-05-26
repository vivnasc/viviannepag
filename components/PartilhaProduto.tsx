'use client';

import { useState } from 'react';

type Props = {
  url: string;
  titulo: string;
  subtitulo: string;
  locale: string;
};

export function PartilhaProduto({ url, titulo, subtitulo, locale }: Props) {
  const [copiado, setCopiado] = useState(false);
  const isPt = locale === 'pt';

  const textoPartilha = `${titulo}\n${subtitulo}\n\n${url}`;
  const textoEncode = encodeURIComponent(textoPartilha);
  const urlEncode = encodeURIComponent(url);
  const tituloEncode = encodeURIComponent(titulo);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[0.68rem] tracking-[0.28em] uppercase text-ocre/50">
        {isPt ? 'partilhar' : 'share'}
      </p>
      <div className="flex gap-2.5 flex-wrap justify-center">
        <a
          href={`https://wa.me/?text=${textoEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${tituloEncode}&url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          X
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          Facebook
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          LinkedIn
        </a>
        <a
          href={`https://pinterest.com/pin/create/button/?url=${urlEncode}&description=${tituloEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          Pinterest
        </a>
        <button
          onClick={copiar}
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          {copiado ? (isPt ? 'copiado!' : 'copied!') : (isPt ? 'copiar link' : 'copy link')}
        </button>
      </div>
    </div>
  );
}
