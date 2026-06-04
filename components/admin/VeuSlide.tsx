'use client';

// VeuSlide — replica fiel do SLIDE-DESIGN-SPEC.md (variante React) dos
// Carrosseis dos 7 Veus. Canvas 1080x1920 (9:16). Toda a tipografia/medidas
// em unidades de container (cqw, 100cqw = 1080px) para ser pixel-exacta em
// qualquer tamanho de render. NAO alterar valores — so expandir conteudo.

import { useLayoutEffect, useRef } from 'react';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';

// Tema editorial (default CarouselTheme do spec)
const C = {
  ink: '#26221c',
  ivory: '#f3ece0',
  parchmentDark: '#d8d0c1',
  deep: '#1a1714',
  deepWarm: '#2a2520',
  terracotta: '#8a8378',
  gold: '#b69a6e',
  mist: 'rgba(243, 236, 224, 0.65)',
};
const GOLD_HARD = (a: number) => `rgba(201, 169, 97, ${a})`;
const TERRA_HARD = (a: number) => `rgba(184, 92, 56, ${a})`;

// px (no canvas de 1080) -> cqw
const u = (px: number) => `${((px / 1080) * 100).toFixed(4)}cqw`;

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Auto-fit fiel ao spec: comeca em startPx, reduz step ate caber em maxWidthPx
// (medido em px reais, escalados pela largura do container).
function useAutoFit(text: string, startPx: number, minPx: number, stepPx: number, maxWidthPx: number) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest('[data-veu-root]') as HTMLElement | null;
    if (!root) return;
    const fit = () => {
      const cw = root.clientWidth;
      if (!cw) return;
      const scale = cw / 1080;
      const allowed = maxWidthPx * scale;
      let s = startPx;
      el.style.fontSize = `${s * scale}px`;
      let i = 0;
      while (el.scrollWidth > allowed && s > minPx && i < 80) {
        s -= stepPx;
        el.style.fontSize = `${s * scale}px`;
        i++;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    return () => ro.disconnect();
  }, [text, startPx, minPx, stepPx, maxWidthPx]);
  return ref;
}

function iconeOferta(titulo?: string): string {
  const t = (titulo ?? '').toLowerCase();
  if (t.includes('músic') || t.includes('music')) return '🎧';
  if (t.includes('comunidad')) return '🌀';
  if (t.includes('espelho') || t.includes('lumina')) return '✦';
  if (t.includes('livro')) return '📖';
  return '✦';
}

