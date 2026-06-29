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

// EDITOR DE TIPOGRAFIA (à escolha da Vivianne): fonte, tamanho e cores das letras.
// Só fontes que o render-veu carrega (senão o MP4 não as teria).
export const FONTES_TEXTO = [
  { id: 'serif', label: 'Serif' },
  { id: 'sans', label: 'Sans' },
  { id: 'mono', label: 'Mono' },
] as const;
export type FonteTexto = (typeof FONTES_TEXTO)[number]['id'];
// alinhV/alinhH: posição do texto sobre a imagem (à escolha; default centro/centro).
export type AlinhV = 'cima' | 'centro' | 'baixo';
export type AlinhH = 'esq' | 'centro' | 'dir';
export interface Tipografia { fonte?: FonteTexto; tamanho?: number; cor?: string; corDestaque?: string; alinhV?: AlinhV; alinhH?: AlinhH }
const FONT_MAP: Record<FonteTexto, string> = { serif: FONT_SERIF, sans: FONT_SANS, mono: FONT_MONO };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// os EFEITOS de revelação do texto (à escolha da Vivianne; ver EFEITOS_TEXTO no admin).
export type EfeitoTexto = 'maquina' | 'teclado' | 'bloom' | 'fade' | 'surgir';
export const EFEITOS_TEXTO: { id: EfeitoTexto; label: string }[] = [
  { id: 'teclado', label: '⌨︎ teclado (letra a letra)' },
  { id: 'maquina', label: '⌨︎ máquina (palavra a palavra)' },
  { id: 'surgir', label: '✶ surgir' },
  { id: 'fade', label: '◍ fade suave' },
  { id: 'bloom', label: '✺ bloom luminoso' },
];

// a TRANSIÇÃO entre momentos (de uma frase para a seguinte). É DIFERENTE do efeito:
// o efeito é COMO cada frase se revela; a transição é COMO se TROCA de frase. À
// escolha da Vivianne (a "linguagem de movimento" da marca), com descrição clara.
// Paleta completa: deslizar (←/→), empurrar, virar página, revelar, cortina, zoom,
// fundir, corte. O padrão do método é 'deslizar' (esquerda); o Soulab fica em 'fundir'.
export type Transicao =
  | 'deslizar' | 'deslizar-dir' | 'empurrar' | 'virar'
  | 'revelar' | 'cortina' | 'zoom' | 'fundir' | 'corte';
export const TRANSICOES: { id: Transicao; label: string; desc: string }[] = [
  { id: 'deslizar', label: '⇠ deslizar (←)', desc: 'a frase nova entra da direita e a anterior sai pela esquerda (deslizar entre cartões)' },
  { id: 'deslizar-dir', label: '⇢ deslizar (→)', desc: 'ao contrário: a frase nova entra da esquerda e a anterior sai pela direita' },
  { id: 'empurrar', label: '⇥ empurrar', desc: 'a frase nova empurra a anterior para fora, sem fundido, com bordas nítidas (sensação física)' },
  { id: 'virar', label: '⤵ virar página', desc: 'a frase nova vira como uma página de livro (rotação 3D a partir da margem)' },
  { id: 'revelar', label: '◗ revelar', desc: 'a frase nova revela-se por cima da anterior, como um pano a abrir da esquerda para a direita' },
  { id: 'cortina', label: '◫ cortina', desc: 'a frase nova abre do centro para cima e para baixo, como uma cortina a separar-se' },
  { id: 'zoom', label: '⊙ zoom', desc: 'a frase nova aproxima-se suavemente (entra um pouco maior e assenta); a anterior afasta-se' },
  { id: 'fundir', label: '◍ fundir', desc: 'as frases cruzam-se num fundido suave (uma esmorece enquanto a outra acende)' },
  { id: 'corte', label: '▮ corte seco', desc: 'troca direta, sem fundido nem deslize: cada frase aparece de uma vez' },
];

