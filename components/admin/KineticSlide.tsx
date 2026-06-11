'use client';

// KineticSlide — reel "simples" de alto desempenho: uma imagem transcendente +
// uma frase que se revela PALAVRA A PALAVRA (typewriter/kinetic), com leve zoom
// de fundo. Tudo em função de `prog` (0..1) -> determinístico, o render captura
// frame a frame conduzindo o prog. Estética da feed: serif elegante, ouro nas
// palavras-destaque, assinatura discreta.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export function KineticSlide({ texto, destaque = [], imageUrl, mundo = 'escola', prog = 1, ratio = '9:16', variante, conceito }: { texto: string; destaque?: string[]; imageUrl?: string; mundo?: Mundo; prog?: number; ratio?: '9:16' | '4:5'; variante?: string; conceito?: string }) {
  const ehDomingo = variante === 'domingo'; // motion luminoso (bloom), distinto do typewriter
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
  // realce: apanha EXPRESSÕES inteiras (ex.: "Consciente e inconsciente"), não só palavras soltas
  const normW = palavras.map(norm);
  const goldIdx = new Set<number>();
  for (const frase of destaque) {
    const pw = frase.trim().split(/\s+/).map(norm).filter(Boolean);
    if (!pw.length) continue;
    for (let i = 0; i + pw.length <= normW.length; i++) {
      let ok = true;
      for (let j = 0; j < pw.length; j++) if (normW[i + j] !== pw[j]) { ok = false; break; }
      if (ok) for (let j = 0; j < pw.length; j++) goldIdx.add(i + j);
    }
  }
  const revelar = Math.min(1, prog / (ehDomingo ? 0.85 : 0.72)); // domingo revela mais devagar
  const mostradas = revelar * palavras.length;
  const aindaEscreve = revelar < 1;
  const accent = ehDomingo ? '#F0C6CF' : ACCENT; // Domingo de Luz: rosa luminoso (legível sobre fundo), sem dourado
  const serie = ehDomingo ? 'Domingo de Luz' : 'Ancorar'; // cabeçalho da série
  const ultimoVisivel = Math.min(palavras.length - 1, Math.floor(mostradas));
  const zoom = 1 + 0.07 * prog;                        // leve Ken Burns
  const rodapeOp = Math.max(0, Math.min(1, (prog - 0.55) / 0.25));

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 110% 80% at 50% 35%, ${BG1} 0%, ${BG2} 80%)`, overflow: 'hidden' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: 'center', zIndex: 0 }} />
          {/* véu vertical (topo/base) + scrim central ESCURO atrás da frase = contraste garantido sobre qualquer imagem */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${a(BG2, '66')} 0%, ${a(BG2, '38')} 36%, ${a(BG2, 'd9')} 100%)`, zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 135% 40% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 56%, transparent 76%)', zIndex: 1 }} />
        </>)}

        {/* cabeçalho/selo da série (como as outras coleções) + selo do conceito */}
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 26px', borderRadius: 999, border: `1px solid ${a('#F4ECDD', '3d')}`, background: 'rgba(18,16,22,0.32)' }}>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.75 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#F8F1E8' }}>{serie}</span>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.75 }} />
          </div>
          {conceito && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 21, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, opacity: 0.82, textAlign: 'center', padding: '0 90px' }}>{conceito}</span>}
        </div>

        {/* frase */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px', zIndex: 2 }}>
          <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 92, lineHeight: 1.18, letterSpacing: '-0.01em', textAlign: 'center', color: '#F4ECDD', textShadow: imageUrl ? '0 2px 28px rgba(0,0,0,0.6)' : 'none', margin: 0 }}>
            {palavras.map((w, i) => {
              const dest = goldIdx.has(i);
              let st: React.CSSProperties;
              if (ehDomingo) {
                // bloom luminoso: cada palavra surge de um desfoque com brilho suave (sem cursor)
                const n = palavras.length;
                const ini = n > 1 ? (i / (n - 1)) * 0.5 : 0;
                const f = Math.max(0, Math.min(1, (revelar - ini) / 0.42));
                st = { opacity: f, filter: `blur(${(1 - f) * 12}px)`, transform: `translateY(${(1 - f) * 8}px) scale(${0.96 + 0.04 * f})`, textShadow: `0 0 ${30 * (1 - f) + 10}px rgba(255,244,250,${0.45 * (1 - f) + 0.2}), 0 2px 20px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)` };
              } else {
                let op = 0, dy = 14;
                if (i < ultimoVisivel) { op = 1; dy = 0; }
                else if (i === ultimoVisivel) { const f = Math.max(0, Math.min(1, mostradas - i)); op = f; dy = 14 * (1 - f); }
                st = { opacity: op, transform: `translateY(${dy}px)`, textShadow: imageUrl ? '0 2px 30px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.55)' : 'none' };
              }
              return (
                <span key={i} style={{ display: 'inline-block', marginRight: '0.28em', color: dest ? accent : '#F8EFE9', fontStyle: dest ? 'italic' : 'normal', transition: 'none', ...st }}>{w}</span>
              );
            })}
            {aindaEscreve && !ehDomingo && <span style={{ display: 'inline-block', width: 5, height: '0.92em', background: accent, opacity: 0.9, transform: 'translateY(0.12em)', marginLeft: '0.04em' }} />}
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
