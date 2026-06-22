'use client';
/* eslint-disable @next/next/no-img-element, jsx-a11y/media-has-caption */

// KARAOKÊ (lyric) do Método VS: o texto já é conhecido (as linhas dos slides) e a
// voz traz o tempo de cada PALAVRA (vozPalavras). Aqui mostramos a LINHA que está a
// ser dita e ACENDEMOS as palavras à medida que são pronunciadas — como um vídeo de
// letras. Conduzido por `timeS` (segundos), que o render avança com a voz.

import type { Conta } from '@/lib/metodo/contas';

export type Palavra = { w: string; t0: number; t1: number };

export function KaraokeMetodo({ linhas, palavras, timeS, imageUrl, clipUrl, conta }: { linhas: string[]; palavras: Palavra[]; timeS: number; imageUrl?: string | null; clipUrl?: string | null; conta: Conta }) {
  const accent = conta.paleta.accent;
  const lineWords = linhas.map((l) => l.trim().split(/\s+/).filter(Boolean)).filter((ws) => ws.length);
  // índice plano da palavra -> linha a que pertence
  const flatToLine: number[] = [];
  lineWords.forEach((ws, li) => ws.forEach(() => flatToLine.push(li)));
  // palavra ativa = a última cujo início já passou
  let active = 0;
  for (let i = 0; i < palavras.length; i++) { if (palavras[i].t0 <= timeS) active = i; else break; }
  const activeLine = flatToLine[Math.min(active, flatToLine.length - 1)] ?? 0;
  let before = 0; for (let li = 0; li < activeLine; li++) before += lineWords[li].length;
  const words = lineWords[activeLine] ?? [];
  const relActive = Math.max(0, Math.min(active - before, words.length - 1));

  return (
    <div style={{ position: 'relative', width: 1080, height: 1920, background: '#000', overflow: 'hidden' }}>
      {clipUrl
        ? <video className="clip-bg" src={clipUrl} muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.04)' }} />
        : imageUrl ? <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 140% 70% at 50% 50%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.2) 85%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 110px' }}>
        <p style={{ fontFamily: 'var(--font-cormorant), serif', fontWeight: 600, fontSize: 86, lineHeight: 1.28, textAlign: 'center', color: '#fff', textShadow: '0 4px 44px rgba(0,0,0,0.75)', margin: 0 }}>
          {words.map((w, wi) => (
            <span key={wi} style={{ color: wi <= relActive ? accent : 'rgba(255,255,255,0.4)' }}>{w}{wi < words.length - 1 ? ' ' : ''}</span>
          ))}
        </p>
      </div>
    </div>
  );
}
