'use client';

import { useEffect, useState } from 'react';
import { SlideRender, type SlideLayout } from '@/components/admin/SlideRenderer';
import type { Slide, Mundo, ConteudoDia } from '@/lib/estudio-conteudo';
import { CALENDARIO_30_DIAS } from '@/lib/estudio-conteudo';

function defaultLayoutFor(slide: Slide): SlideLayout {
  if (slide.fundoClaro) return 'claro';
  if (slide.tipo === 'cta') return 'cta';
  if (slide.tipo === 'capa') return 'foto-fundo';
  return 'statement';
}

export default function RenderSlidePage() {
  const [data, setData] = useState<{
    slide: Slide;
    mundo: Mundo;
    layout: SlideLayout;
    slideKey: string;
    imageUrl?: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dia = Number(params.get('dia'));
    const idx = Number(params.get('idx'));
    const layoutOverride = params.get('layout') as SlideLayout | null;
    const imageUrl = params.get('imageUrl') ?? undefined;

    if (!dia || isNaN(idx)) {
      setData(null);
      return;
    }

    const conteudo = CALENDARIO_30_DIAS.find(c => c.dia === dia);
    if (!conteudo || !conteudo.slides || idx < 0 || idx >= conteudo.slides.length) {
      setData(null);
      return;
    }

    const slide = conteudo.slides[idx];
    const layout = layoutOverride ?? defaultLayoutFor(slide);
    const slideKey = `dia-${dia}-slide-${idx}-${layout}`;

    setData({
      slide,
      mundo: conteudo.mundo,
      layout,
      slideKey,
      imageUrl,
    });
  }, []);

  // Inject imagem dropping in IndexedDB if provided (for foto-* layouts)
  useEffect(() => {
    if (!data?.imageUrl) return;
    (async () => {
      try {
        const res = await fetch(data.imageUrl!);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const { saveImage } = await import('@/lib/estudio-imagens-db');
        // SlideRenderer usa slideKey-{layout} dentro de useSlideImage
        await saveImage(`${data.slideKey}-${data.layout}`, dataUrl);
        // Forca re-render
        setData(d => d ? { ...d } : null);
      } catch (e) {
        console.error('img inject', e);
      }
    })();
  }, [data?.imageUrl, data?.slideKey, data?.layout]);

  if (!data) {
    return (
      <div style={{ width: 1080, height: 1350, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>missing params: dia, idx</p>
      </div>
    );
  }

  return (
    <div
      id="slide-root"
      style={{
        width: 1080,
        height: 1350,
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#111',
        overflow: 'hidden',
      }}
    >
      <SlideRender
        slide={data.slide}
        mundo={data.mundo}
        layout={data.layout}
        slideKey={data.slideKey}
      />
    </div>
  );
}
