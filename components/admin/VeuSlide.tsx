'use client';

// Pele dos Carrosseis dos 7 Veus, fiel ao sistema da Vivianne:
//  - CAPA e CTA: fundo escuro/editorial (imagem full-bleed com veu, ou
//    gradiente do universo). Palavra-destaque do dia em serif, ou oferta no CTA.
//  - PROSA / POETICO / PRATICA: BASE CLARA (creme), serif italico centrado,
//    etiqueta de seccao no topo, "OS SETE VEUS" e a palavra do dia no rodape.
// Cada DIA tem a sua propria palavra-destaque (passada por slide-dia).

import type { Slide, Mundo } from '@/lib/estudio-conteudo';
import { PALETAS } from '@/lib/estudio-conteudo';

const CREME = { bg: '#F0E7D8', bg2: '#E7DBC7', texto: '#3A2818' };

export function VeuSlide({
  slide,
  mundo,
  palavra,
  subtitulo,
  imageUrl,
}: {
  slide: Slide;
  mundo: Mundo;
  palavra?: string;
  subtitulo?: string;
  imageUrl?: string;
}) {
  const p = PALETAS[mundo];
  const isCapa = slide.tipo === 'capa';
  const isCta = slide.tipo === 'cta';
  const escuro = isCapa || isCta; // capa e fecho sao escuros; meio e claro

  const bg = escuro
    ? `linear-gradient(165deg, ${p.bg}, ${p.bg2})`
    : `linear-gradient(165deg, ${CREME.bg}, ${CREME.bg2})`;
  const cor = escuro ? p.texto : CREME.texto;
  const accent = p.destaque;
  const etiqueta = !isCapa && !isCta ? slide.titulo : undefined;
  const palavraTopo = palavra ?? slide.texto;

  return (
    <div
      className="relative aspect-[4/5] rounded-2xl overflow-hidden flex flex-col items-center justify-between text-center px-5 py-6 select-none"
      style={{ background: escuro && imageUrl ? '#000' : bg, color: cor, fontFamily: 'var(--font-serif), Georgia, serif' }}
    >
      {escuro && imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.bg2}45, ${p.bg2}d8)` }} />
        </>
      )}

      {/* topo: OS SETE VEUS (+ etiqueta de seccao no meio) */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-[0.42rem] tracking-[0.4em] uppercase opacity-50">Os Sete Véus</span>
      </div>

      {/* centro */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-1 w-full">
        {etiqueta && (
          <span className="text-[0.46rem] tracking-[0.45em] uppercase opacity-70" style={{ color: accent }}>{etiqueta}</span>
        )}
        {!etiqueta && <span className="text-[0.7rem] opacity-40 leading-none">⋄</span>}

        {isCapa ? (
          <>
            <h2 className="tracking-[0.16em] text-[1.65rem] leading-tight">{palavraTopo}</h2>
            {subtitulo && <p className="italic text-[0.66rem] leading-snug opacity-75 max-w-[85%]">{subtitulo}</p>}
          </>
        ) : (
          <p className="italic text-[0.9rem] leading-relaxed max-w-[92%] whitespace-pre-line">{slide.texto}</p>
        )}

        {isCta && slide.destaque && (
          <p className="mt-1 text-[0.55rem] tracking-[0.2em] uppercase opacity-80" style={{ color: accent }}>{slide.destaque}</p>
        )}
        {!isCapa && !isCta && <span className="text-[0.7rem] opacity-40 leading-none">—</span>}
      </div>

      {/* rodape: a palavra do dia */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <span className="text-[0.42rem] tracking-[0.4em] uppercase opacity-45">{palavra ?? ''}</span>
        {isCapa && <span className="text-[0.42rem] tracking-[0.25em] uppercase opacity-60">desliza →</span>}
      </div>
    </div>
  );
}
