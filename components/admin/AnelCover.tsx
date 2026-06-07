'use client';

// AnelCover — capa de destaque / foto de perfil (1080x1080) com imagem
// transcendente + etiqueta serif dourada. Mesma identidade (gota/linha/◇).
// perfil=true -> versao para foto de perfil ("Véu a Véu").

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

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
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(circle at 50% 40%, ${p.bg} 0%, ${p.bg2} 75%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, color: p.texto, textAlign: 'center' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${p.bg2}99 0%, ${p.bg2}e6 100%)`, zIndex: 0 }} />
        </>)}

        {perfil ? (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 40, letterSpacing: '0.5em', color: p.destaque, opacity: 0.85, paddingLeft: '0.5em' }}>◇ ◇ ◇</span>
            <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 150, lineHeight: 0.92, letterSpacing: '0.02em' }}>Véu<br />a Véu</span>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 26, letterSpacing: '0.4em', textTransform: 'uppercase', color: p.destaque, opacity: 0.8, marginTop: 8 }}>vivianne dos santos</span>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 90px' }}>
            <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, letterSpacing: '0.5em', color: p.destaque, opacity: 0.8, paddingLeft: '0.5em' }}>◇</span>
            <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 96, lineHeight: 1.02, letterSpacing: '0.02em' }}>{label}</span>
            <span style={{ width: 120, height: 2, background: p.destaque, opacity: 0.7, borderRadius: 2 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 22, letterSpacing: '0.45em', textTransform: 'uppercase', color: p.destaque, opacity: 0.7 }}>os sete véus</span>
          </div>
        )}
      </div>
    </div>
  );
}
