import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_TROVOADA } from '@/lib/amostras/a-trovoada';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante IV · rosa) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-trovoada',
  romano: 'IV',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo sexto romance',
    en: 'The Véspera Library · novel sixteen',
  },
  tituloPt: 'A Trovoada',
  tituloEn: 'The Thunderstorm',
  pitchPt: 'Tranquilina nasceu numa noite de trovoada, numa casa onde o amor e os gritos entravam juntos, e aprendeu a confundir a intensidade com o amor e a paz com o abandono. Agora tem, pela primeira vez, um amor calmo, e esse sossego, em vez de a sossegar, apavora-a. Este é o ano em que aprende a distinguir a paz da ausência, antes de rebentar, com as próprias mãos, o primeiro amor bom que a vida lhe deu.',
  pitchEn: 'Tranquilina was born on a night of thunderstorm, in a house where love and shouting came in together, and learned to confuse intensity with love and peace with abandonment. Now she has, for the first time, a calm love, and that quiet, instead of soothing her, terrifies her. This is the year she learns to tell peace from absence, before she blows up, with her own hands, the first good love life has given her.',
  corTexto: 'text-rosa',
  corBorda: 'border-rosa/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Thunderstorm · a novel of Véspera' : 'A Trovoada · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function TrovoadaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_TROVOADA} locale={locale} />;
}
