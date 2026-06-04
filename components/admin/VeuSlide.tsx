'use client';

// Pele dos Carrosseis dos 7 Veus, fiel ao sistema da Vivianne.
// Tipografia em unidades de CONTAINER (cqw): o texto escala com a largura do
// proprio slide, por isso as proporcoes ficam identicas em miniatura ou em
// tamanho real. CAPA/CTA escuros (imagem ou gradiente do universo); PROSA/
// POETICO/PRATICA em base clara (creme).

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
  const escuro = isCapa || isCta;

  const bg = escuro ? `linear-gradient(165deg, ${p.bg}, ${p.bg2})` : `linear-gradient(165deg, ${CREME.bg}, ${CREME.bg2})`;
  const cor = escuro ? p.texto : CREME.texto;
  const accent = p.destaque;
  const etiqueta = !isCapa && !isCta ? slide.titulo : undefined;
  const palavraTopo = palavra ?? slide.texto;

  return (
    <div
      className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden flex flex-col items-center justify-between text-center select-none"
      style={{
        containerType: 'inline-size',
        background: escuro && imageUrl ? '#000' : bg,
        color: cor,
        fontFamily: 'var(--font-serif), Georgia, serif',
        padding: '8cqw 6cqw',
      }}
    >
      {escuro && imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.bg2}45, ${p.bg2}d8)` }} />
        </>
      )}

      {/* topo */}
      <div className="relative z-10 flex flex-col items-center" style={{ gap: '1.5cqw' }}>
        <span style={{ fontSize: '2.4cqw', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.5 }}>Os Sete Véus</span>
        {etiqueta && (
          <span style={{ fontSize: '2.5cqw', letterSpacing: '0.45em', textTransform: 'uppercase', color: accent, opacity: 0.9 }}>{etiqueta}</span>
        )}
      </div>

      {/* centro */}
      <div className="relative z-10 flex flex-col items-center" style={{ gap: '3.5cqw', width: '100%' }}>
        {isCapa ? (
          <>
            <h2 style={{ fontSize: '9cqw', letterSpacing: '0.04em', lineHeight: 1.05 }}>{palavraTopo}</h2>
            {subtitulo && <p style={{ fontSize: '3.4cqw', fontStyle: 'italic', lineHeight: 1.4, opacity: 0.8, maxWidth: '88%' }}>{subtitulo}</p>}
          </>
        ) : (
          <p style={{ fontSize: '4.4cqw', fontStyle: 'italic', lineHeight: 1.55, maxWidth: '90%', whiteSpace: 'pre-line' }}>{slide.texto}</p>
        )}
        {isCta && slide.destaque && (
          <p style={{ fontSize: '2.8cqw', letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, opacity: 0.85 }}>{slide.destaque}</p>
        )}
      </div>

      {/* rodape: a palavra do dia */}
      <div className="relative z-10 flex flex-col items-center" style={{ gap: '1cqw' }}>
        <span style={{ fontSize: '2.2cqw', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.45 }}>{palavra ?? ''}</span>
        {isCapa && <span style={{ fontSize: '2.2cqw', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.6 }}>desliza →</span>}
      </div>
    </div>
  );
}
