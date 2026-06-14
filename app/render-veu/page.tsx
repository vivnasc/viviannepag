'use client';

// Pagina de render (1080x1920) para o Puppeteer fotografar cada slide de um
// carrossel dos 7 Veus. Le a coleccao por slug (rota publica), renderiza o
// slide pedido a tamanho nativo e marca body[data-slide-ready="true"].
// URL: /render-veu?slug=<slug>&dia=<n>&idx=<i>

import { useEffect, useState } from 'react';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { VeuSlide } from '@/components/admin/VeuSlide';
import { InfograficoSlide } from '@/components/admin/InfograficoSlide';
import { AnelCover } from '@/components/admin/AnelCover';
import { ReelSlide } from '@/components/admin/ReelSlide';
import { BandaSlide } from '@/components/admin/BandaSlide';
import { KineticSlide } from '@/components/admin/KineticSlide';
import { MetodoSlide } from '@/components/admin/MetodoSlide';
import { getConta } from '@/lib/metodo/contas';
import { SerieDiariaSlide, type SerieId } from '@/components/admin/SerieDiariaSlide';
import { type PaletaId } from '@/lib/series/serie-design';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'block' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'block' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'block' });

type Dia = { dia: number; mundo: Mundo; palavra?: string; subtitulo?: string; slides?: (Slide & { imageUrl?: string })[] };
type Coleccao = { dias: Dia[]; theme?: { subtipo?: string } };

// séries de reels com capa-assinatura (selo + carvão na capa)
const SERIE_ASSINATURA: Record<string, string> = { ninguem: 'O que ninguém te explica', sinais: 'Sinais de que…', pensador: 'Uma ideia de…' };