export function VeuSlide({
  slide,
  palavra,
  subtitulo,
  imageUrl,
  numeroDia,
  slideIndex,
  slideTotal = 6,
}: {
  slide: Slide;
  mundo?: Mundo;
  palavra?: string;
  subtitulo?: string;
  imageUrl?: string;
  numeroDia?: number;
  slideIndex?: number;
  slideTotal?: number;
}) {
  const isCapa = slide.tipo === 'capa';
  const isCta = slide.tipo === 'cta';
  const escuro = isCapa || isCta; // modo "mixed": capa/cta sombra, conteudo luz

  // título da capa e recurso do CTA com auto-fit
  const tituloRef = useAutoFit(palavra ?? slide.texto, 180, 110, 4, 860);
  const recursoRef = useAutoFit(slide.titulo ?? slide.texto, 78, 50, 2, 820);

  // fundo raiz
  const bgRaiz = isCapa
    ? `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.deepWarm} 0%, ${C.deep} 70%)`
    : isCta
      ? `radial-gradient(ellipse 70% 50% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 70%)`
      : `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 70%)`;

  const padding = isCapa ? `${u(150)} ${u(110)} ${u(200)}` : isCta ? `${u(180)} ${u(110)} ${u(180)}` : `${u(110)}`;

  // scrim do fundo MJ
  const scrim = escuro
    ? `radial-gradient(ellipse at 50% 40%, rgba(15,12,10,0.68) 0%, rgba(15,12,10,0.92) 100%)`
    : `radial-gradient(ellipse at 50% 40%, rgba(245,234,213,0.94) 0%, rgba(245,234,213,0.62) 100%)`;
  const vinheta = escuro
    ? `radial-gradient(ellipse 80% 60% at center, transparent 40%, rgba(0,0,0,0.55) 100%)`
    : `radial-gradient(ellipse 90% 70% at center, transparent 50%, rgba(60,35,15,0.18) 100%)`;
  const glow = isCapa
    ? `radial-gradient(ellipse 60% 50% at 50% 35%, ${GOLD_HARD(0.1)} 0%, transparent 70%)`
    : isCta
      ? `radial-gradient(ellipse 60% 50% at 50% 60%, ${TERRA_HARD(0.1)} 0%, transparent 70%)`
      : 'none';

  const Cantoneira = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const top = pos[0] === 't';
    const left = pos[1] === 'l';
    const v = { position: 'absolute' as const, background: C.gold, opacity: 0.55, zIndex: 3 };
    const off = u(60);
    return (
      <>
        <span style={{ ...v, height: u(1), width: u(56), [top ? 'top' : 'bottom']: off, [left ? 'left' : 'right']: off }} />
        <span style={{ ...v, width: u(1), height: u(56), [top ? 'top' : 'bottom']: off, [left ? 'left' : 'right']: off }} />
      </>
    );
  };

  return (
    <div
      data-veu-root
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '1080 / 1920', containerType: 'inline-size', background: bgRaiz, padding, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', fontFamily: FONT_SERIF }}
    >
      {/* fundo MJ + scrim */}
      {imageUrl && (
        <>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: scrim, zIndex: 0 }} />
        </>
      )}
      {/* grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: u(220), mixBlendMode: escuro ? 'screen' : 'overlay', opacity: escuro ? 0.18 : 0.45, zIndex: 0, pointerEvents: 'none' }} />
      {/* vinheta */}
      <div style={{ position: 'absolute', inset: 0, background: vinheta, zIndex: 0, pointerEvents: 'none' }} />
      {/* glow */}
      {glow !== 'none' && <div style={{ position: 'absolute', inset: 0, background: glow, zIndex: 1, pointerEvents: 'none' }} />}

      {/* watermarks */}
      {isCapa && numeroDia != null && (
        <span style={{ position: 'absolute', top: u(280), left: '50%', transform: 'translateX(-50%)', fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: u(720), lineHeight: 1, letterSpacing: '-0.05em', color: GOLD_HARD(0.05), zIndex: 1, pointerEvents: 'none' }}>{numeroDia}</span>
      )}
      {isCta && (
        <span style={{ position: 'absolute', bottom: u(-120), right: u(-120), fontSize: u(600), color: C.gold, opacity: 0.04, zIndex: 1, pointerEvents: 'none' }}>🌀</span>
      )}

      {/* cantoneiras (capa) */}
      {isCapa && (<><Cantoneira pos="tl" /><Cantoneira pos="tr" /><Cantoneira pos="bl" /><Cantoneira pos="br" /></>)}

      {/* ───────── CAPA ───────── */}
      {isCapa && (
        <>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(8) }}>
            <span style={{ width: u(320), height: u(1), background: C.gold, opacity: 0.65 }} />
            <span style={{ width: u(200), height: u(1), background: C.gold, opacity: 0.45 }} />
            <span style={{ width: u(100), height: u(1), background: C.gold, opacity: 0.28 }} />
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(40) }}>
            <div ref={tituloRef} style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: u(180), lineHeight: 0.95, letterSpacing: '-0.025em', whiteSpace: 'nowrap', color: C.ivory }}>{palavra ?? slide.texto}</div>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: u(28), letterSpacing: '1.2em', color: C.gold, opacity: 0.8, paddingLeft: '1.2em' }}>◇ ◇ ◇</div>
            {subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: u(40), lineHeight: 1.4, color: C.ivory, opacity: 0.78, maxWidth: u(760) }}>{subtitulo}</p>}
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(16) }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: u(18), letterSpacing: '0.6em', textTransform: 'uppercase', color: C.gold, opacity: 0.7 }}>os sete véus</span>
            {palavra && <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: u(16), letterSpacing: '0.45em', textTransform: 'uppercase', color: C.gold, opacity: 0.4 }}>{palavra} · desliza →</span>}
          </div>
        </>
      )}

      {/* ───────── CONTEÚDO ───────── */}
      {!isCapa && !isCta && (
        <>
          <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: u(18), letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(26,22,20,0.4)' }}>os sete véus</span>
            <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: u(32), color: 'rgba(184,92,56,0.55)' }}>{String(slideIndex ?? 1).padStart(2, '0')} / {String(slideTotal).padStart(2, '0')}</span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(28), width: '100%' }}>
            {isPoetico(slide.titulo) ? (
              <>
                <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: u(56), color: C.terracotta, opacity: 0.7 }}>~</span>
                <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: u(72), lineHeight: 1.3, color: C.ink, maxWidth: u(820), whiteSpace: 'pre-line' }}>{slide.texto}</p>
                <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: u(56), color: C.terracotta, opacity: 0.7 }}>~</span>
              </>
            ) : (
              <>
                {slide.titulo && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: u(22), letterSpacing: '0.4em', textTransform: 'uppercase', color: C.terracotta }}>{slide.titulo}</span>}
                <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: u((slide.texto?.length ?? 0) > 200 ? 44 : 50), lineHeight: 1.42, color: C.ink, maxWidth: u(800), whiteSpace: 'pre-line' }}>{slide.texto}</p>
              </>
            )}
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(14) }}>
            <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: u(24), letterSpacing: '0.8em', color: C.terracotta, opacity: 0.6, paddingLeft: '0.8em' }}>◇ ◇ ◇</span>
            {palavra && <span style={{ fontFamily: FONT_SANS, fontSize: u(16), letterSpacing: '0.6em', textTransform: 'lowercase', color: 'rgba(26,22,20,0.35)' }}>{palavra.toLowerCase()}</span>}
          </div>
        </>
      )}

      {/* ───────── CTA ───────── */}
      {isCta && (
        <>
          <div style={{ position: 'relative', zIndex: 2, width: u(220), height: u(220), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <span style={{ position: 'absolute', inset: 0, border: `${u(1)} solid ${C.gold}`, opacity: 0.35, borderRadius: '50%' }} />
            <span style={{ position: 'absolute', inset: u(16), border: `${u(1)} solid ${C.gold}`, opacity: 0.18, borderRadius: '50%' }} />
            <span style={{ fontSize: u(96), lineHeight: 1 }}>{iconeOferta(slide.titulo)}</span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(28) }}>
            <div ref={recursoRef} style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: u(78), lineHeight: 1.1, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: C.ivory }}>{slide.titulo ?? slide.texto}</div>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: u(38), lineHeight: 1.45, color: C.mist, maxWidth: u(720) }}>{slide.texto}</p>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: u(24), width: u(820), maxWidth: '100%' }}>
            <span style={{ flex: 1, height: u(1), background: C.gold, opacity: 0.55 }} />
            <span style={{ fontFamily: FONT_MONO, fontWeight: 400, fontSize: u(30), letterSpacing: '0.04em', color: C.terracotta, whiteSpace: 'nowrap' }}>{slide.destaque ?? 'viviannedossantos.com'}</span>
            <span style={{ flex: 1, height: u(1), background: C.gold, opacity: 0.55 }} />
          </div>
        </>
      )}
    </div>
  );
}

function isPoetico(titulo?: string): boolean {
  return (titulo ?? '').toUpperCase().includes('PO');
}
