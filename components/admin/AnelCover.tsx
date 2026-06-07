'use client';

// AnelCover — capa de destaque / foto de perfil (1080x1080).
// A ESTRELA e a imagem transcendente (gerada no MJ e arrastada). Sem imagem,
// mostra um aviso claro para gerar+arrastar (nao um desenho falso).
// Destaque = imagem + etiqueta (palavra) por cima. Perfil = so a imagem.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

export function AnelCover({ label, imageUrl, mundo = 'escola', perfil = false, square = false }: { label: string; imageUrl?: string; mundo?: Mundo; perfil?: boolean; square?: boolean }) {
  const p = PALETAS[mundo];
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: square ? 0 : '50%', background: p.bg2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, color: p.texto, textAlign: 'center', background: p.bg2 }}>
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            {!perfil && (
              <>
                {/* scrim suave so para a palavra ler */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.45) 100%)', zIndex: 1 }} />
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '0 90px' }}>
                  <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 92, lineHeight: 1.02, letterSpacing: '0.02em', color: '#fff', textShadow: '0 2px 26px rgba(0,0,0,0.7)' }}>{label}</span>
                  <span style={{ width: 96, height: 2, background: p.destaque, opacity: 0.9, borderRadius: 2 }} />
                </div>
              </>
            )}
          </>
        ) : (
          // sem imagem — aviso claro para gerar+arrastar (nada de falso)
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${p.bg} 0%, ${p.bg2} 80%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
            <span style={{ position: 'absolute', inset: 90, borderRadius: '50%', border: `2px dashed ${p.destaque}55` }} />
            <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 78, color: p.texto, opacity: 0.55 }}>{perfil ? 'perfil' : label}</span>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.1em', color: p.destaque, opacity: 0.85, maxWidth: 620, lineHeight: 1.4 }}>{perfil ? <>arrasta aqui a tua<br />foto profissional</> : <>copia o prompt MJ →<br />gera no MidJourney → arrasta aqui</>}</span>
          </div>
        )}
      </div>
    </div>
  );
}
