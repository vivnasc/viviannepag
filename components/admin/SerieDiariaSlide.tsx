'use client';

// SerieDiariaSlide — a moldura das séries diárias da vivianne.dos.santos
// (seteveus.space): "VC Sabia" (Sabias que…) de manhã e "Hoje em Mim" (hoje
// aprendi) de noite. Desenha-se sobre um vídeo de MOTION (feito no Midjourney
// pela Vivianne); aqui é só a CAMADA de texto/marca, que o render sobrepõe.
//
// Técnica: canvas real 1080x1920 (px do spec) escalado para caber no container,
// como o VeuSlide — proporções idênticas à produção em qualquer ecrã.
// transparente=true => fundo transparente (para o ffmpeg sobrepor ao vídeo).

import { useLayoutEffect, useRef, useState } from 'react';

const GOLD = '#C9A961';
const GOLD_SOFT = 'rgba(201,169,97,0.55)';
const IVORY = '#F4ECDD';
const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

export type SerieId = 'vcsabia' | 'hojeemmim';

export const SERIES: Record<SerieId, { nome: string; etiqueta: string; momento: string }> = {
  vcsabia: { nome: 'VC Sabia', etiqueta: 'Sabias que…', momento: 'manhã' },
  hojeemmim: { nome: 'Hoje em Mim', etiqueta: 'hoje aprendi', momento: 'noite' },
};

// "q u i n t a" — espaçado, como na arte
const espacado = (s: string) => s.split('').join(' ');

export function SerieDiariaSlide({
  serie,
  frase,
  dia,
  bgUrl,
  transparente = false,
}: {
  serie: SerieId;
  frase: string;
  dia?: string;           // dia da semana (Hoje em Mim mostra-o)
  bgUrl?: string;         // fundo de pré-visualização (no render real é o vídeo)
  transparente?: boolean; // true = sem fundo (camada para sobrepor ao vídeo)
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const diaPt = dia || '';

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 14, background: transparente ? 'transparent' : '#0e0d12' }}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: 1080, height: 1920,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          visibility: scale ? 'visible' : 'hidden',
          fontFamily: FONT_SERIF,
        }}
      >
        {/* fundo de preview (o render real põe o vídeo aqui) */}
        {!transparente && bgUrl && <img src={bgUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {/* véu escuro para legibilidade (suave; precisa de ler sobre qualquer motion) */}
        {!transparente && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,11,16,0.45) 0%, rgba(12,11,16,0.15) 32%, rgba(12,11,16,0.20) 60%, rgba(12,11,16,0.62) 100%)' }} />
        )}
        {/* scrim radial atrás do texto, garante contraste mesmo na camada transparente */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 42% at 50% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 55%, transparent 78%)' }} />

        {serie === 'vcsabia' ? (
          <>
            {/* moldura dourada (retângulo arredondado) */}
            <div style={{ position: 'absolute', inset: 64, border: `1px solid ${GOLD_SOFT}`, borderRadius: 28 }} />
            {/* etiqueta da série, dourado itálico */}
            <div style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 46, letterSpacing: '0.04em', color: GOLD }}>Sabias que…</div>
            {/* frase central */}
            <div style={{ position: 'absolute', top: 0, left: 110, right: 110, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 60, lineHeight: 1.42, textAlign: 'center', color: IVORY, textShadow: '0 2px 26px rgba(0,0,0,0.6)', margin: 0 }}>{frase}</p>
            </div>
            {/* assinatura */}
            <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 30, letterSpacing: '0.06em', color: GOLD }}>seteveus.space</div>
          </>
        ) : (
          <>
            {/* arco dourado (portal) */}
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} fill="none">
              <path d="M150 1740 L150 560 A390 390 0 0 1 930 560 L930 1740" stroke={GOLD_SOFT} strokeWidth={1.5} fill="none" />
            </svg>
            {/* dia da semana, no topo, espaçado, com um ponto */}
            <div style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, opacity: 0.8, margin: '0 auto 22px' }} />
              <span style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 26, letterSpacing: '0.5em', textTransform: 'lowercase', color: IVORY, opacity: 0.85, paddingLeft: '0.5em' }}>{espacado(diaPt)}</span>
            </div>
            {/* frase central + glifo de gaivota */}
            <div style={{ position: 'absolute', top: 0, left: 120, right: 120, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
              <svg width={70} height={26} viewBox="0 0 70 26" fill="none" style={{ opacity: 0.85 }}>
                <path d="M4 20 C16 4 26 4 35 16 C44 4 54 4 66 20" stroke={IVORY} strokeWidth={2} strokeLinecap="round" fill="none" />
              </svg>
              <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 60, lineHeight: 1.4, textAlign: 'center', color: IVORY, textShadow: '0 2px 26px rgba(0,0,0,0.65)', margin: 0 }}>{frase}</p>
            </div>
            {/* nome da série + assinatura */}
            <div style={{ position: 'absolute', bottom: 200, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, color: IVORY, opacity: 0.9 }}>hoje aprendi</div>
            <div style={{ position: 'absolute', bottom: 132, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SANS, fontSize: 20, letterSpacing: '0.42em', textTransform: 'uppercase', color: GOLD, opacity: 0.85, paddingLeft: '0.42em' }}>seteveus space</div>
          </>
        )}
      </div>
    </div>
  );
}
