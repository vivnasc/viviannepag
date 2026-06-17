import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_NENHUM_INCOMODO } from '@/lib/amostras/nenhum-incomodo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante V · salvia) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'nenhum-incomodo',
  romano: 'V',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o quinto romance',
    en: 'The Véspera Library · novel five',
  },
  tituloPt: 'Nenhum Incómodo',
  tituloEn: 'No Trouble at All',
  pitchPt: 'Plácida não pede, não precisa, não incomoda. Na mesa comprida senta-se na ponta, serve-se por último, e já houve festas em que ninguém deu pela falta dela. Aos sessenta e seis anos, ensinada por um neto de oito, aprende a coisa mais difícil que há: a pedir.',
  pitchEn: 'Plácida asks for nothing, needs nothing, troubles no one. At the long table she sits at the end, serves herself last, and there have been parties where no one noticed she was missing. At sixty-six, taught by an eight-year-old grandson, she learns the hardest thing of all: to ask.',
  corTexto: 'text-salvia',
  corBorda: 'border-salvia/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'No Trouble at All · a novel of Véspera' : 'Nenhum Incómodo · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function IncomodoLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_NENHUM_INCOMODO} locale={locale} />;
}
