'use client';

import { useState, useRef, useCallback, type DragEvent } from 'react';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';
import { PALETAS } from '@/lib/estudio-conteudo';
import { useSlideImage } from '@/lib/estudio-imagens-db';

export type Layout = 'foto-fundo' | 'foto-topo' | 'foto-baixo' | 'foto-lado' | 'statement' | 'claro' | 'cta';

const LAYOUT_LABELS: Record<Layout, string> = {
  'foto-fundo': 'Foto Fundo',
  'foto-topo': 'Foto Topo',
  'foto-baixo': 'Foto Baixo',
  'foto-lado': 'Foto Lado',
  statement: 'Statement',
  claro: 'Claro',
  cta: 'CTA',
};

// ─── Helpers ────────────────────────────────────────────

function renderBoldText(text: string, boldWords: string[] | undefined, accentColor: string, baseColor: string) {
  const words = boldWords?.filter(w => w.length > 0);
  if (!words || words.length === 0) return <span style={{ color: baseColor }}>{text}</span>;

  const parts: { text: string; isBold: boolean }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestWord = '';
    for (const word of words) {
      const idx = remaining.indexOf(word);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        earliestWord = word;
      }
    }
    if (earliest === -1) {
      parts.push({ text: remaining, isBold: false });
      break;
    }
    if (earliest > 0) parts.push({ text: remaining.substring(0, earliest), isBold: false });
    parts.push({ text: earliestWord, isBold: true });
    remaining = remaining.substring(earliest + earliestWord.length);
  }

  return (
    <>
      {parts.map((part, i) =>
        part.isBold ? (
          <strong key={i} style={{ color: accentColor, fontWeight: 800 }}>{part.text}</strong>
        ) : (
          <span key={i} style={{ color: baseColor }}>{part.text}</span>
        )
      )}
    </>
  );
}

function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2] opacity-[0.06]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

function PaperTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1] opacity-[0.12]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeDiffuseLighting in='result' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  );
}

function MundoIcon({ mundo, size = 16, light }: { mundo: string; size?: number; light?: boolean }) {
  switch (mundo) {
    case 'freeme': {
      const c = light ? '#6B3A28' : '#9A5A43';
      return (
        <svg viewBox="0 0 512 512" style={{ width: size, height: size, flexShrink: 0 }}>
          <path d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425" fill="none" stroke={c} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    case 'infonte': {
      const c = light ? '#8C6A20' : '#EBAE4A';
      const c2 = light ? '#9A7525' : '#F4C56A';
      return (
        <svg viewBox="0 0 512 512" style={{ width: size, height: size, flexShrink: 0 }}>
          <path d="M256 116 C198 218 166 282 166 334 A90 90 0 0 0 346 334 C346 282 314 218 256 116 Z" fill="none" stroke={c} strokeWidth="28" strokeLinejoin="round" />
          <circle cx="256" cy="338" r="34" fill={c2} />
        </svg>
      );
    }
    case 'synchim': {
      const c = light ? '#8B2235' : '#E08496';
      return (
        <svg viewBox="0 0 512 512" style={{ width: size, height: size, flexShrink: 0 }}>
          <g transform="translate(256,256)">
            <rect x="-150" y="-150" width="300" height="300" fill="none" stroke={c} strokeWidth="28" />
            <rect x="-150" y="-150" width="300" height="300" transform="rotate(45)" fill="none" stroke={c} strokeWidth="28" />
            <circle r="46" fill="#8B2235" />
          </g>
        </svg>
      );
    }
    case 'escola': {
      const c = light ? '#7A5FB8' : '#C9B6FA';
      return (
        <svg viewBox="0 0 512 512" style={{ width: size, height: size, flexShrink: 0 }}>
          <g transform="translate(256,256)" fill="none" stroke={c} strokeWidth="28" strokeLinecap="round">
            <ellipse cx="0" cy="-108" rx="34" ry="86" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(51.4)" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(102.8)" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(154.3)" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(205.7)" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(257.1)" />
            <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(308.6)" />
          </g>
          <circle cx="256" cy="256" r="20" fill={c} />
        </svg>
      );
    }
    default: {
      const c = light ? '#8C6A20' : '#EBAE4A';
      const c2 = light ? '#9A7525' : '#F4C56A';
      return (
        <svg viewBox="0 0 512 512" style={{ width: size, height: size, flexShrink: 0 }}>
          <g fill="none" stroke={c} strokeWidth="28" strokeLinecap="round">
            <path d="M170 130 C170 270 200 340 248 374" />
            <path d="M342 130 C342 270 312 340 264 374" />
          </g>
          <circle cx="256" cy="244" r="22" fill={c2} />
          <path d="M170 400 C200 376 230 420 256 400 C282 380 312 420 342 400" fill="none" stroke={c2} strokeWidth="18" strokeLinecap="round" />
        </svg>
      );
    }
  }
}

function BrandTop({ mundo, light }: { mundo: string; light?: boolean }) {
  const c = light ? '#2A1C12' : '#F2E8DC';
  const name = mundo === 'autora' ? 'Vivianne dos Santos' : PALETAS[mundo as Mundo]?.nome ?? 'Vivianne';
  return (
    <div className="flex items-center gap-[5px]">
      <MundoIcon mundo={mundo} size={18} light={light} />
      <span className="text-[8px] font-serif italic" style={{ color: c, opacity: 0.6 }}>
        {name}
      </span>
    </div>
  );
}

function BrandBottom({ mundo, light }: { mundo: string; light?: boolean }) {
  const c = light ? '#2A1C12' : '#F2E8DC';
  return (
    <div className="flex items-center gap-[4px] mt-1">
      <MundoIcon mundo={mundo} size={10} light={light} />
      <span className="text-[6px] tracking-[0.1em]" style={{ color: c, opacity: 0.35 }}>
        viviannedossantos
      </span>
    </div>
  );
}

function SlideDots({ total, current, color }: { total: number; current: number; color: string }) {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[3px] z-[8]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-[4px] h-[4px] rounded-full"
          style={{ background: i === current ? color : color + '30' }}
        />
      ))}
    </div>
  );
}

