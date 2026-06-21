import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_DESPENSA_CHEIA } from '@/lib/amostras/a-despensa-cheia';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante III · ouro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-despensa-cheia',
  romano: 'III',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo terceiro romance',
    en: 'The Véspera Library · novel thirteen',
  },
  tituloPt: 'A Despensa Cheia',
  tituloEn: 'The Full Pantry',
  pitchPt: 'Fartura nasceu num ano de fome e herdou o medo dela sem nunca a ter à mesa. Tem a despensa mais cheia da vila e a mesa mais pobre: guarda o melhor até apodrecer, e come sempre o pior. Este é o ano em que aprende, tarde, que a abundância não é para se ter, é para se viver.',
  pitchEn: 'Fartura was born in a year of hunger and inherited its fear without ever having it at her table. She has the fullest pantry in the village and the poorest table: she keeps the best until it rots, and always eats the worst. This is the year she learns, late, that abundance is not for having, it is for living.',
  corTexto: 'text-ouro',
  corBorda: 'border-ouro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Full Pantry · a novel of Véspera' : 'A Despensa Cheia · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function DespensaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_DESPENSA_CHEIA} locale={locale} />;
}