// ── MODELO DE SEQUÊNCIA (o bom) ────────────────────────────────────────────────
// A Vivianne: "a transição não pode ter espaço vazio nem apagar — as pessoas fogem".
// Este modelo TROCA de frase SOBRE a fronteira, com as duas frases a sobrepor-se: há
// SEMPRE uma frase a cobrir o ecrã inteiro (zero preto), e a família empurrão é SÓLIDA
// (opacity 1, sem fundido). Recebe o prog GLOBAL (0..1), o índice i e o total n — é isso
// que permite a sobreposição (o estiloMomento antigo, por lp local, deixava um buraco
// na fronteira). A frase que ENTRA tem índice maior => é pintada por cima.
export function estiloSequencia(transicao: Transicao | undefined, prog: number, i: number, n: number): React.CSSProperties | null {
  const t = transicao ?? 'deslizar';
  const N = Math.max(1, n);
  const w = 1 / N;
  const T = Math.min(w * 0.32, 0.055);   // duração da troca (curta), em unidades de prog
  const isFirst = i === 0, isLast = i === N - 1;
  const bIn = i * w;          // fronteira onde ESTE entra (= fim do anterior)
  const bOut = (i + 1) * w;   // fronteira onde ESTE sai
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  // fora das suas janelas (com meia-troca de margem), não existe.
  if (!isFirst && prog < bIn - T / 2) return null;
  if (!isLast && prog > bOut + T / 2) return null;
  // fase + progresso da fase (f: 0..1)
  let fase: 'enter' | 'hold' | 'exit' = 'hold';
  let f = 0;
  if (!isFirst && prog < bIn + T / 2) { fase = 'enter'; f = clamp((prog - (bIn - T / 2)) / T); }
  else if (!isLast && prog > bOut - T / 2) { fase = 'exit'; f = clamp((prog - (bOut - T / 2)) / T); }
  // CORTE: troca seca, sem sobreposição (cada frase "possui" a sua janela).
  if (t === 'corte') {
    const vis = (isFirst || prog >= bIn) && (isLast || prog < bOut);
    return vis ? { opacity: 1 } : null;
  }
  // FUNDIR: o ÚNICO com fundido (a Vivianne sabe-o; já não é o padrão).
  if (t === 'fundir') {
    const op = fase === 'enter' ? f : fase === 'exit' ? 1 - f : 1;
    return op <= 0 ? null : { opacity: op };
  }
  // FAMÍLIA EMPURRÃO (deslizar ←/→, empurrar): SÓLIDA. As duas frases deslizam juntas
  // sobre a fronteira -> cobertura contínua, zero preto, zero fade.
  if (t === 'deslizar' || t === 'deslizar-dir' || t === 'empurrar') {
    const dir = t === 'deslizar-dir' ? -1 : 1; // ← entra da direita(+); → entra da esquerda(-)
    let x = 0;
    if (fase === 'enter') x = (1 - f) * 100 * dir;   // de +100·dir a 0
    else if (fase === 'exit') x = -f * 100 * dir;    // de 0 a -100·dir
    return { opacity: 1, transform: `translateX(${x.toFixed(2)}%)` };
  }
  // FAMÍLIA COBERTURA (virar/revelar/cortina/zoom): a que SAI fica parada e cheia; a que
  // ENTRA vem POR CIMA (índice maior). Nunca há preto por baixo.
  if (fase === 'exit') return { opacity: 1 };
  if (fase === 'enter') {
    switch (t) {
      case 'revelar': return { opacity: 1, clipPath: `inset(0 ${((1 - f) * 100).toFixed(1)}% 0 0)` };
      case 'cortina': { const h = ((1 - f) * 50).toFixed(1); return { opacity: 1, clipPath: `inset(${h}% 0 ${h}% 0)` }; }
      case 'virar': return { opacity: 1, transform: `perspective(1600px) rotateY(${((1 - f) * 90).toFixed(1)}deg)`, transformOrigin: 'left center', backfaceVisibility: 'hidden' };
      case 'zoom': return { opacity: f, transform: `scale(${(1.12 - 0.12 * f).toFixed(3)})` };
    }
  }
  return { opacity: 1 }; // hold
}

