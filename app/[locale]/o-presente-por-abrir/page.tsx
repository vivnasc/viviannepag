import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_O_PRESENTE_POR_ABRIR } from '@/lib/amostras/o-presente-por-abrir';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante III · ouro) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'o-presente-por-abrir',
  romano: 'III',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o décimo quarto romance',
    en: 'The Véspera Library · novel fourteen',
  },
  tituloPt: 'O Presente por Abrir',
  tituloEn: 'The Unopened Gift',
  pitchPt: 'Dádiva cuida de meia vila e não aceita nada de ninguém: devolve os elogios antes de os sentir, recusa as prendas, e tem em casa, por abrir há três anos, o presente que a filha lhe deu. Receber, para ela, é descer. Este é o ano em que aprende que receber não é ficar a dever, é deixar-se amar.',
  pitchEn: 'Dádiva cares for half the village and accepts nothing from anyone: she returns compliments before feeling them, refuses gifts, and has at home, unopened for three years, the present her daughter gave her. To receive, for her, is to come down. This is the year she learns that to receive is not to be in debt, it is to let oneself be loved.',
  corTexto: 'text-ouro',
  corBorda: 'border-ouro/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'The Unopened Gift · a novel of Véspera' : 'O Presente por Abrir · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function PresenteLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_O_PRESENTE_POR_ABRIR} locale={locale} />;
}
