'use client';

// BandaSlide — um painel (1080x1920) da banda desenhada "Cá em Casa".
// Personagens ILUSTRADAS (avatares SVG consistentes) + balões de fala.
// O balão "herdada" é a voz herdada (tracejado, itálico). O último painel é a
// LIÇÃO (reflexão de fecho, sem personagens). Assinatura no rodapé.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { openPeeps } from '@dicebear/collection';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';
import { getPersonagem, SKIN, expressaoDoModo, type Personagem } from '@/lib/banda/personagens';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type Fala = { id: string; fala: string; modo?: 'fala' | 'pensa' | 'herdada' };
export type Painel = { cenario?: string; personagens?: Fala[]; licao?: string };

// ── Avatar (Open Peeps): ilustrado, consistente por personagem, sem cara real.
// A mesma personagem dá sempre a mesma cara; só a expressão segue o "modo" da
// fala (pensa -> preocupada, fala -> a explicar). Pele única na família (SKIN).
const noHash = (h: string) => h.replace('#', '');
function Avatar({ p, size = 240, modo }: { p: Personagem; size?: number; modo?: string }) {
  const s = Math.round(p.crianca ? size * 0.85 : size);
  const svg = useMemo(
    () =>
      createAvatar(openPeeps, {
        seed: p.id,
        size: s,
        head: [p.head],
        face: [expressaoDoModo(p, modo)],
        skinColor: [noHash(SKIN)],
        clothingColor: [noHash(p.cloth)],
        headContrastColor: [noHash(p.hair)],
        facialHairProbability: 0,
        accessoriesProbability: 0,
        maskProbability: 0,
        backgroundColor: ['transparent'],
      }).toString(),
    [p.id, p.head, p.cloth, p.hair, modo, s],
  );
  return <div style={{ width: s, height: s, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── Balão de fala ──
function Balao({ f }: { f: Fala }) {
  const p = getPersonagem(f.id);
  const herdada = f.modo === 'herdada';
  const pensa = f.modo === 'pensa';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 460 }}>
      <span style={{ fontFamily: FONT_SANS, fontSize: 22, letterSpacing: '0.18em', textTransform: 'uppercase', color: herdada ? '#b8956a' : '#8a8378', opacity: 0.95 }}>
        {herdada ? 'a voz herdada' : (p?.nome ?? f.id)}
      </span>
      <div style={{
        position: 'relative',
        background: herdada ? 'rgba(243,236,224,0.55)' : '#f3ece0',
        color: '#26221c',
        border: herdada ? '2px dashed #b8956a' : '1px solid rgba(38,34,28,0.12)',
        borderRadius: pensa ? 40 : 26,
        padding: '26px 32px',
        fontFamily: FONT_SERIF,
        fontStyle: herdada ? 'italic' : 'normal',
        fontWeight: 400,
        fontSize: 40,
        lineHeight: 1.22,
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}>
        {herdada ? '«' : (pensa ? '' : '')}{f.fala}{herdada ? '»' : ''}
        {/* cauda */}
        {!pensa && <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `18px solid ${herdada ? 'rgba(243,236,224,0.55)' : '#f3ece0'}` }} />}
      </div>
      {pensa && <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>{[10, 7, 4].map((d, i) => <span key={i} style={{ width: d, height: d, borderRadius: '50%', background: '#f3ece0', opacity: 0.85 }} />)}</div>}
    </div>
  );
}

export function BandaSlide({ painel, mundo = 'escola', numero, total, capa = false }: { painel: Painel; mundo?: Mundo; numero?: number; total?: number; capa?: boolean }) {
  const pal = PALETAS[mundo];
  const BG1 = pal.bg, BG2 = pal.bg2, ACCENT = pal.destaque, TXT = pal.texto;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = contentRef.current; if (!el) return;
    const apply = () => { el.style.transform = 'scale(1)'; const avail = 1500; const h = el.scrollHeight; setFit(h > avail ? Math.max(0.45, avail / h) : 1); };
    apply();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(apply).catch(() => {});
  }, [painel]);

  const personagens = (painel.personagens ?? []).filter((f) => f.fala && getPersonagem(f.id)).slice(0, 2);
  const ehLicao = !!painel.licao && personagens.length === 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: `radial-gradient(ellipse 110% 80% at 50% 24%, ${BG1} 0%, ${BG2} 76%)`, boxSizing: 'border-box', fontFamily: FONT_SERIF, color: TXT }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }} />

        {/* título da série no topo */}
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 24, letterSpacing: '0.45em', textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>Cá em Casa</span>
        </div>

        <div ref={contentRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 90px', zIndex: 3, transform: `scale(${fit})`, transformOrigin: 'center' }}>
          {/* cenário */}
          {painel.cenario && !ehLicao && (
            <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 38, lineHeight: 1.3, opacity: 0.8, textAlign: 'center', margin: '0 0 40px', maxWidth: 820 }}>{painel.cenario}</p>
          )}

          {ehLicao ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              <span style={{ color: ACCENT, opacity: 0.6, fontSize: 30, letterSpacing: '0.5em' }}>◇◇◇</span>
              <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 76, lineHeight: 1.2, textAlign: 'center', margin: 0, maxWidth: 880 }}>{painel.licao}</p>
            </div>
          ) : (
            <>
              {/* balões */}
              <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
                {personagens.map((f, i) => <Balao key={i} f={f} />)}
              </div>
              {/* avatares */}
              <div style={{ display: 'flex', gap: 80, alignItems: 'flex-end', justifyContent: 'center' }}>
                {personagens.map((f, i) => {
                  const p = getPersonagem(f.id)!;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Avatar p={p} size={300} modo={f.modo} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* rodapé: pager + assinatura */}
        <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 3 }}>
          {total && total > 1 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {Array.from({ length: total }).map((_, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: ACCENT, opacity: i + 1 === numero ? 1 : 0.3 }} />)}
            </div>
          )}
          <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 32, color: TXT, opacity: 0.72 }}>Véu a Véu</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.04em', color: ACCENT, opacity: 0.8 }}>viviannedossantos.com</span>
        </div>
        {capa && null}
      </div>
    </div>
  );
}
