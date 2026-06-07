'use client';

// InfograficoSlide — cartao unico 1080x1350 (4:5) sobre um PADRAO:
//  - diagrama em RODA (o ciclo que se repete)
//  - duas implicacoes: EM TI / NOS OUTROS
//  - virada + CTA
// Paleta do universo (mundo). Auto-encolhe o conteudo para nunca cortar (sem scroll).

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
  custoTi?: string;
  custoOutros?: string;
  virada?: string;
  url?: string;
};

export function InfograficoSlide({ info, mundo = 'freeme', imageUrl }: { info: Infografico; mundo?: Mundo; imageUrl?: string }) {
  const p = PALETAS[mundo];
  const BG1 = p.bg, BG2 = p.bg2, ACCENT = p.destaque, TXT = p.texto;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;

  // escala do canvas para o container
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  // auto-encolher o conteudo para caber em 1350 (nunca corta)
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = contentRef.current; if (!el) return;
    const apply = () => {
      el.style.transform = 'scale(1)';
      const avail = 1350 - 150; // padding vertical
      const h = el.scrollHeight;
      setFit(h > avail ? Math.max(0.6, avail / h) : 1);
    };
    apply();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(apply).catch(() => {});
  }, [info.padrao, info.subtitulo, info.custoTi, info.custoOutros, info.virada, info.ciclo.length]);

  // diagrama em roda
  const passos = info.ciclo.slice(0, 4);
  const n = Math.max(passos.length, 1);
  const RING = 520, CXY = RING / 2, R = 178;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1080, height: 1350, transform: `scale(${scale})`, transformOrigin: 'top left',
        visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 95% 80% at 50% 30%, ${BG1} 0%, ${BG2} 80%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', fontFamily: FONT_SERIF, color: TXT,
      }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${a(BG2, 'cc')} 0%, ${a(BG2, 'f2')} 100%)`, zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.14, zIndex: 0, pointerEvents: 'none' }} />

        <div ref={contentRef} style={{ position: 'relative', zIndex: 2, width: 1080, padding: '0 84px', boxSizing: 'border-box', transform: `scale(${fit})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* topo */}
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>O padrão</span>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 80, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '16px 0 0' }}>{info.padrao}</h2>
          {info.subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, lineHeight: 1.3, opacity: 0.82, margin: '12px auto 0', maxWidth: 820 }}>{info.subtitulo}</p>}

          {/* diagrama em roda */}
          <div style={{ position: 'relative', width: RING, height: RING, margin: '24px 0 8px' }}>
            <div style={{ position: 'absolute', inset: 64, borderRadius: '50%', border: `1px dashed ${a(ACCENT, '55')}` }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 66, color: ACCENT, opacity: 0.85, lineHeight: 1 }}>↻</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 17, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7, marginTop: 6 }}>repete-se</span>
            </div>
            {passos.map((passo, i) => {
              const ang = (-90 + i * (360 / n)) * Math.PI / 180;
              const x = CXY + R * Math.cos(ang), y = CXY + R * Math.sin(ang);
              return (
                <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', width: 250 }}>
                  <div style={{ fontFamily: FONT_SERIF, fontSize: 30, lineHeight: 1.18, color: TXT, background: a(BG2, 'cc'), border: `1px solid ${a(ACCENT, '55')}`, borderRadius: 12, padding: '10px 16px' }}>
                    <span style={{ fontFamily: FONT_SANS, fontSize: 16, color: ACCENT, opacity: 0.8, display: 'block', marginBottom: 2 }}>{i + 1}</span>
                    {passo}
                  </div>
                </div>
              );
            })}
          </div>

          {/* implicacoes: em ti / nos outros */}
          {(info.custoTi || info.custoOutros) && (
            <div style={{ display: 'flex', gap: 20, width: '100%', marginTop: 18 }}>
              {[{ t: 'Em ti', v: info.custoTi }, { t: 'Nos outros', v: info.custoOutros }].filter((b) => b.v).map((b) => (
                <div key={b.t} style={{ flex: 1, border: `1px solid ${a(ACCENT, '45')}`, borderRadius: 16, padding: '20px 22px', background: a(BG2, '55') }}>
                  <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, letterSpacing: '0.32em', textTransform: 'uppercase', color: ACCENT }}>{b.t}</span>
                  <p style={{ fontFamily: FONT_SERIF, fontSize: 32, lineHeight: 1.32, margin: '10px 0 0' }}>{b.v}</p>
                </div>
              ))}
            </div>
          )}

          {info.virada && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 40, lineHeight: 1.3, margin: '26px auto 0', maxWidth: 880 }}>{info.virada}</p>}

          {/* rodape */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 30 }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 18, letterSpacing: '0.6em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7 }}>os sete véus</span>
            {info.url && <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: '0.03em', color: ACCENT, opacity: 0.85 }}>{info.url}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
