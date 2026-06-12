'use client';

// SerieDiariaSlide — moldura das séries diárias da vivianne.dos.santos, FIEL ao
// escola-veus (docs/DESIGN-E-MOTIVOS): "Hoje, em Mim" = Carta Noturna (arco,
// dia, glifo+kicker do dia, rodapé); "VC Sabia" = cartão fosco + cantoneiras.
// Desenha-se sobre o vídeo de motion (Midjourney/Runway). transparente=true =>
// sem fundo, para o render sobrepor ao vídeo. Canvas 1080x1920 escalado.

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ROTACAO, PALETAS, CREME, type PaletaId } from '@/lib/series/serie-design';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", var(--font-jetmono), "Courier New", monospace'; // VC Sabia (máquina de escrever)
const SIGNATURE = 'viviannedossantos.com';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type SerieId = 'vcsabia' | 'hojeemmim';
export const SERIES: Record<SerieId, { nome: string; etiqueta: string; momento: string }> = {
  vcsabia: { nome: 'VC Sabia', etiqueta: 'Sabias que…', momento: 'manhã' },
  hojeemmim: { nome: 'Hoje em Mim', etiqueta: 'hoje aprendi', momento: 'noite' },
};

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// spec: 1 linha=76; 2=70; 3=64; 4=60; 5=56; 6+=52 (aproximado por nº de chars)
function tamanhoFrase(t: string): number {
  const n = t.trim().length;
  if (n <= 34) return 76;
  if (n <= 54) return 70;
  if (n <= 78) return 64;
  if (n <= 104) return 60;
  if (n <= 134) return 56;
  return 52;
}

const espacadoUpper = (s: string) => s.toUpperCase().split('').join(' ');

// frase com MOTION palavra a palavra, conduzida por prog (0..1). prog=1 => tudo
// visível (estático, p/ poster/feed). modo: 'typewriter' (Hoje em Mim, escreve-se
// + cursor) ou 'bloom' (VC Sabia, as palavras florescem de um leve desfoque/brilho).
function FraseTW({ texto, prog, size, color, maxW, modo = 'typewriter', fonte = FONT_SERIF, alturaLinha = 1.42 }: { texto: string; prog: number; size: number; color: string; maxW?: number; modo?: 'typewriter' | 'bloom'; fonte?: string; alturaLinha?: number }) {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  const n = palavras.length;
  const revelar = Math.min(1, prog / 0.85); // revela até 85%, segura cheio no fim
  const mostradas = revelar * n;
  const ultimo = Math.min(n - 1, Math.floor(mostradas));
  const escreve = modo === 'typewriter' && prog < 1 && revelar < 1;
  return (
    <p style={{ fontFamily: fonte, fontStyle: 'italic', fontWeight: 400, fontSize: size, lineHeight: alturaLinha, color, margin: 0, maxWidth: maxW, marginLeft: maxW ? 'auto' : undefined, marginRight: maxW ? 'auto' : undefined, textShadow: '0 2px 26px rgba(0,0,0,0.6)' }}>
      {palavras.map((w, i) => {
        let st: CSSProperties;
        if (modo === 'bloom') {
          const ini = n > 1 ? (i / (n - 1)) * 0.5 : 0; // entram escalonadas
          const f = Math.max(0, Math.min(1, (revelar - ini) / 0.42));
          st = { opacity: f, filter: `blur(${(1 - f) * 12}px)`, transform: `translateY(${(1 - f) * 8}px) scale(${0.965 + 0.035 * f})`, textShadow: `0 0 ${28 * (1 - f) + 8}px rgba(255,243,225,${0.4 * (1 - f) + 0.18}), 0 2px 18px rgba(0,0,0,0.55)` };
        } else {
          let op = 0, dy = 12;
          if (i < ultimo) { op = 1; dy = 0; }
          else if (i === ultimo) { const f = Math.max(0, Math.min(1, mostradas - i)); op = f; dy = 12 * (1 - f); }
          st = { opacity: op, transform: `translateY(${dy}px)` };
        }
        // o CURSOR vive DENTRO da última palavra visível — acompanha a escrita
        // (antes ficava no fim da frase completa, parado, porque as palavras
        // invisíveis já reservam o espaço todo)
        return (
          <span key={i} style={{ display: 'inline-block', marginRight: '0.26em', ...st }}>
            {w}
            {escreve && i === ultimo && <span style={{ display: 'inline-block', width: 4, height: '0.9em', background: color, opacity: 0.9, transform: 'translateY(0.12em)', marginLeft: '0.08em' }} />}
          </span>
        );
      })}
    </p>
  );
}