export function KineticSlide({ texto, destaque = [], imageUrl, clipUrl, mundo = 'escola', prog = 1, ratio = '9:16', variante, efeito, tipografia, conceito, selo, mostrarConceito = true, assinatura = 'Véu a Véu', site = 'viviannedossantos.com' }: { texto: string; destaque?: string[]; imageUrl?: string; clipUrl?: string; mundo?: Mundo; prog?: number; ratio?: '9:16' | '4:5'; variante?: string; efeito?: EfeitoTexto; tipografia?: Tipografia; conceito?: string; selo?: string | null; mostrarConceito?: boolean; assinatura?: string; site?: string }) {
  const ehDomingo = variante === 'domingo'; // motion luminoso (bloom), distinto do typewriter
  // o EFEITO do texto (à escolha): máquina de escrever · bloom luminoso · fade
  // suave · surgir (palavra a palavra, sem cursor). Back-compat: domingo => bloom.
  const efeitoFinal: EfeitoTexto = efeito ?? (ehDomingo ? 'bloom' : 'maquina');
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
  const velocidade = efeitoFinal === 'bloom' ? 0.85 : efeitoFinal === 'fade' ? 0.6 : efeitoFinal === 'surgir' ? 0.82 : efeitoFinal === 'teclado' ? 0.74 : 0.72;
  // TECLADO (letra a letra): offsets de caráter por palavra, para revelar carácter
  // a carácter (mantendo o espaço reservado, sem reflow).
  const ehTeclado = efeitoFinal === 'teclado';
  const chOffsets: number[] = [];
  let chTotal = 0;
  if (ehTeclado) { let acc = 0; for (const w of palavras) { chOffsets.push(acc); acc += w.length + 1; } chTotal = Math.max(0, acc - 1); }
  const revelar = Math.min(1, prog / velocidade); // bloom/surgir revelam mais devagar; fade abre cedo
  const mostradas = revelar * palavras.length;
  const aindaEscreve = revelar < 1;
  const accent = (efeitoFinal === 'bloom' && ehDomingo) ? '#F0C6CF' : ACCENT; // Domingo de Luz: rosa; restante = destaque da paleta
  // tipografia à escolha (com defaults = o de sempre)
  const fontFam = FONT_MAP[tipografia?.fonte ?? 'serif'] ?? FONT_SERIF;
  const tamFinal = tipografia?.tamanho ?? 92;
  const corBase = tipografia?.cor ?? '#F4ECDD';     // a frase
  const corPalavra = tipografia?.cor ?? '#F8EFE9';  // palavra normal
  const accentTexto = tipografia?.corDestaque ?? accent; // palavra em realce + cursor
  // alinhamento/posição do texto sobre a imagem (à escolha; default centro/centro)
  const alignV = tipografia?.alinhV === 'cima' ? 'flex-start' : tipografia?.alinhV === 'baixo' ? 'flex-end' : 'center';
  const alignText: 'left' | 'center' | 'right' = tipografia?.alinhH === 'esq' ? 'left' : tipografia?.alinhH === 'dir' ? 'right' : 'center';
  const alignFlexH = alignText === 'left' ? 'flex-start' : alignText === 'right' ? 'flex-end' : 'center';
  const serie = ehDomingo ? 'Domingo de Luz' : 'Ancorar'; // cabeçalho da série (veu.a.veu)
  // a MARCA é parametrizável: por defeito a veu.a.veu, mas outra conta (ex. Soulab)
  // passa o seu selo/assinatura/site e pode esconder o selo e o rótulo do conceito.
  const seloTexto = selo === undefined ? serie : selo; // selo===null => esconde o selo
  const ultimoVisivel = Math.min(palavras.length - 1, Math.floor(mostradas));
  const zoom = 1 + 0.07 * prog;                        // leve Ken Burns
  const rodapeOp = Math.max(0, Math.min(1, (prog - 0.55) / 0.25));

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', aspectRatio: ar, overflow: 'hidden', borderRadius: 16, background: BG2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', visibility: scale ? 'visible' : 'hidden', background: (imageUrl || clipUrl) ? '#000' : `radial-gradient(ellipse 110% 80% at 50% 35%, ${BG1} 0%, ${BG2} 80%)`, overflow: 'hidden' }}>
        {(imageUrl || clipUrl) && (<>
          {clipUrl
            // MOTION: o clip do Kling como fundo. class 'clip-bg' => o render faz seek
            // por frame (window.__setKProg) e o texto compõe-se por cima. Sem ffmpeg.
            ? <video className="clip-bg" src={clipUrl} muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            : <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: 'center', zIndex: 0 }} />}
          {/* véu vertical (topo/base) + scrim central ESCURO atrás da frase = contraste garantido sobre qualquer imagem/motion */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${a(BG2, '66')} 0%, ${a(BG2, '38')} 36%, ${a(BG2, 'd9')} 100%)`, zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 135% 40% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 56%, transparent 76%)', zIndex: 1 }} />
        </>)}

        {/* cabeçalho/selo da série (como as outras coleções) + selo do conceito.
            Soulab passa selo={null} e mostrarConceito={false} -> sem nenhum destes. */}
        {(seloTexto || (mostrarConceito && conceito)) && (
          <div style={{ position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 3 }}>
            {seloTexto && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 26px', borderRadius: 999, border: `1px solid ${a('#F4ECDD', '3d')}`, background: 'rgba(18,16,22,0.32)' }}>
                <span style={{ width: 18, height: 1, background: accent, opacity: 0.75 }} />
                <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#F8F1E8' }}>{seloTexto}</span>
                <span style={{ width: 18, height: 1, background: accent, opacity: 0.75 }} />
              </div>
            )}
            {mostrarConceito && conceito && <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 21, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, opacity: 0.82, textAlign: 'center', padding: '0 90px' }}>{conceito}</span>}
          </div>
        )}

        {/* frase — alinhamento/posição à escolha (default centro/centro) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: alignV, justifyContent: alignFlexH, padding: '170px 120px', zIndex: 2 }}>
          <p style={{ fontFamily: fontFam, fontWeight: 300, fontSize: tamFinal, lineHeight: 1.18, letterSpacing: '-0.01em', textAlign: alignText, color: corBase, textShadow: imageUrl ? '0 2px 28px rgba(0,0,0,0.6)' : 'none', margin: 0 }}>
            {palavras.map((w, i) => {
              const dest = goldIdx.has(i);
              const sombra = imageUrl ? (dest ? '0 2px 24px rgba(0,0,0,0.85), 0 0 7px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.95)' : '0 2px 30px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.55)') : 'none';
              let st: React.CSSProperties;
              if (efeitoFinal === 'bloom') {
                // bloom luminoso: cada palavra surge de um desfoque com brilho suave (sem cursor)
                const n = palavras.length;
                const ini = n > 1 ? (i / (n - 1)) * 0.5 : 0;
                const f = Math.max(0, Math.min(1, (revelar - ini) / 0.42));
                st = { opacity: f, filter: `blur(${(1 - f) * 12}px)`, transform: `translateY(${(1 - f) * 8}px) scale(${0.96 + 0.04 * f})`, textShadow: `0 0 ${30 * (1 - f) + 10}px rgba(255,244,250,${0.45 * (1 - f) + 0.2}), 0 2px 20px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)` };
              } else if (efeitoFinal === 'fade') {
                // a frase inteira surge junta, em fade suave com leve subida (sem stagger, sem cursor)
                const f = Math.max(0, Math.min(1, revelar));
                st = { opacity: f, transform: `translateY(${(1 - f) * 12}px)`, textShadow: sombra };
              } else if (efeitoFinal === 'surgir') {
                // palavra a palavra, mas em fade+subida suave, SEM cursor de máquina
                const n = palavras.length;
                const ini = n > 1 ? (i / (n - 1)) * 0.55 : 0;
                const f = Math.max(0, Math.min(1, (revelar - ini) / 0.35));
                st = { opacity: f, transform: `translateY(${(1 - f) * 11}px)`, textShadow: sombra };
              } else if (efeitoFinal === 'teclado') {
                // teclado: letra a letra; o espaço fica reservado (sem reflow)
                st = { opacity: 1, textShadow: sombra };
              } else {
                // máquina de escrever (default): palavra a palavra com cursor
                let op = 0, dy = 14;
                if (i < ultimoVisivel) { op = 1; dy = 0; }
                else if (i === ultimoVisivel) { const f = Math.max(0, Math.min(1, mostradas - i)); op = f; dy = 14 * (1 - f); }
                st = { opacity: op, transform: `translateY(${dy}px)`, textShadow: sombra };
              }
              const cursor = <span style={{ display: 'inline-block', width: 5, height: '0.92em', background: accentTexto, opacity: 0.9, transform: 'translateY(0.12em)', marginLeft: '0.08em' }} />;
              const startCh = ehTeclado ? chOffsets[i] : 0;
              const charRevel = revelar * chTotal;
              const visCh = ehTeclado ? Math.max(0, Math.min(w.length, Math.round(charRevel - startCh))) : w.length;
              const cursorTeclado = ehTeclado && aindaEscreve && charRevel >= startCh && charRevel < startCh + w.length + 1;
              return (
                <span key={i} style={{ display: 'inline-block', marginRight: '0.28em', color: dest ? accentTexto : corPalavra, fontStyle: dest ? 'italic' : 'normal', transition: 'none', ...st }}>
                  {ehTeclado
                    // teclado: revela os carateres já escritos + cursor; o resto fica invisível (espaço reservado, sem reflow)
                    ? (<>{w.slice(0, visCh)}{cursorTeclado && cursor}<span style={{ opacity: 0 }}>{w.slice(visCh)}</span></>)
                    // palavra a palavra (cursor só no modo máquina, na última palavra visível)
                    : (<>{w}{aindaEscreve && efeitoFinal === 'maquina' && i === ultimoVisivel && cursor}</>)}
                </span>
              );
            })}
          </p>
        </div>

        {/* assinatura */}
        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center', zIndex: 3, opacity: rodapeOp }}>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 34, color: '#F4ECDD', opacity: 0.85, margin: 0 }}>{assinatura}</p>
          <p style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.04em', color: ACCENT, opacity: 0.85, margin: '6px 0 0' }}>{site}</p>
        </div>
      </div>
    </div>
  );
}
