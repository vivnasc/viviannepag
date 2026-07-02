'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { geometriaVDS, rotuloTema, segmentar, TOK } from '@/lib/crescer/assinatura-reel';

// RENDER do reel da mãe, dirigido por progresso (window.__setKProg para o recorder).
// ?multi=1 = REEL MULTI-FRAME (cada segmento é uma CENA com a sua geometria, que se
// redesenha e troca). Sem multi = REEL de 1 frame (uma geometria, o texto entra por
// tempos). Params: ?tema=&linhas=a|b&label=&multi=1. Sem recorder, faz preview em loop.
const clamp = (x: number) => Math.max(0, Math.min(1, x));

export default function RenderReelMae() {
  const [p, setP] = useState(0);
  // layout ajustável pela Vivianne (autonomia): posição/tamanho do texto e da geometria.
  const [params, setParams] = useState<{ tema: string; segs: string[]; label?: string; multi: boolean; estatico: boolean; seed: string; av: string; ah: string; dist: number; txtSize: number; geoTop: number; geoW: number; img?: string; imgModo?: string; marca?: string; lingua?: string; formato?: string; citacao?: string; fonte?: string } | null>(null);
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
      seed: q.get('seed') || raw, av: q.get('av') || 'baixo', ah: q.get('ah') || 'centro', dist: num('dist', 12), txtSize: num('txtSize', 5.6), geoTop: num('geoTop', 15), geoW: num('geoW', 66),
      img: q.get('img') || undefined, imgModo: q.get('imgmodo') || undefined,
      marca: q.get('marca') || undefined, lingua: q.get('lingua') || undefined,
      formato: q.get('formato') || undefined, citacao: q.get('citacao') || undefined, fonte: q.get('fonte') || undefined });
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

  const estatico = !!params?.estatico;
  // a COMPOSIÇÃO VDS do tema (anéis+eixo+nós+foco, ondas, vesica…), varia por seed.
  const motivoHTML = useMemo(() => (params ? geometriaVDS(params.tema, params.seed) : ''), [params]);

  // desenha a geometria conforme o progresso (SEMPRE anima): pathLength desenha-se
  // escalonado; os brilhos e o halo pulsam. Cobre os componentes da biblioteca VDS.
  useEffect(() => {
    const g = geoRef.current; if (!g || !params) return;
    g.querySelectorAll<SVGGeometryElement>('[pathLength]').forEach((el, i) => {
      const frac = clamp((p - (0.03 + i * 0.05)) / 0.24);
      el.style.strokeDasharray = '1'; el.style.strokeDashoffset = String(1 - frac);
    });
    const br = 0.4 + 0.6 * (0.5 - 0.5 * Math.cos(p * Math.PI * 4));
    g.querySelectorAll<SVGElement>('.halo, .core, .focus').forEach((el) => (el.style.opacity = String(0.7 + 0.3 * br)));
    g.querySelectorAll<SVGElement>('[fill^="url"]').forEach((el) => (el.style.opacity = String(0.55 + 0.45 * br)));
  }, [p, motivoHTML, params]);

  useEffect(() => { if (params) document.body.dataset.slideReady = 'true'; }, [params]);
  if (!params) return null;

  // LAYOUT EDITORIAL VDS (docs/referencias/DESENHO-EDITORIAL-VDS.md): título=FACA à
  // esquerda + régua + corpo (a viragem, entra por tempos); geometria à direita.
  const titulo = params.segs[0] || '';
  const corpo = params.segs.slice(1);
  const M = Math.max(1, corpo.length);
  const label = String(params.label || rotuloTema(params.tema, params.lingua) || '').toUpperCase();
  const marca = params.marca || '@vivianne.dos.santos';
  const titOp = estatico ? 1 : clamp(p / 0.08);
  const ruleW = estatico ? 60 : clamp((p - 0.06) / 0.1) * 60;
  const HEADp = 0.14, TAILp = 0.92, slotW = (TAILp - HEADp) / M;
  // FONTE VISUAL: imagem (Flux/Replicate ou MJ) OU geometria VDS. 'fundo' = cena inteira
  // (imagem cobre o cartão, véu à esquerda); 'acento' = elemento em preto à direita (screen).
  const img = params.img;
  const fundo = !!img && params.imgModo !== 'acento';
  const acento = !!img && params.imgModo === 'acento';
  const sombra = fundo ? '0 2px 16px rgba(0,0,0,.92)' : undefined; // contraste do texto sobre imagem

  // FORMATOS DE EXCERTO (@viviannewrites): manuscrito (papel premium) · quote sobre
  // fotografia. Contraste forte de origem: véu local atrás do texto + sombra.
  const grainSvg = (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08, mixBlendMode: 'screen', zIndex: 4 }} viewBox="0 0 100 178" preserveAspectRatio="none">
      <filter id="gq"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100" height="178" filter="url(#gq)" />
    </svg>
  );
  if (params.formato === 'manuscrito' || params.formato === 'quotefoto') {
    const cit = (params.citacao || params.segs.join(' ')).trim();
    const src = String(params.fonte || '').toUpperCase();
    if (params.formato === 'manuscrito') {
      return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif',
          background: 'radial-gradient(120% 80% at 50% 30%, #2a2013 0%, #17110b 55%, #0c0a08 100%)' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '70%', background: 'radial-gradient(60% 70% at 50% 0%, rgba(216,168,90,.28), transparent 70%)', zIndex: 1 }} />
          {grainSvg}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-2.2deg)', width: '76%', padding: '12% 9%', zIndex: 2,
            background: 'linear-gradient(180deg,#f3ead8,#e9dcc2)', borderRadius: 6, color: '#2a2118', boxShadow: '0 30px 80px rgba(0,0,0,.6), inset 0 0 60px rgba(180,150,100,.15)' }}>
            <div style={{ fontSize: '5vw', lineHeight: 1.5, fontStyle: 'italic' }}>{cit}</div>
            <div style={{ width: '32%', height: 2, background: TOK.gold, margin: '8% 0 5%' }} />
            {src && <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '2.4vw', letterSpacing: '.18em', color: '#8a6f45' }}>From {params.fonte}</div>}
          </div>
          <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0, textAlign: 'center', fontFamily: 'system-ui, sans-serif', fontSize: '2.1vw', letterSpacing: '.34em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: 0.72, zIndex: 3 }}>{marca}</div>
        </div>
      );
    }
    // quote sobre fotografia — véu local escuro atrás do texto + sombra para contraste.
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif', color: TOK.light, background: '#0c0a08' }}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(90% 42% at 50% 52%, rgba(8,6,4,.86), rgba(8,6,4,.34) 60%, transparent 78%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(8,6,4,.5), transparent 22%, transparent 78%, rgba(8,6,4,.6))' }} />
        {grainSvg}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 12%' }}>
          <div style={{ fontSize: '5.4vw', lineHeight: 1.42, textAlign: 'center', fontStyle: 'italic', textShadow: '0 2px 22px rgba(0,0,0,.85)' }}>{cit}</div>
          <div style={{ width: '22%', height: 1, background: TOK.gold, margin: '7% 0 4%' }} />
          {src && <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '2.2vw', letterSpacing: '.3em', color: TOK.light, opacity: 0.92, textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>From {params.fonte}</div>}
        </div>
        <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0, textAlign: 'center', fontFamily: 'system-ui, sans-serif', fontSize: '2.1vw', letterSpacing: '.34em', textTransform: 'uppercase', color: TOK.light, opacity: 0.8, textShadow: '0 1px 12px rgba(0,0,0,.9)', zIndex: 3 }}>{marca}</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif', color: TOK.light,
      background: 'radial-gradient(130% 90% at 64% 34%, #241c13 0%, #1a140e 55%, #0e0a07 100%)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09, mixBlendMode: 'screen' }} viewBox="0 0 100 178" preserveAspectRatio="none">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100" height="178" filter="url(#g)" />
      </svg>
      {/* CENA INTEIRA: imagem de fundo (Flux/Replicate ou MJ) + véu à esquerda para o texto */}
      {fundo && (<>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg, rgba(9,6,4,.97) 30%, rgba(9,6,4,.66) 55%, rgba(9,6,4,.18) 82%, transparent 100%)' }} />
      </>)}
      {/* cabeçalho: marca */}
      <div style={{ position: 'absolute', top: '6.2%', left: '9%', right: '9%', display: 'flex', justifyContent: 'space-between',
        fontFamily: 'system-ui, sans-serif', fontSize: '2.2vw', letterSpacing: '.34em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: fundo ? 0.85 : 0.7, textShadow: sombra, zIndex: 3 }}>
        <span>{marca}</span><span />
      </div>
      {/* geometria à DIREITA — linha FINA e nítida, como a referência */}
      <style>{`.mgeo{--vds-gold:${TOK.gold};--vds-gold-soft:${TOK.goldSoft};--vds-bg:${TOK.bg}}.mgeo circle,.mgeo path,.mgeo ellipse,.mgeo line{stroke-width:.7}`}</style>
      {!img && (<div ref={geoRef} style={{ position: 'absolute', right: '3.5%', top: '50%', transform: 'translateY(-50%)', width: '41%' }}>
        <svg className="mgeo" viewBox="0 0 100 100" style={{ width: '100%', fill: 'none', stroke: TOK.gold, strokeLinecap: 'round' }}>
          <defs>
            <radialGradient id="halo"><stop offset="58%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="80%" stopColor={TOK.goldSoft} stopOpacity=".5" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="corona"><stop offset="52%" stopColor={TOK.goldSoft} stopOpacity="0" /><stop offset="72%" stopColor={TOK.goldSoft} stopOpacity=".9" /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor={TOK.light} /><stop offset="100%" stopColor={TOK.goldSoft} stopOpacity="0" /></radialGradient>
          </defs>
          <g key={params.tema + params.seed} dangerouslySetInnerHTML={{ __html: motivoHTML }} />
        </svg>
      </div>)}
      {/* ACENTO botânico à direita (imagem em preto puro, mistura screen tira o preto) */}
      {acento && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" style={{ position: 'absolute', right: '-4%', top: '50%', transform: 'translateY(-50%)', width: '52%', mixBlendMode: 'screen', zIndex: 1 }} />
      )}
      {/* coluna de TEXTO à esquerda */}
      <div style={{ position: 'absolute', left: '9%', width: '47%', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
        <div style={{ fontSize: '6.3vw', lineHeight: 1.14, textTransform: 'uppercase', letterSpacing: '.012em', textShadow: sombra,
          opacity: titOp, transform: `translateY(${(1 - titOp) * 10}px)` }}>{titulo}</div>
        <div style={{ width: `${ruleW}%`, height: 1, margin: '6.5% 0 6%', background: TOK.gold, opacity: 0.9 }} />
        <div style={{ position: 'relative', minHeight: estatico ? undefined : '22vh', fontSize: '3.4vw', lineHeight: 1.56, fontStyle: 'italic', color: fundo ? '#ece1cb' : '#cbb691', textShadow: sombra }}>
          {estatico ? (
            <div>{corpo.join(' ')}</div>
          ) : corpo.map((t, i) => {
            const s = HEADp + i * slotW, ultimo = i === M - 1;
            const aparece = clamp((p - s) / (slotW * 0.32));
            const some = ultimo ? 0 : clamp((p - (s + slotW * 0.88)) / (slotW * 0.12));
            return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: aparece * (1 - some), transform: `translateY(${8 * (1 - aparece)}px)` }}>{t}</div>;
          })}
        </div>
      </div>
      {/* rodapé: etiqueta */}
      <div style={{ position: 'absolute', bottom: '6.2%', left: '9%', fontFamily: 'system-ui, sans-serif', fontSize: '2.1vw', letterSpacing: '.34em', textTransform: 'uppercase', color: TOK.goldSoft, opacity: fundo ? 0.82 : 0.62, textShadow: sombra, zIndex: 3 }}>{label}</div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(135% 95% at 58% 42%, transparent 48%, rgba(12,9,6,.92) 100%)' }} />
    </div>
  );
}
