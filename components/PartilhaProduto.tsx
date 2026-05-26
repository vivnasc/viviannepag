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
  const [copiadoLegenda, setCopiadoLegenda] = useState(false);
  const isPt = locale === 'pt';

  const textoPartilha = `${titulo}\n${subtitulo}\n\n${url}`;
  const textoEncode = encodeURIComponent(textoPartilha);
  const urlEncode = encodeURIComponent(url);
  const tituloEncode = encodeURIComponent(titulo);

  const legendaInsta = `${subtitulo}\n\n"${titulo}"\nPor Vivianne dos Santos\n\nLink na bio\nviviannedossantos.com/loja\n\n.\n.\n.\n#viviannedossantos #autoconhecimento #ebook #constelacaofamiliar #psicologiatranspessoal #desenvolvimentopessoal #mulheresqueinspiram #ebookdigital #vidacomproposito #saudementalimporta`;

  const legendaTiktok = `${subtitulo}\n\n"${titulo}" por Vivianne dos Santos\n\nLink na bio\n\n#viviannedossantos #autoconhecimento #ebook #fyp #foryou #healingtiktok #booktok #constelacaofamiliar`;

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
    <div className="flex flex-col items-center gap-3">
      <p className="text-[0.68rem] tracking-[0.28em] uppercase text-ocre/50">
        {isPt ? 'partilhar' : 'share'}
      </p>
      <div className="flex gap-2.5 flex-wrap justify-center">
        <button
          onClick={() => copiarLegenda(legendaInsta)}
          className="px-3.5 py-1.5 rounded-full border border-rosa/40 text-creme-2/80 text-[0.75rem] hover:border-rosa hover:text-rosa transition-colors"
        >
          {copiadoLegenda ? (isPt ? 'legenda copiada!' : 'caption copied!') : 'Instagram'}
        </button>
        <button
          onClick={() => copiarLegenda(legendaTiktok)}
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          TikTok
        </button>
        <a
          href={`https://wa.me/?text=${textoEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          WhatsApp
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
          href={`https://twitter.com/intent/tweet?text=${tituloEncode}&url=${urlEncode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors no-underline"
        >
          X
        </a>
        <button
          onClick={copiar}
          className="px-3.5 py-1.5 rounded-full border border-ocre/25 text-creme-2/80 text-[0.75rem] hover:border-ambar hover:text-ambar transition-colors"
        >
          {copiado ? (isPt ? 'copiado!' : 'copied!') : (isPt ? 'copiar link' : 'copy link')}
        </button>
      </div>
      <p className="text-[0.6rem] text-creme-2/35 text-center">
        {isPt
          ? 'Instagram/TikTok: copia a legenda com hashtags e cola no story ou post.'
          : 'Instagram/TikTok: copy the caption with hashtags, paste in story or post.'}
      </p>
    </div>
  );
}
