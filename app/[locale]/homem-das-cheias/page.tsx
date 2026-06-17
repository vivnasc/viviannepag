import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_HOMEM_DAS_CHEIAS } from '@/lib/amostras/homem-das-cheias';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante IV · rosa) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'homem-das-cheias',
  romano: 'IV',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o quarto romance',
    en: 'The Véspera Library · novel four',
  },
  tituloPt: 'O Homem das Cheias',
  tituloEn: 'The Man the Floods Brought',
  pitchPt: 'Rosário ama um homem que aparece com as águas grandes e desaparece com elas. Do lado de cá há outro, o que fica, e o que fica não lhe acende nada. Este é o ano em que aprende a diferença entre amar a falta e ver o amor que está presente.',
  pitchEn: 'Rosário loves a man who comes with the floods and goes with them. On this side of the river there is another, the one who stays, and the one who stays lights nothing in her. This is the year she learns the difference between loving absence and seeing the love that is present.',
  corTexto: 'text-rosa',
  corBorda: 'border-rosa/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Man the Floods Brought · a novel of Véspera' : 'O Homem das Cheias · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function CheiasLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_HOMEM_DAS_CHEIAS} locale={locale} />;
}
