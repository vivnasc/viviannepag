'use client';

// InfograficoSlide — cartao unico (1080x1350, 4:5) que explica um PADRAO e a
// sua limitacao. Paleta do UNIVERSO (mundo). Desenha no canvas real e escala.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

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

export function InfograficoSlide({ info, mundo = 'freeme', imageUrl }: { info: Infografico; mundo?: Mundo; imageUrl?: string }) {
  const p = PALETAS[mundo];
  const BG1 = p.bg, BG2 = p.bg2, ACCENT = p.destaque, TXT = p.texto;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`; // hex + alpha (ex.: 66)

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1080, height: 1350,
        transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden',
        background: imageUrl ? '#000' : `radial-gradient(ellipse 90% 75% at 50% 28%, ${BG1} 0%, ${BG2} 78%)`,
        padding: '94px 88px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: FONT_SERIF, color: TXT,
      }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${a(BG2, 'cc')} 0%, ${a(BG2, 'f2')} 100%)`, zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.14, zIndex: 0, pointerEvents: 'none' }} />

        {/* topo */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>O padrão</span>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 82, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '18px 0 0' }}>{info.padrao}</h2>
          {info.subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 36, lineHeight: 1.35, opacity: 0.82, margin: '14px auto 0', maxWidth: 840 }}>{info.subtitulo}</p>}
        </div>

        {/* ciclo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, margin: '38px 0' }}>
          {info.ciclo.slice(0, 5).map((passo, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 37, lineHeight: 1.2, color: TXT, border: `1px solid ${a(ACCENT, '55')}`, borderRadius: 14, padding: '11px 26px', maxWidth: 780 }}>{passo}</div>
              {i < Math.min(info.ciclo.length, 5) - 1 && <span style={{ color: ACCENT, opacity: 0.75, fontSize: 30, lineHeight: 1 }}>↓</span>}
            </div>
          ))}
        </div>

        {/* o que te custa */}
        <div style={{ position: 'relative', zIndex: 2, width: '90%', border: `1px solid ${a(ACCENT, '45')}`, borderRadius: 18, padding: '24px 32px', background: a(BG2, '55') }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.4em', textTransform: 'uppercase', color: ACCENT }}>O que te custa</span>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 39, lineHeight: 1.4, margin: '12px 0 0' }}>{info.custo}</p>
        </div>

        {info.virada && <p style={{ position: 'relative', zIndex: 2, fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 45, lineHeight: 1.35, color: TXT, margin: '30px auto 0', maxWidth: 880 }}>{info.virada}</p>}

        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 18, letterSpacing: '0.6em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7 }}>os sete véus</span>
          {info.url && <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: '0.03em', color: ACCENT, opacity: 0.85 }}>{info.url}</span>}
        </div>
      </div>
    </div>
  );
}
