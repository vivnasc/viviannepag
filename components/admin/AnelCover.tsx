'use client';

// AnelCover — capa de destaque / foto de perfil (1080x1080, redondo).
// TRANSCENDENTE POR DESIGN: gradiente profundo + brilho + mandala de luz
// (geometria sagrada em SVG) + etiqueta serif dourada. Sem fotos do pool.
// Se houver imageUrl (imagem MJ arrastada), usa-a como fundo com véu.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

// mandala de luz (geometria sagrada) — concentrica + raios
function Mandala({ cor, op = 0.22 }: { cor: string; op?: number }) {
  const cx = 540, raios = 24;
  return (
    <svg viewBox="0 0 1080 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: op }}>
      <g fill="none" stroke={cor} strokeWidth="1.5">
        <circle cx={cx} cy={cx} r="170" />
        <circle cx={cx} cy={cx} r="250" />
        <circle cx={cx} cy={cx} r="330" strokeDasharray="2 12" />
        {Array.from({ length: raios }).map((_, i) => {
          const a = (i * 360 / raios) * Math.PI / 180;
          return <line key={i} x1={cx + 250 * Math.cos(a)} y1={cx + 250 * Math.sin(a)} x2={cx + 330 * Math.cos(a)} y2={cx + 330 * Math.sin(a)} />;
        })}
      </g>
      <circle cx={cx} cy={cx} r="6" fill={cor} />
    </svg>
  );
}

export function AnelCover({ label, imageUrl, mundo = 'escola', perfil = false }: { label: string; imageUrl?: string; mundo?: Mundo; perfil?: boolean }) {
  const p = PALETAS[mundo];
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '50%', background: p.bg2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, color: p.texto, textAlign: 'center', background: `radial-gradient(circle at 50% 42%, ${p.bg} 0%, ${p.bg2} 70%)` }}>
        {/* imagem MJ opcional */}
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${p.bg2}aa 0%, ${p.bg2}e8 100%)`, zIndex: 0 }} />
        </>)}
        {/* brilho transcendente */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${p.destaque}33 0%, transparent 55%)`, zIndex: 1, pointerEvents: 'none' }} />
        {/* mandala de luz */}
        <Mandala cor={p.destaque} op={imageUrl ? 0.16 : 0.24} />

        {perfil ? (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
            <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 120, letterSpacing: '0.3em', color: p.destaque, opacity: 0.92, paddingLeft: '0.3em', textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}>◇</span>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: '0 110px' }}>
            <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 92, lineHeight: 1.02, letterSpacing: '0.02em', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>{label}</span>
            <span style={{ width: 110, height: 2, background: p.destaque, opacity: 0.75, borderRadius: 2 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 21, letterSpacing: '0.45em', textTransform: 'uppercase', color: p.destaque, opacity: 0.7 }}>os sete véus</span>
          </div>
        )}
      </div>
    </div>
  );
}
