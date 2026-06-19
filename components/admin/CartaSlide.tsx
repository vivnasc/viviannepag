'use client';

// CartaSlide: o render PRÓPRIO da "Carta de renomear" (tarde da vir).
// Dois registos, a decisão da Vivianne:
//  - CAPA (1.º beat = a CENA): alto contraste, frase GRANDE a ocupar o ecrã,
//    fundo escuro quente + grão de luz, micro-movimento (a letra a assentar).
//    É a faca que para o scroll (nunca sépia-sobre-sépia).
//  - CORPO (restantes beats): a carta tipográfica em PAPEL ENVELHECIDO, com um
//    timbre discreto da conta (placeholder, a definir), as palavras a revelarem-se.
// Conduzido por prog (0..1) para o render (Puppeteer) e o preview do admin.

import { useLayoutEffect, useRef, useState } from 'react';
import type { Conta } from '@/lib/metodo/contas';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

// grão de filme subtil (SVG turbulence) — dá textura e "lê como reel".
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")";

export function CartaSlide({ texto, conta, prog = 1, capa = false, semRodape = false }: { texto: string; conta: Conta; prog?: number; capa?: boolean; semRodape?: boolean }) {
  const accent = conta.paleta.accent;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  // micro-movimento: a frase assenta no 1.º terço (blur+subida+opacidade), depois segura.
  const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  const introCapa = ease(prog / 0.45);
  const reveal = ease(prog / 0.6); // corpo: revela mais devagar (respira)

  const frases = texto.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 16, background: capa ? '#0d0a06' : '#e7d9bd' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', overflow: 'hidden' }}>

        {capa ? (
          // ── CAPA · a CENA, alto contraste, grande ──────────────────────────
          <div style={{ position: 'absolute', inset: 0, background: '#0d0a06' }}>
            {/* brilho quente que respira (deriva lenta) */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 45% at ${50 + 4 * Math.sin(prog * 6)}% ${40 + 3 * Math.cos(prog * 5)}%, ${accent}3a 0%, rgba(0,0,0,0) 60%)` }} />
            <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.07, backgroundImage: GRAIN }} />
            {/* timbre (placeholder, a definir) */}
            <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.5em', textTransform: 'uppercase', color: accent }}>vir · soltar</div>
              <div style={{ width: 90, height: 2, margin: '20px auto 0', background: accent, opacity: 0.7 }} />
            </div>
            {/* a cena, grande */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 90px', textAlign: 'center', opacity: introCapa, transform: `translateY(${(1 - introCapa) * 26}px)`, filter: `blur(${(1 - introCapa) * 10}px)` }}>
              {frases.map((f, i) => (
                <div key={i} style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 116, lineHeight: 1.08, color: '#f6efe0', textShadow: '0 4px 40px rgba(0,0,0,0.6)', marginBottom: i < frases.length - 1 ? 28 : 0 }}>{f}</div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 110, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SANS, fontSize: 26, letterSpacing: '0.32em', textTransform: 'uppercase', color: `${accent}cc`, opacity: Math.max(0, (prog - 0.5) / 0.4) }}>uma carta para ti  →</div>
          </div>
        ) : (
          // ── CORPO · a carta no papel ───────────────────────────────────────
          <div style={{ position: 'absolute', inset: 0, padding: '150px 120px 130px', display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(120% 80% at 30% 12%, rgba(255,250,235,0.9) 0%, rgba(0,0,0,0) 45%), radial-gradient(ellipse at 50% 50%, #f1e7d0 0%, #e8dabd 62%, #dcc9a4 100%)' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 220px rgba(90,65,35,0.38), inset 0 0 60px rgba(90,65,35,0.18)' }} />
            {/* timbre */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#9c7a3f' }}>vir · soltar</div>
              <div style={{ width: 100, height: 2, margin: '22px auto 0', background: 'linear-gradient(90deg, rgba(156,122,63,0), #9c7a3f, rgba(156,122,63,0))' }} />
            </div>
            {/* o texto da carta, revelado */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 64, lineHeight: 1.5, textAlign: 'center', color: '#46361f', margin: 0, opacity: reveal, transform: `translateY(${(1 - reveal) * 18}px)` }}>{texto}</p>
            </div>
            {!semRodape && (
              <div style={{ textAlign: 'right', opacity: Math.max(0, (prog - 0.55) / 0.3) }}>
                <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 26, letterSpacing: '0.16em', color: '#9c7a3f' }}>@{conta.handle}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
