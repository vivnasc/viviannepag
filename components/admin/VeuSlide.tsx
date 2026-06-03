'use client';

// Pele dos Carrosseis dos 7 Veus: composicao serif, contemplativa, centrada —
// palavra-capa em destaque, etiqueta de seccao (PROSA/POETICO/PRATICA/Sabias
// que...), wordmark e rodape "OS SETE VEUS". Quando ha imagem editorial gerada,
// entra como fundo full-bleed com veu escuro; sem ela, usa o gradiente do
// universo (elegante de qualquer forma).

import type { Slide, Mundo } from '@/lib/estudio-conteudo';
import { PALETAS } from '@/lib/estudio-conteudo';

export function VeuSlide({
  slide,
  mundo,
  palavra,
  subtitulo,
  diaSemana,
  imageUrl,
}: {
  slide: Slide;
  mundo: Mundo;
  palavra?: string;
  subtitulo?: string;
  diaSemana?: string;
  imageUrl?: string;
}) {
  const p = PALETAS[mundo];
  const isCapa = slide.tipo === 'capa';
  const isCitacao = slide.tipo === 'citacao';
  const isCta = slide.tipo === 'cta';
  const etiqueta = !isCapa ? slide.titulo : undefined;

  return (
    <div
      className="relative aspect-[4/5] rounded-2xl overflow-hidden flex flex-col items-center justify-between text-center px-5 py-6 select-none"
      style={{
        background: imageUrl ? '#000' : `linear-gradient(165deg, ${p.bg}, ${p.bg2})`,
        color: p.texto,
        fontFamily: 'var(--font-serif), Georgia, serif',
      }}
    >
      {imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.bg2}40, ${p.bg2}d0)` }} />
        </>
      )}

      {isCitacao && (
        <div className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: p.destaque + '55' }} />
      )}

      {/* topo: wordmark + dia */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="italic text-[0.6rem] opacity-80" style={{ color: p.destaque }}>Vivianne dos Santos</span>
        {diaSemana && <span className="text-[0.48rem] tracking-[0.3em] uppercase opacity-55">{diaSemana}</span>}
      </div>

      {/* centro */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 px-1">
        {etiqueta && (
          <span className="text-[0.46rem] tracking-[0.4em] uppercase opacity-90" style={{ color: p.destaque }}>{etiqueta}</span>
        )}
        {isCapa ? (
          <>
            <h2 className="tracking-[0.18em] text-[1.7rem] leading-tight">{palavra ?? slide.texto}</h2>
            {(subtitulo || slide.titulo) && (
              <p className="italic text-[0.68rem] leading-snug opacity-80 max-w-[85%]">{subtitulo ?? slide.titulo}</p>
            )}
          </>
        ) : (
          <p className={`${isCitacao || isCta ? 'italic' : ''} text-[0.9rem] leading-relaxed max-w-[92%] whitespace-pre-line`}>{slide.texto}</p>
        )}
        {isCta && slide.destaque && (
          <p className="mt-1 text-[0.55rem] tracking-[0.22em] uppercase" style={{ color: p.destaque }}>{slide.destaque}</p>
        )}
      </div>

      {/* rodape */}
      <div className="relative z-10 flex flex-col items-center gap-0.5 opacity-60">
        <span className="text-[0.44rem] tracking-[0.4em] uppercase">Os Sete Véus</span>
        {isCapa && <span className="text-[0.42rem] tracking-[0.25em] uppercase opacity-70">desliza para o lado →</span>}
      </div>
    </div>
  );
}