export default function RenderVeuPage() {
  const [estado, setEstado] = useState<{ slide: Slide & { imageUrl?: string }; dia: Dia; idx: number } | null>(null);
  const [subtipo, setSubtipo] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);
  const [prog, setProg] = useState(1); // progresso do cinético/infográfico (0..1), conduzido pelo render
  const [video, setVideo] = useState(false); // ?video=1 => modo MP4 (infográfico animado 9:16)

  // o render conduz a animacao do cinetico frame a frame via window.__setKProg
  useEffect(() => { (window as unknown as { __setKProg?: (p: number) => void }).__setKProg = (p: number) => setProg(p); }, []);

  useEffect(() => {
    (async () => {
      const p = new URLSearchParams(window.location.search);
      const slug = p.get('slug');
      const diaN = Number(p.get('dia'));
      const idx = Number(p.get('idx'));
      if (p.get('video') === '1') setVideo(true);
      if (!slug || !diaN || isNaN(idx)) { setErro('faltam params: slug, dia, idx'); return; }
      try {
        const r = await fetch(`/api/carrossel-veus/data?slug=${encodeURIComponent(slug)}`);
        if (!r.ok) { setErro(`coleccao ${r.status}`); return; }
        const col = (await r.json()) as Coleccao;
        setSubtipo(col.theme?.subtipo ?? '');
        const dia = col.dias.find((d) => d.dia === diaN);
        const slide = dia?.slides?.[idx];
        if (!dia || !slide) { setErro('slide nao encontrado'); return; }
        // pre-carrega a imagem de fundo (se houver) antes de marcar ready
        if (slide.imageUrl) {
          await new Promise<void>((resolve) => {
            const im = new Image();
            im.onload = () => resolve();
            im.onerror = () => resolve();
            im.src = slide.imageUrl!;
          });
        }
        setEstado({ slide, dia, idx });
      } catch (e) { setErro(String(e)); }
    })();
  }, []);

  // séries diárias: body transparente para a moldura sair com alpha (omitBackground)
  useEffect(() => {
    const t = (estado?.slide as { tipo?: string } | undefined)?.tipo;
    if (typeof document !== 'undefined') document.body.style.background = t === 'serie-diaria' ? 'transparent' : '#000';
  }, [estado]);

  useEffect(() => {
    if (!estado) return;
    const marcar = () => { document.body.setAttribute('data-slide-ready', 'true'); };
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => setTimeout(marcar, 150)).catch(marcar);
    } else {
      setTimeout(marcar, 400);
    }
  }, [estado]);

  const tipoSlide = (estado?.slide as { tipo?: string } | undefined)?.tipo;
  const ehInfo = tipoSlide === 'infografico';
  const ehAnel = tipoSlide === 'anel' || tipoSlide === 'perfil';
  const ehReel = tipoSlide === 'reel';
  const ehBanda = tipoSlide === 'banda';
  const ehKinetic = tipoSlide === 'kinetico';
  const ehMetodo = tipoSlide === 'metodo'; // identidade própria das contas do Método VS
  const ehSerie = tipoSlide === 'serie-diaria'; // moldura das séries diárias, sobreposta ao motion no render
  const ehCarrosselReel = false; // sinais/ninguem/pensador passaram a reels 9:16 (MP4); já não há carrossel de imagens
  const H = ehAnel ? 1080 : ehInfo ? (video ? 1920 : 1350) : ehCarrosselReel ? 1350 : 1920;
  const sd = estado?.slide as unknown as { serie?: SerieId; frase?: string; dia?: string; paleta?: PaletaId } | undefined;
  const s = estado?.slide as unknown as (Slide & { imageUrl?: string; padrao?: string; rotulo?: string; subtitulo?: string; tipoDiagrama?: 'ciclo' | 'espectro' | 'herdado' | 'camadas' | 'travessia'; diagrama?: import('@/components/admin/InfograficoSlide').Diagrama; ciclo?: string[]; custoTi?: string; custoOutros?: string; virada?: string; url?: string; label?: string; perfil?: boolean; kicker?: string; nota?: string; capa?: boolean; cenario?: string; licao?: string; gancho?: string; serie?: string; titulo?: string; pontos?: string[]; motivo?: string; selo?: string; pal?: string; variante?: string; personagens?: import('@/components/admin/BandaSlide').Fala[]; destaque?: string[]; conceito?: string; contaId?: string }) | undefined;
  return (
    <div className={`${cormorant.variable} ${inter.variable} ${jetmono.variable}`} style={{ margin: 0, padding: 0, width: 1080, height: H, overflow: 'hidden', background: ehSerie ? 'transparent' : '#000' }}>
      {erro && <div style={{ color: '#fff', padding: 40 }}>{erro}</div>}
      {estado && ehAnel && s && (
        <AnelCover label={s.label ?? ''} imageUrl={s.imageUrl} mundo={estado.dia.mundo} perfil={!!s.perfil} />
      )}
      {estado && ehInfo && s && (
        // MP4 = 9:16 cheio (preenche o ecrã como os outros reels), revelado camada a
        // camada via prog; PNG do feed = 4:5.
        <InfograficoSlide
          info={{ padrao: s.padrao ?? '', rotulo: s.rotulo, subtitulo: s.subtitulo, tipoDiagrama: s.tipoDiagrama, diagrama: s.diagrama, ciclo: s.ciclo, custoTi: s.custoTi, custoOutros: s.custoOutros, virada: s.virada, url: s.url }}
          mundo={estado.dia.mundo}
          imageUrl={s.imageUrl}
          prog={video ? prog : 1}
          ratio={video ? '9:16' : '4:5'}
          conceito={s.conceito}
        />
      )}
      {estado && ehReel && s && (
        <ReelSlide
          frame={{ kicker: s.kicker, texto: s.texto ?? '', nota: s.nota, titulo: s.titulo, pontos: s.pontos, motivo: s.motivo, selo: s.selo || (estado.idx === 0 && SERIE_ASSINATURA[subtipo] ? SERIE_ASSINATURA[subtipo] : undefined), pal: s.pal ?? (SERIE_ASSINATURA[subtipo] ? (estado.idx === 0 ? 'carvao' : 'creme') : undefined), imageUrl: s.imageUrl }}
          mundo={estado.dia.mundo}
          imageUrl={s.imageUrl}
          numero={estado.idx + 1}
          total={estado.dia.slides?.length ?? 1}
          capa={!!s.capa}
          ratio={ehCarrosselReel ? '4:5' : '9:16'}
          conceito={s.conceito}
        />
      )}
      {estado && ehBanda && s && (
        <BandaSlide
          painel={{ cenario: s.cenario, licao: s.licao, personagens: s.personagens, imageUrl: s.imageUrl, gancho: s.gancho, texto: s.texto, serie: s.serie }}
          mundo={estado.dia.mundo}
          numero={estado.idx + 1}
          total={estado.dia.slides?.length ?? 1}
          capa={!!s.capa}
          conceito={s.conceito}
        />
      )}
      {estado && ehKinetic && s && (
        <KineticSlide
          texto={s.texto ?? ''}
          destaque={s.destaque}
          imageUrl={s.imageUrl}
          mundo={estado.dia.mundo}
          prog={prog}
          variante={s.variante}
          conceito={s.conceito}
        />
      )}
      {estado && ehMetodo && s && getConta(s.contaId ?? '') && (
        <MetodoSlide
          texto={s.texto ?? ''}
          destaque={s.destaque}
          imageUrl={s.imageUrl}
          conta={getConta(s.contaId ?? '')!}
          conceito={s.conceito}
          prog={prog}
        />
      )}
      {estado && ehSerie && sd && (
        // moldura TRANSPARENTE (só texto/marca); o ffmpeg sobrepõe-na ao motion
        <SerieDiariaSlide serie={sd.serie ?? 'vcsabia'} frase={sd.frase ?? ''} dia={sd.dia} paleta={sd.paleta} prog={prog} transparente />
      )}
      {estado && !ehInfo && !ehAnel && !ehReel && !ehBanda && !ehKinetic && !ehMetodo && !ehSerie && (
        <VeuSlide
          slide={estado.slide}
          mundo={estado.dia.mundo}
          palavra={estado.dia.palavra}
          subtitulo={estado.dia.subtitulo}
          imageUrl={estado.slide.imageUrl}
          numeroDia={estado.dia.dia}
          slideIndex={estado.idx + 1}
          slideTotal={estado.dia.slides?.length ?? 6}
          prog={prog}
        />
      )}
    </div>
  );
}
