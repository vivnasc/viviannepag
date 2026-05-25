'use client';

import { useState } from 'react';

type Props = {
  url: string;
  titulo: string;
  resumo: string;
  locale: string;
};

export function PartilhaEscrito({ url, titulo, resumo, locale }: Props) {
  const [copiado, setCopiado] = useState(false);

  const textoPartilha = `${titulo}\n\n${resumo}\n\n${url}`;
  const textoEncode = encodeURIComponent(textoPartilha);
  const urlEncode = encodeURIComponent(url);
  const tituloEncode = encodeURIComponent(titulo);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const label = locale === 'en' ? 'share' : 'partilhar';

  return (
    <div className="flex flex-col items-center gap-4 mt-16 mb-4">
      <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre/60">
        {label}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <a
          href={`https://wa.me/?text=${textoEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${tituloEncode}&url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          X
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          Facebook
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          LinkedIn
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          {copiado ? (locale === 'en' ? 'copied!' : 'copiado!') : (locale === 'en' ? 'copy link' : 'copiar link')}
        </button>
      </div>
    </div>
  );
}