export function SerieDiariaSlide({
  serie,
  frase,
  dia,
  bgUrl,
  paleta = 'carta-noturna',
  transparente = false,
  prog = 1,
}: {
  serie: SerieId;
  frase: string;
  dia?: string;
  bgUrl?: string;
  paleta?: PaletaId;
  transparente?: boolean;
  prog?: number;
}) {
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

  const HL = PALETAS[paleta]?.highlight ?? PALETAS['carta-noturna'].highlight;
  const HLsoft = hexA(HL, 0.55);
  const ritual = (dia && ROTACAO[dia]) || ROTACAO['quinta'];

  // VC Sabia mantém a identidade dourada própria
  const OURO = '#C9A96E';
  const OURO_BRACKET = '#D4AF37';

  const cantoneira = (top: boolean, left: boolean) => (
    <>
      <span style={{ position: 'absolute', background: OURO_BRACKET, height: 2, width: 40, [top ? 'top' : 'bottom']: 22, [left ? 'left' : 'right']: 22 }} />
      <span style={{ position: 'absolute', background: OURO_BRACKET, width: 2, height: 40, [top ? 'top' : 'bottom']: 22, [left ? 'left' : 'right']: 22 }} />
    </>
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: '1080 / 1920', overflow: 'hidden', borderRadius: 14, background: transparente ? 'transparent' : '#0e0d12' }}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: 1080, height: 1920,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          visibility: scale ? 'visible' : 'hidden',
          fontFamily: FONT_SERIF,
        }}
      >
        {!transparente && bgUrl && <img src={bgUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {/* véu vertical para legibilidade (precisa de ler sobre qualquer motion) */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,8,32,0.42) 0%, rgba(14,8,32,0.12) 34%, rgba(14,8,32,0.18) 62%, rgba(14,8,32,0.58) 100%)' }} />
        {/* scrim radial central atrás do texto */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 92% 40% at 50% 53%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.12) 56%, transparent 80%)' }} />
        {/* grão de papel */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: 220, mixBlendMode: 'overlay', opacity: 0.22, pointerEvents: 'none' }} />
        {/* vinheta */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 82% 64% at center, transparent 50%, rgba(14,8,32,0.55) 100%)', pointerEvents: 'none' }} />

        {serie === 'hojeemmim' ? (
          <>
            {/* arco (portal) — path exato do spec */}
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} fill="none">
              <path d="M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098" stroke={HLsoft} strokeWidth={1.5} fill="none" />
            </svg>
            {/* ponto + dia da semana, centrado a y=507 */}
            <div style={{ position: 'absolute', top: 462, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: HL, opacity: 0.85 }} />
            </div>
            <div style={{ position: 'absolute', top: 507, left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 29, letterSpacing: '12px', color: HL, opacity: 0.82, paddingLeft: '12px' }}>{espacadoUpper(dia || '')}</div>
            {/* frase, centrada a y≈1014, DENTRO do arco (x 220–860) e typewriter */}
            <div style={{ position: 'absolute', top: 1014, left: 270, right: 270, transform: 'translateY(-50%)', textAlign: 'center' }}>
              <FraseTW texto={frase} prog={prog} size={tamanhoFrase(frase)} color={CREME} />
            </div>
            {/* glifo + kicker do dia, por baixo da frase */}
            <div style={{ position: 'absolute', top: 1600, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 44, color: HL, opacity: 0.9, lineHeight: 1 }}>{ritual.glifo}</span>
              <span style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 36, color: HL, opacity: 0.92 }}>{ritual.kicker}</span>
            </div>
            {/* rodapé */}
            <div style={{ position: 'absolute', top: 1730, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 24, letterSpacing: '8px', textTransform: 'uppercase', color: HL, opacity: 0.7, paddingLeft: '8px' }}>{SIGNATURE}</div>
          </>
        ) : (
          <>
            {/* cartão fosco + cantoneiras (VC Sabia). Abraça SÓ a mensagem
                ("Sabias que…" + frase); a assinatura vai FORA, como rodapé do
                post (igual ao Hoje em Mim). Frase em BLOOM (palavras florescem)
                — distinto do typewriter do Hoje em Mim. Mais ABAIXO (a imagem
                contemplativa respira em cima) e com respiro entre linhas.
                A frase nunca repete o "Sabias que…" (o rótulo já o diz). */}
            <div style={{ position: 'absolute', left: 110, right: 110, top: '58%', transform: 'translateY(-50%)', borderRadius: 22, background: 'rgba(20,15,30,0.30)', border: `1px solid ${OURO}`, padding: '72px 72px', boxSizing: 'border-box' }}>
              {cantoneira(true, true)}{cantoneira(true, false)}{cantoneira(false, true)}{cantoneira(false, false)}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44, textAlign: 'center' }}>
                <span style={{ fontFamily: FONT_MONO, fontStyle: 'italic', fontWeight: 400, fontSize: 50, letterSpacing: '0.01em', color: OURO }}>Sabias que…</span>
                <FraseTW texto={frase.replace(/^sabias\s+que(\.\.\.|…)?,?\s*/i, '')} prog={prog} size={tamanhoFrase(frase)} color={CREME} maxW={680} modo="bloom" fonte={FONT_MONO} alturaLinha={1.66} />
              </div>
            </div>
            {/* rodapé/assinatura FORA do cartão (selo do post) — mono, como o VC Sabia */}
            <div style={{ position: 'absolute', top: 1748, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 400, fontSize: 22, letterSpacing: '0.14em', color: OURO, opacity: 0.85 }}>{SIGNATURE}</div>
          </>
        )}
      </div>
    </div>
  );
}
