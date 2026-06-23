'use client';

// AutoridadeSlide — cada formato de autoridade da MÃE com o SEU layout próprio.
// Em vez de 8 formatos a saírem todos como slides iguais a ciclar, cada um tem uma
// cara: o Véu de… (o NOME grande), o Mecanismo (a pergunta + revelação), a Origem
// (linha do tempo), o Erro (errado riscado -> certo), o Custo (recibo), o Mito vs
// Verdade (dois painéis), a Cena (legenda de cinema). O Mapa do Véu tem componente
// próprio (MapaSlide) e é delegado. Conduzido por prog (as partes acendem-se).

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Conta } from '@/lib/metodo/contas';
import type { FormatoAutoridadeId } from '@/lib/metodo/formatos-autoridade';
import { FORMATOS_AUTORIDADE } from '@/lib/metodo/formatos-autoridade';
import { MapaSlide } from './MapaSlide';

const FONT_SERIF = '"Cormorant Garamond", var(--font-cormorant), Georgia, serif';
const FONT_SANS = '"Inter", var(--font-inter), system-ui, sans-serif';

const a = (hex: string, alpha: string) => `${hex}${alpha}`;
const limpos = (beats: string[]) => beats.map((b) => (b ?? '').trim()).filter(Boolean);
// tira um prefixo tipo "Mito:" / "Pensas que é" do início de uma linha (o layout já o mostra).
const semPrefixo = (s: string, re: RegExp) => s.replace(re, '').trim();

// ——— moldura comum: escala 1080×H, fundo (imagem ou gradiente), o selo do formato ———
function Stage({ conta, imageUrl, prog, ratio, nome, children }: { conta: Conta; imageUrl?: string; prog: number; ratio: '9:16' | '4:5'; nome: string; children: ReactNode }) {
  const { bg1, bg2, accent } = conta.paleta;
  const H = ratio === '4:5' ? 1350 : 1920;
  const ar = ratio === '4:5' ? '1080 / 1350' : '1080 / 1920';
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const set = () => { const w = wrap.clientWidth; if (w) setScale(w / 1080); };
    set(); const ro = new ResizeObserver(set); ro.observe(wrap); return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: bg2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: imageUrl ? '#000' : `radial-gradient(ellipse 120% 85% at 50% 28%, ${bg1} 0%, ${bg2} 86%)`, overflow: 'hidden' }}>
        {imageUrl && (<>
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + 0.06 * prog})`, transformOrigin: 'center', filter: 'brightness(0.55) saturate(1.02)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${a(bg2, 'd0')} 0%, ${a(bg2, '90')} 45%, ${a(bg2, 'e0')} 100%)`, zIndex: 1 }} />
        </>)}
        {/* selo do formato */}
        <div style={{ position: 'absolute', top: 116, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 28px', borderRadius: 999, border: `1px solid ${a(accent, '55')}`, background: 'rgba(0,0,0,0.28)' }}>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
            <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F6F1E8' }}>{nome}</span>
            <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// assinatura (@handle) em baixo, comum.
function Assinatura({ conta, op }: { conta: Conta; op: number }) {
  return <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 28, letterSpacing: '0.06em', color: conta.paleta.accent, margin: 0, opacity: op }}>@{conta.handle}</p>;
}

