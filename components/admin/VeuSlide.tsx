'use client';

// VeuSlide — replica fiel do SLIDE-DESIGN-SPEC.md (variante React).
// Tecnica: desenha-se no canvas REAL de 1080x1920 com os px exactos do spec e
// escala-se a folha inteira (transform: scale) para caber no container. Assim as
// proporcoes sao identicas a producao, em qualquer tamanho de ecra.

import { useLayoutEffect, useRef, useState } from 'react';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';

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

// Paleta por dia/veu (1-7) — spec: rosa, lavanda, menta, salvia, ambar, ceu, aurora
const HUES = [
  { hue: '#f5b8a8', deep: '#e89684' }, // 1 rosa
  { hue: '#d8c4e8', deep: '#b29bce' }, // 2 lavanda
  { hue: '#b8dcc8', deep: '#82bea4' }, // 3 menta
  { hue: '#cde0b6', deep: '#9fbc7c' }, // 4 salvia
  { hue: '#f0c890', deep: '#d8a868' }, // 5 ambar
  { hue: '#bedaee', deep: '#8cb4d0' }, // 6 ceu
  { hue: '#e6cde8', deep: '#c098c8' }, // 7 aurora
];

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// auto-fit no canvas real (px de 1080): reduz ate caber em maxW
function useAutoFit(text: string, start: number, min: number, step: number, maxW: number) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      let s = start;
      el.style.fontSize = `${s}px`;
      let i = 0;
      while (el.scrollWidth > maxW && s > min && i < 90) {
        s -= step;
        el.style.fontSize = `${s}px`;
        i++;
      }
    };
    fit();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(fit).catch(() => {});
  }, [text, start, min, step, maxW]);
  return ref;
}

