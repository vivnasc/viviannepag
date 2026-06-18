import { setRequestLocale } from 'next-intl/server';
import { RomancePreview, type RomanceMeta } from '@/components/romance/RomancePreview';
import { AMOSTRA_ENQUANTO_A_FABRICA_DORME } from '@/lib/amostras/enquanto-a-fabrica-dorme';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// classes de cor literais (estante VII · ocre) — app/** é lido pelo JIT do Tailwind
const META: RomanceMeta = {
  slug: 'enquanto-a-fabrica-dorme',
  romano: 'VII',
  serieLabel: {
    pt: 'Biblioteca de Véspera · o sétimo romance',
    en: 'The Véspera Library · novel seven',
  },
  tituloPt: 'Enquanto a Fábrica Dorme',
  tituloEn: 'While the Mill Sleeps',
  pitchPt: 'Durante quarenta e três anos, Libânia acordou às cinco da manhã para abrir a Fiandeira, a fábrica que era a sua vida. Depois a fábrica fechou, de vez, e o corpo continuou a acordar às cinco — só que já não há para onde ir. Sem trabalho, Libânia não sabe a que horas existe, nem quem é debaixo da encarregada. É a história de uma mulher que confundiu fazer com valer, e que só aprende a diferença quando lhe tiram o fazer: existes antes de fazeres seja o que for.',
  pitchEn: 'For forty-three years, Libânia woke at five to open the mill that was her whole life. Then it closed for good, and her body still wakes at five — only now there is nowhere to go. Without work, Libânia no longer knows at what hour she exists, nor who she is beneath the foreman. It is the story of a woman who confused doing with worth, and who only learns the difference when the doing is taken away: you exist before you do anything at all.',
  corTexto: 'text-ocre',
  corBorda: 'border-ocre/40',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'While the Mill Sleeps · a novel of Véspera' : 'Enquanto a Fábrica Dorme · um romance de Véspera',
    description: isEn ? META.pitchEn : META.pitchPt,
  };
}

export default async function FabricaLanding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RomancePreview meta={META} amostra={AMOSTRA_ENQUANTO_A_FABRICA_DORME} locale={locale} />;
}
