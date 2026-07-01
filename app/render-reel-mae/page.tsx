'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motivoSVG, motivosDoTema, segmentar, TOK } from '@/lib/crescer/assinatura-reel';

// RENDER do reel da mãe, dirigido por progresso (window.__setKProg para o recorder).
// ?multi=1 = REEL MULTI-FRAME (cada segmento é uma CENA com a sua geometria, que se
// redesenha e troca). Sem multi = REEL de 1 frame (uma geometria, o texto entra por
// tempos). Params: ?tema=&linhas=a|b&label=&multi=1. Sem recorder, faz preview em loop.
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const hashStr = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

export default function RenderReelMae() {
  const [p, setP] = useState(0);
  // layout ajustável pela Vivianne (autonomia): posição/tamanho do texto e da geometria.
  const [params, setParams] = useState<{ tema: string; segs: string[]; label?: string; multi: boolean; estatico: boolean; seed: string; av: string; ah: string; dist: number; txtSize: number; geoTop: number; geoW: number } | null>(null);
  const geoRef = useRef<HTMLDivElement>(null);
  const externo = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tema = q.get('tema') || 'consciencia';
    const raw = q.get('linhas') || q.get('capa') || q.get('frase') || 'aquilo a que chamas sou assim foi so uma forma de te protegeres. quando a pousas nao ficas menor, ficas leve.';
    const linhas = raw.split('|').map((s) => s.trim()).filter(Boolean);
    const segs = linhas.flatMap(segmentar).slice(0, 12);
    const num = (k: string, d: number) => { const v = parseFloat(q.get(k) || ''); return Number.isFinite(v) ? v : d; };
    setParams({ tema, segs: segs.length ? segs : linhas, label: q.get('label') || undefined, multi: q.get('multi') === '1', estatico: q.get('static') === '1',
      seed: q.get('seed') || raw, av: q.get('av') || 'baixo', ah: q.get('ah') || 'centro', dist: num('dist', 12), txtSize: num('txtSize', 5.6), geoTop: num('geoTop', 15), geoW: num('geoW', 66) });
  }, []);

  useEffect(() => {
    (window as unknown as { __setKProg?: (v: number) => void }).__setKProg = (v: number) => { externo.current = true; setP(clamp(v)); };
    // a GEOMETRIA anima SEMPRE (respira, desenha, orbita), mesmo no modo de posicionar;
    // o 'estatico' só mantém o TEXTO sempre visível. Um não exclui o outro.
    let raf = 0, t0 = 0;
    const LOOP = params ? Math.max(9000, params.segs.length * 3000) : 9000;
    const tick = (t: number) => { if (externo.current) return; if (!t0) t0 = t; setP((((t - t0) % LOOP) / LOOP)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [params]);

  const N = params ? Math.max(1, params.segs.length) : 1;
  const multi = !!params?.multi;
  const scene = multi ? Math.min(N - 1, Math.floor(p * N)) : 0;
  const localP = multi ? clamp(p * N - scene) : p;
  const seq = useMemo(() => (params ? motivosDoTema(params.tema) : []), [params]);
  // single: o motivo varia POR POST (seed do slug) para 2 posts saírem diferentes.
  // multi: o motivo varia por CENA. Ambos partem da sequência do tema.
  const base = params ? hashStr(params.seed) : 0;
  const motivo = params && seq.length ? (multi ? seq[(base + scene) % seq.length] : seq[base % seq.length]) : 'rings';
  const motivoHTML = useMemo(() => motivoSVG(motivo), [motivo]);

  const estatico = !!params?.estatico;
  // opacidade da CENA (multi): entra e sai; a última fica. No estático (texto parado) a
  // geometria fica estável (sem fade de cena) mas continua a animar por dentro.
  const sceneOp = estatico ? 1 : (multi ? clamp(localP / 0.12) * (scene === N - 1 ? 1 : 1 - clamp((localP - 0.86) / 0.12)) : 1);

  // aplica o progresso à geometria (anima SEMPRE)
  useEffect(() => {
    const g = geoRef.current; if (!g || !params) return;
    const dp = multi ? localP : p;
    // GENERICO para a biblioteca VDS: tudo o que tem pathLength DESENHA-SE (escalonado);
    // os brilhos (fills com gradiente) e o halo PULSAM. Cobre os 59 componentes.
    const draws = g.querySelectorAll<SVGGeometryElement>('[pathLength]');
    draws.forEach((el, i) => {
      const start = multi ? 0.04 : 0.02 + i * 0.05;
      const frac = clamp((dp - start) / (multi ? 0.34 : 0.22));
      el.style.strokeDasharray = '1'; el.style.strokeDashoffset = String(1 - frac);
    });
    const br = 0.4 + 0.6 * (0.5 - 0.5 * Math.cos(dp * Math.PI * (multi ? 2 : 4)));
    g.querySelectorAll<SVGElement>('.halo, .core, .focus').forEach((el) => (el.style.opacity = String(0.7 + 0.3 * br)));
    g.querySelectorAll<SVGElement>('[fill^="url"]').forEach((el) => (el.style.opacity = String(0.55 + 0.45 * br)));
    g.querySelectorAll<SVGElement>('.orbit').forEach((el) => { el.style.transformBox = 'fill-box'; el.style.transformOrigin = '50px 50px'; el.style.transform = `rotate(${dp * (multi ? 300 : 720)}deg)`; });
    g.querySelectorAll<SVGElement>('.cnode').forEach((el, i) => (el.style.opacity = String(0.3 + 0.7 * clamp((dp - 0.15 - i * 0.05) / 0.15))));
  }, [p, localP, multi, motivoHTML, params]);

  useEffect(() => { if (params) document.body.dataset.slideReady = 'true'; }, [params]);
  if (!params) return null;

  const ruleW = clamp(((multi ? localP : p) - 0.02) / 0.12) * 56;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: 'Georgia, serif', color: TOK.light,
      background: 'radial-gradient(120% 80% at 50% 30%, #241c13 0%, #1c1610 52%, #100c09 100%)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'screen' }} viewBox="0 0 100 178" preserveAspectRatio="none">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100" height="178" filter="url(#g)" />
      </svg>
      <div ref={geoRef} style={{ position: 'absolute', top: `${params.geoTop}%`, left: '50%', transform: 'translateX(-50%)', width: `${params.geoW}%`, opacity: sceneOp, transition: 'opacity 80ms linear' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', fill: 'none', stroke: TOK.gold, strokeLinecap: 'round' }}>
          <defs>
            <radialGradient id="halo"><stop offset="58%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="80%" stopColor={TOK.goldSoft} stopOpacity=".5" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="corona"><stop offset="52%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="72%" stopColor={TOK.goldSoft} stopOpacity=".9" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor={TOK.light} /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
          </defs>
          <g key={motivo} dangerouslySetInnerHTML={{ __html: motivoHTML }} />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: '8%', right: '8%',
        ...(params.av === 'topo' ? { top: `${params.dist}%` } : params.av === 'centro' ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: `${params.dist}%` }),
        textAlign: params.ah === 'esq' ? 'left' : params.ah === 'dir' ? 'right' : 'center' }}>
        <div style={{ width: `${ruleW}%`, height: 1, margin: params.ah === 'esq' ? '0 auto 4.5% 0' : params.ah === 'dir' ? '0 0 4.5% auto' : '0 auto 4.5%', background: `linear-gradient(90deg,transparent,${TOK.gold},transparent)` }} />
        <div style={{ position: 'relative', minHeight: estatico ? undefined : '11vh' }}>
          {estatico ? (
            <div style={{ fontSize: `${params.txtSize}vw`, lineHeight: 1.4 }}>{params.segs.join(' ')}</div>
          ) : multi ? (
            <div style={{ opacity: sceneOp, fontSize: `${params.txtSize}vw`, lineHeight: 1.4, transform: `translateY(${9 * (1 - clamp(localP / 0.12))}px)` }}>{params.segs[scene]}</div>
          ) : params.segs.map((t, i) => {
            const slot = 1 / N, s = i * slot, ultimo = i === N - 1;
            const aparece = clamp((p - s) / (slot * 0.28));
            const some = ultimo ? 0 : clamp((p - (s + slot * 0.9)) / (slot * 0.12));
            return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: aparece * (1 - some), transform: `translateY(${9 * (1 - aparece)}px)`, fontSize: `${params.txtSize}vw`, lineHeight: 1.4 }}>{t}</div>;
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '6.5%', left: 0, right: 0, textAlign: 'center', fontSize: '3vw', letterSpacing: '.42em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: 0.6 }}>
        @vivianne.dos.santos
        <small style={{ display: 'block', fontFamily: 'system-ui, sans-serif', fontSize: '1.9vw', letterSpacing: '.34em', opacity: 0.6, marginTop: '1.4%' }}>viviannedossantos.com</small>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 34%, transparent 52%, rgba(16,12,9,.9) 100%)' }} />
    </div>
  );
}
