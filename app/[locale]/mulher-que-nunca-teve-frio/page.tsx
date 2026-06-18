import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_MULHER_FRIO } from '@/lib/amostras/mulher-frio';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VI · lila) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'mulher-que-nunca-teve-frio',
  romano: 'VI',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o sexto romance',
    en: 'The Véspera Library · novel six',
  },
  tituloPt: 'A Mulher Que Nunca Teve Frio',
  tituloEn: 'The Woman Who Never Felt the Cold',
  pitchPt: 'Serafina criou os irmãos desde os onze anos, no inverno em que os pais desceram à serra e não voltaram, e nunca chorou. Toda a gente jura que ela não sente o frio. Mas há um inverno, uma neta, e uma manta — e a frase que ela diz no fim, a primeira em sessenta anos: afinal sempre tive frio.',
  pitchEn: 'Serafina raised her siblings from the age of eleven, in the winter her parents went down the mountain and never returned, and she never cried. Everyone swears she does not feel the cold. But there is a winter, a granddaughter, and a blanket — and the words she says at the end, the first in sixty years: I always felt the cold after all.',
  corTexto: 'text-lila',
  corBorda: 'border-lila/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Woman Who Never Felt the Cold · a novel of Véspera' : 'A Mulher Que Nunca Teve Frio · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function FrioLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_MULHER_FRIO} locale={locale} />;
}
