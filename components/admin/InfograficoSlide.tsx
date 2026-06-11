'use client';

// InfograficoSlide — cartao unico 1080x1350 (4:5) sobre um PADRAO.
// O diagrama ADAPTA-SE ao padrao (o Claude escolhe o tipo):
//   ciclo (roda) · espectro (dois polos) · herdado (2 colunas) · camadas · travessia
// + implicacoes EM TI / NOS OUTROS + virada + CTA. Paleta do universo. Auto-encolhe.

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
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
  rotulo?: string; // "O PADRÃO" (dinâmica que se repete) ou "O CONCEITO" (ideia/distinção)
  subtitulo?: string;
  tipoDiagrama?: 'ciclo' | 'espectro' | 'herdado' | 'camadas' | 'travessia';
  diagrama?: Diagrama;
  ciclo?: string[]; // legado
  custoTi?: string;
  custoOutros?: string;
  virada?: string;
  url?: string;
};

export function InfograficoSlide({ info, mundo = 'freeme', imageUrl, prog = 1, ratio = '4:5', conceito }: { info: Infografico; mundo?: Mundo; imageUrl?: string; prog?: number; ratio?: '4:5' | '9:16'; conceito?: string }) {
  const p = PALETAS[mundo];
  // Identidade COMUM da Veu a Veu: fundo índigo profundo + texto creme, igual ao
  // resto do feed. Só o ACENTO (bordas, rótulos, diagrama) vem da matéria, para
  // o infográfico deixar de destoar mas continuar a ler-se como "aquela matéria".
  const BG1 = '#1A1726', BG2 = '#0F0F1A', TXT = '#F2E8DC';
  const ACCENT = p.destaque;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;
  // 4:5 = PNG do feed; 9:16 = MP4 (preenche o ecrã todo, como os outros reels)
  const H = ratio === '9:16' ? 1920 : 1350;
  const AR = ratio === '9:16' ? '1080 / 1920' : '1080 / 1350';
  const avail = H - 180; // altura util (deixa margem em cima/baixo); o conteudo distribui-se nela

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
    const apply = () => { el.style.transform = 'scale(1)'; const h = el.scrollHeight; setFit(h > avail ? Math.max(0.4, avail / h) : 1); };
    apply();
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(apply).catch(() => {});
  }, [info, H]);

  const d = info.diagrama ?? {};
  const tipo = info.tipoDiagrama ?? (info.ciclo?.length ? 'ciclo' : 'ciclo');
  const passos = (d.passos && d.passos.length ? d.passos : info.ciclo ?? []).slice(0, 4);
  const cardSt = { fontFamily: FONT_SERIF, color: TXT, background: a(BG2, 'cc'), border: `1px solid ${a(ACCENT, '55')}`, borderRadius: 12 } as const;

  // Revelação CAMADA A CAMADA (para o MP4): cada bloco entra à vez, conforme o
  // "prog" (0..1) que o render conduz frame a frame. prog=1 => tudo visível, sem
  // transform — por isso o PNG estático e o feed ficam EXATAMENTE como antes.
  const temCustos = !!(info.custoTi || info.custoOutros);
  // cada ITEM do diagrama revela-se sozinho (não o diagrama todo de uma vez)
  const diagItems = (tipo === 'espectro' && (d.poloA || d.poloB)) ? 3
    : (tipo === 'herdado' && (d.esquerda || d.direita)) ? 2
    : (tipo === 'camadas' && d.camadas?.length) ? Math.min(3, d.camadas.length)
    : (tipo === 'travessia' && passos.length) ? passos.length
    : Math.max(passos.length, 1);
  let _n = 0;
  const idxHeader = _n++;
  const idxDiag0 = _n; _n += diagItems;
  const idxCustos = temCustos ? _n++ : -1, idxVirada = info.virada ? _n++ : -1, idxFooter = _n++;
  const STAGES = _n;
  const reveal = (i: number): CSSProperties => {
    if (prog >= 1 || i < 0) return {};
    const slice = 1 / STAGES;
    // entra depressa (0.55 da fatia) e SEGURA o resto da fatia => dá tempo de leitura
    const local = Math.max(0, Math.min(1, (prog - i * slice) / (slice * 0.55)));
    const e = 1 - Math.pow(1 - local, 3); // easeOutCubic
    return { opacity: e, transform: `translateY(${(1 - e) * 28}px)` };
  };
  const dRev = (k: number): CSSProperties => reveal(idxDiag0 + k);

  // selo numerado (realce forte, para prender)
  const Badge = ({ n, size = 56 }: { n: number; size?: number }) => (
    <span style={{ flexShrink: 0, width: size, height: size, borderRadius: '50%', background: ACCENT, color: BG2, fontFamily: FONT_SANS, fontWeight: 800, fontSize: size * 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
  );

  function Diagrama() {
    // ESPECTRO — dois polos + equilibrio no meio (cada um entra à vez)
    if (tipo === 'espectro' && (d.poloA || d.poloB)) {
      return (
        <div style={{ width: '100%', margin: '14px 0 6px' }}>
          <div style={{ position: 'relative', height: 4, background: a(ACCENT, '40'), borderRadius: 2, margin: '0 40px' }}>
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: ACCENT }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 14 }}>
            <div style={{ ...cardSt, ...dRev(0), flex: 1, padding: '18px 22px', fontSize: 34, borderLeft: `6px solid ${ACCENT}` }}>{d.poloA}</div>
            <div style={{ ...cardSt, ...dRev(1), flex: 1, padding: '18px 22px', fontSize: 34, borderRight: `6px solid ${ACCENT}`, textAlign: 'right' }}>{d.poloB}</div>
          </div>
          {d.equilibrio && (
            <div style={{ ...dRev(2), textAlign: 'center', marginTop: 22 }}>
              <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT }}>equilíbrio</span>
              <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 42, lineHeight: 1.3, margin: '8px 0 0' }}>{d.equilibrio}</p>
            </div>
          )}
        </div>
      );
    }
    // HERDADO — duas colunas (cada coluna entra à vez)
    if (tipo === 'herdado' && (d.esquerda || d.direita)) {
      const col = (c: { titulo?: string; itens?: string[] } | undefined, st: CSSProperties) => (
        <div style={{ flex: 1, ...cardSt, ...st, padding: '24px 26px', textAlign: 'left', borderLeft: `6px solid ${ACCENT}` }}>
          <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 19, letterSpacing: '0.26em', textTransform: 'uppercase', color: ACCENT }}>{c?.titulo}</span>
          {(c?.itens ?? []).slice(0, 4).map((it, i) => <p key={i} style={{ fontFamily: FONT_SERIF, fontSize: 33, lineHeight: 1.32, margin: '14px 0 0', display: 'flex', gap: 12 }}><span style={{ color: ACCENT }}>◆</span><span>{it}</span></p>)}
        </div>
      );
      return <div style={{ display: 'flex', gap: 20, width: '100%', margin: '16px 0 6px' }}>{col(d.esquerda, dRev(0))}{col(d.direita, dRev(1))}</div>;
    }
    // CAMADAS — bandas numeradas (cada uma entra à vez, com realce)
    if (tipo === 'camadas' && d.camadas?.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', margin: '16px 0 6px' }}>
          {d.camadas.slice(0, 3).map((c, i) => (
            <div key={i} style={{ ...cardSt, ...dRev(i), display: 'flex', gap: 24, alignItems: 'flex-start', padding: '24px 28px', textAlign: 'left', borderLeft: `6px solid ${ACCENT}`, background: a(BG2, 'e6') }}>
              <Badge n={i + 1} />
              <div>
                <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 17, letterSpacing: '0.26em', textTransform: 'uppercase', color: ACCENT }}>{c.label}</span>
                <p style={{ fontFamily: FONT_SERIF, fontSize: 35, lineHeight: 1.3, margin: '8px 0 0' }}>{c.texto}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    // TRAVESSIA — passos numerados com seta (cada passo entra à vez)
    if (tipo === 'travessia' && passos.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: '16px 0 6px' }}>
          {passos.map((passo, i) => (
            <div key={i} style={{ ...dRev(i), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
              <div style={{ ...cardSt, display: 'flex', gap: 20, alignItems: 'center', padding: '16px 28px', fontSize: 36, maxWidth: 840, borderLeft: `6px solid ${ACCENT}` }}>
                <Badge n={i + 1} size={50} /><span>{passo}</span>
              </div>
              {i < passos.length - 1 && <span style={{ color: ACCENT, opacity: 0.7, fontSize: 30 }}>↓</span>}
            </div>
          ))}
        </div>
      );
    }
    // CICLO (roda) — cada raio entra à vez
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
            <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', width: 248 }}>
              <div style={{ ...cardSt, ...dRev(i), display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px', fontSize: 30, lineHeight: 1.18, borderLeft: `5px solid ${ACCENT}` }}>
                <Badge n={i + 1} size={42} /><span>{passo}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: AR, overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 95% 80% at 50% 30%, ${BG1} 0%, ${BG2} 80%)`, display: 'flex', flexDirection: 'column', justifyContent: fit < 1 ? 'flex-start' : 'center', paddingTop: fit < 1 ? 90 : 0, boxSizing: 'border-box', fontFamily: FONT_SERIF, color: TXT }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${a(BG2, 'cc')} 0%, ${a(BG2, 'f2')} 100%)`, zIndex: 0 }} />
        </>)}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'screen', opacity: 0.14, zIndex: 0, pointerEvents: 'none' }} />

        <div ref={contentRef} style={{ position: 'relative', zIndex: 2, width: 1080, minHeight: fit < 1 ? undefined : avail, padding: '0 84px', boxSizing: 'border-box', transform: `scale(${fit})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: fit < 1 ? 'flex-start' : 'space-between', textAlign: 'center' }}>
          <div style={{ ...reveal(idxHeader), display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {conceito && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7, marginBottom: 14, textAlign: 'center' }}>{conceito}</span>}
            <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>{info.rotulo ?? 'O padrão'}</span>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 78, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '16px 0 0' }}>{info.padrao}</h2>
            {info.subtitulo && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, lineHeight: 1.3, opacity: 0.82, margin: '12px auto 0', maxWidth: 820 }}>{info.subtitulo}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}><Diagrama /></div>

          {temCustos && (
            <div style={{ ...reveal(idxCustos), display: 'flex', gap: 20, width: '100%', marginTop: 18 }}>
              {[{ t: 'Em ti', v: info.custoTi }, { t: 'Nos outros', v: info.custoOutros }].filter((b) => b.v).map((b) => (
                <div key={b.t} style={{ flex: 1, border: `1px solid ${a(ACCENT, '45')}`, borderRadius: 16, padding: '18px 22px', background: a(BG2, '55') }}>
                  <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, letterSpacing: '0.32em', textTransform: 'uppercase', color: ACCENT }}>{b.t}</span>
                  <p style={{ fontFamily: FONT_SERIF, fontSize: 31, lineHeight: 1.3, margin: '10px 0 0' }}>{b.v}</p>
                </div>
              ))}
            </div>
          )}

          {info.virada && <p style={{ ...reveal(idxVirada), fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 40, lineHeight: 1.3, margin: '24px auto 0', maxWidth: 880 }}>{info.virada}</p>}

          <div style={{ ...reveal(idxFooter), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, marginTop: 20 }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: 17, letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, opacity: 0.65 }}>os sete véus</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: '0.04em', color: ACCENT, opacity: 0.85 }}>{info.url ?? 'viviannedossantos.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
