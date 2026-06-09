'use client';

// ReelSlide — um frame vertical 1080x1920 de um Reel.
// Estetica premium coerente com os 7 Veus / infograficos: serif grande,
// grao, paleta do universo, assinatura no rodape (para sobreviver a circulacao).
// O texto auto-encolhe para caber sempre. Varios frames em sequencia = o reel.

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), monospace';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type ReelFrame = {
  kicker?: string;   // etiqueta pequena no topo (formato / nº)
  texto: string;     // a frase grande (gancho, sinal, ideia, fecho)
  nota?: string;     // linha pequena por baixo (ex.: "comenta em baixo")
  titulo?: string;   // título do frame (mini-aula): lê maior, em cima dos pontos
  pontos?: string[]; // bullets (hierarquia + retenção em frames com muito texto)
  motivo?: string;   // (legado) 'lanterna' = capa de "O que ninguém te explica"
  selo?: string;     // nome da série no selo da capa (ex.: "Sinais de que…")
  imageUrl?: string | null; // imagem de fundo do frame (ex.: capa-assinatura gerada)
  pal?: string;      // paleta por frame (ex.: 'carvao' na capa, 'creme' no ensino)
};

export function ReelSlide({ frame, mundo = 'escola', imageUrl, numero, total, capa = false }: { frame: ReelFrame; mundo?: Mundo; imageUrl?: string; numero?: number; total?: number; capa?: boolean }) {
  const img = imageUrl ?? frame.imageUrl ?? undefined;
  const p = PALETAS[frame.pal ?? mundo] ?? PALETAS[mundo] ?? PALETAS.escola;
  const BG1 = p.bg, BG2 = p.bg2, ACCENT = p.destaque, TXT = p.texto;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  // auto-fit do texto grande (mede e encolhe se transbordar)
  const txtRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = txtRef.current; if (!el) return;
    const apply = () => { el.style.transform = 'scale(1)'; const avail = 1180; const h = el.scrollHeight; setFit(h > avail ? Math.max(0.45, avail / h) : 1); };
    apply();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(apply).catch(() => {});
  }, [frame]);

  const base = capa ? 104 : 88;
  // selo de capa por série (genérico). 'motivo:lanterna' = legado da 1.ª série.
  const seloTxt = frame.selo ?? (frame.motivo === 'lanterna' ? 'O que ninguém te explica' : undefined);
  const ehSelo = capa && !!seloTxt;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: img ? '#000' : `radial-gradient(ellipse 100% 75% at 50% 28%, ${BG1} 0%, ${BG2} 78%)`, boxSizing: 'border-box', fontFamily: FONT_SERIF, color: TXT }}>
        {img && (<>
          <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, ${a(BG2, 'd9')} 0%, ${a(BG2, 'f7')} 100%)`, zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.13, zIndex: 0, pointerEvents: 'none' }} />

        {/* CAPA-assinatura da série: imagem (Flux) + selo neutro com o nome.
            Sem imagem ainda? mostra um brilho suave de marcador (sem desenho infantil). */}
        {ehSelo && (
          <>
            {!img && <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(circle at 50% 24%, rgba(255,247,224,0.30) 0%, rgba(255,247,224,0.08) 24%, transparent 46%)' }} />}
            <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 28px', borderRadius: 999, border: `1px solid ${a(TXT, '4d')}`, background: a(BG2, '40') }}>
                <span style={{ width: 20, height: 1, background: TXT, opacity: 0.5 }} />
                <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.34em', textTransform: 'uppercase', color: TXT }}>{seloTxt}</span>
                <span style={{ width: 20, height: 1, background: TXT, opacity: 0.5 }} />
              </div>
            </div>
          </>
        )}

        {/* cantoneiras finas (premium) */}
        {([['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']] as const).map(([v, h], i) => {
          const isTop = v === 'top', isLeft = h === 'left';
          const st: CSSProperties = { position: 'absolute', width: 40, height: 40, zIndex: 2, top: isTop ? 60 : undefined, bottom: !isTop ? 60 : undefined, left: isLeft ? 60 : undefined, right: !isLeft ? 60 : undefined, borderTop: isTop ? `2px solid ${a(ACCENT, '66')}` : undefined, borderBottom: !isTop ? `2px solid ${a(ACCENT, '66')}` : undefined, borderLeft: isLeft ? `2px solid ${a(ACCENT, '66')}` : undefined, borderRight: !isLeft ? `2px solid ${a(ACCENT, '66')}` : undefined };
          return <span key={i} style={st} />;
        })}

        {/* topo: kicker (escondido na capa-assinatura, que já traz o selo) */}
        {!ehSelo && (
          <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 3 }}>
            {frame.kicker && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.42em', textTransform: 'uppercase', color: ACCENT, opacity: 0.92, textAlign: 'center', padding: '0 90px' }}>{frame.kicker}</span>}
            <span style={{ color: ACCENT, opacity: 0.6, fontSize: 30, letterSpacing: '0.5em' }}>◇◇◇</span>
          </div>
        )}

        {/* centro: a frase grande */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 110px', zIndex: 3 }}>
          <div ref={txtRef} style={{ transform: `scale(${fit})`, transformOrigin: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
            {frame.pontos && frame.pontos.length ? (
              // ── frame de mini-aula: título (maior) + bullets (hierarquia/retenção) ──
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 880, width: '100%' }}>
                {frame.titulo && <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 74, lineHeight: 1.14, textAlign: 'center', margin: 0 }}>{frame.titulo}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                  {frame.pontos.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                      <span style={{ color: ACCENT, fontSize: 34, lineHeight: 1.4, flexShrink: 0 }}>◆</span>
                      <span style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 50, lineHeight: 1.3, textAlign: 'left' }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: base, lineHeight: 1.12, letterSpacing: '-0.01em', textAlign: 'center', margin: 0 }}>{frame.texto}</p>
            )}
            {frame.nota && <span style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.12em', color: ACCENT, opacity: 0.9, textAlign: 'center' }}>{frame.nota}</span>}
          </div>
        </div>

        {/* rodape: assinatura + pager */}
        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 3 }}>
          {total && total > 1 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {Array.from({ length: total }).map((_, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: ACCENT, opacity: i + 1 === numero ? 1 : 0.3 }} />)}
            </div>
          )}
          <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, color: TXT, opacity: 0.78 }}>Véu a Véu</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.04em', color: ACCENT, opacity: 0.82 }}>viviannedossantos.com</span>
        </div>
      </div>
    </div>
  );
}
