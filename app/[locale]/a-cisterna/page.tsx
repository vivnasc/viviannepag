import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_A_CISTERNA } from '@/lib/amostras/a-cisterna';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VI · lila) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'a-cisterna',
  romano: 'VI',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo nono romance',
    en: 'The Véspera Library · novel nineteen',
  },
  tituloPt: 'A Cisterna',
  tituloEn: 'The Cistern',
  pitchPt: 'Soledade vive na casa do alto, a que tem cisterna própria e nunca precisou da fonte do largo, e faz tudo sozinha desde sempre: ao filho emigrado responde sempre está tudo bem, à vizinha que lhe repara no fumo recusa sempre a ajuda. Em pequena, numa noite, foi pedir socorro a uma porta e a porta não abriu, e decidiu nunca mais pedir. Este é o ano em que aprende, aos sessenta, a coisa mais difícil para quem se fechou em cisterna: descer da casa do alto, bater a uma porta antes do desespero, e aguentar o mais difícil de tudo, que é que a porta se abra.',
  pitchEn: 'Soledade lives in the house on the heights, the one with its own cistern that never needed the square’s fountain, and has always done everything alone: to her emigrated son she always answers all is well, to the neighbour who notices her smoke she always refuses help. As a child, on one night, she went to ask for help at a door and the door did not open, and she decided never to ask again. This is the year she learns, at sixty, the hardest thing for one who shut herself into a cistern: to come down from the house on the heights, to knock at a door before despair, and to bear the hardest thing of all, that the door should open.',
  corTexto: 'text-lila',
  corBorda: 'border-lila/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Cistern · a novel of Véspera' : 'A Cisterna · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function CisternaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_A_CISTERNA} locale={locale} />;
}
