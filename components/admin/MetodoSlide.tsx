'use client';

// MetodoSlide: identidade PRÓPRIA das contas do Método VS (ver/vir/viver).
// NÃO é o KineticSlide da veu.a.veu (esse assina "Véu a Véu"). Aqui:
//  - paleta própria por conta (azul/âmbar/verde),
//  - o @conta como assinatura (identificável),
//  - UMA linha no ecrã (foco), revelada palavra a palavra,
//  - o selo editorial no topo (Véu do… / Revelação / Manifesto).
// Sem pessoas, sem "Véu a Véu". Conduzido por prog (0..1) para o render.

import { useLayoutEffect, useRef, useState } from 'react';
import type { Conta } from '@/lib/metodo/contas';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export function MetodoSlide({ texto, destaque = [], imageUrl, conta, conceito, prog = 1, ratio = '9:16' }: { texto: string; destaque?: string[]; imageUrl?: string; conta: Conta; conceito?: string; prog?: number; ratio?: '9:16' | '4:5' }) {
  const { bg1, bg2, accent } = conta.paleta;
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
  const revelar = Math.min(1, prog / 0.82); // mais lento que a veu.a.veu (linha curta, lê-se com calma)
  const mostradas = revelar * palavras.length;
  const aindaEscreve = revelar < 1;
  const ultimoVisivel = Math.min(palavras.length - 1, Math.floor(mostradas));
  const zoom = 1 + 0.06 * prog;
  const rodapeOp = Math.max(0, Math.min(1, (prog - 0.5) / 0.25));

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: bg2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 120% 85% at 50% 32%, ${bg1} 0%, ${bg2} 82%)`, overflow: 'hidden' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: 'center', filter: 'brightness(1.6) saturate(1.05)', zIndex: 0 }} />
          {/* sombra SÓ no rodapé (para o @conta) e atrás do texto (legibilidade); resto fica claro */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 0%, transparent 56%, ${a(bg2, '55')} 100%)`, zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 34% at 50% 47%, rgba(0,0,0,0.34) 0%, transparent 66%)', zIndex: 1 }} />
        </>)}

        {/* selo editorial (Véu do… / Revelação / Manifesto) */}
        <div style={{ position: 'absolute', top: 116, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 30px', borderRadius: 999, border: `1px solid ${a(accent, '55')}`, background: 'rgba(0,0,0,0.28)' }}>
            <span style={{ width: 20, height: 1, background: accent, opacity: 0.8 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#F6F1E8' }}>Método VS</span>
            <span style={{ width: 20, height: 1, background: accent, opacity: 0.8 }} />
          </div>
          {conceito && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, opacity: 0.9, textAlign: 'center', padding: '0 90px' }}>{conceito}</span>}
        </div>

        {/* a linha (uma só, no centro) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 130px', zIndex: 2 }}>
          <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 98, lineHeight: 1.16, letterSpacing: '-0.01em', textAlign: 'center', color: '#F5EEE3', textShadow: imageUrl ? '0 2px 30px rgba(0,0,0,0.65)' : 'none', margin: 0 }}>
            {palavras.map((w, i) => {
              const dest = goldIdx.has(i);
              let op = 0, dy = 14;
              if (i < ultimoVisivel) { op = 1; dy = 0; }
              else if (i === ultimoVisivel) { const f = Math.max(0, Math.min(1, mostradas - i)); op = f; dy = 14 * (1 - f); }
              return (
                <span key={i} style={{ display: 'inline-block', marginRight: '0.28em', color: dest ? accent : '#F7EFE6', fontStyle: dest ? 'italic' : 'normal', opacity: op, transform: `translateY(${dy}px)`, textShadow: imageUrl ? '0 2px 28px rgba(0,0,0,0.85)' : 'none' }}>
                  {w}
                  {aindaEscreve && i === ultimoVisivel && <span style={{ display: 'inline-block', width: 5, height: '0.92em', background: accent, opacity: 0.9, transform: 'translateY(0.12em)', marginLeft: '0.08em' }} />}
                </span>
              );
            })}
          </p>
        </div>

        {/* assinatura: o @conta (identidade própria, NUNCA "Véu a Véu") */}
        <div style={{ position: 'absolute', bottom: 132, left: 0, right: 0, textAlign: 'center', zIndex: 3, opacity: rodapeOp }}>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.06em', color: accent, margin: 0 }}>@{conta.handle}</p>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 28, color: '#F2E8DC', opacity: 0.7, margin: '8px 0 0' }}>Ver e Soltar</p>
        </div>
      </div>
    </div>
  );
}
