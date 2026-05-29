'use client';

import { useEffect, useState } from 'react';
import { SlideRender, type SlideLayout } from '@/components/admin/SlideRenderer';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';
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
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const dia = Number(params.get('dia'));
      const idx = Number(params.get('idx'));
      const layoutOverride = params.get('layout') as SlideLayout | null;
      const imageUrlParam = params.get('imageUrl') ?? undefined;

      if (!dia || isNaN(idx)) {
        setErro('missing params: dia, idx');
        return;
      }

      const conteudo = CALENDARIO_30_DIAS.find(c => c.dia === dia);
      if (!conteudo || !conteudo.slides || idx < 0 || idx >= conteudo.slides.length) {
        setErro(`slide nao encontrado: dia=${dia} idx=${idx}`);
        return;
      }

      const slide = conteudo.slides[idx];
      const layout = layoutOverride ?? defaultLayoutFor(slide);
      const slideKey = `dia-${dia}-slide-${idx}-${layout}`;

      // CRITICO: Carregar imagem PARA IndexedDB ANTES de setData
      // Senao a layout faz mount sem imagem e nunca actualiza
      if (imageUrlParam) {
        try {
          const res = await fetch(imageUrlParam, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            const { saveImage } = await import('@/lib/estudio-imagens-db');
            // useSlideImage usa slideKey-{layout} no layout. slideKey ja inclui layout, entao precisa do duplo
            await saveImage(`${slideKey}-${layout}`, dataUrl);
          } else {
            console.warn(`imageUrl ${res.status}`);
          }
        } catch (e) {
          console.error('img preload erro:', e);
        }
      }

      setData({ slide, mundo: conteudo.mundo, layout, slideKey });

      // Sinal para Puppeteer: aguardar pequeno tempo para garantir paint
      setTimeout(() => {
        document.body.setAttribute('data-slide-ready', 'true');
      }, 500);
    })();
  }, []);

  if (erro) {
    return (
      <div style={{ width: 1080, height: 1350, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>{erro}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ width: 1080, height: 1350, background: '#111', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>a carregar...</p>
      </div>
    );
  }

  // Render at preview size (270x337.5) and scale 4x to match preview proportions
  // ensures preview == render pixel-perfect
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
      <div
        style={{
          width: 270,
          height: 337.5,
          transform: 'scale(4)',
          transformOrigin: 'top left',
        }}
      >
        <SlideRender
          slide={data.slide}
          mundo={data.mundo}
          layout={data.layout}
          slideKey={data.slideKey}
        />
      </div>
    </div>
  );
}