function iconeOferta(titulo?: string): string {
  const t = (titulo ?? '').toLowerCase();
  if (t.includes('músic') || t.includes('music') || t.includes('loranne')) return '🎧';
  if (t.includes('comunidad') || t.includes('ecos')) return '🌀';
  if (t.includes('espelho') || t.includes('lumina')) return '✦';
  if (t.includes('livro') || t.includes('véus')) return '📖';
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
  prog = 1,
}: {
  slide: Slide;
  mundo?: Mundo;
  palavra?: string;
  subtitulo?: string;
  imageUrl?: string;
  numeroDia?: number;
  slideIndex?: number;
  slideTotal?: number;
  prog?: number;
}) {
  const isCapa = slide.tipo === 'capa';
  const isCta = slide.tipo === 'cta';
  const escuro = isCapa || isCta;
  // CAPA com movimento (o render conduz prog 0..1; a prog=1 fica IDENTICA ao
  // estatico, por isso as imagens de feed nao mudam). O topo (palavra/linhas/
  // subtitulo) floresce de um leve desfoque e o gancho escreve-se palavra a
  // palavra (typewriter), como nos reels cineticos.
  const motion = isCapa && prog < 1;
  const topReveal = Math.min(1, prog / 0.4);
  const ganchoProg = Math.max(0, Math.min(1, (prog - 0.3) / 0.62));
  const ganchoPalavras = (slide.destaque ?? '').trim().split(/\s+/).filter(Boolean);
  const ganchoMostradas = ganchoProg * ganchoPalavras.length;
  const ganchoEscreve = motion && ganchoProg < 1;
  const hue = numeroDia ? HUES[(numeroDia - 1) % 7] : undefined;
  const ornamento = hue?.deep ?? C.gold; // accent tingido pela cor do dia

  // escala da folha 1080 para caber no container
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

  const tituloRef = useAutoFit(palavra ?? slide.texto, 180, 110, 4, 860);
  const recursoRef = useAutoFit(slide.titulo ?? slide.texto, 78, 50, 2, 820);

  const bgRaiz = isCapa
    ? `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.deepWarm} 0%, ${C.deep} 70%)`
    : isCta
      ? `radial-gradient(ellipse 70% 50% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 70%)`
      : `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 70%)`;
  const padding = isCapa ? '150px 110px 200px' : isCta ? '180px 110px 180px' : '110px';
  // CAPA/CTA com imagem: véu LEVE para a imagem transcendente respirar (era 0.68/0.92,
  // escurecia quase tudo). O título tem sombra própria, por isso continua legível.
  const scrim = escuro
    ? 'radial-gradient(ellipse at 50% 42%, rgba(15,12,10,0.30) 0%, rgba(15,12,10,0.60) 100%)'
    : 'radial-gradient(ellipse at 50% 40%, rgba(245,234,213,0.94) 0%, rgba(245,234,213,0.62) 100%)';
  const vinheta = escuro
    ? 'radial-gradient(ellipse 82% 62% at center, transparent 48%, rgba(0,0,0,0.40) 100%)'
    : 'radial-gradient(ellipse 90% 70% at center, transparent 50%, rgba(60,35,15,0.18) 100%)';
  const glow = isCapa
    ? `radial-gradient(ellipse 60% 50% at 50% 35%, ${GOLD_HARD(0.1)} 0%, transparent 70%)`
    : isCta
      ? `radial-gradient(ellipse 60% 50% at 50% 60%, ${TERRA_HARD(0.1)} 0%, transparent 70%)`
      : 'none';

  const cantoneira = (top: boolean, left: boolean) => (
    <>
      <span style={{ position: 'absolute', background: C.gold, opacity: 0.55, zIndex: 3, height: 1, width: 56, [top ? 'top' : 'bottom']: 60, [left ? 'left' : 'right']: 60 }} />
      <span style={{ position: 'absolute', background: C.gold, opacity: 0.55, zIndex: 3, width: 1, height: 56, [top ? 'top' : 'bottom']: 60, [left ? 'left' : 'right']: 60 }} />
    </>
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 16, background: C.deep }}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: 1080, height: 1920,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          visibility: scale ? 'visible' : 'hidden',
          background: escuro && imageUrl ? '#000' : bgRaiz, padding, boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'center', fontFamily: FONT_SERIF,
        }}
      >
        {imageUrl && (
          <>
            <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: scrim, zIndex: 0 }} />
          </>
        )}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: escuro ? 'screen' : 'overlay', opacity: escuro ? 0.18 : 0.45, zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: vinheta, zIndex: 0, pointerEvents: 'none' }} />
        {hue && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 55% at 50% 32%, ${hue.hue}${escuro ? '2e' : '40'} 0%, transparent 66%)`, mixBlendMode: escuro ? 'screen' : 'multiply', opacity: escuro ? 0.55 : 0.4, zIndex: 0, pointerEvents: 'none' }} />}
        {glow !== 'none' && <div style={{ position: 'absolute', inset: 0, background: glow, zIndex: 1, pointerEvents: 'none' }} />}

        {isCapa && numeroDia != null && (
          <span style={{ position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 720, lineHeight: 1, letterSpacing: '-0.05em', color: GOLD_HARD(0.05), zIndex: 1, pointerEvents: 'none' }}>{numeroDia}</span>
        )}
        {isCta && <span style={{ position: 'absolute', bottom: -120, right: -120, fontSize: 600, color: C.gold, opacity: 0.04, zIndex: 1, pointerEvents: 'none' }}>🌀</span>}

        {isCapa && (<>{cantoneira(true, true)}{cantoneira(true, false)}{cantoneira(false, true)}{cantoneira(false, false)}</>)}

        {/* CAPA */}
        {isCapa && (
          <>
            {/* TOPO: linhas + palavra + ◇◇◇ + subtitulo */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, opacity: motion ? topReveal : 1, filter: motion ? `blur(${(1 - topReveal) * 10}px)` : 'none', transform: motion ? `translateY(${(1 - topReveal) * 18}px)` : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 320, height: 1, background: C.gold, opacity: 0.65 }} />
                <span style={{ width: 200, height: 1, background: C.gold, opacity: 0.45 }} />
                <span style={{ width: 100, height: 1, background: C.gold, opacity: 0.28 }} />
              </div>
              <div ref={tituloRef} style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 180, lineHeight: 0.95, letterSpacing: '-0.025em', whiteSpace: 'nowrap', color: C.ivory, textShadow: imageUrl ? '0 2px 30px rgba(0,0,0,0.6)' : 'none' }}>{palavra ?? slide.texto}</div>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 28, letterSpacing: '1.2em', color: ornamento, opacity: 0.85, paddingLeft: '1.2em' }}>◇ ◇ ◇</div>
              {subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, lineHeight: 1.4, color: C.ivory, opacity: 0.82, maxWidth: 780 }}>{subtitulo}</p>}
            </div>
            {/* CENTRO: frase de abertura (o GANCHO). Estatico a prog=1; com
                movimento escreve-se palavra a palavra. */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {slide.destaque && (
                motion ? (
                  <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 50, lineHeight: 1.4, color: C.ivory, maxWidth: 820, textShadow: imageUrl ? '0 2px 24px rgba(0,0,0,0.55)' : 'none' }}>
                    {ganchoPalavras.map((w, i) => {
                      const f = Math.max(0, Math.min(1, ganchoMostradas - i));
                      const ultimo = Math.min(ganchoPalavras.length - 1, Math.floor(ganchoMostradas));
                      return (
                        <span key={i} style={{ display: 'inline-block', marginRight: '0.26em', opacity: f, transform: `translateY(${(1 - f) * 12}px)` }}>
                          {w}
                          {/* cursor DENTRO da última palavra visível — acompanha a escrita */}
                          {ganchoEscreve && i === ultimo && <span style={{ display: 'inline-block', width: 4, height: '0.9em', background: ornamento, opacity: 0.9, transform: 'translateY(0.1em)', marginLeft: '0.08em' }} />}
                        </span>
                      );
                    })}
                  </p>
                ) : (
                  <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 50, lineHeight: 1.4, color: C.ivory, maxWidth: 820, textShadow: imageUrl ? '0 2px 24px rgba(0,0,0,0.55)' : 'none' }}>{slide.destaque}</p>
                )
              )}
            </div>
            {/* BAIXO: marca */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 18, letterSpacing: '0.6em', textTransform: 'uppercase', color: C.gold, opacity: 0.7 }}>os sete véus</span>
            </div>
          </>
        )}

        {/* CONTEÚDO */}
        {!isCapa && !isCta && (
          <>
            <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 18, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(26,22,20,0.4)' }}>os sete véus</span>
              <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 32, color: 'rgba(184,92,56,0.55)' }}>{String(slideIndex ?? 1).padStart(2, '0')} / {String(slideTotal).padStart(2, '0')}</span>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
              {isPoetico(slide.titulo) ? (
                <>
                  <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 56, color: C.terracotta, opacity: 0.7 }}>~</span>
                  <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 72, lineHeight: 1.3, color: C.ink, maxWidth: 820, whiteSpace: 'pre-line' }}>{slide.texto}</p>
                  <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 56, color: C.terracotta, opacity: 0.7 }}>~</span>
                </>
              ) : (
                <>
                  {slide.titulo && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.terracotta }}>{slide.titulo}</span>}
                  <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: (slide.texto?.length ?? 0) > 200 ? 44 : 50, lineHeight: 1.42, color: C.ink, maxWidth: 800, whiteSpace: 'pre-line' }}>{slide.texto}</p>
                </>
              )}
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 24, letterSpacing: '0.8em', color: ornamento, opacity: 0.7, paddingLeft: '0.8em' }}>◇ ◇ ◇</span>
              {palavra && <span style={{ fontFamily: FONT_SANS, fontSize: 16, letterSpacing: '0.6em', textTransform: 'lowercase', color: 'rgba(26,22,20,0.35)' }}>{palavra.toLowerCase()}</span>}
            </div>
          </>
        )}

        {/* CTA */}
        {isCta && (
          <>
            <div style={{ position: 'relative', zIndex: 2, width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <span style={{ position: 'absolute', inset: 0, border: `1px solid ${C.gold}`, opacity: 0.35, borderRadius: '50%' }} />
              <span style={{ position: 'absolute', inset: 16, border: `1px solid ${C.gold}`, opacity: 0.18, borderRadius: '50%' }} />
              <span style={{ fontSize: 96, lineHeight: 1 }}>{iconeOferta(slide.titulo)}</span>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              <div ref={recursoRef} style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 78, lineHeight: 1.1, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: C.ivory }}>{slide.titulo ?? slide.texto}</div>
              <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 38, lineHeight: 1.45, color: C.mist, maxWidth: 720 }}>{slide.texto}</p>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 24, width: 820, maxWidth: '100%' }}>
              <span style={{ flex: 1, height: 1, background: C.gold, opacity: 0.55 }} />
              <span style={{ fontFamily: FONT_MONO, fontWeight: 400, fontSize: 30, letterSpacing: '0.04em', color: C.terracotta, whiteSpace: 'nowrap' }}>{slide.destaque ?? 'viviannedossantos.com'}</span>
              <span style={{ flex: 1, height: 1, background: C.gold, opacity: 0.55 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function isPoetico(titulo?: string): boolean {
  return (titulo ?? '').toUpperCase().includes('PO');
}
