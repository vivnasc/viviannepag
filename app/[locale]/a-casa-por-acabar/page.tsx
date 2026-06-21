import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_CASA_POR_ACABAR } from '@/lib/amostras/a-casa-por-acabar';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante IV · rosa) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-casa-por-acabar',
  romano: 'IV',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo quinto romance',
    en: 'The Véspera Library · novel fifteen',
  },
  tituloPt: 'A Casa por Acabar',
  tituloEn: 'The Unfinished House',
  pitchPt: 'Há vinte anos que o Venturoso anda a acabar a casa nova: quando estiver pronta, casam a sério, vivem a sério, são felizes a sério. Esperança ama esse homem por vir, o desenho dele; ao que existe, adiador e encantador, não pergunta nada. Este é o ano em que olha a casa ao sol, bonita como um esqueleto, e se pergunta quanto da sua vida está ali emparedado.',
  pitchEn: 'For twenty years Venturoso has been finishing the new house: when it is ready, they will marry in earnest, live in earnest, be happy in earnest. Esperança loves that man to come, his design; of the one who exists, putting-off and charming, she asks nothing. This is the year she looks at the house in the sun, beautiful as a skeleton, and asks how much of her life is walled up there.',
  corTexto: 'text-rosa',
  corBorda: 'border-rosa/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Unfinished House · a novel of Véspera' : 'A Casa por Acabar · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function CasaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_CASA_POR_ACABAR} locale={locale} />;
}
