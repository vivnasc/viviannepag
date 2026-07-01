'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { receitaDe, motivoSVG, segmentar, TOK } from '@/lib/crescer/assinatura-reel';

// PAGINA DE RENDER do reel da mae (assinatura VDS), DIRIGIDA POR PROGRESSO. O recorder
// (scripts/render-reel-mae.js) chama window.__setKProg(p) por frame para gravar o
// movimento de forma deterministica (como /render-veu). Params: ?tema=&linhas=a|b&label=
// Sem recorder, corre um preview em loop. Marca body[data-slide-ready="true"] quando pronto.
export default function RenderReelMae() {
  const [p, setP] = useState(0);
  const [params, setParams] = useState<{ tema: string; linhas: string[]; label?: string } | null>(null);
  const geoRef = useRef<HTMLDivElement>(null);
  const externo = useRef(false); // true quando o recorder assume o controlo

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tema = q.get('tema') || 'consciencia';
    const raw = q.get('linhas') || q.get('capa') || q.get('frase') || 'aquilo a que chamas sou assim foi so uma forma de te protegeres|quando a pousas nao ficas menor, ficas leve';
    const linhas = raw.split('|').map((s) => s.trim()).filter(Boolean).slice(0, 4);
    const label = q.get('label') || undefined;
    setParams({ tema, linhas, label });
  }, []);

  // hook do recorder: define o progresso [0,1] deste frame e para o preview.
  useEffect(() => {
    (window as unknown as { __setKProg?: (v: number) => void }).__setKProg = (v: number) => {
      externo.current = true;
      setP(Math.max(0, Math.min(1, v)));
    };
    // preview automatico (so ate o recorder assumir)
    let raf = 0, t0 = 0;
    const LOOP = 9000;
    const tick = (t: number) => {
      if (externo.current) return;
      if (!t0) t0 = t;
      setP((((t - t0) % LOOP) / LOOP));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rec = useMemo(() => (params ? receitaDe(params.tema) : null), [params]);
  const motivoHTML = useMemo(() => (rec ? motivoSVG(rec.motivo) : ''), [rec]);

  // aplica o progresso a TODOS os elementos (em vez de animacoes CSS por tempo).
  useEffect(() => {
    const g = geoRef.current;
    if (!g || !params) return;
    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    // tracos que se desenham: escalonados no primeiro quarto, depois ficam
    const draws = g.querySelectorAll<SVGGeometryElement>('.ring, .drawpath, .cnet line');
    draws.forEach((el, i) => {
      const start = 0.02 + i * 0.04, frac = clamp((p - start) / 0.2);
      el.style.strokeDasharray = '1';
      el.style.strokeDashoffset = String(1 - frac);
    });
    // halo respira, core pulsa
    const breatheOp = 0.4 + 0.6 * (0.5 - 0.5 * Math.cos(p * Math.PI * 4));
    g.querySelectorAll<SVGElement>('.halo').forEach((el) => (el.style.opacity = String(breatheOp)));
    g.querySelectorAll<SVGElement>('.core, .focus').forEach((el) => (el.style.opacity = String(0.7 + 0.3 * (0.5 - 0.5 * Math.cos(p * Math.PI * 4)))));
    // orbita
    g.querySelectorAll<SVGElement>('.orbit').forEach((el) => { el.style.transformBox = 'fill-box'; el.style.transformOrigin = '50px 50px'; el.style.transform = `rotate(${p * 720}deg)`; });
    // nos da constelacao
    g.querySelectorAll<SVGElement>('.cnode').forEach((el, i) => (el.style.opacity = String(0.3 + 0.7 * clamp((p - 0.15 - i * 0.05) / 0.15))));
  }, [p, params, motivoHTML]);

  // ready para o recorder
  useEffect(() => { if (params) document.body.dataset.slideReady = 'true'; }, [params]);

  if (!params || !rec) return null;
  // SEGMENTOS (entram por tempos, sincronia): parte a frase em pedacos legiveis.
  const segsRaw = params.linhas.flatMap(segmentar).slice(0, 12);
  const linhasV = segsRaw.length ? segsRaw : params.linhas;
  const N = Math.max(1, linhasV.length);
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  // revelacao das linhas em sequencia ao longo do progresso
  const ruleW = clamp((p - 0.02) / 0.12) * 56;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: 'Georgia, serif', color: TOK.light,
      background: 'radial-gradient(120% 80% at 50% 30%, #241c13 0%, #1c1610 52%, #100c09 100%)' }}>
      {/* grao */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'screen' }} viewBox="0 0 100 178" preserveAspectRatio="none">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100" height="178" filter="url(#g)" />
      </svg>
      {/* geometria (do motor), dirigida por progresso */}
      <div ref={geoRef} style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '66%' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', fill: 'none', stroke: TOK.gold, strokeLinecap: 'round' }}>
          <defs>
            <radialGradient id="halo"><stop offset="58%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="80%" stopColor={TOK.goldSoft} stopOpacity=".5" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="corona"><stop offset="52%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="72%" stopColor={TOK.goldSoft} stopOpacity=".9" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor={TOK.light} /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
          </defs>
          <g dangerouslySetInnerHTML={{ __html: motivoHTML }} />
        </svg>
      </div>
      {/* topo */}
      <div style={{ position: 'absolute', top: '6.5%', left: '8%', right: '8%', display: 'flex', justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif', fontSize: '2.6vw', letterSpacing: '.32em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: 0.72 }}>
        <span>a mãe</span><span>{params.label || rec.label}</span>
      </div>
      {/* texto */}
      <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: '19%', textAlign: 'center' }}>
        <div style={{ width: `${ruleW}%`, height: 1, margin: '0 auto 4.5%', background: `linear-gradient(90deg,transparent,${TOK.gold},transparent)` }} />
        <div style={{ position: 'relative', minHeight: '22vh' }}>
          {linhasV.map((t, i) => {
            const slot = 1 / N, s = i * slot;
            const ultimo = i === N - 1; // o ultimo fica ate ao fim (sem geometria sozinha)
            const aparece = clamp((p - s) / (slot * 0.28));
            const some = ultimo ? 0 : clamp((p - (s + slot * 0.9)) / (slot * 0.12));
            const op = aparece * (1 - some);
            const y = 9 * (1 - aparece);
            return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: op, transform: `translateY(${y}px)`, fontSize: '5.6vw', lineHeight: 1.4 }}>{t}</div>;
          })}
        </div>
      </div>
      {/* marca */}
      <div style={{ position: 'absolute', bottom: '6.5%', left: 0, right: 0, textAlign: 'center', fontSize: '3vw', letterSpacing: '.42em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: 0.6 }}>
        vivianne dos santos
        <small style={{ display: 'block', fontFamily: 'system-ui, sans-serif', fontSize: '1.9vw', letterSpacing: '.34em', opacity: 0.6, marginTop: '1.4%' }}>a vantagem de crescer</small>
      </div>
      {/* vinheta */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 34%, transparent 52%, rgba(16,12,9,.9) 100%)' }} />
    </div>
  );
}
