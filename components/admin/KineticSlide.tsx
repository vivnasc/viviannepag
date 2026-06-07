'use client';

// KineticSlide — reel "simples" de alto desempenho: uma imagem transcendente +
// uma frase que se revela PALAVRA A PALAVRA (typewriter/kinetic), com leve zoom
// de fundo. Tudo em função de `prog` (0..1) -> determinístico, o render captura
// frame a frame conduzindo o prog. Estética da feed: serif elegante, ouro nas
// palavras-destaque, assinatura discreta.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export function KineticSlide({ texto, destaque = [], imageUrl, mundo = 'escola', prog = 1, ratio = '9:16' }: { texto: string; destaque?: string[]; imageUrl?: string; mundo?: Mundo; prog?: number; ratio?: '9:16' | '4:5' }) {
  const pal = PALETAS[mundo];
  const BG1 = pal.bg, BG2 = pal.bg2, ACCENT = pal.destaque;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;
  const H = ratio === '4:5' ? 1350 : 1920;
  const ar = ratio === '4:5' ? '1080 / 1350' : '1080 / 1920';

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  const destSet = new Set(destaque.map(norm));
  const revelar = Math.min(1, prog / 0.72);          // 0..0.72 revela, depois segura
  const mostradas = revelar * palavras.length;
  const aindaEscreve = revelar < 1;
  const ultimoVisivel = Math.min(palavras.length - 1, Math.floor(mostradas));
  const zoom = 1 + 0.07 * prog;                        // leve Ken Burns
  const rodapeOp = Math.max(0, Math.min(1, (prog - 0.55) / 0.25));

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 110% 80% at 50% 35%, ${BG1} 0%, ${BG2} 80%)`, overflow: 'hidden' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: 'center', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${a(BG2, '55')} 0%, ${a(BG2, '22')} 40%, ${a(BG2, 'cc')} 100%)`, zIndex: 1 }} />
        </>)}

        {/* frase */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px', zIndex: 2 }}>
          <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 92, lineHeight: 1.18, letterSpacing: '-0.01em', textAlign: 'center', color: '#F4ECDD', textShadow: imageUrl ? '0 2px 28px rgba(0,0,0,0.6)' : 'none', margin: 0 }}>
            {palavras.map((w, i) => {
              const dest = destSet.has(norm(w));
              let op = 0, dy = 14;
              if (i < ultimoVisivel) { op = 1; dy = 0; }
              else if (i === ultimoVisivel) { const f = Math.max(0, Math.min(1, mostradas - i)); op = f; dy = 14 * (1 - f); }
              return (
                <span key={i} style={{ display: 'inline-block', opacity: op, transform: `translateY(${dy}px)`, color: dest ? ACCENT : '#F4ECDD', fontStyle: dest ? 'italic' : 'normal', marginRight: '0.28em', transition: 'none' }}>{w}</span>
              );
            })}
            {aindaEscreve && <span style={{ display: 'inline-block', width: 5, height: '0.92em', background: ACCENT, opacity: 0.9, transform: 'translateY(0.12em)', marginLeft: '0.04em' }} />}
          </p>
        </div>

        {/* assinatura */}
        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center', zIndex: 3, opacity: rodapeOp }}>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, color: '#F4ECDD', opacity: 0.85, margin: 0 }}>Véu a Véu</p>
          <p style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.04em', color: ACCENT, opacity: 0.85, margin: '6px 0 0' }}>viviannedossantos.com</p>
        </div>
      </div>
    </div>
  );
}
