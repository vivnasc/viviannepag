'use client';

// Dispatcher de slide da Veu a Veu: dado um slide (de carousel_collections.dias[].slides[]),
// rende o componente certo conforme o "tipo" — espelha a logica de /render-veu, mas sem
// ir buscar dados (recebe o slide ja em memoria). Usado para capturar PNG em lote (ZIP da
// semana) na Agenda. Tamanho nativo: 1080 de largura; altura conforme o formato.

import { ReelSlide } from '@/components/admin/ReelSlide';
import { BandaSlide } from '@/components/admin/BandaSlide';
import { KineticSlide } from '@/components/admin/KineticSlide';
import { InfograficoSlide, type Diagrama } from '@/components/admin/InfograficoSlide';
import type { Mundo } from '@/lib/estudio-conteudo';

// Slide generico tal como vem guardado (campos opcionais conforme o formato).
export type PostSlideT = {
  tipo?: string;
  // reel
  kicker?: string; texto?: string; nota?: string; titulo?: string; pontos?: string[];
  motivo?: string; selo?: string; pal?: string; capa?: boolean; imageUrl?: string;
  // kinetico
  destaque?: string[]; variante?: string;
  // banda
  cenario?: string; licao?: string; gancho?: string; serie?: string;
  personagens?: { id: string; fala: string; modo?: 'fala' | 'pensa' | 'herdada' }[];
  // infografico
  padrao?: string; rotulo?: string; subtitulo?: string; tipoDiagrama?: 'ciclo' | 'espectro' | 'herdado' | 'camadas' | 'travessia';
  diagrama?: Diagrama; ciclo?: string[]; custoTi?: string; custoOutros?: string; virada?: string; url?: string;
};

// Altura nativa por formato (largura e sempre 1080).
export function alturaSlide(tipo?: string): number {
  return tipo === 'infografico' ? 1350 : 1920;
}

export function PostSlide({ slide, mundo = 'escola', numero, total }: {
  slide: PostSlideT; mundo?: Mundo; numero?: number; total?: number;
}) {
  const tipo = slide.tipo;
  if (tipo === 'infografico') {
    return (
      <InfograficoSlide
        info={{ padrao: slide.padrao ?? '', rotulo: slide.rotulo, subtitulo: slide.subtitulo, tipoDiagrama: slide.tipoDiagrama, diagrama: slide.diagrama, ciclo: slide.ciclo, custoTi: slide.custoTi, custoOutros: slide.custoOutros, virada: slide.virada, url: slide.url }}
        mundo={mundo}
        imageUrl={slide.imageUrl}
      />
    );
  }
  if (tipo === 'banda') {
    return (
      <BandaSlide
        painel={{ cenario: slide.cenario, licao: slide.licao, personagens: slide.personagens, imageUrl: slide.imageUrl, gancho: slide.gancho, texto: slide.texto, serie: slide.serie }}
        mundo={mundo}
        numero={numero}
        total={total}
        capa={!!slide.capa}
      />
    );
  }
  if (tipo === 'kinetico') {
    return (
      <KineticSlide texto={slide.texto ?? ''} destaque={slide.destaque} imageUrl={slide.imageUrl} mundo={mundo} prog={1} variante={slide.variante} />
    );
  }
  // reel (sinais, ninguem, heroi, etc.) — o caso por defeito
  return (
    <ReelSlide
      frame={{ kicker: slide.kicker, texto: slide.texto ?? '', nota: slide.nota, titulo: slide.titulo, pontos: slide.pontos, motivo: slide.motivo, selo: slide.selo, pal: slide.pal, imageUrl: slide.imageUrl }}
      mundo={mundo}
      imageUrl={slide.imageUrl}
      numero={numero}
      total={total}
      capa={!!slide.capa}
    />
  );
}