function SwipeCTA({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-auto pt-2">
      <span className="text-[7px] tracking-[0.2em] uppercase" style={{ color, opacity: 0.35 }}>
        Desliza para o lado
      </span>
      <span className="text-[9px]" style={{ color, opacity: 0.35 }}>&rarr;</span>
    </div>
  );
}

// ─── Drop zone for images ───────────────────────────────

type SlideContext = {
  texto: string;
  tipo: string;
  mundo: string;
  notaVisual?: string;
  titulo?: string;
  aspectRatio?: string;
};

async function gerarImagemAutomatica(slideKey: string, ctx: SlideContext): Promise<string> {
  const res = await fetch('/api/admin/estudio/gerar-imagem', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      slideKey,
      texto: ctx.texto,
      mundo: ctx.mundo,
      tipo: ctx.tipo,
      notaVisual: ctx.notaVisual,
      titulo: ctx.titulo,
      aspectRatio: ctx.aspectRatio,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detalhe ?? json.erro ?? 'falha');
  return json.imageUrl as string;
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function DropZone({ slideKey, imageUrl, onImage, onClear, height, notaVisual, slideContext, children }: {
  slideKey: string;
  imageUrl: string | null;
  onImage: (dataUrl: string) => void;
  onClear: () => void;
  height: string;
  notaVisual?: string;
  slideContext?: SlideContext;
  children?: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  async function handleGerar() {
    if (!slideContext || gerando) return;
    setErro(null);
    setGerando(true);
    try {
      const url = await gerarImagemAutomatica(slideKey, slideContext);
      const dataUrl = await urlToDataUrl(url);
      onImage(dataUrl);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro');
    }
    setGerando(false);
  }

  return (
    <div
      className="w-full relative overflow-hidden group"
      style={{ height }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={() => setDragging(false)}
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {children}
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-1 right-1 z-[10] w-4 h-4 rounded-full bg-black/60 text-white text-[7px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            &times;
          </button>
        </>
      ) : (
        <>
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${dragging ? 'bg-ambar/15' : 'bg-terra-2/30'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-terra-2/20 to-terra/40" />
            <div className="relative z-10 text-center px-3">
              {gerando ? (
                <p className="text-[8px] tracking-[0.15em] uppercase text-ambar animate-pulse">a gerar imagem...</p>
              ) : (
                <>
                  <p className={`text-[8px] tracking-[0.15em] uppercase mb-1 cursor-pointer ${dragging ? 'text-ambar' : 'text-ocre/40'}`} onClick={() => inputRef.current?.click()}>
                    {dragging ? 'larga aqui' : 'arrasta foto'}
                  </p>
                  {slideContext && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGerar(); }}
                      className="text-[7px] px-2 py-0.5 rounded-full border border-ambar/40 text-ambar/80 hover:bg-ambar/15 transition-colors mb-1"
                    >
                      &#10024; gerar auto
                    </button>
                  )}
                  {notaVisual && !dragging && (
                    <p className="text-[5px] text-creme-2/25 italic leading-tight max-w-[140px] mt-1">{notaVisual}</p>
                  )}
                  {erro && (
                    <p className="text-[6px] text-rosa mt-1">{erro}</p>
                  )}
                </>
              )}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </>
      )}
    </div>
  );
}

