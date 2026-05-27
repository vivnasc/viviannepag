'use client';

import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';
import { PALETAS } from '@/lib/estudio-conteudo';

export type Layout = 'statement' | 'foto-topo' | 'foto-lado' | 'claro' | 'cta';

const LAYOUT_LABELS: Record<Layout, string> = {
  statement: 'Statement',
  'foto-topo': 'Foto Topo',
  'foto-lado': 'Foto Lado',
  claro: 'Claro',
  cta: 'CTA',
};

// ─── IndexedDB image store ──────────────────────────────

const DB_NAME = 'estudio-imagens';
const DB_STORE = 'slides';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveImage(key: string, dataUrl: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(dataUrl, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadImage(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteImage(key: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Hook: use stored image ─────────────────────────────

function useSlideImage(slideKey: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImage(slideKey).then(setImageUrl).catch(() => {});
  }, [slideKey]);

  const setImage = useCallback(async (dataUrl: string) => {
    await saveImage(slideKey, dataUrl);
    setImageUrl(dataUrl);
  }, [slideKey]);

  const clearImage = useCallback(async () => {
    await deleteImage(slideKey);
    setImageUrl(null);
  }, [slideKey]);

  return { imageUrl, setImage, clearImage };
}

// ─── Helpers ────────────────────────────────────────────

function renderBoldText(text: string, boldWords: string[] | undefined, accentColor: string, baseColor: string) {
  if (!boldWords || boldWords.length === 0) return <span style={{ color: baseColor }}>{text}</span>;

  const parts: { text: string; isBold: boolean }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestWord = '';
    for (const word of boldWords) {
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

function GotaIcon({ size = 20, color = '#EBAE4A' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <g fill="none" stroke={color} strokeWidth="52" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 90 C100 280 172 405 256 450" />
        <path d="M412 90 C412 280 340 405 256 450" />
      </g>
      <circle cx="256" cy="270" r="38" fill={color} />
    </svg>
  );
}

function BrandTop({ mundo, light, accent }: { mundo: string; light?: boolean; accent?: string }) {
  const c = light ? '#2A1C12' : '#F2E8DC';
  const iconColor = accent ?? (light ? '#8C4A36' : '#EBAE4A');
  const name = mundo === 'autora' ? 'Vivianne dos Santos' : PALETAS[mundo as Mundo]?.nome ?? 'Vivianne';
  return (
    <div className="flex items-center gap-[5px]">
      <GotaIcon size={16} color={iconColor} />
      <span className="text-[8px] font-serif italic" style={{ color: c, opacity: 0.6 }}>
        {name}
      </span>
    </div>
  );
}

function BrandBottom({ light, accent }: { light?: boolean; accent?: string }) {
  const c = light ? '#2A1C12' : '#F2E8DC';
  const iconColor = accent ?? (light ? '#8C4A36' : '#EBAE4A');
  return (
    <div className="flex items-center gap-[4px] mt-1">
      <GotaIcon size={10} color={iconColor} />
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

function DropZone({ slideKey, imageUrl, onImage, onClear, height, notaVisual, children }: {
  slideKey: string;
  imageUrl: string | null;
  onImage: (dataUrl: string) => void;
  onClear: () => void;
  height: string;
  notaVisual?: string;
  children?: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
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
            <div className="relative z-10 text-center px-3 cursor-pointer" onClick={() => inputRef.current?.click()}>
              <p className={`text-[8px] tracking-[0.15em] uppercase mb-0.5 ${dragging ? 'text-ambar' : 'text-ocre/40'}`}>
                {dragging ? 'larga aqui' : 'arrasta foto'}
              </p>
              {notaVisual && !dragging && (
                <p className="text-[5px] text-creme-2/25 italic leading-tight max-w-[140px]">{notaVisual}</p>
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

// ─── LAYOUT: Statement ──────────────────────────────────

function LayoutStatement({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  const p = PALETAS[mundo];
  const { imageUrl, setImage, clearImage } = useSlideImage(`${slideKey}-statement`);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: `linear-gradient(175deg, ${p.bg}dd, ${p.bg2})` }}>
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-[0]" />
          <div className="absolute inset-0 z-[1]" style={{ background: `linear-gradient(180deg, transparent 10%, ${p.bg2}aa 45%, ${p.bg2}ee 65%, ${p.bg2} 100%)` }} />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 z-[10] w-5 h-5 rounded-full bg-black/50 text-white text-[8px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            &times;
          </button>
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-[1]" style={{ boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.3)' }} />
          <div className="absolute top-0 left-0 right-0 h-[45%] z-[3]">
            <DropZone
              slideKey={`${slideKey}-statement`}
              imageUrl={null}
              onImage={setImage}
              onClear={clearImage}
              height="100%"
              notaVisual={slide.notaVisual}
            />
          </div>
        </>
      )}
      <GrainOverlay />

      <div className="relative z-[5] flex flex-col flex-1 px-5 pt-4 pb-3">
        <BrandTop mundo={mundo} />
        <div className="flex-1" />
        <p className="font-sans text-[22px] leading-[1.22] font-normal mb-3">
          {renderBoldText(slide.texto, slide.bold, p.destaque, p.texto)}
        </p>
        <BrandBottom />
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
          <BrandBottom />
          {slide.tipo === 'capa' && <SwipeCTA color={p.texto} />}
        </div>
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
          <BrandBottom />
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
        <BrandTop mundo={mundo} light accent={accent} />
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
        <BrandBottom light accent={accent} />
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
        <BrandTop mundo={mundo} light accent={accent} />
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
        <BrandBottom light accent={accent} />
      </div>
    </div>
  );
}

// ─── Main renderer ──────────────────────────────────────

function SlideRender({ slide, mundo, layout, slideKey }: { slide: Slide; mundo: Mundo; layout: Layout; slideKey: string }) {
  switch (layout) {
    case 'statement': return <LayoutStatement slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'foto-topo': return <LayoutFotoTopo slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'foto-lado': return <LayoutFotoLado slide={slide} mundo={mundo} slideKey={slideKey} />;
    case 'claro': return <LayoutClaro slide={slide} mundo={mundo} />;
    case 'cta': return <LayoutCTA slide={slide} mundo={mundo} />;
  }
}

// ─── Grid with all 5 layouts ────────────────────────────

export function SlideLayoutGrid({ slide, mundo, slideKey }: { slide: Slide; mundo: Mundo; slideKey: string }) {
  return (
    <div className="grid grid-cols-5 gap-2">
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
  const [layout, setLayout] = useState<Layout>(defaultLayout ?? (slide.fundoClaro ? 'claro' : slide.tipo === 'cta' ? 'cta' : 'statement'));
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
