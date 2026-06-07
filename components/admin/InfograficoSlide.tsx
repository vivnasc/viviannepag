'use client';

// InfograficoSlide — cartao unico 1080x1350 (4:5) sobre um PADRAO.
// O diagrama ADAPTA-SE ao padrao (o Claude escolhe o tipo):
//   ciclo (roda) · espectro (dois polos) · herdado (2 colunas) · camadas · travessia
// + implicacoes EM TI / NOS OUTROS + virada + CTA. Paleta do universo. Auto-encolhe.

import { useLayoutEffect, useRef, useState } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type Diagrama = {
  passos?: string[];
  poloA?: string; poloB?: string; equilibrio?: string;
  esquerda?: { titulo?: string; itens?: string[] };
  direita?: { titulo?: string; itens?: string[] };
  camadas?: { label?: string; texto?: string }[];
};
export type Infografico = {
  padrao: string;
  subtitulo?: string;
  tipoDiagrama?: 'ciclo' | 'espectro' | 'herdado' | 'camadas' | 'travessia';
  diagrama?: Diagrama;
  ciclo?: string[]; // legado
  custoTi?: string;
  custoOutros?: string;
  virada?: string;
  url?: string;
};

export function InfograficoSlide({ info, mundo = 'freeme', imageUrl }: { info: Infografico; mundo?: Mundo; imageUrl?: string }) {
  const p = PALETAS[mundo];
  const BG1 = p.bg, BG2 = p.bg2, ACCENT = p.destaque, TXT = p.texto;
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
    const apply = () => { el.style.transform = 'scale(1)'; const avail = 1350 - 150; const h = el.scrollHeight; setFit(h > avail ? Math.max(0.55, avail / h) : 1); };
    apply();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(apply).catch(() => {});
  }, [info]);

  const d = info.diagrama ?? {};
  const tipo = info.tipoDiagrama ?? (info.ciclo?.length ? 'ciclo' : 'ciclo');
  const passos = (d.passos && d.passos.length ? d.passos : info.ciclo ?? []).slice(0, 4);
  const cardSt = { fontFamily: FONT_SERIF, color: TXT, background: a(BG2, 'cc'), border: `1px solid ${a(ACCENT, '55')}`, borderRadius: 12 } as const;

  function Diagrama() {
    // ESPECTRO — dois polos + equilibrio no meio
    if (tipo === 'espectro' && (d.poloA || d.poloB)) {
      return (
        <div style={{ width: '100%', margin: '14px 0 6px' }}>
          <div style={{ position: 'relative', height: 4, background: a(ACCENT, '40'), borderRadius: 2, margin: '0 40px' }}>
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: ACCENT }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <div style={{ ...cardSt, padding: '12px 18px', maxWidth: 320, fontSize: 32 }}>{d.poloA}</div>
            <div style={{ ...cardSt, padding: '12px 18px', maxWidth: 320, fontSize: 32 }}>{d.poloB}</div>
          </div>
          {d.equilibrio && (
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 17, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT, opacity: 0.8 }}>equilíbrio</span>
              <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 38, lineHeight: 1.3, margin: '6px 0 0' }}>{d.equilibrio}</p>
            </div>
          )}
        </div>
      );
    }
    // HERDADO — duas colunas
    if (tipo === 'herdado' && (d.esquerda || d.direita)) {
      const col = (c?: { titulo?: string; itens?: string[] }) => (
        <div style={{ flex: 1, ...cardSt, padding: '20px 22px', textAlign: 'left' }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT }}>{c?.titulo}</span>
          {(c?.itens ?? []).slice(0, 4).map((it, i) => <p key={i} style={{ fontFamily: FONT_SERIF, fontSize: 30, lineHeight: 1.3, margin: '10px 0 0' }}>· {it}</p>)}
        </div>
      );
      return <div style={{ display: 'flex', gap: 20, width: '100%', margin: '16px 0 6px' }}>{col(d.esquerda)}{col(d.direita)}</div>;
    }
    // CAMADAS — bandas empilhadas
    if (tipo === 'camadas' && d.camadas?.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', margin: '16px 0 6px' }}>
          {d.camadas.slice(0, 3).map((c, i) => (
            <div key={i} style={{ ...cardSt, padding: '18px 24px', textAlign: 'left', opacity: 1 - i * 0.12 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 16, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT }}>{c.label}</span>
              <p style={{ fontFamily: FONT_SERIF, fontSize: 32, lineHeight: 1.3, margin: '8px 0 0' }}>{c.texto}</p>
            </div>
          ))}
        </div>
      );
    }
    // TRAVESSIA — passos lineares com seta →
    if (tipo === 'travessia' && passos.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '16px 0 6px' }}>
          {passos.map((passo, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ ...cardSt, padding: '12px 26px', fontSize: 34, maxWidth: 800 }}>{passo}</div>
              {i < passos.length - 1 && <span style={{ color: ACCENT, opacity: 0.7, fontSize: 26 }}>↓</span>}
            </div>
          ))}
        </div>
      );
    }
    // CICLO (roda) — default
    const n = Math.max(passos.length, 1), RING = 500, CXY = RING / 2, R = 172;
    return (
      <div style={{ position: 'relative', width: RING, height: RING, margin: '18px 0 4px' }}>
        <div style={{ position: 'absolute', inset: 60, borderRadius: '50%', border: `1px dashed ${a(ACCENT, '55')}` }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 60, color: ACCENT, opacity: 0.85, lineHeight: 1 }}>↻</span>
          <span style={{ fontFamily: FONT_SANS, fontSize: 16, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7, marginTop: 6 }}>repete-se</span>
        </div>
        {passos.map((passo, i) => {
          const ang = (-90 + i * (360 / n)) * Math.PI / 180;
          const x = CXY + R * Math.cos(ang), y = CXY + R * Math.sin(ang);
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', width: 240 }}>
              <div style={{ ...cardSt, padding: '10px 16px', fontSize: 29, lineHeight: 1.18 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 15, color: ACCENT, opacity: 0.8, display: 'block', marginBottom: 2 }}>{i + 1}</span>{passo}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1350, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 95% 80% at 50% 30%, ${BG1} 0%, ${BG2} 80%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', fontFamily: FONT_SERIF, color: TXT }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${a(BG2, 'cc')} 0%, ${a(BG2, 'f2')} 100%)`, zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.14, zIndex: 0, pointerEvents: 'none' }} />

        <div ref={contentRef} style={{ position: 'relative', zIndex: 2, width: 1080, padding: '0 84px', boxSizing: 'border-box', transform: `scale(${fit})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>O padrão</span>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 78, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '16px 0 0' }}>{info.padrao}</h2>
          {info.subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, lineHeight: 1.3, opacity: 0.82, margin: '12px auto 0', maxWidth: 820 }}>{info.subtitulo}</p>}

          <Diagrama />

          {(info.custoTi || info.custoOutros) && (
            <div style={{ display: 'flex', gap: 20, width: '100%', marginTop: 18 }}>
              {[{ t: 'Em ti', v: info.custoTi }, { t: 'Nos outros', v: info.custoOutros }].filter((b) => b.v).map((b) => (
                <div key={b.t} style={{ flex: 1, border: `1px solid ${a(ACCENT, '45')}`, borderRadius: 16, padding: '18px 22px', background: a(BG2, '55') }}>
                  <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, letterSpacing: '0.32em', textTransform: 'uppercase', color: ACCENT }}>{b.t}</span>
                  <p style={{ fontFamily: FONT_SERIF, fontSize: 31, lineHeight: 1.3, margin: '10px 0 0' }}>{b.v}</p>
                </div>
              ))}
            </div>
          )}

          {info.virada && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 40, lineHeight: 1.3, margin: '24px auto 0', maxWidth: 880 }}>{info.virada}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 28 }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 18, letterSpacing: '0.6em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7 }}>os sete véus</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: '0.03em', color: ACCENT, opacity: 0.8 }}>{info.url ?? 'viviannedossantos.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