// ─── LAYOUT: Foto Fundo (full background photo + scrim) ─

function LayoutFotoFundo({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  const p = PALETAS[mundo];
  const { imageUrl, setImage, clearImage } = useSlideImage(`${slideKey}-foto-fundo`);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: `linear-gradient(175deg, ${p.bg}dd, ${p.bg2})` }}>
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-[0]" />
          <div className="absolute inset-0 z-[1]" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.82) 100%)` }} />
          <button onClick={clearImage} className="absolute top-2 right-2 z-[10] w-5 h-5 rounded-full bg-black/50 text-white text-[8px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">&times;</button>
        </>
      ) : (
        <DropZone slideKey={`${slideKey}-foto-fundo`} imageUrl={null} onImage={setImage} onClear={clearImage} height="100%" notaVisual={slide.notaVisual} slideContext={{ texto: slide.texto, tipo: slide.tipo, mundo, notaVisual: slide.notaVisual, titulo: slide.titulo, aspectRatio: '4:5' }}>
          <div className="absolute inset-0 z-[1]" style={{ boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.3)' }} />
        </DropZone>
      )}
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col flex-1 px-5 pt-4 pb-3">
        <BrandTop mundo={mundo} />
        <div className="flex-1" />
        <p className="font-sans text-[22px] leading-[1.22] font-normal mb-3">
          {renderBoldText(slide.texto, slide.bold, p.destaque, '#ffffff')}
        </p>
        <BrandBottom mundo={mundo} />
        {slide.tipo === 'capa' && <SwipeCTA color="#ffffff" />}
      </div>
    </div>
  );
}

// ─── LAYOUT: Statement (text-only, no photo) ────────────

function LayoutStatement({ slide, mundo }: { slide: Slide; mundo: Mundo }) {
  const p = PALETAS[mundo];
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: `linear-gradient(175deg, ${p.bg}dd, ${p.bg2})` }}>
      <GrainOverlay />
      <div className="absolute inset-0 z-[1]" style={{ boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.3)' }} />
      <div className="relative z-[5] flex flex-col flex-1 px-5 pt-4 pb-3">
        <BrandTop mundo={mundo} />
        <div className="flex-1" />
        <p className="font-sans text-[22px] leading-[1.22] font-normal mb-3">
          {renderBoldText(slide.texto, slide.bold, p.destaque, p.texto)}
        </p>
        <BrandBottom mundo={mundo} />
        {slide.tipo === 'capa' && <SwipeCTA color={p.texto} />}
      </div>
    </div>
  );
}

// ─── LAYOUT: Foto Topo ──────────────────────────────────

function LayoutFotoTopo({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  const p = PALETAS[mundo];
  const { imageUrl, setImage, clearImage } = useSlideImage(`${slideKey}-foto-topo`);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: p.bg2 }}>
      <div className="absolute top-0 left-0 right-0 z-[6] px-4 pt-3">
        <BrandTop mundo={mundo} />
      </div>
      <DropZone
        slideKey={`${slideKey}-foto-topo`}
        imageUrl={imageUrl}
        onImage={setImage}
        onClear={clearImage}
        height="42%"
        notaVisual={slide.notaVisual}
        slideContext={{ texto: slide.texto, tipo: slide.tipo, mundo, notaVisual: slide.notaVisual, titulo: slide.titulo, aspectRatio: '4:5' }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-10 z-[3]" style={{ background: `linear-gradient(to bottom, transparent, ${p.bg2})` }} />
      </DropZone>
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col flex-1 px-5 pb-3 pt-1">
        <div className="flex-1 flex items-end">
          <p className="font-sans text-[20px] leading-[1.22] font-normal">
            {renderBoldText(slide.texto, slide.bold, p.destaque, p.texto)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <BrandBottom mundo={mundo} />
          {slide.tipo === 'capa' && <SwipeCTA color={p.texto} />}
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT: Foto Baixo (text top, photo bottom) ────────

function LayoutFotoBaixo({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  const p = PALETAS[mundo];
  const { imageUrl, setImage, clearImage } = useSlideImage(`${slideKey}-foto-baixo`);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: p.bg2 }}>
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col px-5 pt-4 pb-2" style={{ height: '55%' }}>
        <BrandTop mundo={mundo} />
        <div className="flex-1 flex items-end">
          <p className="font-sans text-[20px] leading-[1.22] font-normal mb-1">
            {renderBoldText(slide.texto, slide.bold, p.destaque, p.texto)}
          </p>
        </div>
        <BrandBottom mundo={mundo} />
      </div>
      <div className="relative" style={{ height: '45%' }}>
        <div className="absolute top-0 left-0 right-0 h-10 z-[3]" style={{ background: `linear-gradient(to top, transparent, ${p.bg2})` }} />
        <DropZone
          slideKey={`${slideKey}-foto-baixo`}
          imageUrl={imageUrl}
          onImage={setImage}
          onClear={clearImage}
          height="100%"
          notaVisual={slide.notaVisual}
          slideContext={{ texto: slide.texto, tipo: slide.tipo, mundo, notaVisual: slide.notaVisual, titulo: slide.titulo, aspectRatio: '4:5' }}
        />
      </div>
    </div>
  );
}

// ─── LAYOUT: Foto Lado ──────────────────────────────────

function LayoutFotoLado({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  const p = PALETAS[mundo];
  const { imageUrl, setImage, clearImage } = useSlideImage(`${slideKey}-foto-lado`);

  return (
    <div className="w-full h-full relative overflow-hidden flex" style={{ background: p.bg2 }}>
      <div className="w-[40%] h-full relative shrink-0">
        <DropZone
          slideKey={`${slideKey}-foto-lado`}
          imageUrl={imageUrl}
          onImage={setImage}
          onClear={clearImage}
          height="100%"
          notaVisual={slide.notaVisual}
          slideContext={{ texto: slide.texto, tipo: slide.tipo, mundo, notaVisual: slide.notaVisual, titulo: slide.titulo, aspectRatio: '4:5' }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-8 z-[3]" style={{ background: `linear-gradient(to right, transparent, ${p.bg2})` }} />
        </DropZone>
      </div>
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col flex-1 px-4 pt-4 pb-3">
        <BrandTop mundo={mundo} />
        <div className="flex-1 flex items-end">
          <p className="font-sans text-[17px] leading-[1.25] font-normal">
            {renderBoldText(slide.texto, slide.bold, p.destaque, p.texto)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <BrandBottom mundo={mundo} />
          {slide.tipo === 'capa' && <SwipeCTA color={p.texto} />}
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT: Claro ──────────────────────────────────────

function LayoutClaro({ slide, mundo }: { slide: Slide; mundo: Mundo }) {
  const p = PALETAS[mundo];
  const textColor = '#1a1410';
  const accent = p.bg;
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: '#f5f0e8' }}>
      <PaperTexture />
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col flex-1 px-5 pt-4 pb-3">
        <BrandTop mundo={mundo} light />
        <div className="flex-1 flex flex-col justify-end">
          {slide.titulo && (
            <p className="text-[7px] tracking-[0.3em] uppercase mb-3 font-medium" style={{ color: accent, opacity: 0.5 }}>
              {slide.titulo}
            </p>
          )}
          <p className="font-sans text-[21px] leading-[1.22] font-normal mb-3">
            {renderBoldText(slide.texto, slide.bold, accent, textColor)}
          </p>
          {slide.destaque && (
            <p className="text-[7px] italic font-serif mt-1" style={{ color: accent, opacity: 0.5 }}>
              {slide.destaque}
            </p>
          )}
        </div>
        <BrandBottom mundo={mundo} light />
      </div>
    </div>
  );
}

// ─── LAYOUT: CTA ────────────────────────────────────────

function LayoutCTA({ slide, mundo }: { slide: Slide; mundo: Mundo }) {
  const p = PALETAS[mundo];
  const textColor = '#1a1410';
  const accent = p.bg;
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: '#f5f0e8' }}>
      <PaperTexture />
      <GrainOverlay />
      <div className="relative z-[5] flex flex-col flex-1 px-5 pt-4 pb-3">
        <BrandTop mundo={mundo} light />
        <div className="flex-1 flex flex-col justify-end">
          <p className="font-sans text-[19px] leading-[1.25] font-normal mb-3">
            {renderBoldText(slide.texto, slide.bold, accent, textColor)}
          </p>
          {slide.destaque && (
            <p className="text-[8px] italic font-serif mb-2" style={{ color: accent, opacity: 0.6 }}>
              {slide.destaque}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
              style={{ background: accent + '12', color: accent, border: `1px solid ${accent}20` }}
            >
              &rarr;
            </div>
            <span className="text-[7px] tracking-[0.15em] uppercase" style={{ color: textColor, opacity: 0.3 }}>
              link na bio
            </span>
          </div>
        </div>
        <BrandBottom mundo={mundo} light />
      </div>
    </div>
  );
}

// ─── Main renderer ──────────────────────────────────────

function SlideRender({ slide, mundo, layout, slideKey }: { slide: Slide; mundo: Mundo; layout: Layout; slideKey: string }) {
  switch (layout) {
    case 'foto-fundo': return <LayoutFotoFundo slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'foto-topo': return <LayoutFotoTopo slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'foto-baixo': return <LayoutFotoBaixo slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'foto-lado': return <LayoutFotoLado slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'statement': return <LayoutStatement slide={slide} mundo={mundo} />;
    case 'claro': return <LayoutClaro slide={slide} mundo={mundo} />;
    case 'cta': return <LayoutCTA slide={slide} mundo={mundo} />;
  }
}

// ─── Grid with all 5 layouts ────────────────────────────

export function SlideLayoutGrid({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {(Object.keys(LAYOUT_LABELS) as Layout[]).map(layout => (
        <div key={layout} className="flex flex-col items-center gap-1">
          <div className="rounded-[8px] overflow-hidden border border-ocre/15 hover:border-ambar/40 transition-colors cursor-pointer" style={{ width: 140, aspectRatio: '4/5' }}>
            <SlideRender slide={slide} mundo={mundo} layout={layout} slideKey={slideKey} />
          </div>
          <span className="text-[0.5rem] text-creme-2/40 tracking-[0.1em] uppercase">{LAYOUT_LABELS[layout]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Single slide with layout selector + export ─────────

export function SlideWithLayout({ slide, mundo, defaultLayout, slideKey }: {
  slide: Slide; mundo: Mundo; defaultLayout?: Layout; slideKey: string;
}) {
  const [layout, setLayout] = useState<Layout>(defaultLayout ?? (slide.fundoClaro ? 'claro' : slide.tipo === 'cta' ? 'cta' : slide.tipo === 'capa' ? 'foto-fundo' : 'statement'));
  const slideRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);

  const exportarPNG = useCallback(async () => {
    if (!slideRef.current) return;
    setExportando(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(slideRef.current, {
        width: 1080,
        height: 1350,
        pixelRatio: 2,
        backgroundColor: '#111',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `slide-${slideKey}-${layout}.png`;
      a.click();
    } catch (e) {
      console.error('Export error:', e);
    }
    setExportando(false);
  }, [layout, slideKey]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={slideRef}
        className="rounded-[12px] overflow-hidden border-2 border-ocre/20"
        style={{ width: 280, aspectRatio: '4/5' }}
      >
        <SlideRender slide={slide} mundo={mundo} layout={layout} slideKey={slideKey} />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {(Object.keys(LAYOUT_LABELS) as Layout[]).map(l => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`text-[0.58rem] px-2 py-1 rounded-md border transition-colors ${
              layout === l
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/20 text-creme-2/50 hover:text-creme-2/70'
            }`}
          >
            {LAYOUT_LABELS[l]}
          </button>
        ))}
        <button
          onClick={exportarPNG}
          disabled={exportando}
          className="text-[0.58rem] px-2 py-1 rounded-md border border-lila/30 text-lila/80 hover:bg-lila/10 disabled:opacity-40 transition-colors ml-1"
        >
          {exportando ? '...' : 'PNG'}
        </button>
      </div>
    </div>
  );
}

export { SlideRender, LAYOUT_LABELS };
export type { Layout as SlideLayout };