export function AutoridadeSlide({ formato, beats, conta, imageUrl, prog = 1, ratio = '9:16' }: { formato: FormatoAutoridadeId; beats: string[]; conta: Conta; imageUrl?: string; prog?: number; ratio?: '9:16' | '4:5' }) {
  // O Mapa tem componente próprio.
  if (formato === 'mapa') return <MapaSlide beats={beats} conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} />;

  const { accent } = conta.paleta;
  const nome = FORMATOS_AUTORIDADE[formato]?.nome ?? '';
  const L = limpos(beats);
  const op = (ini: number, dur = 0.16) => Math.max(0, Math.min(1, (prog - ini) / dur));
  const sombra = imageUrl ? '0 2px 22px rgba(0,0,0,0.7)' : 'none';
  // primeira (faca) · meio · última (fecho) — comum a vários arcos.
  const faca = L[0] ?? '';
  const ultima = L.length > 1 ? L[L.length - 1] : '';
  const meio = L.slice(1, -1);

  switch (formato) {
    // ——— 🪞 O Véu de… — o NOME grande + sinais como checklist + a pergunta ———
    case 'veuDe': {
      const sinais = L.slice(1, -1);
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          <div style={{ position: 'absolute', top: 320, left: 90, right: 90, textAlign: 'center', zIndex: 2, opacity: op(0.04), transform: `translateY(${(1 - op(0.04)) * 14}px)` }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, opacity: 0.85, margin: '0 0 22px' }}>conheces…</p>
            <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 96, lineHeight: 1.08, color: '#F5EEE3', margin: 0, textShadow: sombra }}>{faca}</p>
          </div>
          <div style={{ position: 'absolute', top: 760, left: 150, right: 150, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 34 }}>
            {sinais.map((s, i) => {
              const o = op(0.3 + i * 0.14);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 22, opacity: o, transform: `translateX(${(1 - o) * -20}px)` }}>
                  <span style={{ flexShrink: 0, marginTop: 14, width: 16, height: 16, borderRadius: 4, border: `2px solid ${accent}`, background: a(accent, '44') }} />
                  <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 50, lineHeight: 1.16, color: '#F2E8DC', margin: 0, textShadow: sombra }}>{s}</p>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 110px', zIndex: 3, opacity: op(0.82) }}>
            {ultima && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 54, lineHeight: 1.16, color: accent, margin: '0 0 26px', textShadow: sombra }}>{ultima}</p>}
            <Assinatura conta={conta} op={op(0.82)} />
          </div>
        </Stage>
      );
    }

    // ——— ⚙️ O Mecanismo Invisível — a pergunta + a revelação numa caixa + o custo ———
    case 'mecanismo': {
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          <div style={{ position: 'absolute', top: 300, left: 110, right: 110, textAlign: 'center', zIndex: 2, opacity: op(0.04), transform: `translateY(${(1 - op(0.04)) * 14}px)` }}>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 76, lineHeight: 1.14, color: '#F5EEE3', margin: 0, textShadow: sombra }}>{faca}</p>
          </div>
          {/* a caixa "o que está mesmo a acontecer" */}
          <div style={{ position: 'absolute', top: 700, left: 120, right: 120, zIndex: 2, opacity: op(0.32), transform: `translateY(${(1 - op(0.32)) * 18}px)`, border: `1px solid ${a(accent, '55')}`, borderRadius: 22, padding: '40px 44px', background: 'rgba(0,0,0,0.34)' }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.26em', textTransform: 'uppercase', color: accent, margin: '0 0 22px' }}>o que está mesmo a acontecer</p>
            {meio.map((m, i) => (
              <p key={i} style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 50, lineHeight: 1.2, color: '#F2E8DC', margin: i ? '16px 0 0' : 0, opacity: op(0.4 + i * 0.12), textShadow: sombra }}>{m}</p>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 120px', zIndex: 3, opacity: op(0.8) }}>
            {ultima && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 52, lineHeight: 1.16, color: accent, margin: '0 0 24px', textShadow: sombra }}>{ultima}</p>}
            <Assinatura conta={conta} op={op(0.8)} />
          </div>
        </Stage>
      );
    }

    // ——— 🌱 A Origem — linha do tempo vertical: HOJE -> DE ONDE VEIO -> AGORA ———
    case 'origem': {
      const nodos = [{ rot: 'hoje', txt: faca }, ...meio.map((m) => ({ rot: 'de onde veio', txt: m })), { rot: 'e agora', txt: ultima }].filter((n) => n.txt);
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          <div style={{ position: 'absolute', top: 330, bottom: 230, left: 150, right: 110, zIndex: 2 }}>
            {/* a linha vertical */}
            <div style={{ position: 'absolute', left: 11, top: 18, bottom: 18, width: 2, background: a(accent, '55') }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 56, height: '100%', justifyContent: 'center' }}>
              {nodos.map((n, i) => {
                const o = op(0.08 + i * 0.2);
                const ultimoNo = i === nodos.length - 1;
                return (
                  <div key={i} style={{ position: 'relative', paddingLeft: 56, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
                    <span style={{ position: 'absolute', left: 0, top: 8, width: 24, height: 24, borderRadius: '50%', border: `2px solid ${accent}`, background: ultimoNo ? accent : a(accent, '33') }} />
                    <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.26em', textTransform: 'uppercase', color: accent, margin: '0 0 10px' }}>{n.rot}</p>
                    <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: ultimoNo ? 58 : 52, lineHeight: 1.16, fontStyle: ultimoNo ? 'italic' : 'normal', color: ultimoNo ? accent : '#F2E8DC', margin: 0, textShadow: sombra }}>{n.txt}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}><Assinatura conta={conta} op={op(0.85)} /></div>
        </Stage>
      );
    }

    // ——— 🔁 O Erro de Interpretação — o errado RISCADO -> o certo, claro ———
    case 'erro': {
      const certo = L[1] ?? '';
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          {/* o que pensas (riscado, esmorecido) */}
          <div style={{ position: 'absolute', top: 350, left: 110, right: 110, textAlign: 'center', zIndex: 2, opacity: op(0.04) }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#F6F1E8', opacity: 0.45, margin: '0 0 18px' }}>pensas que é</p>
            <p style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 68, lineHeight: 1.16, color: '#F2E8DC', opacity: 0.5, margin: 0, textShadow: sombra }}>
              {semPrefixo(faca, /^pensas\s+que\s+é\s*[:：-]?\s*/i)}
              <span style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 3, background: '#E0796F', transform: `scaleX(${op(0.34, 0.18)})`, transformOrigin: 'left' }} />
            </p>
          </div>
          {/* a viragem */}
          <div style={{ position: 'absolute', top: 720, left: 0, right: 0, textAlign: 'center', zIndex: 2, opacity: op(0.5) }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent }}>não é. é…</span>
          </div>
          {/* o certo (claro, em acento) */}
          <div style={{ position: 'absolute', top: 810, left: 100, right: 100, textAlign: 'center', zIndex: 2, opacity: op(0.56), transform: `translateY(${(1 - op(0.56)) * 16}px)` }}>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 78, lineHeight: 1.14, color: accent, margin: 0, textShadow: sombra }}>{semPrefixo(certo, /^(não\s+é\.?\s*é|é)\s*[:：-]?\s*/i)}</p>
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 120px', zIndex: 3, opacity: op(0.82) }}>
            {ultima && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 50, lineHeight: 1.18, color: '#F2E8DC', margin: '0 0 24px', textShadow: sombra }}>{ultima}</p>}
            <Assinatura conta={conta} op={op(0.82)} />
          </div>
        </Stage>
      );
    }

    // ——— 💸 O Custo Escondido — recibo: "parece" + as trocas + a verdade no fim ———
    case 'custo': {
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          <div style={{ position: 'absolute', top: 320, left: 110, right: 110, textAlign: 'center', zIndex: 2, opacity: op(0.04) }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#F6F1E8', opacity: 0.6, margin: '0 0 18px' }}>parece bom</p>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 70, lineHeight: 1.14, color: '#F5EEE3', margin: 0, textShadow: sombra }}>{faca}</p>
          </div>
          {/* o recibo do que custa */}
          <div style={{ position: 'absolute', top: 660, left: 130, right: 130, zIndex: 2, opacity: op(0.3), borderTop: `1px dashed ${a(accent, '66')}`, borderBottom: `1px dashed ${a(accent, '66')}`, padding: '34px 0' }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#E0796F', margin: '0 0 24px', textAlign: 'center' }}>mas custa-te</p>
            {meio.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, margin: i ? '18px 0 0' : 0, opacity: op(0.38 + i * 0.12) }}>
                <span style={{ flexShrink: 0, marginTop: 18, color: '#E0796F', fontSize: 40, lineHeight: 1 }}>−</span>
                <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 48, lineHeight: 1.2, color: '#F2E8DC', margin: 0, textShadow: sombra }}>{m}</p>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 120px', zIndex: 3, opacity: op(0.82) }}>
            {ultima && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 54, lineHeight: 1.16, color: accent, margin: '0 0 24px', textShadow: sombra }}>{ultima}</p>}
            <Assinatura conta={conta} op={op(0.82)} />
          </div>
        </Stage>
      );
    }

    // ——— ⚔️ Mito vs Verdade — dois painéis: o mito (riscado) e a verdade (clara) ———
    case 'mito': {
      const mito = semPrefixo(faca, /^mito\s*[:：-]?\s*/i);
      const verdade = semPrefixo(L[1] ?? '', /^verdade\s*[:：-]?\s*/i);
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          {/* painel MITO */}
          <div style={{ position: 'absolute', top: 320, left: 110, right: 110, zIndex: 2, opacity: op(0.06), borderRadius: 22, padding: '40px 44px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#F6F1E8', opacity: 0.5, margin: '0 0 18px' }}>mito</p>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 300, fontSize: 56, lineHeight: 1.16, color: '#F2E8DC', opacity: 0.62, margin: 0, textDecoration: 'line-through', textDecorationColor: a('#E0796F', 'cc') }}>{mito}</p>
          </div>
          {/* painel VERDADE */}
          <div style={{ position: 'absolute', top: 720, left: 110, right: 110, zIndex: 2, opacity: op(0.42), transform: `translateY(${(1 - op(0.42)) * 18}px)`, borderRadius: 22, padding: '44px 44px', background: a(accent, '1f'), border: `2px solid ${accent}` }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', textTransform: 'uppercase', color: accent, margin: '0 0 18px' }}>verdade</p>
            <p style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 66, lineHeight: 1.14, color: '#F8F2E8', margin: 0, textShadow: sombra }}>{verdade}</p>
          </div>
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', padding: '0 120px', zIndex: 3, opacity: op(0.82) }}>
            {ultima && <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 50, lineHeight: 1.18, color: accent, margin: '0 0 24px', textShadow: sombra }}>{ultima}</p>}
            <Assinatura conta={conta} op={op(0.82)} />
          </div>
        </Stage>
      );
    }

    // ——— 🎬 Cena do dia-a-dia — cinema: imagem forte + legendas em terço inferior ———
    case 'cena': {
      // a cena pede imagem; as linhas entram como legendas (uma de cada vez).
      const linhas = L;
      const idx = Math.min(linhas.length - 1, Math.floor(prog * linhas.length));
      return (
        <Stage conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} nome={nome}>
          {/* barras letterbox (cinema) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: '#000', zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: '#000', zIndex: 2 }} />
          {/* legenda (terço inferior), a linha atual; a última (a revelação) maior e em acento */}
          <div style={{ position: 'absolute', bottom: 240, left: 90, right: 90, textAlign: 'center', zIndex: 3 }}>
            {linhas.map((l, i) => {
              if (i !== idx) return null;
              const ehRevelacao = i === linhas.length - 1 && linhas.length > 1;
              return (
                <p key={i} style={{ fontFamily: FONT_SERIF, fontWeight: ehRevelacao ? 400 : 300, fontStyle: ehRevelacao ? 'italic' : 'normal', fontSize: ehRevelacao ? 74 : 60, lineHeight: 1.14, color: ehRevelacao ? accent : '#F6F1E8', margin: 0, textShadow: '0 2px 26px rgba(0,0,0,0.85)' }}>{l}</p>
              );
            })}
          </div>
          {/* pontinhos da cena + assinatura */}
          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 3 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {linhas.map((_, k) => <span key={k} style={{ width: 12, height: 12, borderRadius: '50%', background: k === idx ? accent : 'rgba(255,255,255,0.35)' }} />)}
            </div>
            <Assinatura conta={conta} op={1} />
          </div>
        </Stage>
      );
    }

    default:
      return <MapaSlide beats={beats} conta={conta} imageUrl={imageUrl} prog={prog} ratio={ratio} />;
  }
}

// para o feed/render saberem se um tipo é um formato de autoridade (layout próprio).
export function ehFormatoAutoridade(tipo?: string | null): tipo is FormatoAutoridadeId {
  return !!tipo && tipo in FORMATOS_AUTORIDADE;
}
