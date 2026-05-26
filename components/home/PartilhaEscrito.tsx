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
  const [copiadoLegenda, setCopiadoLegenda] = useState(false);
  const isPt = locale === 'pt';

  const textoPartilha = `${titulo}\n\n${resumo}\n\n${url}`;
  const textoEncode = encodeURIComponent(textoPartilha);
  const urlEncode = encodeURIComponent(url);
  const tituloEncode = encodeURIComponent(titulo);

  const legendaInsta = `${resumo}\n\nNovo escrito: "${titulo}"\nPor Vivianne dos Santos\n\nLink na bio\nviviannedossantos.com\n\n.\n.\n.\n#viviannedossantos #escritos #autoconhecimento #reflexao #psicologiatranspessoal #constelacaofamiliar #desenvolvimentopessoal #mulheresqueinspiram`;

  const legendaTiktok = `${resumo}\n\n"${titulo}" por Vivianne dos Santos\n\n#viviannedossantos #autoconhecimento #reflexao #fyp #foryou #healingtiktok #constelacaofamiliar`;

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function copiarLegenda(texto: string) {
    await navigator.clipboard.writeText(texto);
    setCopiadoLegenda(true);
    setTimeout(() => setCopiadoLegenda(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-16 mb-4">
      <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre/60">
        {isPt ? 'partilhar' : 'share'}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => copiarLegenda(legendaInsta)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-rosa/40 text-creme-2 text-[0.8rem] hover:border-rosa hover:text-rosa transition-colors"
        >
          {copiadoLegenda ? (isPt ? 'legenda copiada!' : 'caption copied!') : 'Instagram'}
        </button>
        <button
          onClick={() => copiarLegenda(legendaTiktok)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          TikTok
        </button>
        <a
          href={`https://wa.me/?text=${textoEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          WhatsApp
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
          href={`https://twitter.com/intent/tweet?text=${tituloEncode}&url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          X
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          {copiado ? (isPt ? 'copiado!' : 'copied!') : (isPt ? 'copiar link' : 'copy link')}
        </button>
      </div>
      <p className="text-[0.65rem] text-creme-2/40 text-center max-w-[400px]">
        {isPt
          ? 'Instagram e TikTok: copia a legenda com hashtags, depois cola no story ou post.'
          : 'Instagram and TikTok: copy the caption with hashtags, then paste in your story or post.'}
      </p>
    </div>
  );
}
