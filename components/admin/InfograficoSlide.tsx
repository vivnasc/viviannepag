'use client';

// InfograficoSlide — cartao unico (1080x1350, 4:5) que explica um PADRAO e a
// sua limitacao. Mesma estetica dos 7 Veus (serif, dourado, fundo do pool).
// Desenha no canvas real e escala para caber (como o VeuSlide).

import { useLayoutEffect, useRef, useState } from 'react';

const C = {
  ink: '#26221c', ivory: '#f3ece0', parchmentDark: '#d8d0c1',
  deep: '#1a1714', deepWarm: '#2a2520', terracotta: '#8a8378',
  gold: '#b69a6e', mist: 'rgba(243,236,224,0.65)',
};
const GOLD_HARD = (a: number) => `rgba(201,169,97,${a})`;
const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type Infografico = {
  padrao: string;
  subtitulo?: string;
  ciclo: string[];
  custo: string;
  virada?: string;
  url?: string;
};

export function InfograficoSlide({ info, imageUrl }: { info: Infografico; imageUrl?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden', borderRadius: 16, background: C.deep }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1080, height: 1350,
        transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden',
        background: imageUrl ? '#000' : `radial-gradient(ellipse 80% 70% at 50% 30%, ${C.deepWarm} 0%, ${C.deep} 75%)`,
        padding: '96px 90px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: FONT_SERIF, color: C.ivory,
      }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(15,12,10,0.78) 0%, rgba(15,12,10,0.94) 100%)', zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.16, zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at center, transparent 45%, rgba(0,0,0,0.5) 100%)', zIndex: 0, pointerEvents: 'none' }} />

        {/* topo */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase', color: C.gold, opacity: 0.85 }}>O padrão</span>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 84, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '18px 0 0' }}>{info.padrao}</h2>
          {info.subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 36, lineHeight: 1.35, opacity: 0.8, margin: '14px auto 0', maxWidth: 820 }}>{info.subtitulo}</p>}
        </div>

        {/* ciclo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '40px 0' }}>
          {info.ciclo.slice(0, 5).map((passo, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 38, lineHeight: 1.2, color: C.ivory, border: `1px solid ${GOLD_HARD(0.4)}`, borderRadius: 14, padding: '12px 28px', maxWidth: 760 }}>{passo}</div>
              {i < Math.min(info.ciclo.length, 5) - 1 && <span style={{ color: C.gold, opacity: 0.7, fontSize: 30, lineHeight: 1 }}>↓</span>}
            </div>
          ))}
        </div>

        {/* o que te custa */}
        <div style={{ position: 'relative', zIndex: 2, width: '88%', border: `1px solid ${GOLD_HARD(0.35)}`, borderRadius: 18, padding: '26px 32px', background: 'rgba(0,0,0,0.25)' }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.gold }}>O que te custa</span>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 40, lineHeight: 1.4, margin: '12px 0 0' }}>{info.custo}</p>
        </div>

        {info.virada && <p style={{ position: 'relative', zIndex: 2, fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 46, lineHeight: 1.35, color: C.ivory, margin: '34px auto 0', maxWidth: 860 }}>{info.virada}</p>}

        <div style={{ flex: 1 }} />
        {/* rodape */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 18, letterSpacing: '0.6em', textTransform: 'uppercase', color: C.gold, opacity: 0.7 }}>os sete véus</span>
          {info.url && <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: '0.03em', color: C.terracotta }}>{info.url}</span>}
        </div>
      </div>
    </div>
  );
}
