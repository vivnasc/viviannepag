'use client';

// MapaSlide — layout PRÓPRIO do formato "O Mapa do Véu" (autoridade da mãe).
// Em vez de 4 slides iguais, UM cartão-diagnóstico: a faca em cima, e as linhas
// PENSAS / SENTES / FAZES / PAGAS como um mapa, com a saída por baixo. Conduzido
// por prog (as linhas acendem-se em cadência). Distinto dos outros formatos.

import { useLayoutEffect, useRef, useState } from 'react';
import type { Conta } from '@/lib/metodo/contas';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

// separa os beats: title (faca) · linhas rotuladas (Pensas/Sentes/Fazes/Pagas) · saída.
const ROTULOS = ['pensas', 'sentes', 'fazes', 'pagas'];
function partir(beats: string[]): { titulo: string; linhas: { rotulo: string; texto: string }[]; saida: string } {
  const limpo = beats.map((b) => (b ?? '').trim()).filter(Boolean);
  const linhas: { rotulo: string; texto: string }[] = [];
  const resto: string[] = [];
  for (const b of limpo) {
    const m = b.match(/^\s*(pensas|sentes|fazes|pagas)\s*[:：-]\s*(.+)$/i);
    if (m) linhas.push({ rotulo: m[1].toUpperCase(), texto: m[2].trim() });
    else resto.push(b);
  }
  // se o modelo não rotulou, usa a ordem (1.ª=faca, 4 do meio=mapa, última=saída).
  if (!linhas.length && limpo.length >= 5) {
    return { titulo: limpo[0], linhas: ROTULOS.map((r, i) => ({ rotulo: r.toUpperCase(), texto: limpo[i + 1] ?? '' })).filter((x) => x.texto), saida: limpo[limpo.length - 1] };
  }
  const titulo = resto[0] ?? 'O mapa deste padrão';
  const saida = resto.length > 1 ? resto[resto.length - 1] : '';
  return { titulo, linhas, saida };
}

export function MapaSlide({ beats, conta, imageUrl, prog = 1, ratio = '9:16' }: { beats: string[]; conta: Conta; imageUrl?: string; prog?: number; ratio?: '9:16' | '4:5' }) {
  const { bg1, bg2, accent } = conta.paleta;
  const a = (hex: string, alpha: string) => `${hex}${alpha}`;
  const H = ratio === '4:5' ? 1350 : 1920;
  const ar = ratio === '4:5' ? '1080 / 1350' : '1080 / 1920';
  const { titulo, linhas, saida } = partir(beats);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);

  // cadência: título cedo; as linhas acendem-se uma a uma; a saída no fim.
  const op = (ini: number, dur = 0.16) => Math.max(0, Math.min(1, (prog - ini) / dur));
  const opTitulo = op(0.04);
  const opSaida = op(0.78);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: bg2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 120% 85% at 50% 30%, ${bg1} 0%, ${bg2} 84%)`, overflow: 'hidden' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + 0.06 * prog})`, transformOrigin: 'center', filter: 'brightness(0.6) saturate(1.02)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${a(bg2, 'cc')} 0%, ${a(bg2, '99')} 45%, ${a(bg2, 'dd')} 100%)`, zIndex: 1 }} />
        </>)}

        {/* selo + nome do formato */}
        <div style={{ position: 'absolute', top: 118, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 28px', borderRadius: 999, border: `1px solid ${a(accent, '55')}`, background: 'rgba(0,0,0,0.28)' }}>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#F6F1E8' }}>O Mapa do Véu</span>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
          </div>
        </div>

        {/* a faca (título) */}
        <div style={{ position: 'absolute', top: 270, left: 0, right: 0, padding: '0 120px', zIndex: 2, textAlign: 'center', opacity: opTitulo, transform: `translateY(${(1 - opTitulo) * 16}px)` }}>
          <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 78, lineHeight: 1.12, color: '#F5EEE3', margin: 0, textShadow: imageUrl ? '0 2px 24px rgba(0,0,0,0.7)' : 'none' }}>{titulo}</p>
        </div>

        {/* o MAPA: linhas rotuladas, acendem-se uma a uma */}
        <div style={{ position: 'absolute', top: 560, left: 130, right: 130, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {linhas.map((l, i) => {
            const o = op(0.24 + i * 0.13);
            return (
              <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * -24}px)`, borderLeft: `3px solid ${a(accent, 'cc')}`, paddingLeft: 28 }}>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 26, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, opacity: 0.92, margin: '0 0 8px' }}>{l.rotulo}</p>
                <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 52, lineHeight: 1.18, color: '#F2E8DC', margin: 0, textShadow: imageUrl ? '0 2px 18px rgba(0,0,0,0.7)' : 'none' }}>{l.texto}</p>
              </div>
            );
          })}
        </div>

        {/* a saída + assinatura */}
        <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 120px', zIndex: 3, opacity: opSaida, transform: `translateY(${(1 - opSaida) * 14}px)` }}>
          {saida && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 56, lineHeight: 1.16, color: accent, margin: '0 0 26px', textShadow: imageUrl ? '0 2px 20px rgba(0,0,0,0.7)' : 'none' }}>{saida}</p>}
          <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 28, letterSpacing: '0.06em', color: accent, margin: 0 }}>@{conta.handle}</p>
        </div>
      </div>
    </div>
  );
}
